(() => {
  'use strict';
  const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEYS=['STR','VIT','AGI','INT','WIL','LUK'];
  const bosses={
    demon:{name:'黒角の魔王ヴァルガ',portrait:41,skill:'黒冠の業火',threat:'魔王軍が封じた王都の門',win:'黒い霧が晴れ、王都の門が再び開いた。避難していた人々が戻り、広場には失われていた朝市の声が響いた。',lose:'王都は魔王の支配下に残った。生き延びた人々は地下の街道を結び、小さな抵抗の灯を絶やさなかった。'},
    dragon:{name:'星喰いの古竜アストラ',portrait:24,skill:'星墜とし',threat:'古竜に閉ざされた空の航路',win:'古竜が去った空に星が戻った。空港の灯台が一斉にともり、離れていた街々の便りが再び届くようになった。',lose:'古竜の影は空を覆い続けた。人々は地上の古道を整え、もう一度空を取り戻すための観測を始めた。'},
    machine:{name:'終末機関オメガ',portrait:39,skill:'零式崩壊光',threat:'都市を隔離する終末機関の防壁',win:'終末機関の暴走は止まり、都市に穏やかな灯りが戻った。住民たちは機械を支配する仕組みを見直し、未来を自分たちの手に取り戻した。',lose:'終末機関はなお都市を監視し続けた。地下に逃れた技術者たちは、今回の戦闘記録から停止鍵の手がかりを探し始めた。'},
    queen:{name:'宵闇の女王リュシエル',portrait:40,skill:'忘却の花園',threat:'人々の記憶を奪う忘却の庭',win:'忘却の花が散り、人々は大切な名前を思い出した。街角に記憶を書き留める図書室が設けられ、語れなかった物語が再び紡がれた。',lose:'忘却の庭は広がり続けた。それでも旅人たちは互いの名前を手帳に刻み、記憶をつなぐ新しい習慣を生み出した。'}
  };
  let roster=[],state=null,timer=null,paused=false,report='';
  function loadRoster(){
    let invalid=0;
    try{const data=JSON.parse(localStorage.getItem('playground.character-forge.v1')||'[]');if(Array.isArray(data))roster=data.filter(c=>{const ok=c&&typeof c.name==='string'&&typeof c.job==='string'&&KEYS.every(k=>Number.isInteger(c.stats?.[k])&&c.stats[k]>0&&c.stats[k]<=9999);if(!ok)invalid++;return ok;}).slice(0,200);}catch{invalid++;}
    const options=roster.map((c,i)=>`<option value="${i}">${esc(c.name)} / ${esc(c.job)} / 合計${KEYS.reduce((n,k)=>n+c.stats[k],0)}</option>`).join('');
    $('hero').innerHTML=options;$('opponent').innerHTML=options;if(roster.length>1)$('opponent').value='1';
    $('roster-status').textContent=`保存キャラ ${roster.length} / 200体`+(invalid?'（読み込めないデータがありました。元の保存内容は変更していません）':'');
    updateSetup();
  }
  function updateSetup(){const boss=$('battle-kind').value==='boss';$('boss-settings').hidden=!boss;$('party-field').hidden=!boss;$('opponent-field').hidden=boss;
    $('party-list').innerHTML=roster.map((c,i)=>i===Number($('hero').value)?'':`<label><input type="checkbox" value="${i}"> ${esc(c.name)} <small> / ${esc(c.job)}</small></label>`).join('');
    $('start').disabled=roster.length<(boss?1:2);$('setup-error').textContent=roster.length<(boss?1:2)?`先にキャラメーカーで${boss?'1':'2'}体以上のキャラクターを保存してください。`:'';
  }
  function rand(){let a=state.rng+=0x6D2B79F5;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
  function unit(c,side,id){const raw=KEYS.reduce((n,k)=>n+c.stats[k],0),factor=$('balance').value==='equal'?600/raw:1;
    const s=Object.fromEntries(KEYS.map(k=>[k,Math.sqrt(c.stats[k]*factor)*4]));
    const max=Math.round(200+s.VIT*9+s.WIL*2);
    return {id,c,side,s,max,hp:max,energy:2,guard:false,damage:0,healing:0,blocks:0,actions:0};
  }
  function start(){
    clearTimeout(timer);const kind=$('battle-kind').value,hero=Number($('hero').value),opp=Number($('opponent').value),extra=[...document.querySelectorAll('#party-list input:checked')].map(i=>Number(i.value));
    if(!roster[hero]||(kind==='duel'&&(!roster[opp]||hero===opp))||extra.length>2){$('setup-error').textContent=extra.length>2?'追加の仲間は2人まで選んでください。':'対戦では異なる2体のキャラクターを選んでください。';return;}
    const seed=new Uint32Array(1);crypto.getRandomValues(seed);
    state={kind,seed:seed[0],rng:seed[0],round:1,queue:[],log:[],units:[],done:false,outcome:null,boss:bosses[$('boss').value],difficulty:$('difficulty').selectedOptions[0].textContent,balance:$('balance').selectedOptions[0].textContent};
    state.units=[hero,...(kind==='boss'?extra:[])].map((i,n)=>unit(structuredClone(roster[i]),'A','A'+n));
    if(kind==='duel')state.units.push(unit(structuredClone(roster[opp]),'B','B0'));
    else {const b=state.boss,c={name:b.name,job:'強敵',personality:'世界の行方を試す存在',title:'終わりを告げる者',stats:{STR:100,VIT:100,AGI:100,INT:100,WIL:100,LUK:100},visual:{animeIndex:b.portrait},lore:{uniqueSkill:{name:b.skill}}},u=unit(c,'B','B0'),n=state.units.length,mult={story:.7,normal:1,hard:1.35}[$('difficulty').value];
      KEYS.forEach(k=>u.s[k]=state.units.reduce((v,a)=>v+a.s[k],0)/n*mult*(k==='AGI'?1:1+Math.max(0,n-1)*.25));
      u.max=u.hp=Math.round(state.units.reduce((v,a)=>v+a.max,0)*mult*.95);state.units.push(u);
    }
    paused=false;$('speed').value=$('play-mode').value;$('setup').hidden=true;$('ending').hidden=true;$('arena').hidden=false;$('pause').textContent='一時停止';
    state.log.push(kind==='boss'?`${state.boss.threat}を巡る戦いが始まった。`:'二人は互いの力を確かめるため、決闘場で向き合った。');
    makeQueue();render();$('arena').scrollIntoView({block:'start',behavior:'auto'});schedule();
  }
  function alive(side){return state.units.filter(u=>u.hp>0&&(!side||u.side===side));}
  function makeQueue(){state.queue=alive().map(u=>({id:u.id,score:u.s.AGI*(.85+rand()*.3)})).sort((a,b)=>b.score-a.score).map(u=>u.id);}
  function actor(){return state.units.find(u=>u.id===state.queue[0]);}
  function finish(outcome){state.done=true;state.outcome=outcome;clearTimeout(timer);makeEnding();}
  function advance(){
    if(!alive('A').length){finish('loss');return;}if(!alive('B').length){finish('win');return;}
    while(state.queue.length&&!state.units.find(u=>u.id===state.queue[0]).hp)state.queue.shift();
    if(!state.queue.length){if(state.round>=60){finish('draw');return;}state.round++;makeQueue();}
  }
  function perform(action,targetId){
    if(!state||state.done)return;const a=actor();if(!a)return;
    const canSpend=Math.min(4,a.energy+1)>=2;if(['heal','skill'].includes(action)&&!canSpend)return;
    const allies=alive(a.side),enemies=alive(a.side==='A'?'B':'A');let t=state.units.find(u=>u.id===targetId&&u.hp>0);
    if(action==='heal'){if(!t||t.side!==a.side)t=[...allies].sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];}
    else if(action!=='guard'&&(!t||t.side===a.side))t=enemies[0];
    a.guard=false;a.energy=Math.min(4,a.energy+1);a.actions++;
    const prefix=`R${state.round} · ${a.c.name}`;
    if(action==='guard'){a.guard=true;a.blocks++;a.energy=Math.min(4,a.energy+1);state.log.push(`${prefix}は守りを固めた。次の自分の行動まで被ダメージ半減。`);}
    else if(action==='heal'){a.energy-=2;const amount=Math.min(t.max-t.hp,Math.round(45+a.s.WIL*2+a.s.INT*.8));t.hp+=amount;a.healing+=amount;state.log.push(`${prefix}が${t.c.name}を手当て。HPが${amount}回復。`);}
    else {const skill=action==='skill';if(skill)a.energy-=2;const crit=rand()<Math.min(.32,.06+a.s.LUK/1000),attack=skill?35+a.s.INT*1.4+a.s.WIL*.8:30+a.s.STR*1.6,defense=skill?t.s.WIL*.35:t.s.VIT*.35;
      let damage=Math.max(8,Math.round((attack-defense)*(.85+rand()*.3)*(crit?1.5:1)*(t.guard?.5:1)));damage=Math.min(t.hp,damage);t.hp-=damage;a.damage+=damage;
      const move=skill?`「${a.c.lore?.uniqueSkill?.name||a.c.skills?.[0]?.name||'魂の一撃'}」`:'攻撃';state.log.push(`${prefix}の${move} → ${t.c.name}に${damage}ダメージ${crit?'（会心）':''}${t.guard?'（防御中）':''}。${t.hp===0?'戦闘不能。':''}`);
    }
    state.queue.shift();advance();
  }
  function ai(){const a=actor(),team=alive(a.side),hurt=[...team].sort((x,y)=>x.hp/x.max-y.hp/y.max)[0],enemies=alive(a.side==='A'?'B':'A');
    if(hurt.hp/hurt.max<.38&&Math.min(4,a.energy+1)>=2&&rand()<.65)return ['heal',hurt.id];
    return [Math.min(4,a.energy+1)>=2&&rand()<.6?'skill':'attack',enemies[Math.floor(rand()*enemies.length)].id];
  }
  function schedule(){clearTimeout(timer);if(!state||state.done||paused)return;const mode=$('speed').value;
    if(mode==='instant'){let limit=500;while(!state.done&&limit-->0)perform(...ai());if(!state.done)finish('draw');render();return;}
    if(mode==='manual'&&actor().side==='A')return;
    timer=setTimeout(()=>{if(paused||state.done)return;perform(...ai());render();schedule();},mode==='fast'?500:1000);
  }
  function art(u){const index=u.c.visual?.animeIndex;if(Number.isInteger(index)&&index>=0&&index<48)return `<div class="face" role="img" aria-label="${esc(u.c.name)}のイラスト" style="background-image:url('/assets/character-anime-atlas-${index>=24?'v4':'v3'}.png');background-position:${index%4/3*100}% ${Math.floor(index%24/4)/5*100}%"></div>`;return '<div class="face" aria-hidden="true">✧</div>';}
  function render(){
    const a=state.done?null:actor();$('round').textContent=`ROUND ${state.round} / 60`;
    $('fighters').innerHTML=['A','B'].map(side=>`<div class="team"><p class="team-heading">${side==='A'?'YOUR PARTY':state.kind==='boss'?'BOSS':'RIVAL'}</p>${state.units.filter(u=>u.side===side).map(u=>`<article class="fighter ${u.hp===0?'down':''} ${a===u?'active':''}">${art(u)}<div><h3>${esc(u.c.name)}</h3><small>${esc(u.c.job)}${u.guard?' / 防御中':''}${u.hp===0?' / 戦闘不能':''}</small><div class="hp" role="progressbar" aria-label="${esc(u.c.name)}のHP" aria-valuemin="0" aria-valuemax="${u.max}" aria-valuenow="${u.hp}"><span style="width:${u.hp/u.max*100}%"></span></div><small>HP ${u.hp} / ${u.max} · 気力 ${u.energy}/4</small></div></article>`).join('')}</div>`).join('');
    $('turn-status').textContent=state.done?'戦いは終わりました。後日談をお読みください。':paused?'一時停止中':`${a.c.name}の行動${$('speed').value==='manual'&&a.side==='A'?' — 行動を選んでください':' — 自動進行中'}`;
    const manual=!state.done&&!paused&&$('speed').value==='manual'&&a.side==='A';$('commands').hidden=!manual;
    if(manual){const old=$('target').value;$('target').innerHTML=alive().map(u=>`<option value="${u.id}">${u.side===a.side?'味方':'相手'} / ${esc(u.c.name)} / HP${u.hp}</option>`).join('');$('target').value=alive().some(u=>u.id===old)?old:alive('B')[0].id;
      document.querySelectorAll('[data-action]').forEach(b=>b.disabled=['heal','skill'].includes(b.dataset.action)&&Math.min(4,a.energy+1)<2);
    }
    $('pause').disabled=state.done;$('retreat').disabled=state.done;$('speed').disabled=state.done;
    const log=$('battle-log');log.innerHTML=state.log.map(l=>`<li>${esc(l)}</li>`).join('');log.scrollTop=log.scrollHeight;
  }
  function makeEnding(){
    const outcome=state.outcome,win=outcome==='win',draw=outcome==='draw',retreat=outcome==='retreat',title=retreat?'明日につなぐ撤退':draw?'決着のない夜明け':win?'新しい朝の、その先へ':'敗北の先にも、物語は続く';
    const winner=state.units.find(u=>u.side===(win?'A':'B'));
    let world=state.kind==='boss'?(win?state.boss.win:draw?`${state.boss.threat}での戦いは膠着した。双方は力を使い果たし、世界は短い休戦の間に次の道を探し始めた。`:retreat?`${state.boss.threat}を突破できず、一行は撤退した。避難路を守る人々と合流し、持ち帰った情報を次の遠征へ託した。`:state.boss.lose):draw?'互いに決め手を欠いた決闘は、引き分けで幕を閉じた。街は二人の粘り強さをたたえ、翌年も同じ舞台を用意することにした。':retreat?'決闘は途中で打ち切られた。誰も勝者を名乗らず、観客たちは次の再会を待つことになった。':`${winner.c.name}の勝利が告げられた。争いを持ち込まないという決闘場の約束は守られ、街には競い合いから技を学ぶ新しい稽古場が生まれた。`;
    const heroes=state.units.filter(u=>state.kind==='duel'||u.side==='A'),mvp=[...heroes].sort((a,b)=>(b.damage+b.healing*.8+b.blocks*30)-(a.damage+a.healing*.8+a.blocks*30))[0];
    const aftermath=heroes.map(u=>{const contribution=u.healing>u.damage?'仲間を支えた手当ての経験を生かし、旅人が休める場所を整えた':u.blocks>u.actions/3?'守り抜くことの重みを知り、故郷で人々を守る方法を伝えた':u===mvp?'戦いで磨いた技を記録に残し、次の世代へ渡す道を選んだ':'相手の強さから学び、これまでと違う技術を学ぶ旅に出た';
      const recovery=u.hp===0?'戦闘不能となったが、戦いのあとに救助され、療養を経て再び歩み始めた。':u.hp/u.max<.3?'深い疲れを癒やすため、しばらく静かな場所で休んだ。':'戦いを生き延び、旅の道具を丁寧に整え直した。';
      const purpose=u.c.lore?.motive?`「${u.c.lore.motive}」という思いは、形を変えながらも胸に残った。`:u.c.story?`自分の来し方を振り返り、次の旅を記録する手帳を開いた。`:'';
      return {name:u.c.name,text:`${recovery}「${u.c.personality||'自分らしい'}」一面を持つ${u.c.job}として、${contribution}。${purpose}`,stats:`与ダメージ ${u.damage} / 回復 ${u.healing} / 防御 ${u.blocks}回`};});
    $('ending-title').textContent=title;$('epilogue').innerHTML=`<h3>世界のその後</h3><p>${esc(world)}</p><p>記録に残る活躍：${esc(mvp.c.name)}。${state.round}ラウンドにわたる戦いで、その選択が仲間と世界の記憶に刻まれた。</p><h3>キャラクターたちのその後</h3>${aftermath.map(x=>`<article><h3>${esc(x.name)}</h3><p>${esc(x.text)}</p><small>${esc(x.stats)}</small></article>`).join('')}`;
    $('ending').hidden=false;$('export-status').textContent='';
    report=`CHRONICLE ARENA\n${title}\n${state.kind==='boss'?state.boss.name+' / '+state.difficulty:'キャラ同士の対戦'} / ${state.balance}\nSEED ${state.seed}\n\n世界のその後\n${world}\n\n${aftermath.map(x=>x.name+'\n'+x.text+'\n'+x.stats).join('\n\n')}\n\n戦闘記録\n${state.log.join('\n')}`;
  }
  $('battle-kind').addEventListener('change',updateSetup);$('hero').addEventListener('change',updateSetup);$('start').addEventListener('click',start);
  $('party-list').addEventListener('change',e=>{if(document.querySelectorAll('#party-list input:checked').length>2){e.target.checked=false;$('setup-error').textContent='追加の仲間は2人まで選べます。';}else $('setup-error').textContent='';});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{if(!state||state.done||paused||$('speed').value!=='manual'||actor().side!=='A')return;perform(b.dataset.action,$('target').value);render();schedule();}));
  $('speed').addEventListener('change',()=>{clearTimeout(timer);render();schedule();});
  $('pause').addEventListener('click',()=>{paused=!paused;$('pause').textContent=paused?'再開':'一時停止';render();schedule();});
  $('retreat').addEventListener('click',()=>{finish('retreat');render();$('ending').scrollIntoView({behavior:'auto'});});
  $('again').addEventListener('click',()=>{clearTimeout(timer);state=null;$('arena').hidden=true;$('ending').hidden=true;$('setup').hidden=false;$('speed').disabled=false;loadRoster();$('setup').scrollIntoView({behavior:'auto'});});
  $('export-story').addEventListener('click',()=>{const blob=new Blob([report],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='character-battle-chronicle.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('export-status').textContent='戦闘ログと後日談を書き出しました。';});
  addEventListener('storage',e=>{if(e.key==='playground.character-forge.v1'&&!state)loadRoster();});
  addEventListener('pagehide',()=>clearTimeout(timer));addEventListener('pageshow',e=>{if(e.persisted){if(state)schedule();else loadRoster();}});loadRoster();
})();
