window.StairVocalScore=(()=>{
  const ppq=480;
  function melody(song,score){
    const beat=60/song.tempo,origin=score.start??.55, result=[];
    const parts=song.vocalParts||[{t:0,end:Infinity,settings:song.singing}];
    for(const part of parts){
      const v=part.settings;
      if(!v?.on)continue;
      const text=v.reading?.trim()||v.text||'';
      const mora=StairSinger.parse(text);
      if(!mora.length)continue;
      const events=score.events.filter(e=>e.v<18&&e.amp>0&&e.time>=origin+part.t*beat-.035&&e.time<origin+part.end*beat-.035);
      const lead=[0,1,2,3].flatMap(role=>song.lanes.map((l,i)=>l.role===role?i:-1)).find(i=>i>=0&&events.some(e=>e.lane===i));
      const notes=new Map();
      for(const e of events.filter(e=>e.lane===lead)){
        const k=e.step??e.time,old=notes.get(k);
        if(!old)notes.set(k,{...e});
        else if(e.m>old.m){old.m=e.m;}
      }
      const ordered=[...notes.values()].sort((a,b)=>a.time-b.time);
      ordered.forEach((e,i)=>{
        const start=Math.max(Math.round(part.t*ppq),Math.round((e.time-origin)/beat*ppq));
        const end=Math.round(Math.min((e.time+e.len-origin)/beat,part.end,ordered[i+1]?(ordered[i+1].time-origin)/beat:Infinity)*ppq);
        const first=Math.floor(i*mora.length/ordered.length),after=Math.floor((i+1)*mora.length/ordered.length);
        const count=Math.max(1,after-first);
        const tied=i>0&&first===Math.floor((i-1)*mora.length/ordered.length);
        for(let j=0;j<count;j++){
          const tick=start+Math.round((end-start)*j/count), until=start+Math.round((end-start)*(j+1)/count);
          if(until<=tick)continue;
          const token=mora[first+j];
          result.push({tick,end:until,m:e.m,lyric:tied&&j===0?'あいうえおん'[token.v]:token.c,voice:v.voice||0});
        }
      });
    }
    return result;
  }
  function variable(n){
    const bytes=[n&127];while((n=Math.floor(n/128))>0)bytes.unshift(128|(n&127));return bytes;
  }
  function midi(song,notes){
    const track=[],push=(delta,...msg)=>track.push(...variable(delta),...msg);
    const tempo=Math.round(60e6/song.tempo),meter=StairGroove.meters[song.meter||0];
    push(0,255,81,3,tempo>>16,(tempo>>8)&255,tempo&255);
    push(0,255,88,4,meter[0],Math.log2(meter[1]),24,8);
    // Japanese SMF lyrics use CP932. Hiragana occupies a contiguous row.
    let cursor=0;
    for(const n of notes){
      const bytes=Array.from(n.lyric).flatMap(c=>{
        if(c==='ゔ')return [0x83,0x94];
        return [0x82,0x9f+c.charCodeAt(0)-0x3041];
      });
      push(n.tick-cursor,255,5,bytes.length,...bytes);push(0,144,n.m,92);
      push(n.end-n.tick,128,n.m,0);cursor=n.end;
    }
    push(0,255,47,0);
    const size=track.length;
    return new Blob([new Uint8Array([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,size>>>24,(size>>>16)&255,(size>>>8)&255,size&255]),new Uint8Array(track)],{type:'audio/midi'});
  }
  function chunks(notes,tempo){
    const out=[];let group;
    for(const n of notes){
      if(!group||group.voice!==n.voice||n.tick-group.end>480||n.end-group.first>tempo/60*480*18||group.notes.length>=76){
        group={first:n.tick,end:n.end,notes:[],voice:n.voice};out.push(group);
      }
      group.notes.push(n);group.end=n.end;
    }
    return out;
  }
  function xml(group,tempo){
    const pad=120, rest=n=>'<note><rest/><duration>'+n+'</duration></note>';
    let cursor=group.first,body=rest(pad);
    for(const n of group.notes){
      if(n.tick>cursor)body+=rest(n.tick-cursor);
      const pc=n.m%12,step='CCDDEFFGGAAB'[pc],alter=[1,3,6,8,10].includes(pc)?'<alter>1</alter>':'';
      body+='<note><pitch><step>'+step+'</step>'+alter+'<octave>'+(Math.floor(n.m/12)-1)+'</octave></pitch><duration>'+(n.end-n.tick)+'</duration><lyric><syllabic>single</syllabic><text>'+n.lyric+'</text></lyric></note>';
      cursor=n.end;
    }
    const length=group.end-group.first+pad*2,gcd=(a,b)=>b?gcd(b,a%b):a,div=gcd(length,1920);
    return '<?xml version="1.0" encoding="UTF-8"?><score-partwise version="2.0"><part-list><score-part id="P1"><part-name>Voice</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>480</divisions><time><beats>'+length/div+'</beats><beat-type>'+1920/div+'</beat-type></time></attributes><direction><sound tempo="'+tempo+'"/></direction>'+body+rest(pad)+'</measure></part></score-partwise>';
  }
  async function sing(song,score,notes,length){
    const groups=chunks(notes,song.tempo),stem=new Float32Array(length),rate=StairSound.rate;
    const worker=new Worker('/stair-sinsy-worker.js',{type:'module'});
    try{
      for(const group of groups){
        const {pcm,hz}=await new Promise((resolve,reject)=>{
          worker.onmessage=({data})=>data.error?reject(Error(data.error)):resolve(data);
          worker.onerror=()=>reject(Error('歌唱モデルを読み込めません。ページを更新して再度お試しください。'));
          worker.postMessage({xml:xml(group,song.tempo),voice:group.voice});
        });
        const offset=Math.round(((score.start??.55)+(group.first-120)/480*60/song.tempo)*rate);
        const count=Math.min(Math.floor(pcm.length*rate/hz),length-offset);
        for(let i=Math.max(0,-offset);i<count;i++){
          const x=i*hz/rate,j=Math.floor(x);
          stem[i+offset]+=pcm[j]+((pcm[j+1]??pcm[j])-pcm[j])*(x-j);
        }
      }
    }finally{worker.terminate();}
    let peak=0,power=0,active=0;
    for(const x of stem){peak=Math.max(peak,Math.abs(x));if(Math.abs(x)>.006){power+=x*x;active++;}}
    const gain=Math.min(.9/Math.max(.01,peak),.19/Math.sqrt(power/(active||1)||1));
    for(let i=0;i<stem.length;i++)stem[i]*=gain;
    return stem;
  }
  return {melody,midi,sing};
})();
