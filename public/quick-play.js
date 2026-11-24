(() => {
  'use strict';
  const game = document.body.dataset.game, panel = document.querySelector('#game');
  const title = document.querySelector('h1').textContent;
  const votes = [
    ['たい焼きは、どこから食べる？','頭から','しっぽから'],
    ['集合の10分前に着いたら？','先に連絡','時間までぶらぶら'],
    ['旅先で朝食をひとつ選ぶなら？','地元の定食','ホテルのビュッフェ'],
    ['好きな場面に出会った本は？','印をつける','そのまま閉じる'],
    ['映画のエンドロールが流れたら？','最後まで座る','余韻と一緒に外へ']
  ];
  const goods = [
    ['夢の続きを一度だけ見られる枕','昨夜の夢の、途切れた場面から。','🌙'],
    ['雨の日をひとつ預ける瓶','ふたを開けた日に、あの雨音が戻ります。','🫙'],
    ['なくした一言が届く便箋','言いそびれた言葉を、一度だけ相手へ。','✉️']
  ];
  const exhibits = ['子どもの頃の夏休みの匂い','昔住んだ家の窓からの景色','大切な人と笑った日の声','初めて好きになった曲の第一音','帰り道に見上げた夕焼け','時間を忘れて読んだ本の午後'];
  const scenes = ['夜更かしの青','春休み最後の日の色','雨が上がる直前の空','誰もいない朝の駅'];
  const colors = Array.from({length:30},(_,i)=>'hsl('+(179+i%6*11)+' '+(38+Math.floor(i/6)*5)+'% '+(19+Math.floor(i/6)*13)+'%)');
  const measureQs = [['「すぐ行く」は何分後？',60,'分',10],['「そこそこ混んでる」は何人待ち？',40,'人',8],['ケーキの「ほんの一口」は何％？',100,'％',15]];
  const holidayQs = [
    ['いつ祝いますか？','初めて毛布を出した翌朝','予定がひとつ消えた午後','雨上がりの最初の日曜','満月の翌日','今年最初の寝坊の日'],
    ['その日に何をしますか？','布団でもう一度眠る','知らない道で寄り道する','おやつをふたつ食べる','積んでいた本をひらく','大切な人に手紙を書く'],
    ['この日の禁止事項は？','午前中の予定を立てる','時計を二度見する','最短距離を調べる','カロリーを数える','返事を急かす']
  ];
  let id;
  try { id=localStorage.getItem('quick-play-id') || crypto.randomUUID();localStorage.setItem('quick-play-id',id); } catch { id=crypto.randomUUID(); }
  let step=0, answers=[], reports=[], timer, textResult='',resultColor='';
  votes.push(...QuickCatalog.votes);
  goods.push(...QuickCatalog.goods);
  exhibits.push(...QuickCatalog.exhibits);
  scenes.push(...QuickCatalog.scenes);
  for(let h=0;h<24;h++)for(const light of [30,45,60,75])colors.push('hsl('+h*15+' 72% '+light+'%)');
  const exhibitsFor=['持ち帰れるのは、一個だけ。',...QuickCatalog.exhibitPrompts];
  const api='https://homepage.b1013154.workers.dev/api/quick-choice';
  let deck=[],measureDeck=[],holidayTheme='',revision=0;
  function shuffled(items,random=Math.random){
    const copy=[...items];
    for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
    return copy;
  }
  function indexes(list){return list.map((_,i)=>i)}
  function node(tag,text='',cls=''){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e}
  function add(tag,text,cls){const e=node(tag,text,cls);panel.append(e);return e}
  function button(parent,label,fn,cls){const b=node('button',label,cls);b.type='button';b.onclick=fn;parent.append(b);return b}
  function start(count,label){panel.replaceChildren();if(count)add('p',(step+1)+' / '+count,'step');add('h2',label)}
  function options(labels,fn){const box=add('div','','choices');labels.forEach((v,i)=>button(box,v,()=>fn(i)))}
  function browse(labels,choose,order=shuffled(indexes(labels))){
    const controls=add('div','','browse'),search=node('input'),box=add('div','','choices'),nav=add('div','','pager');
    search.type='search';search.placeholder='候補を検索';search.setAttribute('aria-label','候補を検索');controls.append(search);
    let page=0;
    function show(){
      const filtered=order.filter(i=>labels[i].includes(search.value.trim())),pages=Math.ceil(filtered.length/6);
      box.replaceChildren();nav.replaceChildren();
      if(!pages){box.append(node('p','一致する候補がありません。'));return}
      filtered.slice(page*6,page*6+6).forEach(i=>button(box,labels[i],()=>choose(i)));
      button(nav,'前へ',()=>{page--;show()}).disabled=page===0;
      nav.append(node('span',(page+1)+' / '+pages+' ページ・'+filtered.length+'候補','small'));
      button(nav,'次へ',()=>{page++;show()}).disabled=page+1===pages;
    }
    search.oninput=()=>{page=0;show()};show();
  }
  function next(fn){step++;fn();panel.scrollIntoView({block:'nearest'})}
  function actions(){return add('div','','actions')}
  function result(summary,details,again){
    textResult=summary+'\n'+details.filter(Boolean).join('\n');add('p',textResult,'ticket');
    const box=actions(),a=node('a','Xで結果を共有');const share=new URL('https://twitter.com/intent/tweet');
    share.searchParams.set('text',title+'\n'+(activeExtra||game==='holiday'||game==='measure'?textResult:summary));share.searchParams.set('url',location.origin+location.pathname+(activeExtra?location.hash:''));
    a.href=share.href;a.target='_blank';a.rel='noopener';box.append(a);
    button(box,'結果画像を保存',saveImage);button(box,again||'もう一度遊ぶ',()=>activeExtra?extra(true):reset());
  }
  function saveImage(){
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=800;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#f7f1df';ctx.fillRect(0,0,1000,800);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--accent');ctx.fillRect(0,0,22,800);
    ctx.font='bold 38px sans-serif';ctx.fillText(title,60,88,880);ctx.font='30px sans-serif';ctx.fillStyle='#253e36';let y=178;
    for(const line of textResult.split('\n')){let row='';for(const ch of line){if(ctx.measureText(row+ch).width>850){ctx.fillText(row,60,y);y+=45;row=''}row+=ch}ctx.fillText(row,60,y);y+=54}
    if(game==='color' && resultColor){if(pairColor){const gradient=ctx.createLinearGradient(60,0,940,0);gradient.addColorStop(0,pairColor);gradient.addColorStop(1,resultColor);ctx.fillStyle=gradient}else ctx.fillStyle=resultColor;ctx.fillRect(60,450,880,145);ctx.fillStyle='#253e36'}
    if(game==='holiday'){
      const now=new Date(),year=now.getFullYear(),month=now.getMonth(),first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();
      ctx.font='22px sans-serif';ctx.fillText(year+' 年 '+(month+1)+' 月',60,443);
      '日月火水木金土'.split('').forEach((d,i)=>ctx.fillText(d,90+i*125,484));
      for(let day=1;day<=days;day++){const i=first+day-1;ctx.fillText(day,90+i%7*125,525+Math.floor(i/7)*35)}
    }
    ctx.font='22px sans-serif';ctx.fillText('ホームページの遊び場',60,752);
    const link=document.createElement('a');link.href=canvas.toDataURL();link.download=title+'.png';link.click();
  }
  async function submit(q,value,done){
    const version=revision;
    panel.querySelectorAll('button,input').forEach(b=>b.disabled=true);
    const status=add('p','集計しています…','small');
    try {
      const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,game,question:q,value}),signal:AbortSignal.timeout(12000)});
      if(!r.ok)throw Error();const data=await r.json();if(version!==revision)return;answers[step]=value;reports[step]=data;done(data);
    } catch {if(version!==revision)return;status.textContent='集計に接続できませんでした。同じ回答で再試行できます。';button(panel,'再試行',()=>{status.remove();submit(q,value,done)})}
  }
  function bars(labels,counts,n){labels.forEach((s,i)=>{const pct=Math.round(counts[i]*100/n);add('p',s+'　'+pct+'％（'+counts[i]+'票）');const b=add('span','','bar');const iTag=node('i');iTag.style.width=pct+'%';b.append(iTag)})}
  function vote(){
    if(step===deck.length){start(0,'あなたの5票');const minor=deck.filter((_,i)=>reports[i].counts[answers[i]]*2<reports[i].n);
      result('5問中、少数派だったのは '+minor.length+' 問。',deck.map((k,i)=>votes[k][1+answers[i]]+'（'+Math.round(reports[i].counts[answers[i]]*100/reports[i].n)+'％）'));return}
    const k=deck[step],[q,...labels]=votes[k];start(5,q);options(labels,i=>submit(k,i,d=>{
      start(5,q);add('p','あなたの一票　'+labels[i]+' ／ 集計 '+d.n+'人');bars(labels,d.counts,d.n);
      button(actions(),step===4?'結果を見る':'次の二択へ',()=>next(vote),'main')}))
  }
  function price(){
    if(step===3){start(0,'あなたの買い付け伝票');result('3品の合計は '+answers.reduce((a,b)=>a+b,0).toLocaleString()+' 円',deck.map((k,i)=>goods[k][0]+'　'+answers[i]+'円 ／ 中央値 '+reports[i].median+'円'));return}
    const k=deck[step],[name,desc,art]=goods[k];start(3,name);add('div',art,'art');add('p',desc);
    const label=add('label','あなたの値札（0〜1,000,000円） '),input=node('input');input.type='number';input.min=0;input.max=1000000;input.step=1;input.required=true;input.inputMode='numeric';label.append(input);
    button(actions(),'値札を付ける',()=>{if(!input.reportValidity())return;const v=input.valueAsNumber;submit(k,v,d=>{
      start(3,name);add('p','あなたの値札 '+v.toLocaleString()+' 円','value');add('p',d.n+' 人の中央値は '+d.median.toLocaleString()+' 円です。');
      button(actions(),step===2?'伝票を見る':'次の品物へ',()=>next(price),'main')})},'main')
  }
  function measure(){
    if(step===3){start(0,'私の言葉のものさし');result('私の感覚を測ったら…',measureDeck.map(([q,,unit],i)=>q+'　'+answers[i]+unit));return}
    const [q,max,unit,initial]=measureDeck[step];start(3,q);const art=add('div','','art'),c=node('canvas');c.width=400;c.height=150;art.append(c);
    const range=add('input');range.type='range';range.min=0;range.max=max;range.value=initial;range.setAttribute('aria-label',q);
    const out=add('output','','value');function paint(){const v=+range.value,ctx=c.getContext('2d');ctx.clearRect(0,0,400,150);out.textContent=v+unit;range.setAttribute('aria-valuetext',v+unit);
      if(step===1){ctx.font='16px sans-serif';for(let i=0;i<v;i++)ctx.fillText('🚶',8+(i%20)*19,30+Math.floor(i/20)*24);return}
      ctx.beginPath();ctx.arc(200,75,62,0,2*Math.PI);ctx.fillStyle=step===0?'#fffdf6':'#c38858';ctx.fill();ctx.strokeStyle='#846a50';ctx.stroke();
      ctx.beginPath();ctx.moveTo(200,75);ctx.arc(200,75,59,-Math.PI/2,-Math.PI/2+2*Math.PI*v/max);ctx.closePath();ctx.fillStyle=step?'#f5c8b4':'#99c7b8';ctx.fill();
      if(!step){for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.fillRect(199+54*Math.sin(a),74-54*Math.cos(a),3,3)}ctx.beginPath();ctx.moveTo(200,75);ctx.lineTo(200+48*Math.sin(2*Math.PI*v/max),75-48*Math.cos(2*Math.PI*v/max));ctx.stroke()}
    }range.oninput=paint;paint();button(actions(),'これくらい',()=>{answers.push(+range.value);next(measure)},'main')
  }
  function holiday(){
    if(step<3){
      const [q,...original]=holidayQs[step],labels=[...original,...QuickCatalog.holidayOptions[step]];
      start(3,q);add('p',holidayTheme,'ticket');
      browse(labels,i=>{answers.push(labels[i]);next(holiday)});return;
    }
    start(0,'祝日制定のお知らせ');
    result('「'+answers[1]+'日」を制定します。',[holidayTheme,'日付　'+answers[0],'禁止事項　'+answers[2]]);
  }
  function exhibit(){
    start(0,'どんな気持ちで展示を巡る？');
    browse(exhibitsFor,q=>{
      start(0,exhibitsFor[q]);add('p','持ち帰る展示品を選ぶと、引換券を発行します。');
      browse(exhibits,i=>submit(q,i,d=>{
        start(0,'展示品引換券');
        const ranking=indexes(exhibits).filter(k=>d.counts[k]>0).sort((a,b)=>d.counts[b]-d.counts[a]).slice(0,5);
        result('私が持ち帰るのは「'+exhibits[i]+'」。',[exhibitsFor[q],'同じ展示品を選んだ人　'+d.counts[i]+' / '+d.n+'人']);
        add('h3','このお題で選ばれた展示品');bars(ranking.map(k=>exhibits[k]),ranking.map(k=>d.counts[k]),d.n);
      }));
    });
  }
  function color(){start(0,'どの情景の色を探す？');browse(scenes,q=>{start(0,'「'+scenes[q]+'」はどの色？');
const grid=add('div','','colors');let selected=-1;const pick=button(actions(),'この色を選ぶ',()=>submit(q,selected,d=>{
    resultColor=colors[selected];start(0,scenes[q]+'のモザイク');const mosaic=add('div','','mosaic');d.counts.forEach((n,i)=>{if(n){const s=node('span');s.style.flex=n;s.style.background=colors[i];s.title=n+'人';mosaic.append(s)}});add('p','帯の幅は、その色を選んだ人数を表します。','small');add('div','あなたの色　#'+(selected+1),'ticket').style.borderLeft='24px solid '+colors[selected];result('「'+scenes[q]+'」に選んだ色は #'+(selected+1)+'。',['同じ色を選んだ人は、自分を含めて '+d.counts[selected]+' / '+d.n+' 人。'])
  }),'main');pick.disabled=true;colors.forEach((col,i)=>{const b=button(grid,'',()=>{selected=i;grid.querySelectorAll('button').forEach((el,j)=>el.setAttribute('aria-pressed',String(i===j)));pick.disabled=false});b.style.background=col;b.setAttribute('aria-label','色 '+(i+1));b.setAttribute('aria-pressed','false')})})}

  const inventory = ('🍎りんご 🍐洋梨 🍊みかん 🍋レモン 🍌バナナ 🍉スイカ 🍇ぶどう 🍓いちご 🫐ブルーベリー 🍈メロン 🍒さくらんぼ 🍑もも 🥭マンゴー 🍍パイナップル 🥥ココナッツ 🥝キウイ 🍅トマト 🥑アボカド 🍆なす 🥔じゃがいも 🥕にんじん 🌽とうもろこし 🫑ピーマン 🥒きゅうり 🥦ブロッコリー 🧄にんにく 🧅たまねぎ 🍄きのこ 🥜落花生 🌰栗 🍞食パン 🥐クロワッサン 🥖バゲット 🥨プレッツェル 🥯ベーグル 🥞パンケーキ 🧇ワッフル 🧀チーズ 🍖骨付き肉 🥓ベーコン 🍔ハンバーガー 🍟フライドポテト 🍕ピザ 🌭ホットドッグ 🥪サンドイッチ 🌮タコス 🍳目玉焼き 🥗サラダ 🍿ポップコーン 🍙おにぎり 🍘せんべい 🍥なると 🍡団子 🍩ドーナツ 🍪クッキー 🎂誕生日ケーキ 🍫チョコ 🍬キャンディ 🍭ペロペロキャンディ 🍮プリン 🍯はちみつ 🫖ティーポット ☕コーヒー 🥛牛乳 🧃紙パックジュース 🧊氷 🥄スプーン 🍴フォークとナイフ 🥢箸 🧂塩入れ 🧸ぬいぐるみ 🪆マトリョーシカ 🎈風船 🪁たこ 🧩パズル 🎲サイコロ ♟️チェスの駒 🪀ヨーヨー 🎯ダーツ盤 🎳ボウリング 🎾テニスボール ⚽サッカーボール 🏀バスケットボール 🏈アメフトボール 🥏フリスビー 🥊グローブ 🛼ローラースケート 🎸ギター 🎺トランペット 🎻バイオリン 🪕バンジョー 🥁太鼓 🎹鍵盤 🎤マイク 🎧ヘッドホン 📻ラジオ 📷カメラ ⏰目覚まし時計 ⌛砂時計 🧭方位磁針 🔦懐中電灯 🕯️ろうそく 💡電球 🔑鍵 🔔ベル 🧲磁石 🔍虫眼鏡 ✂️はさみ 📌画びょう 📎クリップ 📏定規 🖌️絵筆 🖍️クレヨン ✏️鉛筆 🧮そろばん 📓ノート ✉️封筒 📅カレンダー 🗺️地図 🎨パレット 👒麦わら帽子 👓めがね 🕶️サングラス 👑王冠 🧤手袋 🧣マフラー 👢ブーツ ☂️傘 🎒リュック 👜ハンドバッグ').split(' ').map(entry=>entry.match(/^([^ぁ-んァ-ヶ一-龠]+)(.+)$/u).slice(1));
  function memory(){
    const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
    let seed=Number(date.replaceAll('-',''));
    function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
    const stock=shuffled(indexes(inventory),random),display=stock.slice(0,6);
    const names=inventory.map(item=>item[1]),spots=['上段の左','上段の中央','上段の右','下段の左','下段の中央','下段の右'];
    const [a,b,c]=shuffled([0,1,2,3,4,5],random);
    const side=i=>i%3===2?-1:1;
    const quiz=[[names[display[b]]+'を飾っていた棚で、'+spots[a]+'に置かれていた品は？',display[a]],
      [names[display[b]]+'の'+(side(b)>0?'右':'左')+'隣にあった品は？',display[b+side(b)]],
      [names[display[c]]+'の真'+(c<3?'下':'上')+'にあった品は？',display[(c+3)%6]]];
    const orders=quiz.map(([,correct])=>{
      const others=shuffled(stock.filter(k=>k!==correct),random);
      return [...shuffled([correct,...others.slice(0,5)],random),...others.slice(5)];
    });
    function draw(){
      const shelf=add('div','','shelf');shelf.setAttribute('aria-label','喫茶店の飾り棚');
      display.forEach(k=>{const card=node('div');card.append(node('span',inventory[k][0]),node('small',names[k]));shelf.append(card)});
    }
    function ask(){
      if(step===3){start(0,'今日の答え合わせ');draw();const n=quiz.filter(([,k],i)=>answers[i]===k).length;
        result(date+' の喫茶店　'+n+' / 3問正解',quiz.map(([q,k],i)=>(answers[i]===k?'○ ':'× ')+q+'　'+names[k]));return}
      start(3,quiz[step][0]);browse(names,i=>{answers.push(i);next(ask)},orders[step]);
    }
    start(0,date+' の喫茶店');add('p','今日の飾り棚には6つの品。5秒で品物と位置を覚えてください。');
    button(actions(),'5秒だけ見る',()=>{start(0,'喫茶店の飾り棚');draw();const end=performance.now()+5000,clock=add('p','残り5秒');
      timer=setInterval(()=>{const left=Math.ceil((end-performance.now())/1000);if(left<=0){clearInterval(timer);ask()}else clock.textContent='残り'+left+'秒'},100)
    },'main');
  }
  function reset(first){
    activeExtra=false; pairColor='';if(location.hash)history.replaceState(null,'',location.pathname);if(game!=='vote')markMode(classicNames[game]);
    revision++;clearInterval(timer);step=0;answers=[];reports=[];
    if(game==='vote'){
      markMode('投票する');deck=shuffled(indexes(votes).filter(i=>i!==first));
      if(Number.isInteger(first))deck.unshift(first);deck=deck.slice(0,5);
    }
    if(game==='price')deck=shuffled(indexes(goods)).slice(0,3);
    if(game==='measure')measureDeck=QuickCatalog.measures.map((group,i)=>shuffled([...group,[measureQs[i][0],i===0?120:100,...measureQs[i].slice(2)]])[0]);
    if(game==='holiday')holidayTheme=shuffled(QuickCatalog.holidayPrompts)[0];
    ({vote,measure,price,holiday,memory,exhibit,color})[game]();
  }
  const modes=node('nav','','mode-tabs');
  function markMode(label){for(const b of modes.children)b.setAttribute('aria-pressed',String(b.textContent===label))}
  async function openPolls(mode){
    const version=++revision;markMode(mode);start(0,mode);add('p','開票データを読み込み中…');
    try{
      const r=await fetch(api,{signal:AbortSignal.timeout(10000)});
      if(!r.ok)throw Error();const {polls}=await r.json();if(version!==revision)return;
      const rows=polls.filter(row=>votes[row.question]&&row.n>0);
      start(0,mode);
      if(mode==='接戦速報'){
        const races=rows.filter(x=>x.leftVotes>0&&x.leftVotes<x.n).sort((a,b)=>Math.abs(a.leftVotes/a.n-.5)-Math.abs(b.leftVotes/b.n-.5)||b.n-a.n);
        if(!races.length)add('p','まだ両方に票が入ったお題はありません。投票されたお題から順に速報に登場します。');
        for(const row of races.slice(0,10)){
          const [q,...ls]=votes[row.question];add('h3',q);bars(ls,[row.leftVotes,row.n-row.leftVotes],row.n);
          button(actions(),'この対決に参加',()=>reset(row.question));
        }
      }else if(!rows.length)add('p','最初の投票が届くと、得票率を予想できます。');
      else{
        const row=shuffled(rows)[0],[q,left,right]=votes[row.question];
        add('h3',q);add('p','「'+left+'」は何％？　もう一方は「'+right+'」。');
        const slider=add('input');slider.type='range';slider.min=0;slider.max=100;slider.value=50;slider.setAttribute('aria-label',left+'の予想得票率');
        const out=add('output','50％','value');slider.oninput=()=>out.textContent=slider.value+'％';
        button(actions(),'実際の開票結果を見る',()=>{
          const pct=Math.round(row.leftVotes*100/row.n),guess=+slider.value;
          start(0,'得票率予想の結果');add('h3',q);bars([left,right],[row.leftVotes,row.n-row.leftVotes],row.n);
          result(guess===pct?'ぴったり的中！':'予想と実際の差は '+Math.abs(guess-pct)+' ポイント。',['「'+left+'」の予想 '+guess+'％ ／ 実際 '+pct+'％（'+row.n+'票）']);
          button(actions(),'もう一度予想する',()=>openPolls(mode));
        },'main');
      }
    }catch{if(version!==revision)return;start(0,mode);add('p','開票データを読み込めませんでした。');button(actions(),'読み直す',()=>openPolls(mode))}
  }
  function simulate(){
    ++revision;markMode('開票実験室');start(0,'開票実験室');
    add('p','二つの陣営に票を配って、接戦や逆転を作ってみよう。実験用の票は自由に動かせます。');
    const k=shuffled(indexes(votes))[0],[q,...labels]=votes[k];add('h3',q);
    const ranges=labels.map(label=>{const field=add('label',label),input=node('input');input.type='range';input.min=0;input.max=100;input.value=50;field.append(input);return input});
    const view=add('div','','ticket'),meter=add('div','','mosaic sim-meter'),left=node('span'),right=node('span');meter.append(left,right);
    function paint(){const [a,b]=ranges.map(el=>+el.value);left.style.flex=a;right.style.flex=b;meter.hidden=!a&&!b;
      view.textContent=labels[0]+' '+a+'票　／　'+labels[1]+' '+b+'票\n'+(!a&&!b?'開票前':a===b?'同票！ 次の一票で勝負が決まります。':'「'+labels[a>b?0:1]+'」がリード。逆転まであと '+(Math.abs(a-b)+1)+' 票。')}
    ranges.forEach(el=>el.oninput=paint);paint();button(actions(),'別のお題で実験',simulate);
  }
  function ballotBox(){
    ++revision;markMode('投票箱をつくる');
    const candidates=[...new Set(votes.flatMap(([,a,b])=>[a,b]))],pair=[],tally=[0,0];
    function setup(){
      start(0,pair.length?'もう一方の候補を選ぶ':'投票箱をつくる');
      add('p',pair.length?'一つ目の候補　'+pair[0]:'好きな候補を二つ組み合わせて、この端末で一緒にいる人たちに投票してもらえます。');
      const remaining=candidates.filter(label=>!pair.includes(label));
      browse(remaining,i=>{pair.push(remaining[i]);if(pair.length===2)cast();else setup()});
    }
    function cast(){
      start(0,'どちらに一票？');options(pair,i=>{
        tally[i]++;start(0,'投票箱に入りました');add('p','投票済み '+(tally[0]+tally[1])+' 人');
        button(actions(),'次の人に渡す',cast);button(actions(),'投票を締め切って開票',finish,'main');
      });
    }
    function finish(){
      start(0,'みんなの投票箱・開票結果');const n=tally[0]+tally[1];bars(pair,tally,n);
      result(tally[0]===tally[1]?'両者同票！':'勝ったのは「'+pair[Number(tally[1]>tally[0])]+'」！',pair.map((label,i)=>label+'　'+tally[i]+'票'));
      button(actions(),'新しい投票箱をつくる',ballotBox);
    }
    setup();
  }
  if(game==='vote'){
    modes.setAttribute('aria-label','一票の遊び方');panel.before(modes);
    button(modes,'投票する',()=>reset());button(modes,'得票率を予想',()=>openPolls('得票率を予想'));
    button(modes,'接戦速報',()=>openPolls('接戦速報'));button(modes,'開票実験室',simulate);button(modes,'投票箱をつくる',ballotBox);
  }
  const extraNames={vote:'4票目を読みます',measure:'あなたの「すぐ」を当てます',price:'現物のお給料',holiday:'本日の休暇届',memory:'棚に戻す',exhibit:'忘れ物の引き出し',color:'色の伝言'};
  const classicNames={measure:'言葉のものさし',price:'雑貨店で買い付け',holiday:'祝日を制定する',memory:'今日の観察クイズ',exhibit:'展示を巡る',color:'情景の色を選ぶ'};
  const params=new URLSearchParams(location.hash.slice(1));
  function invitation(data,message){
    const url=new URL(location.pathname,location.origin);url.hash=new URLSearchParams(data).toString();
    const box=actions(),a=node('a','Xで招待する');const share=new URL('https://twitter.com/intent/tweet');
    share.searchParams.set('url',url.href);share.searchParams.set('text',message);a.href=share.href;a.target='_blank';a.rel='noopener';box.append(a);
    button(box,'招待リンクをコピー',async()=>{try{await navigator.clipboard.writeText(url.href);add('p','コピーしました。','small')}catch{const field=add('input');field.value=url.href;field.readOnly=true;field.select()}});
  }
  function numberField(label,max){
    const field=add('label',label+' '),input=node('input');input.type='number';input.required=true;input.min=0;input.max=max;input.step=1;field.append(input);return input;
  }
  const settings='休日の朝 旅先 放課後 雨の日 待ち合わせ前 初めての町 昼休み 仕事帰り 連休の初日 夏休み 冬の朝 引っ越しの翌日'.split(' ');
  function prediction(){
    const pace=game==='measure';
    const pairs=pace?[
      ['出発の支度は？','前日にそろえる','出る前にそろえる'],['通知が来たら？','すぐ開く','区切りまで待つ'],['駅に向かう道は？','いつもの近道','気になる路地'],['荷物の確認は？','玄関に行く前','靴を履いてから'],['店で注文するときは？','並ぶ前に決める','席に着いて考える'],['集合場所に向かうときは？','一本早い電車','ちょうどの電車'],['届け物を頼まれたら？','先に届ける','用事をまとめる'],['飲み物を選ぶなら？','いつもの一杯','メニューをじっくり'],['道に迷ったら？','すぐ尋ねる','少し歩いてみる'],['予定が決まったら？','その場で登録','あとで整理']
    ]:[
      ['ポストカードにするなら？','地元の商店街','知らない街角'],['食べに行くなら？','行きつけの定食屋','開店初日の食堂'],['写真を撮るなら？','いつもの景色','未踏の路地'],['列車を降りるなら？','馴染みの駅','初めての終点'],['本棚から取るなら？','好きな本を再読','初めての作家'],['一曲だけ聴くなら？','思い出の一曲','未知の新曲'],['喫茶店で選ぶなら？','定番ブレンド','本日の試作品'],['休日に歩くなら？','いつもの散歩道','地図で見つけた道'],['誰かと遊ぶなら？','得意なゲーム','初めてのゲーム'],['今夜見るなら？','大好きな映画','題名しか知らない映画']
    ];
    const round=shuffled(pairs,challengeRandom).slice(0,pace?5:4),contexts=shuffled(settings,challengeRandom);let i=0,score=0;
    function ask(){
      const [q,a,b]=round[i];start(0,contexts[i]+'。'+q);add('p',(i+1)+' / '+round.length,'step');
      const guess=score>=2?b:a;
      if(!pace&&i===3)add('p','私の予想は「'+guess+'」。最初の3票では'+(score>=2?'新しい体験':'馴染みのあるもの')+'を多く選びました。','ticket');
      const choices=shuffled([a,b]);options(choices,j=>{
        const picked=choices[j];score+=Number(picked===b);i++;
        if(i<round.length)return ask();
        if(!pace){start(0,picked===guess?'4票目、的中！':'予想を裏切る一票！');result('私の4票目は「'+picked+'」。',['遊び場の予想　'+guess]);return}
        const minutes=3+3*score;start(0,'あなたの「すぐ」は '+minutes+' 分と予想！');
        const actual=numberField('実際の感覚は何分？',120);button(actions(),'答え合わせ',()=>{if(!actual.reportValidity())return;const v=actual.valueAsNumber;start(0,'感覚の答え合わせ');result('私は「すぐ」を'+v+'分のつもりで言っています。',['ゲームの予想 '+minutes+'分 ／ 差 '+Math.abs(v-minutes)+'分'])});
      });
    }ask();
  }
  function salary(){
    start(0,'今日の給料、現物でどうぞ');button(actions(),'封筒を開ける',()=>{
      const [name,desc,icon]=shuffled(goods,challengeRandom)[0];start(0,name);add('div',icon,'art');add('p',desc);
      function finish(line){start(0,'現物給与明細');result(name,[line])}
      button(actions(),'持ち帰る',()=>finish('値段を付けずに持ち帰りました。'));
      button(actions(),'値札を付けて売る',()=>{start(0,name);const amount=numberField('いくらで売りますか？（円）',1000000);button(actions(),'売却する',()=>{if(amount.reportValidity())finish(amount.valueAsNumber.toLocaleString()+'円で売却しました。')})});
    });
  }
  function leave(){
    const situations=['返事を何度も書き直した','時計を何度も見た','予定を詰めすぎた','仕事の通知を開いた','近道ばかりを探した','勝ち負けが気になった','頼まれごとを抱えた','明日の準備を急いだ','人と比べてしまった','一度も休憩しなかった'];
    const exemptions=['返信はお茶のあとでいい','時計を伏せていい','予定をひとつ空けていい','通知を休ませていい','遠回りしていい','引き分けでいい','助けを頼んでいい','支度はあとでいい','自分の歩幅でいい','ひと休みしていい'];
    const labels=settings.flatMap(s=>situations.map(v=>s+'、'+v));
    function ticket(k){const title=exemptions[k%10]+'日';start(0,title);add('p','取得条件　'+labels[k],'ticket');
      button(actions(),'この休暇を取得する',()=>{start(0,'本日の休暇届');add('p','取得済　「'+title+'」','ticket');invitation({leave:k},'今日は「'+title+'」。あなたも取得しますか？')});
    }
    const key=params.get('leave');if(key!==null&&/^\d+$/.test(key)&&+key<labels.length)return ticket(+key);
    start(0,'今日は何を免除されたい？');browse(labels,ticket);
  }
  function shelves(){
    const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());let s=Number(day.replaceAll('-',''));
    const rng=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
    const items=shuffled(inventory,rng).slice(0,6),targets=shuffled(indexes(items),rng).slice(0,3);let turn=0,points=0;
    const spots=['左上','上の中央','右上','左下','下の中央','右下'];
    function shelf(full){const grid=add('div','','shelf');return items.map(([icon,name],j)=>{const cell=node('button',full?icon+' '+name:spots[j]);grid.append(cell);cell.disabled=full;return cell})}
    function ask(){const k=targets[turn];start(0,items[k][1]+'を元の場所に戻して');const piece=add('button',items[k].join(' '),'piece');piece.draggable=true;piece.ondragstart=e=>e.dataTransfer.setData('text/plain','piece');
      add('p','ドラッグするか、置きたい場所をタップ。','small');const cells=shelf(false);
      function drop(j){start(0,j===k?'ぴったり！':'正解は'+spots[k]);points+=Number(j===k);const reveal=shelf(turn===2);reveal.forEach(cell=>cell.disabled=true);reveal[k].textContent=items[k].join(' ');reveal[k].classList.add('correct');reveal[j].classList.add('placed');button(actions(),turn===2?'結果を見る':'次の品へ',()=>{if(++turn<3)ask();else{start(0,'今日の棚戻し');result(day+' の棚戻し '+points+' / 3',[])}})}
      piece.onpointerdown=e=>{if(e.pointerType!=='mouse')piece.setPointerCapture(e.pointerId)};piece.onpointerup=e=>{if(e.pointerType==='mouse')return;const tile=document.elementFromPoint(e.clientX,e.clientY);const j=cells.indexOf(tile);if(j>=0)drop(j)};cells.forEach((el,j)=>{el.onclick=()=>drop(j);el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();drop(j)}})
    }
    start(0,'棚に戻す');button(actions(),'棚を5秒見る',()=>{start(0,'6つの場所を覚えて');shelf(true);timer=setTimeout(ask,5000)});
  }
  function drawers(){
    const order=shuffled(exhibits,challengeRandom);let i=0;
    function open(){const item=order[i];start(0,'引き出し '+(i+1));add('p',item,'drawer-item');
      button(actions(),'持ち帰る',()=>{start(0,'忘れ物の引換券');result('持ち帰ったのは「'+item+'」。',['開けた引き出し '+(i+1)+' 個'])});
      if(i+1<order.length)button(actions(),'置いて次を開ける',()=>{i++;open()});
      button(actions(),'情景の音を聴く',async()=>{
        const ctx=new AudioContext();try{await ctx.resume();const notes=item.includes('声')?[330,440,392]:item.includes('雨')?[760,680,520]:[220,330,494];
        notes.forEach((f,j)=>{const osc=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+j*.28;osc.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.05);g.gain.exponentialRampToValueAtTime(.001,t+.8);osc.connect(g).connect(ctx.destination);osc.start(t);osc.stop(t+.85)});await new Promise(r=>setTimeout(r,1700))}finally{await ctx.close()}});
    }
    start(0,'忘れ物保管所');add('p','持ち帰れるのは一品。次を開けると、前の引き出しには戻れません。');button(actions(),'引き出しを開ける',open);
  }
  function colorMessage(){
    const key=params.get('ink'),hint=(params.get('hint')||'').slice(0,80),guest=key!==null&&/^\d+$/.test(key)&&+key<colors.length&&hint.trim();
    start(0,guest?'ヒントから色を選んで':'何色か、言葉で伝えよう');if(guest)add('p',hint,'ticket');
    function pick(fn){const grid=add('div','','colors');colors.forEach((c,i)=>{const b=button(grid,'',()=>fn(i));b.style.background=c;b.setAttribute('aria-label','色 '+(i+1))})}
    pick(i=>{if(guest){start(0,'ふたりの色切符');const ticket=add('div',hint,'sky-ticket');ticket.style.background='linear-gradient(100deg,'+colors[+key]+','+colors[i]+')';resultColor=colors[i];pairColor=colors[+key];result(+key===i?'同じ色を選びました！':'ひとつの言葉から、ふたつの色。',['ヒント　'+hint,'出題者 #'+(+key+1)+' ／ あなた #'+(i+1)]);return}
      start(0,'この色を言葉にすると？');add('div','','swatch').style.background=colors[i];const field=add('input');field.maxLength=80;field.placeholder='例　プールから帰る道';field.setAttribute('aria-label','色名を使わずにヒントを入力');
      button(actions(),'招待状を作る',()=>{if(!field.value.trim()){field.focus();return}const h=field.value.trim();start(0,'色の招待状');add('p',h,'ticket');invitation({ink:i,hint:h},'この言葉、あなたならどんな色？「'+h+'」')})
    });
  }
  let activeExtra=false,pairColor='',challengeRandom=Math.random;
  function extra(fresh=false){
    activeExtra=true;pairColor='';
    if(fresh===true){params.delete('ink');params.delete('hint');params.delete('leave');params.delete('seed')}
    const seed=/^[0-9]{1,10}$/.test(params.get('seed'))?Number(params.get('seed')):crypto.getRandomValues(new Uint32Array(1))[0];
    params.set('seed',seed);params.set('play','extra');history.replaceState(null,'','#'+params);
    let state=seed;challengeRandom=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    revision++;clearInterval(timer);markMode(extraNames[game]);({vote:prediction,measure:prediction,price:salary,memory:shelves,holiday:leave,exhibit:drawers,color:colorMessage})[game]()}
  if(game!=='vote'){modes.setAttribute('aria-label','遊び方');panel.before(modes);button(modes,classicNames[game],()=>{history.replaceState(null,'',location.pathname);params.delete('leave');params.delete('ink');reset();markMode(classicNames[game])})}
  button(modes,extraNames[game],extra);
  if(game==='vote'&&params.get('play')!=='extra')reset();else extra();
})();
