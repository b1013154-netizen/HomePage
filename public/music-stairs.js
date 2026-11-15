(()=>{
'use strict';
const $=id=>document.getElementById(id),E=window.Ensemble,S=window.StairSound,arr=(id,a)=>a.forEach((t,i)=>$(id).append(new Option(t,i)));
arr('genre',E.styles.map(x=>x[0]));arr('ball',E.balls);arr('voice',E.voices);arr('newrole',E.roles);arr('quality',E.chords.map(x=>x[0]));arr('kind',['単音','和音','分散和音','打楽器','休符']);arr('mood',['Cメジャー','Aマイナー','Fメジャー']);arr('theme',['極夜 / Aurora','夕焼け / Ember','霧の森 / Verdant','海辺 / Dawn']);arr('material',['真鍮','ウォールナット','氷ガラス','白磁']);arr('degree',['基音','2度','3度','4度','5度','6度','7度','オクターブ']);$('instrument').append(new Option('パートの楽器',-1));arr('instrument',E.voices);
let song=E.fresh(),sel=0,li=0,ctx,source,raf,run=0,cached,key='',library=[],storageOK=true;const STORE='playground.chime-ateliers.1',lane=()=>song.lanes[li],st=()=>lane().steps[sel],msg=t=>$('status').textContent=t;
const draw=StairDeck($('board'),(j,i)=>{stop();li=j;sel=i;sync();});
function sync(){vocalSettings();sel=Math.min(sel,lane().steps.length-1);let l=lane(),x=st();for(const k of ['genre','title','mood','tempo','theme','material'])$(k).value=song[k];$('view').selectedIndex=song.view;$('voice').value=l.voice;$('ball').value=l.ball;$('vol').value=l.vol;$('mute').checked=l.mute;
$('idx').replaceChildren(...l.steps.map((_,i)=>new Option((i+1)+'段目 · '+(l.steps[i].t+1).toFixed(2)+'拍'+(E.protectedAt(song,l.steps[i].t)?' ◆':''),i)));$('idx').value=sel;$('kind').value=x.k;$('quality').value=x.q;$('quality').disabled=x.k!==1&&x.k!==2;$('instrument').value=x.v;$('degree').value=x.d;
$('tracks').replaceChildren(...song.lanes.map((z,j)=>{let b=document.createElement('button');b.style.setProperty('--lane',E.colors[z.role]);b.textContent=String(j+1).padStart(2,'0')+'　'+E.roles[z.role]+' '+z.steps.length+'段'+(z.mute?' · MUTE':'');b.setAttribute('aria-pressed',String(j===li));b.onclick=()=>{stop();li=j;sync();};return b;}));let locked=!!song.range;
$('lock').textContent=locked?'◆ ロック解除':'◇ 選んだ位置から4段をロック';$('lockstate').textContent=locked?'同じ時間帯を全パートで保持':'';$('lock').disabled=l.steps.length<4&&!locked;$('left').disabled=sel===0||locked;$('right').disabled=sel===l.steps.length-1||locked;$('add').disabled=locked||l.steps.length>=160;$('remove').disabled=locked||l.steps.length<=1;$('pluslane').disabled=locked||song.lanes.length>=4;$('droplane').disabled=locked||song.lanes.length<2;$('genre').disabled=locked;
$('score').textContent=song.lanes.length+' TRACKS　/　'+song.n+' BEATS　/　'+song.tempo+' BPM　/　'+StairGroove.meters[song.meter||0].join('/');$('density').selectedIndex=l.density||0;$('undo').disabled=!history.length;$('hook').disabled=l.steps.length<4||song.n>=48;$('style-note').textContent=E.patterns[song.genre][4]+(song.sections?'　構成：'+song.sections.map(x=>x.name).join(' → '):'')+(song.chorus?'　Aメロ → サビ：'+(song.chorus+1)+'拍目から':'');paintCurve();draw(song,li,sel);syncExtras();}
function stop(t){run++;cancelAnimationFrame(raf);if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}$('stop').disabled=true;$('play').disabled=false;draw(song,li,sel);if(t){msg(t);if(song.singing?.on)$('sing-guide').textContent=t;}$('vocal-solo').disabled=false;}
async function master(){if(vocalSettings().on&&vocalWarning())throw Error(vocalWarning());let k=JSON.stringify(song);if(k!==key){let score=E.compose(song);let data=E.render(score);const vocals=StairVocalScore.melody(song,score);let stem=null;
if(song.singing.on){
 if(!vocals.length)throw Error('歌える音符がありません。メロディーなどの有音程パートを追加し、ミュートを解除してください。');
 const settings={...song.singing};stem=await StairVocalScore.sing(song,score,vocals,data.length);
 let peak=0;for(const sample of stem)peak=Math.max(peak,Math.abs(sample));
 if(!(peak>.01))throw Error('歌声を生成できませんでした。歌詞と音符を確認してください。');
 const gain=(settings.level??110)/100;
 for(let i=0;i<data.length;i++)data[i]=Math.tanh(data[i]*.53+stem[i]*gain);
}
score.wave=data;const fade=Math.min(4410,data.length);for(let i=0;i<fade;i++)data[data.length-fade+i]*=1-i/fade;cached={score,data,stem};key=k;}return cached;}
async function play(solo=false){stop();let token=run;try{ctx=ctx||new AudioContext();await ctx.resume();if(token!==run)return;$('play').disabled=$('vocal-solo').disabled=true;$('stop').disabled=false;if(song.singing?.on){msg('Sinsyで歌声を準備しています…');$('sing-guide').textContent='Sinsyで歌声を準備しています…';}let {data,score,stem}=await master();if(solo)data=stem.map(sample=>Math.tanh(sample*(song.singing.level??110)/100));if(token!==run)return;let buf=ctx.createBuffer(1,data.length,S.rate);buf.copyToChannel(data,0);source=ctx.createBufferSource();source.buffer=buf;source.connect(ctx.destination);let start=ctx.currentTime+.05;source.start(start);if(song.singing?.on)$('sing-guide').textContent='Sinsyの歌声を再生中です。';$('play').disabled=true;$('stop').disabled=false;msg(solo?'歌声だけ試聴中':E.styles[song.genre][0]+'　/　合奏中');let prev=-1;function tick(){if(token!==run)return;let t=ctx.currentTime-start;if(t-prev>.024){draw(song,li,sel,t,score);prev=t;}raf=requestAnimationFrame(tick);}tick();source.onended=()=>{if(token!==run)return;stop('演奏が終わりました。');if($('loop').checked&&!solo)play();};}catch(e){if(token===run)stop(e.message||'再生できませんでした。');}}
$('play').onclick=()=>play();$('stop').onclick=()=>stop('停止しました。');
const history=[];function remember(){history.push(structuredClone(song));if(history.length>20)history.shift();}function change(fn){stop();remember();song.oldArrangement=false;song.legacy=false;fn();sync();} $('undo').onclick=()=>{if(history.length){stop();song=history.pop();li=Math.min(li,song.lanes.length-1);sync();msg('変更をひとつ戻しました。');}};
$('genre').onchange=()=>change(()=>{song.genre=+$('genre').value;const style=E.styles[song.genre];if(song.key===undefined)song.mood=style[2];song.tempo=style[1];song.lanes.forEach((l,j)=>{l.voice=style[3][l.role]??2;E.fill(song,j,false);});});
$('view').onchange=()=>{stop();song.view=$('view').selectedIndex;sync();};for(let k of ['mood','tempo','theme','material'])$(k).onchange=()=>change(()=>song[k]=k==='tempo'?Math.min(180,Math.max(50,Math.round(+$(k).value)||110)):+$(k).value);
for(let k of ['ball','voice','vol','mute'])$(k).onchange=()=>change(()=>lane()[k]=k==='mute'?$(k).checked:+$(k).value);
$('idx').onchange=()=>{stop();sel=+$('idx').value;sync();};$('title').oninput=()=>song.title=$('title').value;
for(let [id,k] of [['kind','k'],['degree','d'],['quality','q'],['instrument','v']])$(id).onchange=()=>change(()=>st()[k]=+$(id).value);
$('lock').onclick=()=>change(()=>{let l=lane(),a=Math.max(0,Math.min(sel,l.steps.length-4));song.range=song.range?null:[l.steps[a].t,l.steps[a+4]?.t??song.n];});
$('density').onchange=()=>change(()=>{lane().density=$('density').selectedIndex;E.fill(song,li,true);});$('part-roll').onclick=()=>change(()=>E.fill(song,li,true));$('hook').onclick=()=>change(()=>{E.chorus(song,li,sel);msg('選んだフレーズをサビにして末尾に追加しました。');});
$('shuffle').onclick=()=>change(()=>{song.lanes.forEach((_,j)=>E.fill(song,j,true));if(!song.range)song.seed=Math.floor(Math.random()*100000);msg(song.range?'ロックした区間を保持して再作曲しました。':'新しいアンサンブルができました。');});
$('pluslane').onclick=()=>change(()=>{E.lane(song,+$('newrole').value);li=song.lanes.length-1;});$('droplane').onclick=()=>change(()=>{song.lanes.splice(li,1);li=Math.min(li,song.lanes.length-1);});
$('add').onclick=()=>change(()=>{let l=lane(),x=st(),t=(x.t+(l.steps[sel+1]?.t??song.n))/2;if(t-x.t<.0625){msg('この間隔には追加できません。');return;}l.steps.splice(++sel,0,{...x,t});});$('remove').onclick=()=>change(()=>{lane().steps.splice(sel,1);sel=Math.min(sel,lane().steps.length-1);});
for(let [id,delta] of [['left',-1],['right',1]])$(id).onclick=()=>change(()=>{let n=sel+delta,steps=lane().steps,a=steps[sel],b=steps[n];steps[n]={...a,t:b.t};steps[sel]={...b,t:a.t};sel=n;});
try{let raw=JSON.parse(localStorage.getItem(STORE)||'[]');if(!Array.isArray(raw))throw Error();library=raw.map(E.migrate);if(!library.every(s=>Array.isArray(s.lanes)&&s.lanes.length>0&&s.lanes.length<=4&&s.lanes.every(l=>l.steps.length>0&&l.steps.every(x=>Number.isFinite(x.t)))&&Array.isArray(s.lock)))throw Error();}catch{storageOK=false;library=[];}

function shelf(){let m=$('library');m.replaceChildren(...library.map((s,i)=>new Option((i+1)+'. '+(s.title||'無題')+'　/ '+(s.n||s.steps.length)+'拍',i)));if(!library.length)m.append(new Option('まだ曲がありません',''));cuts();$('count').textContent=library.length+' / 50';$('append').disabled=$('load').disabled=$('delete').disabled=!library.length;$('save').disabled=!storageOK||library.length>=50;if(!storageOK)$('export-status').textContent='曲棚を読み込めません。音声ファイルへの保存は利用できます。';}
function write(next){try{localStorage.setItem(STORE,JSON.stringify(next));library=next;shelf();return true;}catch{$('export-status').textContent='曲棚に書き込めませんでした。音声として保存してください。';return false;}}
$('save').onclick=()=>{if(library.length>=50||!storageOK)return;if(write([structuredClone(song),...library]))$('export-status').textContent='「'+(song.title||'無題')+'」を曲棚に追加しました。';};$('load').onclick=()=>{const s=library[+$('library').value];if(s){stop();song=E.migrate(structuredClone(s));li=0;sel=0;history.length=0;sync();$('status').textContent='曲棚から「'+(s.title||'無題')+'」を開きました。';}};$('delete').onclick=()=>{let i=+$('library').value;if(library[i]&&confirm('「'+(library[i].title||'無題')+'」を曲棚から削除しますか？')&&write(library.filter((_,n)=>n!==i)))$('export-status').textContent='選んだ曲を削除しました。';};
function download(blob,ext,title){let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(title||'音階階段').replace(/[<>:"/\\|?*]/g,'_')+'.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('wav').onclick=async()=>{try{download(S.wav((await master()).data),'wav',song.title);$('export-status').textContent='WAVを書き出しました。';}catch{$('export-status').textContent='WAVを書き出せませんでした。';}};
$('mp3').onclick=async()=>{let worker,title=song.title;const done=msg=>{worker?.terminate();$('mp3').disabled=false;$('export-status').textContent=msg;};try{$('mp3').disabled=true;$('export-status').textContent='MP3に変換しています…';let data=(await master()).data.slice();worker=new Worker('/stair-encode.js');worker.onerror=()=>done('MP3に変換できませんでした。WAVも利用できます。');worker.onmessage=e=>{if(!e.data.blob){done('MP3に変換できませんでした。');return;}download(e.data.blob,'mp3',title);done('MP3を書き出しました。');};worker.postMessage(data,[data.buffer]);}catch{done('MP3に変換できませんでした。');}};
const cv=$('curve'),cg=cv.getContext('2d');let dragging=false,previous=null;
function paintCurve(){let a=song.curve;cg.clearRect(0,0,800,108);cg.strokeStyle='#516275';cg.lineWidth=1;for(let i=0;i<9;i++){cg.beginPath();cg.moveTo(i*100,0);cg.lineTo(i*100,108);cg.stroke();}cg.beginPath();a.forEach((v,i)=>{let x=i*800/(a.length-1),y=108-(v-.15)/1.15*108;i?cg.lineTo(x,y):cg.moveTo(x,y);});cg.strokeStyle='#76ebce';cg.lineWidth=4;cg.stroke();$('level').value=Math.round(100*a[Math.round(st().t/song.n*(a.length-1))]);}
function expandCurve(){let a=song.curve;song.curve=Array.from({length:65},(_,i)=>{let u=i/64*(a.length-1),k=Math.floor(u);return a[k]+((a[k+1]??a[k])-a[k])*(u-k);});}
function mark(e){let b=cv.getBoundingClientRect(),n=Math.max(0,Math.min(64,Math.round((e.clientX-b.left)/b.width*64))),v=.15+1.15*Math.max(0,Math.min(1,1-(e.clientY-b.top)/b.height));if(previous&&previous.n!==n){let lo=Math.min(previous.n,n),hi=Math.max(previous.n,n);for(let k=lo;k<=hi;k++)song.curve[k]=previous.v+(v-previous.v)*(k-previous.n)/(n-previous.n);}song.curve[n]=v;previous={n,v};paintCurve();}
cv.onpointerdown=e=>{stop();remember();song.oldArrangement=false;song.legacy=false;expandCurve();dragging=true;previous=null;cv.setPointerCapture(e.pointerId);mark(e);};cv.onpointermove=e=>{if(dragging)mark(e);};cv.onpointerup=cv.onpointercancel=()=>{dragging=false;sync();};$('level').onchange=()=>change(()=>{expandCurve();song.curve[Math.round(st().t/song.n*64)]=+$('level').value/100;});
$('video').onclick=async()=>{let rec,stream,dest,src,frameId,timer,finished=false,board=$('board'),main=document.querySelector('main'),title=song.title;
 const end=(message)=>{if(finished)return;finished=true;cancelAnimationFrame(frameId);clearTimeout(timer);if(src){src.onended=null;try{src.stop();}catch{}src.disconnect();}stream?.getTracks().forEach(t=>t.stop());dest?.disconnect();main.inert=false;draw(song,li,sel);$('export-status').textContent=message;};
 try{if(!window.MediaRecorder||!board.captureStream)throw Error('このブラウザは動画保存に対応していません。');stop();main.inert=true;ctx=ctx||new AudioContext();await ctx.resume();
 const {data,score}=await master(),fps=30,buf=ctx.createBuffer(1,data.length,S.rate);buf.copyToChannel(data,0);let mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime)throw Error('このブラウザには利用できる動画形式がありません。');
 dest=ctx.createMediaStreamDestination();src=ctx.createBufferSource();src.buffer=buf;src.connect(dest);stream=board.captureStream(fps);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));rec=new MediaRecorder(stream,{mimeType:mime});let chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.onerror=()=>end('動画を書き出せませんでした。');rec.onstop=()=>{if(finished)return;if(!chunks.length){end('動画データを取得できませんでした。');return;}download(new Blob(chunks,{type:rec.mimeType}),mime.includes('mp4')?'mp4':'webm',title);end('音声付きの演奏動画を書き出しました。');};
 let start=ctx.currentTime+.1;rec.start();src.start(start);let prev=-1;function tick(){let t=ctx.currentTime-start;if(t-prev>1/fps){draw(song,li,sel,t,score);prev=t;$('export-status').textContent='動画を書き出し中… '+Math.min(100,Math.max(0,Math.round(100*t/score.end)))+'％（このタブを開いたままお待ちください）';}frameId=requestAnimationFrame(tick);}tick();src.onended=()=>{if(rec.state==='recording')rec.stop();};timer=setTimeout(()=>{if(rec.state==='recording')rec.stop();},(score.end+4)*1000);
 }catch(e){end(e.message||'動画を書き出せませんでした。');}};


const singer=StairSinger;
arr('lyric-theme',singer.banks.map(x=>x[0]));
function vocalSettings(){song.singing??={on:false,theme:0,text:'',reading:'',voice:0};return song.singing;}
function vocalWarning(){const v=vocalSettings(),text=v.reading.trim()||v.text;return !singer.parse(text).length?'歌詞を生成するか、かなの歌詞を入力してください。':/[^ぁ-ゖァ-ヺー、。！？・「」『』…!?.,、\s]/u.test(text)?'漢字や英字を含む歌詞は「歌う読み」に全文をかなで入力してください。':'';}
function syncExtras(){cuts();$('cadence').selectedIndex=song.cadence?1:0;$('wave').selectedIndex=song.waveOff?1:0;$('meter').value=song.meter||0;$('tonality').value=StairGroove.key(song);$('mode').selectedIndex=StairGroove.minor(song)?1:0;let v=vocalSettings();$('sing-on').checked=v.on;$('lyric-theme').value=v.theme;$('sing-voice').selectedIndex=v.voice;$('lyrics').value=v.text;$('reading').value=v.reading;$('exact-count').value=lane().steps.length;$('resize-track').disabled=!!song.range;$('sing-guide').textContent=v.on?(vocalWarning()||'合成音声を再生と書き出しに含めます。'):'歌詞の作成・編集は歌声をオフにしたままでもできます。';const score=E.compose(song);StairNotation.show(song,score,li);updatePrompt(score);
$('vocal-level').value=v.level??110;$('vocal-percent').value=$('vocal-level').value+'%';
$('brief-preset').value=song.brief?.preset??-1;$('brief-text').value=song.brief?.raw??'';}
$('sing-on').onchange=()=>{stop();let v=vocalSettings();v.on=$('sing-on').checked;if(v.on&&!v.text.trim())v.text=singer.generate(v.theme);syncExtras();};
$('lyric-theme').onchange=()=>vocalSettings().theme=+$('lyric-theme').value;
$('sing-voice').onchange=()=>{stop();vocalSettings().voice=$('sing-voice').selectedIndex;};
$('lyrics-roll').onclick=()=>{stop();remember();delete song.vocalParts;let v=vocalSettings();v.text=singer.generate(v.theme);v.reading='';v.on=true;sync();};
for(const [id,k] of [['lyrics','text'],['reading','reading']])$(id).oninput=()=>{if(source)stop();delete song.vocalParts;vocalSettings()[k]=$(id).value;if($(id).value.trim()){vocalSettings().on=true;$('sing-on').checked=true;}updatePrompt(E.compose(song));$('sing-guide').textContent=vocalWarning()||'入力した歌詞を使用します。';};
$('resize-track').onclick=()=>{const n=+$('exact-count').value;if(!Number.isInteger(n)||n<1||n>160){msg('段数は1〜160の整数で入力してください。');return;}if(song.range)return;change(()=>{let l=lane(),old=l.steps,len=old.length;if(n===len)return;
 // Resample boundaries in musical time, interpolating only where new landings are needed.
 l.steps=Array.from({length:n},(_,j)=>{const p=j*len/n,i=Math.floor(p),x=old[i],end=old[i+1]?.t??song.n;return {...x,t:x.t+(end-x.t)*(p-i)};});sel=Math.min(sel,n-1);});};
$('print-sheet').onclick=()=>window.print();
arr('meter',StairGroove.meters.map(x=>x.join('/')));arr('tonality',['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B']);
for(const id of ['meter','tonality','mode'])$(id).onchange=()=>{if(song.range){msg('拍子や調を変えるにはロックを解除してください。');sync();return;}change(()=>{let old=StairGroove.bar(song);song.key=+$('tonality').value;song.minor=$('mode').selectedIndex===1;song.mood=song.minor?1:0;song.meter=+$('meter').value;if(id!=='tonality'){song.n=Math.max(1,Math.round(song.n/old))*StairGroove.bar(song);delete song.sections;song.chorus=null;song.lanes.forEach((_,j)=>E.fill(song,j,false));}msg('拍子とキーを反映しました。');});};
$('append').onclick=()=>{const saved=library[+$('library').value];if(!saved)return;try{let ring=$('cut-end').value==='ring',joined=StairSplice(song,saved,ring?song.n:+$('cut-end').value,+$('cut-start').value,ring);change(()=>{song=joined;sel=0;li=0;});$('export-status').textContent='曲を連結しました。「曲棚に追加」で別の曲として保存できます。';}catch(e){$('export-status').textContent=e.message;}};
function cuts(){let saved=library[+$('library').value];for(let [id,src,end] of [['cut-end',song,true],['cut-start',saved,false]]){const el=$(id),previous=el.value,stamp=src?JSON.stringify([src.title,src.n,src.lanes.map(l=>l.steps.map(x=>x.t))]):'';if(el.dataset.stamp===stamp)continue;el.dataset.stamp=stamp;el.replaceChildren();if(!src)continue;const time=[...new Set([0,...src.lanes.flatMap(l=>l.steps.map(x=>x.t)),src.n])].sort((a,b)=>a-b);for(let t of time){if(end?t<=0:t>=src.n)continue;let bar=StairGroove.bar(src);el.add(new Option(t===src.n?'曲の末尾':t===0?'曲頭':(Math.floor(t/bar)+1)+'小節 / ＋'+Number((t%bar).toFixed(3))+'拍',t));}if(end)el.add(new Option('曲末の主音を1拍残して接続','ring'));el.value=[...el.options].some(o=>o.value===previous)?previous:String(end?src.n:0);}}
$('library').onchange=cuts;$('cadence').onchange=()=>change(()=>song.cadence=!!$('cadence').selectedIndex);$('wave').onchange=()=>change(()=>song.waveOff=!!$('wave').selectedIndex);
$('random-all').onclick=()=>change(()=>{let r=n=>Math.floor(Math.random()*n),s=E.fresh();s.genre=r(E.styles.length);s.key=r(12);s.minor=!!r(2);s.mood=s.minor?1:0;s.meter=r(5);s.tempo=Math.round(E.styles[s.genre][1]*(.85+Math.random()*.3));s.n=StairGroove.bar(s)*[3,4,6,8][r(4)];s.theme=r(4);s.material=r(4);s.view=r(2);s.cadence=!!r(2);s.title=['雨粒','水晶','白夜','潮風','青葉','月影','木星','真昼'][r(8)]+'の'+['散歩道','列車','光','遠まわり','しらべ','手紙'][r(6)];s.lanes=[];const roles=[0,1,2,3].filter((x,i)=>!i||Math.random()>.23);for(let role of roles){E.lane(s,role);let l=s.lanes.at(-1);l.voice=role===2?[7,12,8][r(3)]:r(E.voices.length);l.ball=r(E.balls.length);l.vol=55+r(41);l.density=r(3);E.fill(s,s.lanes.length-1,false);}s.curve=Array.from({length:5},()=>.55+Math.random()*.65);let theme=r(StairSinger.banks.length);s.singing={on:!!r(2),voice:r(3),theme,text:StairSinger.generate(theme),reading:''};song=s;li=sel=0;msg('新曲を生成しました。「合奏を再生」で波形と動きを見られます。');});
function updatePrompt(score){
 $('prompt-style').value=StairBrief.describe(song,score);
 $('prompt-lyrics').value=song.singing?.on?song.singing.text:'';
 $('copy-lyrics').disabled=!$('prompt-lyrics').value;
}
$('brief-preset').add(new Option('自由入力・おまかせ',-1));arr('brief-preset',StairBrief.scenes.map(row=>row[0]));
function readBrief(){return {preset:Number($('brief-preset').value),raw:$('brief-text').value};}
for(const id of ['brief-preset','brief-text'])$(id).oninput=()=>{song.brief=readBrief();updatePrompt(E.compose(song));};
$('brief-roll').onclick=()=>change(()=>{
 const {preset,raw}=readBrief();song=StairBrief.create(preset,raw);li=sel=0;
 $('brief-result').textContent=E.styles[song.genre][0]+' · '+song.tempo+' BPM · '+(song.singing.on?'歌あり':'インスト')+'で作曲しました。';
});
$('sheet-part').onchange=()=>{li=Number($('sheet-part').value);sel=0;stop();sync();};
$('sheet-bars').onchange=()=>StairNotation.show(song,E.compose(song),li);
$('vocal-level').oninput=()=>{stop();vocalSettings().level=Number($('vocal-level').value);$('vocal-percent').value=$('vocal-level').value+'%';};
$('vocal-midi').onclick=()=>{
 const warning=vocalWarning();if(warning){$('sing-guide').textContent=warning;return;}
 const active={...song,singing:{...song.singing,on:true}},notes=StairVocalScore.melody(active,E.compose(song));
 if(!notes.length){$('sing-guide').textContent='メロディーのミュートを解除してください。';return;}
 download(StairVocalScore.midi(song,notes),'mid',song.title);$('sing-guide').textContent='テンポ・メロディー・かな歌詞入りのMIDIを保存しました。';
};
$('vocal-solo').onclick=()=>{const v=vocalSettings();v.on=true;if(!v.text&&!v.reading)v.text=singer.generate(v.theme);syncExtras();play(true);};
for(const kind of ['style','lyrics'])$('copy-'+kind).onclick=async()=>{
 const field=$('prompt-'+kind);
 try{await navigator.clipboard.writeText(field.value);$('copy-status').textContent='コピーしました。';}
 catch{field.focus();field.select();$('copy-status').textContent='文章を選択しました。端末のコピー操作を使ってください。';}
};
song.singing={on:true,voice:0,theme:7,text:'よるのまちに\nきみのこえがひびく',reading:''};
sync();shelf();
})();

