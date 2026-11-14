window.KanaVoice=(()=>{let bank=null;
async function load(){if(!bank)bank=Promise.all(['json','bin'].map(async ext=>{const r=await fetch('/assets/pjs-voice.'+ext);if(!r.ok)throw Error('日本語音声素材を読み込めませんでした。');return ext==='json'?r.json():new Int16Array(await r.arrayBuffer());})).catch(e=>{bank=null;throw e;});return bank;}
async function mix(data,phrase,voice){const [map,pcm]=await load(),R=44100;let last='あ';
for(let q of phrase){if(q.c==='っ')continue;let c=q.c==='ー'?last:q.c;last=c;let rec=map[c]||map[{'ぢ':'じ','づ':'ず','ゔ':'ぶ','ゐ':'い','ゑ':'え'}[c]]||map[c[0]]||map['あいうえおん'[q.v]];if(!rec)continue;
let [off,size,on,marks,peak]=rec,start=Math.max(0,Math.round(q.time*R)),len=Math.min(data.length-start,Math.round(q.len*R));if(len<2||marks.length<3)continue;let n=Math.min(Math.floor(len*.48),Math.round(on*R/24000)),amp=Math.min(.6,.33+q.amp*.24)/Math.max(1500,peak),f=440*2**((q.m-69)/12);if(voice===1)f/=2;while(f>720)f/=2;while(f<90)f*=2;
const env=i=>Math.min(1,(i+1)/65,(len-i)/Math.min(450,len*.14));for(let i=0;i<n;i++){let x=Math.min(size-1,Math.floor(on*i/n));data[start+i]+=pcm[off+x]*amp*env(i);}
let clip=new Float32Array(len),weights=new Float32Array(len);for(let center=n;center<len+200;){let progress=Math.max(0,Math.min(1,(center-n)/Math.max(1,len-n))),m=Math.min(marks.length-2,Math.max(1,Math.floor(progress*(marks.length-3))+1)),p=marks[m],radius=Math.min(420,Math.max(150,(marks[m+1]-marks[m-1]))),dest=Math.round(center);
 for(let d=-radius;d<radius;d++){let i=dest+d;if(i<n||i>=len)continue;let src=p+Math.round(d*24000/R*(voice===2?1.07:1));if(src<0||src>=size)continue;let w=.5+.5*Math.cos(Math.PI*d/radius);clip[i]+=w*pcm[off+src];weights[i]+=w;}center+=R/(f*(1+.004*Math.sin(center/R*32)));}
for(let i=n;i<len;i++)data[start+i]+=clip[i]/Math.max(.6,weights[i])*amp*env(i)*Math.min(1,(i-n+1)/85);
 // Match the loudness of each recorded syllable while retaining its attack and dynamics.
 let power=0;for(let i=0;i<len;i++)power+=data[start+i]**2;
 const gain=Math.min(9,.18/Math.max(.001,Math.sqrt(power/len)));
 for(let i=0;i<len;i++)data[start+i]=.88*Math.tanh(data[start+i]*gain/.88);
}}
return {mix};})();
