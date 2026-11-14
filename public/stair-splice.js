// Copy arrangements into a shared meter/tempo; never mutate the library originals.
window.StairSplice=(song,input,end=song.n,start=0,keepCadence=false)=>{
 const E=Ensemble,G=StairGroove,a=structuredClone(song),b=E.migrate(structuredClone(input)),bar=G.bar(a),ratio=bar/G.bar(b),extra=keepCadence&&end===a.n?1:0,offset=end+extra,total=offset+(b.n-start)*ratio;
 if(!Number.isFinite(end)||!Number.isFinite(start)||end<=0||end>a.n||start<0||start>=b.n)throw Error('終了位置・開始位置を確認してください。');
 if(total>128)throw Error('連結できる長さは四分音符128拍までです。');
 const used=new Set(),free=new Set(a.lanes.map((_,i)=>i)),mapped=[];
 for(let l of b.lanes){let i=[...free].find(i=>a.lanes[i].role===l.role);if(i!==undefined){free.delete(i);used.add(i);}mapped.push(i);}
 for(let j=0;j<b.lanes.length;j++){let l=b.lanes[j],i=mapped[j];if(i===undefined){if(a.lanes.length<4){i=a.lanes.length;a.lanes.push({...l,steps:[],mute:false});}else{i=free.values().next().value;free.delete(i);}mapped[j]=i;}
 }
 const normalize=(s,l)=>{let st=E.styles[s.genre],scale=G.minor(s)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];return l.steps.map((x,i)=>{let degree=i===s.n-1?0:st[4][Math.floor(x.t/4)%4],y={...x};y.root=x.root??scale[degree];y.v=x.v<0?l.voice:x.v;y.part=x.part??l.role;y.k=l.mute?4:x.k;y.gain=(x.gain??1)*l.vol/100;y.swing=x.swing??st[6];return y;});};
 const old=a.lanes.map(l=>normalize(a,l));a.lanes.forEach((l,i)=>{l.steps=old[i].filter(x=>x.t<end);if(extra&&!l.mute&&l.role!==3&&l.steps.some(x=>x.k!==4))l.steps.push({t:end,d:0,p:l.role===0?12:0,root:0,k:l.role===1?1:0,q:G.minor(a)?2:1,v:l.voice,gain:l.vol/100,vel:.75});l.vol=100;l.mute=false;});
 for(let j=0;j<b.lanes.length;j++){let l=b.lanes[j],out=a.lanes[mapped[j]];let notes=normalize(b,l);for(let x of notes){let t=x.t;if(t<start)continue;x.t=offset+(t-start)*ratio;
 if(G.minor(a)!==G.minor(b)&&x.k!==3){let delta=G.minor(a)?-1:1,alter=G.minor(a)?[4,9,11]:[3,8,10],pc=((x.root%12)+12)%12;if(alter.includes(pc))x.root+=delta;}
 out.steps.push(x);}}
 a.lanes=a.lanes.filter(l=>l.steps.length);if(!a.lanes.length)throw Error('この範囲には段がありません。');a.n=total;a.version=3;a.legacy=false;a.oldArrangement=false;a.range=null;a.lock=[];a.chorus=null;a.sections=[...(a.sections||[{t:0,name:song.title||'曲1'}]).filter(x=>x.t<end),{t:offset,name:b.title||'曲2'},...(b.sections||[]).filter(x=>x.t>start).map(x=>({...x,t:offset+(x.t-start)*ratio}))];
 // Keep the phrasing envelopes on either side of the join.
 const dyn=(s,t)=>{let c=s.curve||[1,1],p=Math.max(0,Math.min(1,t/s.n))*(c.length-1),i=Math.floor(p);return c[i]+((c[i+1]??c[i])-c[i])*(p-i);};a.curve=Array.from({length:65},(_,i)=>{let t=i*total/64;return t<offset?dyn(song,Math.min(t,end)):dyn(b,start+(t-offset)/ratio);});
 const sections=(s)=>s.vocalParts||[{t:0,end:s.n,settings:s.singing||{on:false}}];a.vocalParts=[...sections(song).filter(x=>x.t<end).map(x=>({...x,end:Math.min(end,x.end)})),...sections(b).filter(x=>x.end>start).map(x=>({...structuredClone(x),t:offset+Math.max(0,x.t-start)*ratio,end:offset+(x.end-start)*ratio}))];
 let left=song.singing||{},right=b.singing||{};let active=[left,right].filter(x=>x.on&&x.text);if(active.length){a.singing={...active[0],text:active.map(x=>x.text).join('\n'),reading:active.map(x=>x.reading||x.text).join('\n')};}a.title=((song.title||'無題')+' ＋ '+(b.title||'無題')).slice(0,50);return a;};
