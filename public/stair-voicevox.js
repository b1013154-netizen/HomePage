window.StairVoicevox=(()=>{
  const base='http://127.0.0.1:50021';
  async function request(path,body){
    let res;
    try{
      res=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,
        body:body?JSON.stringify(body):undefined,credentials:'omit',signal:AbortSignal.timeout(90000)});
    }catch{
      throw Error('VOICEVOXに接続できません。「四国めたんで自作曲を歌わせるには」の接続設定をご確認ください。');
    }
    if(!res.ok)throw Error('VOICEVOXで合成できません（'+res.status+'）。歌唱対応版を起動し、歌詞の読みを確認してください。');
    return res;
  }
  function kana(c){return (c==='を'?'お':c).replace(/[ぁ-ゖ]/g,m=>String.fromCharCode(m.charCodeAt(0)+96));}
  async function manifest(){return (await request('/engine_manifest')).json();}
  async function band(score,length){
    const events=score.events.map(e=>[e.time,e.len,e.m,e.v,e.amp]);
    const wav=await (await request('/playground-band',{events,end:score.end})).arrayBuffer();
    const ctx=new OfflineAudioContext(1,1,StairSound.rate);
    const pcm=(await ctx.decodeAudioData(wav)).getChannelData(0);
    const data=new Float32Array(length);data.set(pcm.subarray(0,length));return data;
  }
  async function layer(song,score,notes,length,info){
    const rate=StairSound.rate,beat=60/song.tempo,stem=new Float32Array(length);
    const fps=Number(info.frame_rate)||93.75;
    const decoder=new OfflineAudioContext(1,1,rate);
    for(const group of StairVocalScore.chunks(notes,song.tempo)){
      const pad=Math.ceil(fps*.16),sequence=[{key:null,lyric:'',frame_length:pad}];
      let frames=pad;
      for(const n of group.notes){
        const at=pad+Math.round((n.tick-group.first)/480*beat*fps);
        const end=pad+Math.round((n.end-group.first)/480*beat*fps);
        if(at>frames)sequence.push({key:null,lyric:'',frame_length:at-frames});
        frames=Math.max(frames,at);
        if(end<=frames)continue;
        sequence.push({key:n.m,lyric:kana(n.lyric),frame_length:end-frames});frames=end;
      }
      sequence.push({key:null,lyric:'',frame_length:pad});
      const query=await (await request('/sing_frame_audio_query?speaker=6000',{notes:sequence})).json();
      const wav=await (await request('/frame_synthesis?speaker=3002',query)).arrayBuffer();
      const pcm=(await decoder.decodeAudioData(wav)).getChannelData(0);
      const offset=Math.round(((score.start??.55)+group.first/480*beat-pad/fps)*rate);
      for(let i=Math.max(0,-offset);i<Math.min(pcm.length,length-offset);i++)stem[offset+i]+=pcm[i];
    }
    let peak=0,energy=0,count=0;
    for(const v of stem){peak=Math.max(peak,Math.abs(v));if(Math.abs(v)>.006){energy+=v*v;count++;}}
    const gain=Math.min(.90/Math.max(.01,peak),.19/Math.sqrt(energy/(count||1)||1));
    for(let i=0;i<stem.length;i++)stem[i]*=gain;
    return stem;
  }
  async function sing(song,score,notes,length,info){
    const capabilities=info||await manifest();
    const lead=await layer(song,score,notes,length,capabilities);
    const chorus=song.chorus||song.n*.64,scale=StairGroove.minor(song)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
    const tonic=StairGroove.tonic(song);
    const backing=notes.filter(n=>n.tick>=chorus*480).map(n=>{
      // Move down a diatonic third; preserve the syllable and its original phrasing.
      let pitch=n.m,steps=0;
      while(steps<2){pitch--;if(scale.includes((pitch-tonic+120)%12))steps++;}
      return {...n,m:pitch};
    });
    if(backing.length>=3){
      const harmony=await layer(song,score,backing,length,capabilities),delay=Math.round(.014*StairSound.rate);
      for(let i=delay;i<length;i++)lead[i]+=.27*harmony[i-delay];
    }
    return lead;
  }
  return {sing,manifest,band};
})();
