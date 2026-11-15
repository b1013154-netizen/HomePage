window.StairGroove=(()=>{
const meters=[[4,4],[3,4],[6,8],[2,4],[12,8]],pick=a=>a[Math.floor(Math.random()*a.length)],bar=s=>{let [n,d]=meters[s.meter||0];return n*4/d;},key=s=>s.key??[0,9,5][s.mood],minor=s=>s.minor??(s.mood===1),tonic=s=>60+(key(s)>6?key(s)-12:key(s));
function phrase(genre,style){
 const riff=StairPhrases.choose('riff',genre,style,Math.random),head=pick(riff.patterns);
 return {line:head,reply:pick(riff.patterns.filter(p=>p!==head)),sign:pick([-1,1]),span:pick([1.5,2,2.5]),
 center:pick([3,5,7,9]),phase:Math.floor(Math.random()*3),rhythm:riff.rhythm,alt:riff.answer,genre,last:null,
 comp:pick(['0268ac','147abe','0358d','069ce','048ac','238bce']),bass:pick(['038ac','046be','078ac','038bf','048e','0368c']),
 walk:pick([[0,7,12,7],[0,3,7,10],[0,12,7,5],[0,7,5,2],[0,0,7,12],[0,5,7,10]])};
}
function melody(f,b,k,phase,root,q,intervals,s){let barno=Math.floor(b/bar(s)),line=barno%4===3?f.reply:f.line,ix=(k+f.phase+(barno%4===2?2:0))%line.length,target=f.center+f.sign*f.span*line[ix]+(barno%4===1?2:0),strong=phase===0||phase===.5||k===0,scale=minor(s)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
let tones=intervals||[0,4,7],allowed=strong?tones.slice(0,4).map(x=>(x+root)%12):[...new Set([...scale,...tones.map(x=>(x+root)%12)])];if(s.genre===11)allowed=[0,3,5,7,10];let best=0,cost=Infinity;for(let n=0;n<=20;n++){if(!allowed.includes(n%12))continue;let reach=f.last===null?0:Math.abs(n-f.last);let v=Math.abs(n-target)+Math.max(0,reach-5)*1.8+(reach===0?.65:0);if(v<cost){cost=v;best=n;}}f.last=best;return best-root;}
function grid(s,r,b,pattern,f){let [num,den]=meters[s.meter||0],compound=den===8,div=compound?num*2:num*4;let pos;
if(r===3){let group=compound?6:4,main=compound?Array.from({length:num/3},(_,i)=>i*6):Array.from({length:num},(_,i)=>i*4);let sparse=[4,9,12].includes(s.genre);pos=new Set(main);for(let i=0;i<div;i+=2)if(!sparse||i%group===0)pos.add(i);if(!sparse&&[2,3,7].includes(s.genre)&&b/bar(s)%2===1)pos.add(div-1);
return [...pos].sort((a,b)=>a-b).map(i=>{let beat=Math.floor(i/group),sn=compound?beat%2===1:num===3?beat===1:beat%2===1;let d=i%group===0?(sn?1:0):2;if(s.genre===3&&num===4)d=i===8?1:i===0||i===10?0:2;return {pos:i/div,drum:d,kit:d!==2&&!sparse,vel:d===2?(i%4===0?.52:.31):d===1?.78:.95};});}
let pat=r===0?(b/bar(s)%4===3?f.alt:f.rhythm):(b/bar(s)%4===3?(r===1?f.comp:f.bass):pattern);if(r===0&&[4,12].includes(s.genre))pat=pat.split('').filter((_,i)=>i%2===0).join('');pos=[...new Set([...pat].map(c=>Math.min(div-1,Math.round(parseInt(c,16)/16*div))))];if(compound&&r===2)pos=[0,6,...(num===12?[12,18]:[]),...(s.genre===2?[div-2]:[])];if(compound&&r===1&&s.genre===2)pos=Array.from({length:num/3},(_,i)=>[i*6+2,i*6+4]).flat();return pos.map(i=>({pos:i/div}));}
function kit(v,i,R,hit){let t=i/R,white=hit.random();hit.lp+=.25*(white-hit.lp);let high=white-hit.lp;hit.bright+=.68*(white-hit.bright);let hiss=white-hit.bright;if(v===18)return .95*Math.sin(2*Math.PI*(49*t+1.65*(1-Math.exp(-40*t))))*Math.exp(-12*t)+.10*high*Math.exp(-140*t);if(v===19)return (.42*Math.sin(2*Math.PI*182*t)+.21*Math.sin(2*Math.PI*306*t))*Math.exp(-29*t)+.66*high*Math.exp(-18*t);return .46*hiss*Math.exp(-58*t)+.09*Math.sin(2*Math.PI*5321*t)*Math.sin(2*Math.PI*3463*t)*Math.exp(-75*t);}
return {meters,bar,key,minor,tonic,phrase,melody,grid,kit};})();
