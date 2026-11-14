// Deterministic score renderer; the same mono master is played and exported.
window.StairSound=(()=>{
 const rate=44100,scales=[[0,2,4,5,7,9,11],[0,2,3,5,7,8,10],[0,2,4,5,7,9,11]],tonics=[60,57,65],progress=[[0,4,5,3],[0,5,2,6],[0,3,1,4]];
 function compose(song){let beat=60/song.tempo,t=.45,events=[],hits=[],scale=scales[song.mood],root=tonics[song.mood];
 const pitch=d=>root+scale[d%7]+12*Math.floor(d/7),emit=(time,d,v,amp,len)=>events.push({time,m:pitch(d),v,amp,len});
 song.steps.forEach((s,i)=>{let chord=i===song.steps.length-1?0:progress[song.mood][Math.floor(i/4)%4],d=chord+s.d,v=s.v<0?song.voice:s.v,gap=beat*[1,1.25,.75,1][song.ball],accent=(i%4===0?1:.78)*(song.ball===2?.85:1);hits.push(t);
 if(s.k===0)emit(t,d,v,.42*accent,.9);if(s.k===1||s.k===2)[0,2,4].forEach((a,j)=>emit(t+(s.k===2?gap*.23*j:0),d+a,v,(s.k===2?.27:.2)*accent,1.35));
 if(s.k===3)events.push({time:t,m:38,v:6,amp:.65,len:.38});
 if(song.ball===3&&s.k!==3&&s.k!==4&&i%2===1)emit(t+gap*.6,d,v,.16,.38);
 t+=gap;});return {hits,events,end:t+1.8};}
 function render(score){const data=new Float32Array(Math.ceil(score.end*rate)),tau=2*Math.PI;
 for(const e of score.events){let f=440*2**((e.m-69)/12),a=Math.floor(e.time*rate),len=Math.min(Math.floor(e.len*rate),data.length-a),phase=f*tau/rate,seed=2341;
 for(let i=0;i<len;i++){let t=i/rate,p=i*phase,x=0,dec=4,attack=.008;switch(e.v){
 case 0:x=Math.sin(p)+.38*Math.sin(2*p)*Math.exp(-4*t)+.2*Math.sin(3.003*p);dec=3.5;break;
 case 1:x=Math.sin(p)+.55*Math.sin(2*p)*Math.exp(-5*t)+.32*Math.sin(4*p)*Math.exp(-7*t)+.18*Math.sin(5*p);dec=5;attack=.003;break;
 case 2:x=Math.sin(p)+.75*Math.sin(3.98*p)*Math.exp(-9*t);dec=7;attack=.003;break;
 case 3:x=Math.sin(p+.6*Math.sin(2.7*p)*Math.exp(-3*t))+.38*Math.sin(2.41*p);dec=2.3;break;
 case 4:x=Math.sin(p+.1*Math.sin(32*t))+.12*Math.sin(2*p);dec=2.7;attack=.075;break;
 case 5:x=.72*Math.sin(p)+.47*Math.sin(p*1.003)+.3*Math.sin(2*p)+.12*Math.sin(3*p);dec=2;attack=.12;break;
 default:seed=(Math.imul(seed,1664525)+1013904223)>>>0;x=Math.sin(300*t+11*(1-Math.exp(-24*t)))+.3*(seed/2147483648-1)*Math.exp(-28*t);dec=12;attack=.002;}
 data[a+i]+=x*e.amp*Math.min(1,t/attack)*Math.exp(-dec*t)*Math.min(1,(len-i)/1200);}}
 const delay=Math.floor(rate*.18);let peak=.8;for(let i=0;i<data.length;i++){if(i>=delay)data[i]+=.17*data[i-delay];peak=Math.max(peak,Math.abs(data[i]));}for(let i=0;i<data.length;i++)data[i]*=.84/peak;return data;}
 function wav(data){let buf=new ArrayBuffer(44+data.length*2),v=new DataView(buf),str=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i));};str(0,'RIFF');v.setUint32(4,buf.byteLength-8,true);str(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,data.length*2,true);for(let i=0;i<data.length;i++)v.setInt16(44+i*2,Math.round(data[i]*32767),true);return new Blob([buf],{type:'audio/wav'});}
 return {rate,compose,render,wav};})();

