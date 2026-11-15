window.StairVocalScore=(()=>{
  const ppq=480;
  // These contours describe sung phrases, independently of instrumental onsets.
  const contours=[[0,0,2,4,4,2,0],[0,2,2,0,3,2,0],[2,2,0,-2,0,2,0],
    [-2,0,0,2,5,4,2],[0,3,2,2,0,-2,0],[4,2,2,0,0,-2,0]];
  function phrases(text){
    return text.trim().split(/[、。！？!?.,\s]+/u).flatMap(line=>{
      const tokens=StairSinger.parse(line);
      const count=Math.ceil(tokens.length/12);
      return Array.from({length:count},(_,i)=>tokens.slice(Math.round(i*tokens.length/count),Math.round((i+1)*tokens.length/count)));
    });
  }
  function melody(song,score){
    const result=[],beat=60/song.tempo,bar=StairGroove.bar(song),tonic=StairGroove.tonic(song);
    const scale=StairGroove.minor(song)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
    const harmony=score.events.filter(e=>e.chord&&song.lanes[e.lane]?.role===1)
      .map(e=>({at:(e.time-(score.start??.55))/beat,chord:e.chord})).sort((a,b)=>a.at-b.at);
    const parts=song.vocalParts||[{t:0,end:song.n,settings:song.singing}];
    for(const part of parts){
      const v=part.settings;
      if(!v?.on)continue;
      const lines=phrases(v.reading?.trim()||v.text||'');
      if(!lines.length)continue;
      const seed=(v.melodySeed??song.seed??0)>>>0;
      let state=seed;
      const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
      const motif=Math.floor(random()*contours.length),mid=65+Math.floor(random()*5);
      const start=Math.round(part.t*ppq),end=Math.round(Math.min(song.n,part.end)*ppq);
      const weights=lines.map(line=>line.length+2),total=weights.reduce((a,b)=>a+b,0);
      let used=0,begin=start;
      lines.forEach((line,index)=>{
        const boundary=()=>start+Math.round((end-start)*used/total);
        used+=weights[index];
        const ideal=boundary(),grid=bar*ppq/2,snapped=start+Math.round((ideal-start)/grid)*grid;
        const finish=index===lines.length-1?end:
          (snapped>begin+ppq/2 && snapped<ideal+(end-start)*weights[index+1]/total*.45 && snapped<end-ppq/2 && Math.abs(snapped-ideal)<(ideal-begin)*.2?snapped:ideal);
        const span=finish-begin;
        const unit=Math.min(span/(line.length+2),ppq*(song.genre===3?.65:.95));
        const pickup=Math.min(span*.10,ppq*([0,.25,.5][(seed+index)%3]));
        const breath=Math.min(ppq*.55,span*.12);
        const length=Math.min(span-pickup-breath,unit*(line.length+1.5));
        const shape=contours[(motif+(index%2))%contours.length];
        const rhythm=line.map((u,j)=>j===line.length-1?2.3:u.c==='っ'?.55:
          [1,1,.75,1.25,1,.75][(j+seed%6)%6]);
        const sum=rhythm.reduce((a,b)=>a+b,0);
        let elapsed=0,previous=mid;
        for(let j=0;j<line.length;j++){
          const onset=()=>{
            const ideal=begin+pickup+length*elapsed/sum;
            const grid=Math.max(1,ppq/2**Math.max(2,Math.ceil(Math.log2(4*ppq*sum/length))));
            return Math.round(Math.max(begin,Math.min(finish,Math.round(ideal/grid)*grid)));
          };
          const tick=onset();elapsed+=rhythm[j];const until=onset();
          if(until<=tick)continue;
          const t=tick/ppq,anchor=j===0||j===line.length-1||Math.abs(t/bar-Math.round(t/bar))*bar<.09;
          const [root,q]=Ensemble.harm(song,t);
          const actual=harmony.findLast(h=>h.at<=t+.015)?.chord;
          const chordRoot=actual?.root??tonic+root;
          const chord=(Ensemble.chords[actual?.q??q]?.[1]||[0,4,7]).slice(0,3);
          const pitchClasses=anchor?chord.map(d=>(chordRoot+d)%12):scale.map(d=>(tonic+d)%12);
          const target=mid+shape[Math.round(j*(shape.length-1)/Math.max(1,line.length-1))]+(song.chorus&&t>=song.chorus?2:0);
          let m=previous,best=Infinity;
          for(let pitch=59;pitch<=78;pitch++){
            if(!pitchClasses.includes(pitch%12))continue;
            const cost=Math.abs(pitch-target)+.27*Math.abs(pitch-previous);
            if(cost<best){m=pitch;best=cost;}
          }
          if(j>0&&(line[j].c==='っ'||line[j].c==='ん'))m=previous;
          result.push({tick,end:until,m,lyric:line[j].c,voice:v.voice||0});
          previous=m;
        }
        begin=finish;
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
