// Shared beat clock; each entry is a landing, not a column shared by every part.
window.Ensemble=(()=>{const base=window.Ensemble,{styles,noise}=base;
const chords=[...base.chords,['maj9',[0,4,7,11,14]],['13th',[0,4,10,14,21]],['7♭9',[0,4,10,13]],['6/9',[0,4,7,9,14]]];
// Per-bar onset positions in sixteenths: lead, comping, bass, percussion.
const patterns=[
 ['0358be','068c','08be','02468ace','王道進行と短い歌のフック。2・4拍を強調。'],
 ['02468ace','02468ace','02468ace','0123456789abcdef','8分のパワーコードと低音のユニゾン。'],
 ['2369be','267abe','038be','024678acdef','裏拍のカッティング、9thと13th、次の根音へ滑り込むベース。'],
 ['038b','0b','07ab','0234678bcdef','ハーフタイムのスネア、間を空けた低音、細かなハット。'],
 ['068c','08','08','048c','長い歌の音、ピアノの分散和音とゆったりした低音。'],
 ['047ac','048c','08a','02468ace','余韻の長いリードと分散和音、サビで厚くなるバックビート。'],
 ['0368ad','0369c','038ad','024678ace','刻みの位置をずらしたギターリフと開放的な5度。'],
 ['367abe','16ab','038be','024678acde','後ろに寄せた拍、m9の鍵盤と低音の合いの手。'],
 ['0258ace','269e','048c','0468ce','跳ねる8分、ii–V–Iと4分のウォーキングベース。'],
 ['048ac','02468ace','08','048c','親指の交互低音とアコースティックの指弾き。'],
 ['0268ae','26ae','0268ace','02468ace','四つ打ち、裏の短いシンセ、反復する低音。'],
 ['03589ce','08a','08c','0368ac','五音の旋律、三味線の短いアタックと太鼓の応答。'],
 ['048c','08','0','08c','弦と木管の長い旋律、低弦の持続音と節目の打楽器。']
];
const harmony=[
 [[5,8],[7,9],[4,7],[9,7]],[[0,3],[7,3],[9,3],[5,3]],[[5,14],[4,16],[9,11],[2,11],[7,15],[0,17]],
 [[0,11],[0,11],[5,7],[7,9]],[[0,10],[9,7],[5,8],[7,5]],[[0,10],[7,5],[9,7],[5,8]],[[0,3],[8,3],[3,4],[10,5]],[[0,11],[5,11],[8,14],[7,16]],[[2,11],[7,15],[0,14],[9,9]],[[0,1],[5,10],[7,9],[0,1]],[[0,7],[8,8],[3,8],[10,1]],[[0,4],[10,3],[5,5],[7,3]],[[0,1],[5,8],[2,7],[7,9]]
];
const motifs=[[4,7,9,7,4,2],[0,0,7,10,7,5],[11,14,12,9,7,4],[0,3,7,3],[4,7,9,7],[0,2,4,7,9],[0,7,2,0,10],[7,10,14,12,7],[4,7,10,9,7,5],[0,4,7,9,7],[0,7,12,7],[0,3,5,7,10],[0,4,7,12]];
function stockHarm(s,time){let t=time*4/StairGroove.bar(s),bar=Math.floor(t/4),p=harmony[s.genre];if(s.genre===2){let i=bar%4;return p[i<2?i:i===2?(t%4<2?2:3):(t%4<2?4:5)];}return p[bar%p.length];}
function harm(s,time){let [r,q]=stockHarm(s,time),wasMinor=styles[s.genre][2]===1;if(StairGroove.minor(s)===wasMinor)return [r,q];const src=wasMinor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11],dst=wasMinor?[0,2,4,5,7,9,11]:[0,2,3,5,7,8,10],d=src.indexOf(r);if(d<0)return [r,q];let third=(dst[(d+2)%7]-dst[d]+12)%12;return [dst[d],q===3?3:third===3?(q>=7?11:2):(q>=7?14:1)];}
function protectedAt(s,t){return !!s.range&&t>=s.range[0]&&t<s.range[1];}
function fill(s,li,keep){let l=s.lanes[li],r=l.role,pattern=patterns[s.genre][r],notes=[],old=l.steps||[],shift=Math.floor(Math.random()*3),spice=Math.random(),mot=motifs[s.genre],f=StairGroove.phrase(s.genre),measure=StairGroove.bar(s);
 for(let b=0;b<s.n;b+=measure){let entries=StairGroove.grid(s,r,b,pattern,f);if(l.density===1)entries=entries.filter((x,i)=>r===3?x.drum!==2:i%2===0);if(l.density===2){const unit=1/(measure*4);entries=entries.flatMap(x=>[x,{pos:x.pos+unit,drum:2,vel:.30}]).filter((x,i,a)=>x.pos<1&&a.findIndex(y=>Math.abs(y.pos-x.pos)<.001)===i).sort((a,b)=>a.pos-b.pos);}let pos=entries.map(x=>x.pos*16);
 pos.forEach((p,k)=>{let t=b+entries[k].pos*measure;if(t>=s.n||keep&&protectedAt(s,t))return;let [root,q]=harm(s,t),m=mot[(k+shift+(b%8?1:0))%mot.length],next=harm(s,b+measure)[0];
 let bass=s.genre===8?[0,4,7,(next-root+11)%12][k%4]:s.genre===2?(k===pos.length-1?(next-root+11)%12:[0,7,12,0,7][k%5]):[0,7,0,12][k%4];
 let drum=p%8===0?0:p%8===4?1:2;if(s.genre===3)drum=p===8?1:[0,7,11].includes(p)?0:2;if(s.genre===10)drum=p%4===0?0:2;
 if(r===0&&s.genre===11)m=[0,3,5,7,10][(k+shift)%5]-root;let off=r===2?bass:r===0?m:0;if(r===0&&s.genre===2){const hook=q===16?[10,13,12,10,7,4]:q===11?[10,14,12,7,3,2]:q===15?[9,14,12,10,7,4]:[11,14,12,9,7,4];off=hook[(k+shift)%6];} if(r===2&&k>0&&k<pos.length-1&&spice>.65)off+=12;if(r===3&&p%4===2&&spice>.7)drum=1;
 if(r===2&&k>0&&off>=12&&s.genre!==2)off=7;if(r===0)off=StairGroove.melody(f,b,k,entries[k].pos,root,q,chords[q]?.[1],s);if(r===3)drum=entries[k].drum;notes.push({t,d:r===3?drum:0,p:off,root,q,k:r===3?3:r===1?([4,5,9].includes(s.genre)?2:1):0,v:-1,vel:entries[k].vel??((p%4===0?1:.78)*(k%3===1?.88:1)),kit:!!entries[k].kit});});}
 if(keep&&s.range)notes.push(...old.filter(x=>protectedAt(s,x.t)));l.steps=notes.sort((a,b)=>a.t-b.t);if(!l.steps.length)l.steps=[{t:0,d:0,p:0,k:4,v:-1,q:0}];}
function lane(s,r){let l={role:r,ball:[0,7,4,5][r],voice:styles[s.genre][3][r]??2,vol:[84,75,85,70][r],mute:false,steps:[]};s.lanes.push(l);fill(s,s.lanes.length-1,false);}
function fresh(){let s=base.fresh();s.version=3;s.n=16;s.lanes=[];s.curve=[.8,.83,.9,1];for(let r=0;r<4;r++)lane(s,r);return s;}
function migrate(raw){if(raw.version===3)return raw;let s=base.migrate(raw);s.version=3;s.oldArrangement=true;s.range=s.lock.length?[s.lock[0],s.lock.at(-1)+1]:null;s.curve=[1,1];s.lanes.forEach(l=>l.steps.forEach((x,i)=>x.t=i));return s;}
function dynamic(s,t){let a=s.curve||[1,1],p=Math.max(0,Math.min(1,t/s.n))*(a.length-1),i=Math.floor(p);return a[i]+((a[i+1]??a[i])-a[i])*(p-i);}
function compose(s){if(s.legacy||s.oldArrangement){const old=base.compose(s);old.start=s.legacy?.45:.55;for(const e of old.events){let best=Infinity;old.paths.forEach((h,j)=>h.forEach((time,i)=>{let diff=e.time-time;if(diff>=-.001&&diff<best){best=diff;e.lane=j;e.step=i;}}));}const deg=s.mood===1?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11],roots=[60,57,65];for(const e of old.events){const x=s.lanes[e.lane]?.steps[e.step];if(!x||![1,2].includes(x.k)||Math.abs(e.time-old.paths[e.lane][e.step])>.001)continue;let i=e.step,d=(i===s.n-1?0:(s.legacy?[[0,4,5,3],[0,5,2,6],[0,3,1,4]][s.mood]:styles[s.genre][4])[Math.floor(i/4)%4])+x.d;let q=x.q||0;const third=(deg[(d+2)%7]-deg[d%7]+12)%12,fifth=(deg[(d+4)%7]-deg[d%7]+12)%12;e.chord={root:roots[s.mood]+deg[d%7],q:q||(third===3?(fifth===6?12:2):1)};}old.end=old.events.reduce((v,e)=>Math.max(v,e.time+e.len+.9),old.end);return old;}let beat=60/s.tempo,paths=[],events=[],tonic=StairGroove.tonic(s),st=styles[s.genre],scale=StairGroove.minor(s)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];s.lanes.forEach((l,j)=>{let hits=l.steps.map((x,i)=>{let t=x.t,delay=(s.meter===2||s.meter===4)?0:t%1===.5?(x.swing??st[6])*.5:0;return .55+beat*(t+delay+(l.ball===1?(noise(s.seed,Math.round(t*16),j)-.5)*.1:0));});paths.push(hits);let prev=null;
 l.steps.forEach((x,i)=>{if(l.mute||x.k===4||(s.chorus&&x.t<Math.min(4,s.chorus/2)&&l.role===3))return;let t=hits[i],gap=Math.max(.06,(hits[i+1]??(.55+s.n*beat))-t),root=x.root??harm(s,x.t)[0],m=tonic+root+(x.p||0)+scale[x.d%7]+12*Math.floor(x.d/7)-((x.part??l.role)===2?24:0),v=x.v<0?l.voice:x.v,gain=.39*(x.gain??1)*l.vol/100*(x.vel??1)*dynamic(s,x.t)*(s.chorus&&x.t<s.chorus?(l.role===3?.55:.78):1);
 function emit(time,p,v,amp,len){events.push({time,m:p,v,amp,len,lane:j,step:i,chord:(x.k===1||x.k===2)&&Math.abs(time-t)<.001?{root:m,q:x.q}:null});}
 if(x.k===3){emit(t,0,18+x.d%3,gain*1.15,x.d%3===0?.39:x.d%3===1?.28:.11);if(x.kit&&x.d%3!==2)emit(t,0,20,gain*.21,.10);return;}
 let ns=x.k===0?[m]:(chords[x.q]?.[1]||[0,4,7]).map(n=>m+n);if(x.k!==0&&[2,7,8].includes(s.genre)){ns=ns.slice(1).map(n=>{while(n>78)n-=12;while(n<55)n+=12;return n;}).sort((a,b)=>a-b);if(prev){let best=ns,cost=Infinity;for(let rot=0;rot<ns.length;rot++){for(let oct of [-12,0,12]){let v=ns.slice(rot).concat(ns.slice(0,rot).map(n=>n+12)).map(n=>n+oct);if(v[0]<51||v.at(-1)>86)continue;let c=v.reduce((sum,n,k)=>sum+Math.abs(n-prev[Math.min(k,prev.length-1)]),0);if(c<cost){best=v;cost=c;}}}ns=best;}prev=ns;}
 const short=l.role===1&&[1,2,6,10].includes(s.genre),len=Math.min(3,Math.max(.10,gap*(short?.66:1.03)+(!short?.035:0)));ns.forEach((n,k)=>emit(t+(x.k===2?gap*.72*k/ns.length:x.k===1?.009*k:0),n,v,gain/Math.sqrt(ns.length),len));
 if(l.ball===3&&i%2)emit(t+gap*.58,m,v,gain*.38,Math.min(.3,gap*.35));});});
 // Resolve the final harmony on the next downbeat and leave enough room for release and delay.
 let close=.55+s.n*beat,hold=Math.min(2.8,beat*2.2);s.lanes.forEach((l,j)=>{if(l.mute||!l.vol||!l.steps.some(x=>x.k!==4))return;let v=l.voice,notes=l.role===3?[]:l.role===2?[tonic-24]:l.role===1?[tonic,tonic+(StairGroove.minor(s)?3:4),tonic+7]:[tonic+12];notes.forEach((m,k)=>events.push({time:close+k*.009,m,v,amp:.26*l.vol/100*dynamic(s,s.n)/Math.sqrt(notes.length),len:hold,lane:j,step:l.steps.length,chord:l.role===1&&!k?{root:tonic,q:StairGroove.minor(s)?2:1}:null}));});
 let end=events.reduce((last,e)=>Math.max(last,e.time+e.len),close)+.95;return {paths,events,end,start:.55};}
function chorus(s,li,idx){let span=StairGroove.bar(s);let l=s.lanes[li],a=Math.max(0,Math.min(idx,l.steps.length-4)),lo=l.steps[a].t,hi=l.steps[a+4]?.t??s.n,bar=s.n;for(const track of s.lanes){const phrase=track.steps.filter(x=>x.t>=lo&&x.t<hi);track.steps.push(...phrase.map(x=>({...x,t:bar+(x.t-lo)*span/(hi-lo)})));}s.n+=span;s.chorus=bar;s.range=[bar,bar+span];s.legacy=false;}
return {...base,chords,patterns,fresh,migrate,lane,fill,compose,protectedAt,chorus};})();
