// Copy arrangements into a shared meter/tempo; never mutate the library originals.
window.StairSplice=(song,input)=>{
 const E=Ensemble,G=StairGroove,a=structuredClone(song),b=E.migrate(structuredClone(input)),bar=G.bar(a),ratio=bar/G.bar(b),offset=Math.ceil(a.n/bar)*bar,total=offset+Math.ceil(b.n/G.bar(b))*bar;
 if(total>128)throw Error('連結できる長さは四分音符128拍までです。');
 const used=new Set(),free=new Set(a.lanes.map((_,i)=>i)),mapped=[];
 for(let l of b.lanes){let i=[...free].find(i=>a.lanes[i].role===l.role);if(i!==undefined){free.delete(i);used.add(i);}mapped.push(i);}
 for(let j=0;j<b.lanes.length;j++){let l=b.lanes[j],i=mapped[j];if(i===undefined){if(a.lanes.length<4){i=a.lanes.length;a.lanes.push({...l,steps:[],mute:false});}else{i=free.values().next().value;free.delete(i);}mapped[j]=i;}
 }
 const normalize=(s,l)=>{let st=E.styles[s.genre],scale=G.minor(s)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];return l.steps.map((x,i)=>{let degree=i===s.n-1?0:st[4][Math.floor(x.t/4)%4],y={...x};y.root=x.root??scale[degree];y.v=x.v<0?l.voice:x.v;y.part=x.part??l.role;y.k=l.mute?4:x.k;y.gain=(x.gain??1)*l.vol/100;y.swing=x.swing??st[6];return y;});};
 const old=a.lanes.map(l=>normalize(a,l));a.lanes.forEach((l,i)=>{l.steps=old[i];l.vol=100;l.mute=false;});
 for(let j=0;j<b.lanes.length;j++){let l=b.lanes[j],out=a.lanes[mapped[j]];let notes=normalize(b,l);for(let x of notes){let t=x.t;x.t=offset+t*ratio;
 if(G.minor(a)!==G.minor(b)&&x.k!==3){let delta=G.minor(a)?-1:1,alter=G.minor(a)?[4,9,11]:[3,8,10],pc=((x.root%12)+12)%12;if(alter.includes(pc))x.root+=delta;}
 out.steps.push(x);}}
 a.n=total;a.version=3;a.legacy=false;a.oldArrangement=false;a.range=null;a.lock=[];a.chorus=null;a.sections=[...(a.sections||[{t:0,name:song.title||'曲1'}]),...(b.sections||[{t:0,name:b.title||'曲2'}]).map(x=>({...x,t:offset+x.t*ratio}))];
 // Keep the phrasing envelopes on either side of the join.
 const dyn=(s,t)=>{let c=s.curve||[1,1],p=Math.max(0,Math.min(1,t/s.n))*(c.length-1),i=Math.floor(p);return c[i]+((c[i+1]??c[i])-c[i])*(p-i);};a.curve=Array.from({length:65},(_,i)=>{let t=i*total/64;return t<offset?dyn(song,t):dyn(b,(t-offset)/ratio);});
 const sections=(s)=>s.vocalParts||[{t:0,end:s.n,settings:s.singing||{on:false}}];a.vocalParts=[...sections(song).map(x=>structuredClone(x)),...sections(b).map(x=>({...structuredClone(x),t:offset+x.t*ratio,end:offset+x.end*ratio}))];
 let left=song.singing||{},right=b.singing||{};let active=[left,right].filter(x=>x.on&&x.text);if(active.length){a.singing={...active[0],text:active.map(x=>x.text).join('\n'),reading:active.map(x=>x.reading||x.text).join('\n')};}a.title=((song.title||'無題')+' ＋ '+(b.title||'無題')).slice(0,50);return a;};
