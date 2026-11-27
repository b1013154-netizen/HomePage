games.hands=function(){
 const pile=mix(['🥚 卵','💐 花束','🍱 お弁当','🧋 タピオカ','🎂 ケーキ','🍕 ピザ','📚 辞典','🍧 かき氷','🐙 たこ焼き','🪴 植木鉢','🍜 ラーメン','🧸 ぬいぐるみ']).slice(0,8),hands=[[],[]];let n=0;
 const weights={'📚':4,'🪴':3,'🍜':3,'🎂':3,'🍱':2,'🍕':2};
 const weight=s=>weights[s.split(' ')[0]]||1;
 const load=i=>hands[i].reduce((sum,s)=>sum+weight(s),0);
 function draw(){background();hands.forEach((items,i)=>{const x=155+290*i;label(i?'🤚':'🫲',x,292,76);items.forEach((s,j)=>label(s.split(' ')[0],x+Math.sin(j)*18,224-j*29,36));label((i?'右手':'左手')+'　'+load(i)+' / 9',x,320,15)});label(n<pile.length?'次は '+pile[n]:'全部持てました',300,32)}
 function finish(reason='預かり終了'){draw();end(reason+'。左手に'+hands[0].length+'品、右手に'+hands[1].length+'品。最後に預かったのは'+(pile[n-1]||'なし')+'。')}
 function ask(){draw();screen('片手の容量は9。次の荷物の重さは '+weight(pile[n])+'。どちらで持つ？');['左手','右手'].forEach((s,i)=>button(s+'に置く',()=>{if(load(i)+weight(pile[n])>9)return finish('その手はもういっぱい！');hands[i].push(pile[n++]);n===pile.length?finish('全部持てました！'):ask()}));if(n)button('ここが限界',()=>finish())}ask()
};
games.sign=function(){
 const direction=random()>.5?1:-1;
 const pieces=['出口','走る人','矢印'],pos=[[115,190],[285,160],[475,115]],ref=[[300+direction*110,170],[300+direction*20,175],[300-direction*125,160]],flip=[1,1,1];let selected=1,drag=false;
 function art(points,reference){points.forEach(([x,y],i)=>{g.save();g.translate(x,y);const d=reference?direction:flip[i];g.scale(d,1);const ink=reference?'#ffc675':'#fff8df';g.lineCap='round';
 if(i===0){rect(-26,-48,8,92,ink);rect(-26,-48,52,8,ink);rect(18,-48,8,92,ink)}
 if(i===1){ellipse(13,-35,9,9,ink);stroke([[9,-21],[-6,2],[-20,9],[-34,7]],ink,10);stroke([[-5,2],[13,13],[6,34]],ink,10);stroke([[-9,-13],[4,-22],[15,-9],[29,-11]],ink,7)}
 if(i===2){stroke([[-30,0],[26,0],[8,-16]],ink,8);stroke([[26,0],[8,16]],ink,8)}g.restore()})}
 function draw(){background('#196e55');art(pos,false);const [x,y]=pos[selected];g.strokeStyle='#f8d491';g.setLineDash([5,5]);g.strokeRect(x-41,y-48,82,83);g.setLineDash([])}
 function move(x,y){pos[selected]=[Math.max(42,Math.min(558,x)),Math.max(50,Math.min(285,y))];draw()}
 screen('出口・人・矢印をドラッグして、'+(direction===1?'右':'左')+'へ避難する案内を復元。各部品は反転できます。');draw();
 board.onpointerdown=e=>{const [x,y]=point(e);const k=pos.findIndex(p=>Math.abs(p[0]-x)<47&&Math.abs(p[1]-y)<50);if(k>=0)selected=k;drag=true;board.setPointerCapture(e.pointerId);move(x,y)};board.onpointermove=e=>{if(drag)move(...point(e))};board.onpointerup=board.onpointercancel=()=>drag=false;
 pieces.forEach((p,i)=>button(p,()=>{selected=i;draw()}));button('左右反転',()=>{flip[selected]*=-1;draw()});
 button('見本と重ねる',()=>{background('#196e55');art(pos,false);g.globalAlpha=.72;art(ref,true);g.globalAlpha=1;label('オレンジ色がこの遊びの見本',300,307,17,'white');const gap=Math.round(pos.reduce((s,p,i)=>s+Math.hypot(p[0]-ref[i][0],p[1]-ref[i][1]),0)/3);end('私の避難案内。見本との平均のずれは '+gap+' px。向きの一致 '+[1,2].filter(i=>flip[i]===direction).length+' / 2。')})
};
games.clap=function(){
 let taps=[],start=0,until=0;function crowd(lit=-1){background('#20283e');for(let r=0;r<4;r++)for(let i=0;i<9;i++)label(lit>=0&&(i+r+lit)%3!==0?'👏':'👤',55+i*61+r%2*12,112+r*53,32);label(lit<0?'開演前':'拍手！',300,44,24,'#ffeac0')}
 function play(){let i=0;for(const t of taps)setTimeout(()=>{tone(0,.09,0,true);crowd(i++)},t);setTimeout(()=>crowd(-1),3200)}
 screen('開始を押したら3秒間、好きな間合いで拍手してください。音が出ます。');crowd();button('3秒間の録音を開始',()=>{sound();screen('拍手ボタンか客席をタップ！');start=performance.now();until=start+3000;function tap(){if(performance.now()>until||taps.length>=80)return;taps.push(Math.round(performance.now()-start));tone(0,.08,0,true);crowd(taps.length)}board.onpointerdown=tap;button('👏 拍手',tap);
 setTimeout(()=>{crowd(taps.length||-1);const mood=taps.length===0?'息をのむ静けさ':taps.length<6?'余韻にひたる客席':taps.length<14?'満席のカーテンコール':'鳴りやまないアンコール';label(mood,300,78,19,'white');end(mood+'。3秒で'+taps.length+'拍。',{beats:taps.join('.')});button('客席で再演',play)},3000)});
 const beats=params.get('beats');if(beats!==null&&/^(\d{1,4}(\.\d{1,4})*)?$/.test(beats)&&beats.length<400){taps=beats?beats.split('.').map(Number).filter(v=>v<=3000).slice(0,80):[];screen('届いた拍手を再演できます。');button('音付きで再演',()=>{sound();play()});button('自分で拍手する',()=>location.assign(location.pathname))}
};
games.gyoza=function(){
 const events=mix(['向かいの人が箸を置いた','店員が空いた皿を見ている','友達が小皿に酢を注いだ','みんなが水を一口飲んだ']);let stage=0,clock;
 function scene(){background('#dbbd94');ellipse(300,171,157,68,'#faf9ee');label('🥟',300,185,70);label(events[stage],300,56,23)}
 function finish(take){clearInterval(clock);background('#faf5df');['餃子が一個残る',events[0],events[stage],take?'私がいただく！':'友達にゆずった'].forEach((s,i)=>{const x=(i%2)*300,y=Math.floor(i/2)*165;rect(x+4,y+4,291,156,'#e7dac4');label(['🥟','🥢','👀',take?'😋':'🤝'][i],x+150,y+88,54);label(s,x+150,y+135,17)});end(take?'「'+events[stage]+'」の瞬間、最後の一個を取りました。':'最後の餃子は友達のお皿へ。')}
 background('#dbbd94');label('🥟',300,192,95);screen('円卓に残った餃子は一つ。箸を出すタイミングを決めてください。');button('食卓につく',()=>{screen('いつ取る？　見送ることもできます。');scene();button('いま箸を出す',()=>finish(true));button('見送る',()=>finish(false));clock=setInterval(()=>{if(stage===3)finish(false);else{stage++;scene()}},1700)})
};
games.lost=async function(){
 const group=mix(objects)[0].group,choices=mix(objects.filter(item=>item.group===group)).slice(0,4),answer=Math.floor(random()*4),hint=(params.get('h')||'').slice(0,80),item=choices[answer];
 screen('落とし物をカウンターに並べています…');
 const images=await Promise.all(choices.map(async choice=>{const img=new Image();img.src='/assets/future-museum/item-'+choice.id+'.webp';try{await img.decode();return img}catch{return null}}));
 function tile(j,x,y,w){const img=images[j];rect(x-w/2-3,y-w/2-3,w+6,w+6,'#fffaf0');if(img)g.drawImage(img,x-w/2,y-w/2,w,w);label(choices[j].name,x,y+w/2+24,16)}
 background();if(!hint){tile(answer,300,145,192);screen('この品の名前を使わず、落とし物の特徴を一行で放送してください。');const f=input('館内放送の一行');
 button('放送を作る',()=>{const h=f.value.trim();if(!h||h.includes(item.name)){msg.textContent='品名を避けてヒントを入力してください。';return}screen('館内放送「'+h+'」');invite('この落とし物、どれでしょう？',{h});button('この端末で受け取る',()=>location.assign(location.pathname+'?guest=1#'+new URLSearchParams({s:seed,h})))});return}
 screen('館内放送「'+hint+'」　どれを受け取りますか？');choices.forEach((choice,j)=>{tile(j,82+j*145,154,126);button(choice.name,()=>{background();tile(answer,300,145,192);end(j===answer?'無事に落とし主の手に戻りました！':'取り違えました。正解は'+item.name+'。',{h:hint})})})
};
