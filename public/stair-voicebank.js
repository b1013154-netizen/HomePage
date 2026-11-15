window.KanaVoice=(()=>{
  const R=44100, sourceRate=24000;
  let bank;
  function load(){
    return bank??=Promise.all(['json','bin'].map(async ext=>{
      const r=await fetch('/assets/pjs-legato.'+ext);
      if(!r.ok)throw Error('歌声素材を読み込めませんでした。もう一度再生してください。');
      return ext==='json'?r.json():new Int16Array(await r.arrayBuffer());
    })).catch(e=>{bank=null;throw e;});
  }
  function sample(pcm,off,size,x){
    x=Math.max(0,Math.min(size-1,x));
    const i=Math.floor(x),a=pcm[off+i];
    return a+(pcm[off+Math.min(i+1,size-1)]-a)*(x-i);
  }
  function renderUnit(pcm,rec,q,left,right,previousPitch,voice){
    const [off,size,onset,marks,peak]=rec;
    const length=Math.round(q.len*R)+left+right;
    const clip=new Float32Array(length),weights=new Float32Array(length);
    const rate=sourceRate/R;
    // Keep the original transition into the vowel, including frication and closure.
    const attack=Math.min(onset/rate,length*.58);
    const bridge=Math.max(1,Math.min(length-attack,.013*R));
    const targets=q.pitch;
    const first=q.m;
    let currentPitch=q.join?previousPitch:first, next=0;
    const glide=.035;
    for(let center=attack;center<length+360;){
      const t=Math.max(0,(center-left)/R);
      while(next+1<targets.length&&targets[next+1].at<=t)next++;
      const target=targets[next].m;
      // A narrow comfortable register avoids sudden octave flips on high notes.
      const hz=440*2**((Math.max(40,Math.min(88,currentPitch))+(voice===1?-12:0)-69)/12);
      const period=R/Math.max(65,Math.min(1100,hz));
      currentPitch+=(target-currentPitch)*(1-Math.exp(-period/(R*glide)));
      const progress=Math.max(0,Math.min(1,(center-attack)/Math.max(1,length-attack)));
      const index=1+Math.round(progress*(marks.length-3)),p=marks[index];
      const radius=Math.ceil(Math.max(period*1.08,(marks[index+1]-marks[index-1])/(2*rate)));
      for(let d=-radius;d<radius;d++){
        const i=Math.round(center)+d;
        if(i<attack||i>=length)continue;
        const x=p+d*rate*(voice===2?1.035:1);
        if(x<0||x>=size-1)continue;
        const w=.5+.5*Math.cos(Math.PI*d/radius);
        clip[i]+=sample(pcm,off,size,x)*w;
        weights[i]+=w;
      }
      center+=period;
    }
    let power=0;
    for(let i=0;i<length;i++){
      const blend=Math.max(0,Math.min(1,(i-attack)/bridge));
      const raw=blend<1?sample(pcm,off,size,i<attack?i*onset/Math.max(1,attack):onset+(i-attack)*rate):0;
      clip[i]=((1-blend)*raw+blend*clip[i]/Math.max(.15,weights[i]))/Math.max(1000,peak);
      power+=clip[i]*clip[i];
    }
    const gain=q.expression*Math.min(3.2,.17/Math.max(.02,Math.sqrt(power/length)));
    // Overlap only the adjacent recordings within a phrase. Both halves of the
    // join use the same window duration; line endings and geminates are released.
    const attackFade=left?2*left:Math.min(R*.008,length*.12);
    const release=right?2*right:Math.min(R*.035,length*.20);
    for(let i=0;i<length;i++){
      const fade=Math.min(1,(i+.5)/attackFade,(length-i-.5)/release);
      clip[i]=.94*Math.tanh(clip[i]*gain/.94)*Math.sin(Math.PI*.5*fade);
    }
    return clip;
  }
  const alias={'を':'お','ぢ':'じ','づ':'ず','ゔ':'ぶ','ゐ':'い','ゑ':'え'};
  async function mix(data,phrase,voice){
    const [map,pcm]=await load();
    const overlap=(a,b)=>a&&b?.join?Math.round(R*Math.min(.023,a.len*.18,b.len*.18)):0;
    phrase.forEach((q,i)=>{
      if(q.c==='っ')return;
      const prev=phrase[i-1],next=phrase[i+1],c=alias[q.c]||q.c;
      const left=overlap(prev,q),right=overlap(q,next);
      const prefix=left?'aiueoN'[prev.v]+':':'';
      const rec=map[prefix+c]||map[c]||map[c[0]]||map['あいうえおん'[q.v]];
      if(!rec)return;
      const clip=renderUnit(pcm,rec,q,left,right,prev?.pitch.at(-1).m??q.m,q.voice??voice);
      const start=Math.round(q.time*R)-left;
      for(let j=Math.max(0,-start);j<Math.min(clip.length,data.length-start);j++)data[start+j]+=clip[j];
    });
  }
  return {mix};
})();
