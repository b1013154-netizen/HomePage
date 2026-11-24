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
  function node(tag,text='',cls=''){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e}
  function add(tag,text,cls){const e=node(tag,text,cls);panel.append(e);return e}
  function button(parent,label,fn,cls){const b=node('button',label,cls);b.type='button';b.onclick=fn;parent.append(b);return b}
  function start(count,label){panel.replaceChildren();if(count)add('p',(step+1)+' / '+count,'step');add('h2',label)}
  function options(labels,fn){const box=add('div','','choices');labels.forEach((v,i)=>button(box,v,()=>fn(i)))}
  function next(fn){step++;fn();panel.scrollIntoView({block:'nearest'})}
  function actions(){return add('div','','actions')}
  function result(summary,details,again){
    textResult=summary+'\n'+details.filter(Boolean).join('\n');add('p',textResult,'ticket');
    const box=actions(),a=node('a','Xで結果を共有');const share=new URL('https://twitter.com/intent/tweet');
    share.searchParams.set('text',title+'\n'+(game==='holiday'||game==='measure'?textResult:summary));share.searchParams.set('url','https://asobiba-lab-bsa.pages.dev'+location.pathname);
    a.href=share.href;a.target='_blank';a.rel='noopener';box.append(a);
    button(box,'結果画像を保存',saveImage);button(box,again||'もう一度遊ぶ',reset);
  }
  function saveImage(){
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=800;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#f7f1df';ctx.fillRect(0,0,1000,800);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--accent');ctx.fillRect(0,0,22,800);
    ctx.font='bold 38px sans-serif';ctx.fillText(title,60,88,880);ctx.font='30px sans-serif';ctx.fillStyle='#253e36';let y=178;
    for(const line of textResult.split('\n')){let row='';for(const ch of line){if(ctx.measureText(row+ch).width>850){ctx.fillText(row,60,y);y+=45;row=''}row+=ch}ctx.fillText(row,60,y);y+=54}
    if(game==='color' && resultColor){ctx.fillStyle=resultColor;ctx.fillRect(60,450,880,145);ctx.fillStyle='#253e36'}
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
    panel.querySelectorAll('button,input').forEach(b=>b.disabled=true);
    const status=add('p','集計しています…','small');
    try {
      const r=await fetch('https://homepage.b1013154.workers.dev/api/quick-choice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,game,question:q,value}),signal:AbortSignal.timeout(12000)});
      if(!r.ok)throw Error();const data=await r.json();answers[q]=value;reports[q]=data;done(data);
    } catch {status.textContent='集計に接続できませんでした。同じ回答で再試行できます。';button(panel,'再試行',()=>{status.remove();submit(q,value,done)})}
  }
  function bars(labels,counts,n){labels.forEach((s,i)=>{const pct=Math.round(counts[i]*100/n);add('p',s+'　'+pct+'％（'+counts[i]+'票）');const b=add('span','','bar');const iTag=node('i');iTag.style.width=pct+'%';b.append(iTag)})}
  function vote(){
    if(step===votes.length){start(0,'あなたの5票');const minor=votes.filter((_,i)=>reports[i].counts[answers[i]]*2<reports[i].n);
      result('5問中、少数派だったのは '+minor.length+' 問。',votes.map((q,i)=>q[0]+' → '+q[1+answers[i]]+'（'+Math.round(reports[i].counts[answers[i]]*100/reports[i].n)+'％）'));return}
    const [q,...labels]=votes[step];start(5,q);options(labels,i=>submit(step,i,d=>{
      start(5,q);add('p','あなたの一票　'+labels[i]+' ／ 集計 '+d.n+'人');bars(labels,d.counts,d.n);
      button(actions(),step===4?'結果を見る':'次の二択へ',()=>next(vote),'main')}))
  }
  function price(){
    if(step===3){start(0,'あなたの買い付け伝票');result('3品の合計は '+answers.reduce((a,b)=>a+b,0).toLocaleString()+' 円',goods.map((g,i)=>g[0]+'　'+answers[i]+'円 ／ 中央値 '+reports[i].median+'円'));return}
    const [name,desc,art]=goods[step];start(3,name);add('div',art,'art');add('p',desc);
    const label=add('label','あなたの値札（0〜1,000,000円） '),input=node('input');input.type='number';input.min=0;input.max=1000000;input.step=1;input.required=true;input.inputMode='numeric';label.append(input);
    button(actions(),'値札を付ける',()=>{if(!input.reportValidity())return;const v=input.valueAsNumber;submit(step,v,d=>{
      start(3,name);add('p','あなたの値札 '+v.toLocaleString()+' 円','value');add('p',d.n+' 人の中央値は '+d.median.toLocaleString()+' 円です。');
      button(actions(),step===2?'伝票を見る':'次の品物へ',()=>next(price),'main')})},'main')
  }
  function measure(){
    if(step===3){start(0,'私の言葉のものさし');result('「すぐ行く」は'+answers[0]+'分後。'+ '私の一口はケーキの'+answers[2]+'％。',['「そこそこ混んでる」は '+answers[1]+' 人待ち。']);return}
    const [q,max,unit,initial]=measureQs[step];start(3,q);const art=add('div','','art'),c=node('canvas');c.width=400;c.height=150;art.append(c);
    const range=add('input');range.type='range';range.min=0;range.max=max;range.value=initial;range.setAttribute('aria-label',q);
    const out=add('output','','value');function paint(){const v=+range.value,ctx=c.getContext('2d');ctx.clearRect(0,0,400,150);out.textContent=v+unit;range.setAttribute('aria-valuetext',v+unit);
      if(step===1){ctx.font='22px sans-serif';for(let i=0;i<v;i++)ctx.fillText('🚶',12+(i%10)*38,32+Math.floor(i/10)*33);return}
      ctx.beginPath();ctx.arc(200,75,62,0,2*Math.PI);ctx.fillStyle=step===0?'#fffdf6':'#c38858';ctx.fill();ctx.strokeStyle='#846a50';ctx.stroke();
      ctx.beginPath();ctx.moveTo(200,75);ctx.arc(200,75,59,-Math.PI/2,-Math.PI/2+2*Math.PI*v/max);ctx.closePath();ctx.fillStyle=step?'#f5c8b4':'#99c7b8';ctx.fill();
      if(!step){for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.fillRect(199+54*Math.sin(a),74-54*Math.cos(a),3,3)}ctx.beginPath();ctx.moveTo(200,75);ctx.lineTo(200+48*Math.sin(2*Math.PI*v/max),75-48*Math.cos(2*Math.PI*v/max));ctx.stroke()}
    }range.oninput=paint;paint();button(actions(),'これくらい',()=>{answers.push(+range.value);next(measure)},'main')
  }
  function holiday(){if(step<3){const [q,...opts]=holidayQs[step];start(3,q);options(opts,i=>{answers.push(i);next(holiday)});return}
    const names=['二度寝記念日','遠回りの日','おやつ増量祭','読書解禁日','手紙日和'];start(0,'祝日制定のお知らせ');result('「'+names[answers[1]]+'」を制定します。',['日付　'+holidayQs[0][1+answers[0]],'祝し方　'+holidayQs[1][1+answers[1]],'禁止事項　'+holidayQs[2][1+answers[2]]])}
  function exhibit(){start(0,'持ち帰れるのは、一個だけ。');add('p','展示品を選ぶと、あなたの引換券を発行します。');options(exhibits,i=>submit(0,i,d=>{
    start(0,'展示品引換券');const best=Math.max(...d.counts);result('私が持ち帰るのは「'+exhibits[i]+'」。',['同じ展示品を選んだ人　'+d.counts[i]+' / '+d.n+'人','最多の展示品　'+exhibits.filter((_,k)=>d.counts[k]===best).join('・')]);bars(exhibits,d.counts,d.n)
  }))}
  function color(){start(0,'どの情景の色を探す？');options(scenes,q=>{start(0,'「'+scenes[q]+'」はどの色？');const grid=add('div','','colors');let selected=-1;const pick=button(actions(),'この色を選ぶ',()=>submit(q,selected,d=>{
    resultColor=colors[selected];start(0,scenes[q]+'のモザイク');const mosaic=add('div','','mosaic');d.counts.forEach((n,i)=>{if(n){const s=node('span');s.style.flex=n;s.style.background=colors[i];s.title=n+'人';mosaic.append(s)}});add('p','帯の幅は、その色を選んだ人数を表します。','small');add('div','あなたの色　#'+(selected+1),'ticket').style.borderLeft='24px solid '+colors[selected];result('「'+scenes[q]+'」に選んだ色は #'+(selected+1)+'。',['同じ色を選んだ人は、自分を含めて '+d.counts[selected]+' / '+d.n+' 人。'])
  }),'main');pick.disabled=true;colors.forEach((col,i)=>{const b=button(grid,'',()=>{selected=i;grid.querySelectorAll('button').forEach((el,j)=>el.setAttribute('aria-pressed',String(i===j)));pick.disabled=false});b.style.background=col;b.setAttribute('aria-label','色 '+(i+1));b.setAttribute('aria-pressed','false')})})}

  function memory(){
    const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
    let seed=Number(date.replaceAll('-',''));function random(limit){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*limit)}
    const chairs=2+random(4),cups=1+random(4),pet=['🐈','🐇','🐕'][random(3)],plant=1+random(3);
    const menu=['プリン','トースト','パフェ','タルト'][random(4)],curtain=random(2);
    const questions=[['椅子は何脚あった？',['2脚','3脚','4脚','5脚'],chairs-2],['窓辺にいたのは？',['猫','うさぎ','犬'],['🐈','🐇','🐕'].indexOf(pet)],['カップは何個？',['1個','2個','3個','4個'],cups-1],['黒板のメニューは？',['プリン','トースト','パフェ','タルト'],['プリン','トースト','パフェ','タルト'].indexOf(menu)],['鉢植えはいくつ？',['1鉢','2鉢','3鉢'],plant-1]];
    for(let i=questions.length-1;i>0;i--){const j=random(i+1);[questions[i],questions[j]]=[questions[j],questions[i]]}
    const quiz=questions.slice(0,3);
    function draw(){
      const c=add('canvas','','scene');c.width=700;c.height=355;c.setAttribute('aria-label','今日の喫茶店の観察イラスト');
      const g=c.getContext('2d');function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(x,y,w,h)}
      function icon(x,y,t,size){g.font=size+'px "Segoe UI Emoji",sans-serif';g.fillText(t,x,y)}
      rect(0,0,700,230,'#e2d1ad');rect(0,230,700,125,'#a47f5b');
      for(let x=0;x<700;x+=40)rect(x,0,1,230,'#d3bf99');
      rect(36,18,268,145,'#754f3c');rect(44,26,252,129,curtain?'#afc9c5':'#a8c6d6');
      rect(165,23,6,132,'#8d674d');rect(44,83,252,4,'#947053');icon(76,151,pet,43);
      rect(360,24,230,90,'#8a6346');rect(367,31,216,76,'#314a42');g.fillStyle='#f9ebc8';g.font='27px serif';g.fillText(menu,410,81);
      for(let i=0;i<plant;i++)icon(416+i*68,171,'🪴',43);
      rect(24,178,651,16,'#724c38');rect(38,194,620,40,'#bf9268');
      for(let i=0;i<cups;i++)icon(45+i*80,175,'☕',35);
      for(let i=0;i<chairs;i++){const x=48+i*126;rect(x,243,78,32,'#735440');rect(x,280,80,9,'#594538');rect(x+4,274,7,58,'#79583f');rect(x+69,274,7,58,'#79583f')}
    }
    function ask(){if(step===3){start(0,'今日の答え合わせ');draw();const n=quiz.filter((q,i)=>answers[i]===q[2]).length;
      result(date+' の喫茶店　'+n+' / 3問正解',quiz.map((q,i)=>(answers[i]===q[2]?'○ ':'× ')+q[0]+'　'+q[1][q[2]]));return}
      start(3,quiz[step][0]);options(quiz[step][1],i=>{answers.push(i);next(ask)})
    }
    start(0,date+' の喫茶店');add('p','絵を見る時間は5秒。そのあと、絵にまつわる3問に答えてください。');
    button(actions(),'5秒だけ見る',()=>{start(0,'喫茶店をよく見てください');draw();const end=performance.now()+5000,clock=add('p','残り5秒');
      timer=setInterval(()=>{const left=Math.ceil((end-performance.now())/1000);if(left<=0){clearInterval(timer);ask()}else clock.textContent='残り'+left+'秒'},100)
    },'main')
  }
  function reset(){clearInterval(timer);step=0;answers=[];reports=[];({vote,measure,price,holiday,memory,exhibit,color})[game]()}
  reset();
})();
