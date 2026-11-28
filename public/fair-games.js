'use strict';
function saved(key, fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function storeItem(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function openPage(title,path){const a=document.createElement('a');a.textContent=title;a.href=path;ui.append(a)}
function selectOne(title,values){const l=document.createElement('label'),s=document.createElement('select');l.textContent=title+' ';for(const [i,v] of values.entries())s.add(new Option(v,i));l.append(s);ui.append(l);return s}
function dateJP(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date())}
games.detective=function(){
 const cases=[
 ['プリン二つにスプーン一本','プリンは二つ売れた。洗い場に戻ったスプーンは一本。',['レジを見る','冷蔵庫を見る','窓を見る'],['袋代が一件だけ記録されている。','プリンの型は二つ空いている。','夕方は晴れていた。'],['一つは手土産にした','二つとも店で別々に食べた','店主が注文を消した'],0,'一つは箱に入り、もう一つはカウンターで食べられた。'],
 ['開かなかった傘','傘立ては空なのに、窓際の席にだけ水滴がある。',['伝票を見る','水滴を見る','床を見る'],['アイスティーと氷の追加。','丸いコースターの縁に沿った輪。','入口のマットは乾いている。'],['雨漏り','冷たいグラスの結露','濡れた傘を置いた'],1,'たっぷりの氷が入ったグラスを、客は窓辺でゆっくり空けた。'],
 ['二脚の椅子と一人分の伝票','向かい合う椅子が二脚引かれ、注文は一人分だけ。',['椅子を見る','伝票を見る','足元を見る'],['片方には四角い革の跡。','紅茶一杯、長い滞在。','札の切れ端に「手荷物」の文字。'],['二人目は食い逃げした','椅子を交換した','片方に鞄を置いた'],2,'鞄は客の正面で、同じだけの時間を過ごした。'],
 ['一度も鳴らなかったベル','最後の会計のあと、入口のベルは鳴っていない。',['名札を見る','レシートを見る','裏口を見る'],['最後の客の欄に店員の名前。','従業員割引が付いている。','スタッフ専用出口が開いている。'],['店員が仕事帰りに買った','入口が壊れた','外から注文した'],0,'遅番の店員は自分用に珈琲を買い、いつもの裏口から帰った。'],
 ['湯気の消えたカップ','注文は熱いミルク。客が帰った卓には白いひげの写真が一枚。',['皿を見る','写真の端を見る','レジを見る'],['小さな子用の受け皿。','子供が鼻の下を指さしている。','キッズミルク一杯。'],['雪が吹き込んだ','子供がミルクひげを記念撮影した','ラテアートを売った'],1,'口元の泡が落ちる前に、親子は小さな記念写真を撮った。'],
 ['空っぽの花瓶','入口に花瓶を残して花束だけが消えた。',['リボンを見る','カードを見る','水を見る'],['「祝・卒業」の文字。','受取済みの取り置き札。','水は朝から替えてある。'],['記念の花束を受け取った','花瓶を売った','植え替えた'],0,'店で冷やしておいた花束を、式帰りの客が受け取った。'],
 ['逆さの数字','伝票には「09」。店内の席は六番まで。',['伝票を回す','席を見る','紙の端を見る'],['反対から読むと「60」に見える。','席番号は別の丸印にある。','横に「分」の印字。'],['九番席','六十円の割引','滞在時間60分'],2,'片付け中にひっくり返った、時間制の利用票だった。']
 ];
 const day=dateJP();const date=/^\d{4}-\d{2}-\d{2}$/.test(params.get('day'))?params.get('day'):day;
 const d=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);const c=cases[((Number.isFinite(d)?d:0)%cases.length+cases.length)%cases.length];
 function art(clue=''){background('#ddd0ba');rect(65,38,470,252,'#fff9e9');label(date+'　閉店記録',300,86,17);label(c[0],300,158,31);label(clue||'☕',300,232,clue?19:48)}
 art();screen(c[1]+'　一か所だけ調べられます。');c[2].forEach((s,i)=>button(s,()=>{art(c[3][i]);screen('今夜、何が起きた？');c[4].forEach((v,j)=>button(v,()=>{art(j===c[5]?'解決':'真相判明');end(date+'「'+c[0]+'」'+(j===c[5]?' 解決！':' 推理完了'),{day:date});msg.textContent=c[6]}))}))
};
games.postcard=function(){
 const skies=['#9ccdd9','#f1ae8d','#6577ab'],buildings=['🏠','🏰','🗼'],guests=['🚲','🐈','☂️'],skynames=['朝の空','夕焼け','夜空'];
 const draw=()=>[0,0,0,0,0].map((_,i)=>Math.floor(random()*(i<3?3:5)));
 const source=draw(),hint=(params.get('h')||'').slice(0,80);
 function scene(a){background(skies[a[0]]);ellipse(460,66,25,25,'#ffe8b3');rect(0,220,600,110,'#bad2a3');label(buildings[a[1]],70+a[3]*112,222,90);label(guests[a[2]],70+a[4]*112,277,45)}
 function pair(a,b){scene(a);const snap=document.createElement('canvas');snap.width=600;snap.height=330;snap.getContext('2d').drawImage(board,0,0);scene(b);const copy=document.createElement('canvas');copy.width=600;copy.height=330;copy.getContext('2d').drawImage(board,0,0);background();g.drawImage(snap,6,60,289,180);g.drawImage(copy,305,60,289,180);label('送り主の風景',150,275,20);label('受け手の風景',450,275,20)}
 const answer=params.get('picture');if(hint&&/^[0-2]{3}[0-4]{2}$/.test(answer)){pair(source,[...answer].map(Number));end('絵はがき「'+hint+'」',{h:hint,picture:answer});return}
 if(hint){const a=[0,0,0,2,3];scene(a);screen('届いた便り「'+hint+'」　部品と位置を選んで風景を復元。');[skynames,buildings,guests,['左端','左','中央','右','右端'],['左端','左','中央','右','右端']].forEach((v,i)=>{const s=selectOne(['空','建物','手前の物','建物の位置','手前の位置'][i],v);s.value=a[i];s.onchange=()=>{a[i]=+s.value;scene(a)}});button('絵はがきを合わせる',()=>{pair(source,a);end('絵はがき「'+hint+'」',{h:hint,picture:a.join('')})});return}
 background();label('✉',300,205,98);screen('旅先の景色を5秒見て、一行だけの便りを書きます。');button('景色を見る',()=>{screen('風景を覚えてください');scene(source);setTimeout(()=>{background();label('宛先　まだ見ぬ旅人へ',300,166,29);screen('地名を伏せて、覚えた風景を一行で。');const f=input('例　夕焼けの塔の左に自転車');button('便りを封じる',()=>{const h=f.value.trim();if(!h)return f.focus();screen('便りができました。「'+h+'」');invite('言葉から風景を復元してみてください。',{h});openPage('この端末で復元する',location.pathname+'?read#'+new URLSearchParams({s:seed,h}))})},5000)})
};
games.future=function(){
 const key='playground.yesterday.v1',questions=[['明日聴くならどの曲名？','雨粒交響曲','午前二時の港','知らない駅で'],['最初に寄りたいのは？','夜明けのパン屋','海沿いの本屋','路地裏の喫茶店'],['今いちばん欲しい時間は？','誰かと話す','一人で歩く','何もしない'],['旅に一つ持つなら？','方位磁針','白紙の日記','フィルムカメラ']];
 let letter=saved(key,null);function art(s){background('#e5dbc8');rect(70,60,460,205,'#fff7dc');label('✉',300,158,62);label(s,300,220,23)}
 function wait(){const n=Math.ceil((letter.at-Date.now())/60000);art('封印中');screen('この端末で '+new Date(letter.at).toLocaleString('ja-JP')+' に開封できます。あと約'+Math.max(0,n)+'分。');button('開封時刻を確認',()=>Date.now()>=letter.at?open():wait())}
 function open(){const q=questions[letter.q];art('封を開く前に');screen(q[0]);q.slice(1).forEach(v=>button(v,()=>{const old=letter;art(v===old.choice?'昨日の私と一致':'気分が変わった');end('前の自分は「'+old.choice+'」、今は「'+v+'」。',{});msg.textContent+=' 封をした理由：'+(old.reason||'記入なし');storeItem(key,null)}))}
 if(letter&&questions[letter.q]&&Number.isFinite(letter.at))return Date.now()>=letter.at?open():wait();
 const qi=Math.floor(random()*questions.length),q=questions[qi];art('未来の自分へ');screen(q[0]+'　未来の答えを予想してください。');q.slice(1).forEach(v=>button(v,()=>{screen('予想「'+v+'」　理由と開封時刻を決めてください。');const f=input('予想した理由（任意）');[10,1440].forEach(m=>button(m===10?'10分後に開ける':'24時間後に開ける',()=>{letter={q:qi,choice:v,reason:f.value.trim(),at:Date.now()+m*60000};if(storeItem(key,letter))wait();else msg.textContent='この端末では封書を保存できませんでした。'}))}))
};
function unpackMap(s){return typeof s==='string'&&/^(?:[0-9a-z]{1,2}-[0-9a-z]{1,2}\.){2,239}[0-9a-z]{1,2}-[0-9a-z]{1,2}$/.test(s)?s.split('.').map(v=>v.split('-').map(n=>parseInt(n,36))).filter(([x,y])=>x<=600&&y<=330):[]}
games.expo=function(){
 const sample='50-2s.88-1y.b4-2s.e2-5a.bu-6o.96-72.64-65.4s-4m';
 const maps=saved('playground.islands.v1',[]),songs=saved('playground.chime-ateliers.1',[]);
 const islands=[['見本の島',sample],...(Array.isArray(maps)?maps:[]).filter(v=>v&&unpackMap(v.map).length>=3).map(v=>[v.title,v.map])];
 function visit(map,title,notes){const pts=unpackMap(map);if(pts.length<3)return; background('#a9d5d6');stroke(pts,'#468987',8,true);g.fillStyle='#b9d691';g.fill();label('⚑',pts[0][0],pts[0][1],35);label(title,300,42,27);screen('島の会場へようこそ。展示曲の冒頭を聴いて記念切符をどうぞ。');button('展示曲を聴く',()=>{sound();for(const [t,m,l] of notes)tone(440*2**((m-69)/12),l/100,t/100)});
 const fields={map,title,notes:JSON.stringify(notes)};invite('私の小さな万博「'+title+'」へどうぞ。',fields);button('記念切符を受け取る',()=>{label('入場記念　✦　'+title,300,297,22);end('小さな万博・入場記念切符',{...fields})})}
 let notes;try{notes=JSON.parse(params.get('notes'))}catch{}
 if(unpackMap(params.get('map')).length>=3&&Array.isArray(notes)&&notes.length&&notes.length<=80&&notes.every(n=>Array.isArray(n)&&n.length===3&&n.every(Number.isFinite)&&n[0]>=0&&n[0]<=1200&&n[1]>=12&&n[1]<=120&&n[2]>=1&&n[2]<=200))return visit(params.get('map'),(params.get('title')||'島の音楽会').slice(0,60),notes);
 background('#c4dcce');label('⚑　島の音楽会',300,175,37);screen('島と曲を選んで、小さな万博を開きましょう。保存作品はこの端末から選べます。');const im=selectOne('会場',islands.map(v=>v[0])),tracks=Array.isArray(songs)?songs.filter(s=>s&&typeof s==='object'):[],sm=selectOne('展示曲',['見本のワルツ',...tracks.map(s=>s.title||'無題')]);button('開場する',()=>{let melody=[[0,60,35],[45,64,35],[90,67,40],[135,69,65],[220,67,45],[270,64,75]];if(+sm.value){try{const score=Ensemble.compose(Ensemble.migrate(tracks[+sm.value-1]));melody=score.events.filter(e=>Number.isFinite(e.m)&&e.m>=12&&e.m<=120&&e.time>=0&&e.time<=12).slice(0,80).map(e=>[Math.round(e.time*100),e.m,Math.max(1,Math.min(200,Math.round(e.len*100)))]);if(!melody.length)throw Error()}catch{msg.textContent='この曲から展示用の音を取り出せませんでした。別の曲を選んでください。';return}}
 visit(islands[+im.value][1],sm.selectedOptions[0].text.slice(0,60),melody)});openPage('島を描く','/habit-island');openPage('曲を作る','/music-stairs')
};
games[game]();
