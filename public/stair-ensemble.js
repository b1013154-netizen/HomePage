window.Ensemble=(()=>{
const voices=['ピアノ','アコースティックギター','マリンバ','オルゴール','フルート','弦楽セクション','エレキギター','エレキベース','エレクトリックピアノ','シンセリード','ブラス','ハープ','チェロ','クラリネット','三味線','オルガン','ヴィブラフォン','オーボエ'];
const balls=['ビー玉','ラグビーボール','木の玉','スーパーボール','スチール球','テニスボール','バスケットボール','クリスタル','卓球ボール','ボウリング球'];
const chords=[['調に沿う三和音',null],['メジャー',[0,4,7]],['マイナー',[0,3,7]],['パワーコード',[0,7,12]],['sus2',[0,2,7]],['sus4',[0,5,7]],['6th',[0,4,7,9]],['m7',[0,3,7,10]],['maj7',[0,4,7,11]],['7th',[0,4,7,10]],['add9',[0,4,7,14]],['m9',[0,3,7,10,14]],['dim',[0,3,6]],['aug',[0,4,8]]];
const roles=['メロディー','コード','ベース','リズム'],colors=['#68f4d0','#e1a9ff','#fbbf78','#83bbff'];
// genre, BPM, key mood, instruments, scale degrees, chord voicings, offbeat, chord/bass/drum patterns
const styles=[
 ['J-POP',116,0,[0,1,7],[3,4,2,5],[8,9,7,7],0,'1010','1011','KHS H'],
 ['J-Rock',154,0,[6,6,7],[0,4,5,3],[3,3,3,3],0,'1111','1111','KHSK'],
 ['シティーポップ',104,0,[8,1,7],[3,2,1,4],[8,7,7,9],.08,'0110','1011','KHSH'],
 ['ヒップホップ',84,1,[9,8,7],[0,0,3,4],[11,7,7,9],.19,'1001','1001','KHSK'],
 ['バラード',68,0,[0,11,12],[0,5,3,4],[10,7,8,5],0,'1000','1000','K..S'],
 ['ロックバラード',78,0,[6,0,7],[0,4,5,3],[10,5,7,8],.03,'1010','1010','K.S.'],
 ['オルタナティブロック',135,1,[6,9,7],[0,5,2,6],[3,4,3,5],.04,'1101','1101','KSKH'],
 ['R&B / ソウル',88,1,[8,15,7],[0,3,5,4],[11,7,8,9],.14,'0101','1011','K.HS'],
 ['ジャズ',125,0,[13,8,7],[1,4,0,5],[7,9,8,7],.30,'0101','1111','HSHK'],
 ['フォーク',96,0,[4,1,12],[0,3,4,0],[0,10,9,0],.05,'1111','1010','K.H.'],
 ['エレクトロ',128,1,[9,8,7],[0,5,2,6],[7,8,8,4],0,'0101','1111','KHKH'],
 ['和風フュージョン',108,1,[14,11,12],[0,6,3,4],[4,3,5,9],.08,'1011','1010','K.HS'],
 ['オーケストラ風',92,2,[5,11,12],[0,3,1,4],[0,8,7,9],0,'1111','1010','K..H']
];
const rnd=n=>Math.floor(Math.random()*n);
function step(role,i,n,style,motif){let b=i%4,bar=Math.floor(i/4)%4,final=i===n-1,d=motif[(b+(bar===2?1:0))%4];if(role===0)return {d:final?0:d,k:b===3&&!final&&Math.random()<.16?4:0,v:-1,q:0};
if(role===1)return {d:0,k:final?1:style[7][b]==='1'?(Math.random()<.18||style[1]<80||style[0]==='フォーク'||style[0]==='オーケストラ風'?2:1):4,v:-1,q:final?0:style[5][bar]};
if(role===2)return {d:!final&&b===3?(Math.random()<.6?4:2):0,k:final||style[8][b]==='1'?0:4,v:-1,q:0};
let ch=style[9].replace(/ /g,'')[b];if(b===3&&Math.random()<.22)ch='H';return {d:ch==='H'?2:ch==='S'?1:0,k:ch==='.'?4:3,v:-1,q:0};}
function fill(s,li,keep){let l=s.lanes[li],st=styles[s.genre],motif=[0,[1,2,4][rnd(3)],[2,4,5][rnd(3)],[1,2,4][rnd(3)]];l.steps=Array.from({length:s.n},(_,i)=>keep&&s.lock.includes(i)?l.steps[i]:step(l.role,i,s.n,st,motif));}
function lane(s,role){let st=styles[s.genre];const l={role,ball:[0,7,4,5][role],voice:st[3][role]??2,vol:[85,65,80,65][role],mute:false,steps:[]};s.lanes.push(l);fill(s,s.lanes.length-1,false);}
function fresh(){let s={version:2,title:'夜光スタジオ',genre:2,mood:0,tempo:104,theme:0,material:0,view:0,n:16,seed:rnd(100000),lock:[],lanes:[]};for(let r=0;r<4;r++)lane(s,r);return s;}
function migrate(s){if(s.version===2)return s;return {version:2,title:s.title,genre:0,mood:s.mood,tempo:s.tempo,theme:s.theme,material:s.material,view:0,n:s.steps.length,seed:17,lock:[],legacy:true,lanes:[{role:0,ball:s.ball,voice:s.voice,vol:85,mute:false,steps:s.steps.map(x=>({...x,q:0}))}]};}
const fract=x=>x-Math.floor(x),noise=(seed,i,l)=>fract(Math.sin(seed*.17+i*73.1+l*29.31)*43758.54);
function compose(s){if(s.legacy&&s.lanes.length===1&&!s.lanes[0].mute){let l=s.lanes[0],old=StairSound.compose({...s,...l});return {...old,paths:[old.hits],old:true};}
let events=[],paths=[],beat=60/s.tempo,st=styles[s.genre],scale=s.mood===1?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11],root=[60,57,65][s.mood],pitch=d=>root+scale[d%7]+12*Math.floor(d/7);
s.lanes.forEach((l,j)=>{let hits=[];paths.push(hits);l.steps.forEach((x,i)=>{let jitter=l.ball===1?(noise(s.seed,i,j)-.5)*.29:0,t=.55+beat*(i+(i%2?st[6]:0)+jitter);hits.push(t);if(l.mute||x.k===4)return;
let deg=(i===s.n-1?0:st[4][Math.floor(i/4)%4])+x.d,m=pitch(deg)-(l.role===2?24:0),v=x.v<0?l.voice:x.v,amp=.36*l.vol/100*(i%4?.82:1);function emit(time,n,voice,gain,len){events.push({time,m:n,v:voice,amp:gain,len});}
if(x.k===3){emit(t,x.d,18+x.d%3,amp*1.7,.36);return;}
const notes=x.k===0?[0]:chords[x.q][1]||[0,pitch(deg+2)-pitch(deg),pitch(deg+4)-pitch(deg)];notes.forEach((n,k)=>emit(t+(x.k===2?beat*.72*k/notes.length:0),m+n,v,amp/Math.sqrt(notes.length),x.k===1?1.5:.92));
if(l.ball===3&&i%2)emit(t+beat*.58,m,v,amp*.4,.32);});});return {events,paths,end:.55+s.n*beat+1.8};}
// Cached harmonic wavetables keep multi-part offline rendering inexpensive.
const spectra=[[1,.43,.20,.12],[1,.6,.25,.27,.12],[1,0,0,.55],[1,.18,.45,0,.3],[1,.15,.04],[1,.58,.42,.28,.2],[1,.76,.61,.48,.36,.22,.17],[1,.35,.11,.04],[1,.13,.48,.04],[1,.47,.32,.24,.20,.16,.13],[1,.86,.64,.31,.15],[1,.56,.17,.1],[1,.53,.46,.29,.25],[1,.04,.46,.02,.17],[1,.72,.15,.49,.23],[1,.8,0,.55,.1],[1,0,.38,.25],[1,.78,.44,.18,.09]];
const tabs=spectra.map(row=>Float32Array.from({length:2048},(_,i)=>row.reduce((a,w,k)=>a+w*Math.sin(i*(k+1)*Math.PI/1024),0)/Math.sqrt(row.reduce((a,w)=>a+w*w,0))));
function render(score){if(score.old)return StairSound.render(score);let R=44100,out=new Float32Array(Math.ceil(score.end*R)),dec=[3.2,5,8,3,2.2,1.9,2.2,3.5,3,2.1,2.7,4.8,2.2,2.3,6.3,1.4,2.6,2.8];for(let e of score.events){let a=Math.round(e.time*R),n=Math.min(Math.round(e.len*R),out.length-a),v=e.v,tab=tabs[v],f=440*2**((e.m-69)/12),dp=f*2048/R,phase=0,amp=e.amp,fall=Math.exp(-(dec[v]||13)/R),attack=R*([4,5,10,12,13,17].includes(v)?.048:.004),rng=1;
for(let i=0;i<n;i++){let x;if(tab){phase+=dp;x=tab[phase&2047];if(v===5||v===12)x=.65*x+.35*tab[Math.floor(phase*1.003)&2047];if(v===16)x*=.8+.2*Math.cos(i*.0008);}else{rng=(Math.imul(rng,1664525)+1013904223)>>>0;let t=i/R,white=rng/2147483648-1;x=v===18?Math.sin(280*t+12*(1-Math.exp(-30*t))):v===19?.7*white+.3*Math.sin(1120*t):white*(i%2?1:-1)*.55;}out[a+i]+=amp*x*Math.min(1,i/attack,(n-i)/900);amp*=fall;}}
let peak=.7;for(let i=0;i<out.length;i++){if(i>7450)out[i]+=.13*out[i-7450];peak=Math.max(peak,Math.abs(out[i]));}for(let i=0;i<out.length;i++)out[i]*=.87/peak;return out;}
return {voices,balls,chords,roles,colors,styles,fresh,lane,fill,migrate,compose,render,noise};})();
