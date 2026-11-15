(() => {
  const {plans,parts,goals,dirs}=Workshop, art=WorkshopArt;
  const $=id=>document.getElementById(id), arrows=['→','↓','←','↑'];
  const canvas=$('scene'), ctx=canvas.getContext('2d'), buttons=[], tools=new Map();
  const coordinate=k=>'ABCDEFG'[k%7]+(Math.floor(k/7)+1);
  let completed;
  try {completed=new Set(JSON.parse(localStorage.getItem('workshop.solved')||'[]'))} catch {completed=new Set()}
  let plan,board,locked,pits,required,limit,tool='rail',run=null,motion=null,frame,sound;
  const triggered=new Map(), physics=WorkshopMotion;
  const label=p=>p.design?p.design.name:p.type==='start'?'投入口':p.type==='goal'?goals[plan.goal]:parts[p.type][0];
  const say=s=>$('status').textContent=s;
  for(let k=0;k<35;k++){
    const b=document.createElement('button');b.type='button';b.onclick=()=>place(k);$('cells').append(b);buttons.push(b);
  }
  for(const [id,[name]] of Object.entries(parts)){
    const b=document.createElement('button'), icon=document.createElement('canvas');
    icon.width=icon.height=64;icon.setAttribute('aria-hidden','true');
    const c=icon.getContext('2d');c.translate(32,32);art.draw(c,id);b.className='tool';b.append(icon,name);
    b.onclick=()=>selectTool(id);$('tools').append(b);tools.set(id,b);
  }
  function selectTool(id){for(const b of $('designShelf').children)b.setAttribute('aria-pressed','false');tool=id;for(const [key,b] of tools)b.setAttribute('aria-pressed',key===id);$('detail').textContent=parts[id][1]}
  function options(){
    $('plans').replaceChildren(...plans.map((p,i)=>new Option((completed.has(i)?'✓　':'')+String(i+1).padStart(2,'0')+'　'+p.name,i)));
    $('plans').value=plan.index;$('count').textContent=completed.size+' / '+plans.length+' 件完成';
  }
  function load(index){
    stop();plan=plans[index];board=new Map();locked=new Set();pits=new Set();required={};limit=plan.route.length-2;
    plan.route.forEach((p,i)=>{
      const endpoint=i===0||i===plan.route.length-1;
      if(!endpoint)required[p.type]=(required[p.type]||0)+1;
      if(endpoint||i===(plan.index<4?1:2)){board.set(p.key,{...p});locked.add(p.key)}
      if(p.type==='spring'){const [dx,dy]=dirs[p.dir];const gap=(p.y+dy)*7+p.x+dx;if(!plan.route.some(s=>s.key===gap))pits.add(gap)}
    });
    if(plan.conditions){
      limit=1;
      if(plan.conditions.range>1){
        const stride=(plan.route[1].key-plan.dock)/plan.conditions.range;
        for(let n=1;n<plan.conditions.range;n++)pits.add(plan.dock+n*stride);
      }
    }
    options();selectTool(plan.route.find(p=>!locked.has(p.key))?.type||'rail');
    $('title').textContent=plan.name;
    $('brief').textContent=['玉の力を借りて、作業室の呼び鈴を鳴らそう。','暗い書斎まで仕掛けをつないで、読書灯をともそう。','離れた机に実験開始の旗を揚げよう。','眠った羽根に勢いを届けて、風車を回そう。','火にかけたやかんに合図を届けて、湯気を立てよう。'][plan.goal];
    $('requirements').textContent='通す部品　'+Object.entries(required).map(([id,n])=>parts[id][0]+' ×'+n).join(' ／ ');
    $('hintText').hidden=true;$('hint').textContent='設計ヒントを見る';$('hintText').textContent=plan.route.slice(1,-1).map(p=>coordinate(p.key)+' '+label(p)+arrows[p.dir]).join('　→　');
    if(plan.conditions){
      $('brief').textContent=plan.brief;$('requirements').textContent='設置場所　'+coordinate(plan.dock)+' ／ 自作装置 1台';
      $('hintText').textContent=plan.hint;
    }
    $('requirements').textContent+=' ／ クリア報酬 '+WorkshopMarket.reward(plan.index)+' コイン';
    $('next').hidden=true;say(plan.conditions?'「装置を設計する」から試作して、金色のマスに置きましょう。':'投入口の矢印からスタート。ねじ留めされた部品は固定です。');sync();
  }
  function sync(){
    buttons.forEach((b,k)=>{const p=board.get(k);b.setAttribute('aria-label',coordinate(k)+' '+(p?label(p)+(p.type==='goal'?'':arrows[p.dir]):pits.has(k)?'机の溝':'空き')+(locked.has(k)?' 固定':''));});
    $('budget').textContent='使用部品　'+(board.size-2)+' / '+limit;paint();
  }
  function place(k){
    if(run)return;
    if(locked.has(k)||pits.has(k)){say(pits.has(k)?'ここは溝です。ばね台で飛び越えましょう。':'この部品はねじで固定されています。');return}
    const old=board.get(k);
    if(plan.conditions&&k!==plan.dock){say('装置を置けるのは '+coordinate(plan.dock)+' です。');return}
    if(plan.conditions&&typeof tool==='string'&&tool!=='erase'){say('この依頼には自作装置が必要です。「装置を設計する」か保存した設計図を選んでください。');return}
    if(tool==='erase')board.delete(k);
    else{
      if(!old&&board.size-2>=limit){say('部品数の上限です。「取り外す」で空きを作れます。');return}
      if(typeof tool==='object')board.set(k,{type:'device',design:tool,dir:old?.design?.id===tool.id?(old.dir+1)%4:0});
      else board.set(k,{type:tool,dir:old?.type===tool?(old.dir+1)%4:0});
    }
    motion=null;triggered.clear();$('next').hidden=true;say(coordinate(k)+'　'+(board.has(k)?label(board.get(k))+arrows[board.get(k).dir]:'取り外しました。'));sync();
  }
  function stop(){cancelAnimationFrame(frame);triggered.clear();run=null;motion=null;$('run').textContent='▶　玉を放す'}
  function tone(type,index){
    if(!sound)return;
    const t=sound.currentTime,osc=sound.createOscillator(),gain=sound.createGain();
    const freq=({domino:510+index*37,lever:235,bell:[659,831,988][index],spring:[180,530,145][index],goal:660})[type]||115;
    osc.type=type==='domino'||type==='lever'?'triangle':'sine';
    osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(type==='bell'||type==='goal'?freq*.99:freq*.55,t+.13);
    gain.gain.setValueAtTime(.055,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.32);osc.connect(gain).connect(sound.destination);osc.start(t);osc.stop(t+.33);
  }
  function finish(message,success=false){
    run=null;$('run').textContent='▶　もう一度放す';say(message);
    if(success){const solved=plan;WorkshopMarket.victory(solved).then(n=>{if(plan===solved){$('requirements').textContent=$('requirements').textContent.replace(/クリア報酬 \d+ コイン/,'クリア報酬 5 コイン');if(!run&&$('status').textContent===message)say(message+'　＋'+n+' コイン')}});completed.add(plan.index);try{localStorage.setItem('workshop.solved',JSON.stringify([...completed]))}catch{}options();$('next').hidden=plan.index===plans.length-1}
    paint();
  }
  function enter(k,incoming,now){
    const p=board.get(k);
    let failure='';
    if(!p)failure=coordinate(k)+(pits.has(k)?' の溝に玉が落ちました。':' で玉が止まりました。ここに部品を置いてみましょう。');
    else if(p.type==='goal'){
      if(plan.conditions&&!run.qualified)failure='ゴールに届きました。依頼の機能を装置に組み込んでもう一度試しましょう。';
      const missing=Object.entries(required).filter(([id,n])=>(run.used[id]||0)<n);
      if(missing.length)failure='ゴールに到着！　あと '+missing.map(([id,n])=>parts[id][0]+' ×'+(n-(run.used[id]||0))).join('、')+' を経由しましょう。';
    }else if(p.design){
      const d=p.design;
      if(run.visited.has(k)||p.dir!==(incoming+d.turn+4)%4)failure=coordinate(k)+' の入口の向きが合いません。装置を回して入口と投入口を合わせましょう。';
      else{
        for(const {base} of DeviceLab.stages(d))run.used[base]=(run.used[base]||0)+1;
        run.qualified=plan.conditions&&Object.entries(plan.conditions).every(([key,value])=>d[key]===value||WorkshopStock.items[key]?.[d[key]]?.base===value);
        say(d.name+' が作動中　'+DeviceLab.describe(d));
      }
    }else if(incoming!==null){
      const corner=['bend','lever'].includes(p.type);
      if(run.visited.has(k)|| (corner?(p.dir%2===incoming%2):p.dir!==incoming))failure=coordinate(k)+' の向きを確認しましょう。'+(corner?'曲がる部品は横から受け取ります。':'矢印の根元から玉を入れます。');
      run.used[p.type]=(run.used[p.type]||0)+1;
    }
    const type=failure&&p?.type!=='goal'?(pits.has(k)?'pit':'stop'):p.type;
    if(!failure){run.visited.add(k);triggered.set(k,incoming)}
    Object.assign(run,{k,p,type,failure,incoming,dir:p?.dir??incoming,time:now,beat:0,cues:type==='device'?DeviceLab.cues(p.design):physics.beats[type],duration:type==='device'?DeviceLab.timing(p.design).duration:physics.lengths[type]});
    motion={k,type,incoming,design:p?.design,dir:run.dir,t:0};frame=requestAnimationFrame(tick);
  }
  function tick(now){
    if(!run)return;
    const {k,p,type}=run,t=Math.min(1,(now-run.time)/run.duration);
    motion.t=t;
    const cues=run.cues;
    while(run.beat<cues.length&&t>=cues[run.beat]){const n=run.beat++;const stage=n===0?0:n===cues.length-1?2:1;tone(type==='device'?DeviceLab.stages(p.design)[stage].base:type,n%3);}
    paint();
    if(t<1){frame=requestAnimationFrame(tick);return}
    if(run.failure){finish(run.failure);return}
    if(p.type==='goal'){finish('発明成功！　'+['呼び鈴が鳴り響きました。','読書灯がともりました。','合図の旗が揚がりました。','風車が回りました。','やかんから湯気が上がりました。'][plan.goal],true);return}
    const [dx,dy]=dirs[p.dir],dist=p.design?p.design.range:p.type==='spring'?2:1,x=k%7+dx*dist,y=Math.floor(k/7)+dy*dist;
    if(x<0||x>=7||y<0||y>=5){finish('玉が作業台の端へ。最後の部品の矢印を確認しましょう。');return}
    enter(y*7+x,p.dir,now);
  }
  $('run').onclick=()=>{
    if(run){stop();paint();say('実験を止めました。部品を調整できます。');return}
    try{sound??=new AudioContext();sound.resume().catch(()=>{})}catch{}
    triggered.clear();run={visited:new Set(),used:{}};$('next').hidden=true;$('run').textContent='■　実験を止める';say('実験中…');enter(plan.route[0].key,null,performance.now());
  };
  function paint(){
    if(!board)return;
    const unit=64,w=Math.round(canvas.clientWidth*Math.min(devicePixelRatio,2)),h=Math.round(canvas.clientHeight*Math.min(devicePixelRatio,2));
    if(!w||!h)return;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    ctx.setTransform(w/(7*unit),0,0,h/(5*unit),0,0);
    ctx.clearRect(0,0,7*unit,5*unit);
    const moving=motion&&(motion.type==='device'?DeviceLab.sample(motion.design,motion.dir,motion.t):physics.sample(motion.type,motion.dir,motion.incoming,motion.t));
    const marbles=[];
    function queue(k,list){for(const b of list)marbles.push({...b,x:(k%7+.5)*64+b.x,y:(Math.floor(k/7)+.5)*64+b.y})}
    for(let k=0;k<35;k++){
      const x=k%7*unit,y=Math.floor(k/7)*unit,p=board.get(k);
      ctx.save();ctx.translate(x,y);
      ctx.strokeStyle='#ffe6b253';ctx.lineWidth=.7;ctx.setLineDash([2,3]);ctx.strokeRect(.5,.5,63,63);ctx.setLineDash([]);
      ctx.fillStyle='#281c13bc';ctx.fillRect(2,2,13,8);
      ctx.font='bold 7px monospace';ctx.fillStyle='#fff0d0';ctx.fillText(coordinate(k),4,8.5);
      if(pits.has(k)){
        const hole=ctx.createLinearGradient(0,15,0,51);
        hole.addColorStop(0,'#21140d');hole.addColorStop(.26,'#130f0c');hole.addColorStop(1,'#67412a');
        ctx.fillStyle=hole;ctx.beginPath();ctx.roundRect(5,16,54,33,4);ctx.fill();ctx.strokeStyle='#b18758';ctx.stroke();
      }
      if(k===plan.dock){ctx.strokeStyle='#ffe4a0';ctx.lineWidth=2;ctx.strokeRect(2,2,60,60)}
      ctx.translate(32,32);
      if(p){
        const engaged=motion?.k===k&&motion.type===p.type;
        const spent=triggered.has(k);
        if(p.design){
          DeviceLab.draw(ctx,p.design,p.dir,engaged?moving.action:0);
          ctx.textAlign='center';ctx.font='bold 7px sans-serif';ctx.fillStyle='#281d15e8';ctx.fillRect(-29,18,58,11);ctx.fillStyle='#fff1cb';ctx.fillText(p.design.name,0,26,54);
        }else art.draw(ctx,p.type,p.dir,engaged?moving.action:(spent&&p.type==='domino'?1:0),plan.goal);
        if(!engaged&&(p.type==='domino'||p.type==='lever')){
          const state=physics.sample(p.type,p.dir,triggered.get(k),spent?1:0);
          queue(k,[state.balls[spent?0:1]]);
        }
        if(locked.has(k)){ctx.fillStyle='#5a503b';ctx.beginPath();ctx.arc(25,-25,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e6cf9e';ctx.fillRect(23,-25,4,1)}
        if(p.type==='start'||p.type==='goal'){ctx.textAlign='center';ctx.font='bold 9px sans-serif';const width=ctx.measureText(label(p)).width+7;ctx.fillStyle='#271d14ec';ctx.fillRect(-width/2,19,width,12);ctx.fillStyle='#fff0c8';ctx.fillText(label(p),0,28)}
      }
      ctx.restore();
    }
    if(moving)queue(motion.k,moving.balls);
    for(const {x,y,z,r} of marbles){
      const sx=x+2+z*.3,sy=y+3+z*.18;
      const shadow=ctx.createRadialGradient(sx,sy,0,sx,sy,r+2+z*.18);
      shadow.addColorStop(0,z>8?'#1c130d65':'#170e09ba');shadow.addColorStop(1,'#170e0900');
      ctx.fillStyle=shadow;ctx.fillRect(sx-14,sy-14,28,28);
      art.ball(ctx,x,y-z,r+z*.023);
    }
  }
  $('plans').onchange=e=>load(Number(e.target.value));$('reset').onclick=()=>load(plan.index);
  $('next').onclick=()=>load(plan.index+1);$('hint').onclick=()=>{const h=$('hintText');h.hidden=!h.hidden;$('hint').textContent=h.hidden?'設計ヒントを見る':'ヒントを閉じる'};
  WorkshopMarket.init();WorkshopMusic.init();
  DeviceLab.init(d=>{
    tool=d;for(const b of tools.values())b.setAttribute('aria-pressed','false');
    $('detail').textContent=d.name+' ／ '+DeviceLab.describe(d);say(d.name+' を選択しました。作業台のマスを押して配置、もう一度押して回転します。');
  });
  $('commission').onclick=()=>{load(plans.findIndex(p=>p.conditions));$('openDesign').focus()};
  new ResizeObserver(paint).observe(canvas);load(0);
  art.ready.then(()=>{
    for(const [id,b] of tools){
      const icon=b.querySelector('canvas'), c=icon.getContext('2d');
      c.clearRect(-32,-32,64,64);art.draw(c,id);
    }
    paint();
  });
})();
