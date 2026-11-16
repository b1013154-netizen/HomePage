const PlanetArchive=(()=>{
  const $=id=>document.getElementById(id);
  const stages=['原始惑星','群体','群生生物','知的種族','集落','成熟文明'];
  const policies=['共生','工芸','探航'];
  const exchanges=[
    ['共同研究','研究成果を交換し、両文明の進化・研究速度が6%ずつ上がります。'],
    ['生活技術の交易','生産技術を交換し、両惑星が養える人口が10%ずつ増えます。'],
    ['航法の伝授','航法を交換し、両文明の次の探査から航行速度が15%ずつ上がります。']
  ];
  function count(life,kind){return (life?.contacts||[]).filter(c=>c.kind===kind).length}
  function init({active,records,commit,replace,locked}){
    const left=$('worldA'),right=$('worldB'),slots=$('restoreSlot'),kind=$('exchangeType');
    let shelf=[],editing=false,optionsKey='';
    function options(select,rows,preferred){
      select.replaceChildren(...rows.map(([id,name])=>new Option(name,id)));
      if(rows.some(([id])=>id===preferred))select.value=preferred;
    }
    function star(id){return id==='now'?active():shelf.find(r=>r.id===id)?.star}
    function name(id){return id==='now'?(active().name||'育成中の星'):shelf.find(r=>r.id===id)?.name}
    function message(text){$('archiveStatus').textContent=text}
    function refresh(){
      const rows=shelf.map(r=>[r.id,r.name+' · '+r.star.years.toLocaleString('ja-JP')+'年']);
      const menuKey=JSON.stringify([active().name,rows]);
      if(menuKey!==optionsKey){
        optionsKey=menuKey;const all=[['now','現在：'+name('now')],...rows];
        options(slots,rows,slots.value);options(left,all,left.value);
        options(right,all,right.value&&right.value!==left.value?right.value:rows.at(-1)?.[0]);
      }
      const a=star(left.value),b=star(right.value),mode=Number(kind.value);
      const sameSelection=a===b;
      const show=(v,u='')=>v.toLocaleString('ja-JP')+u;
      const metrics=[
        ['経過年数',s=>show(s.years,'年')],['環境',s=>s.temp+' °C ／ 水 '+s.water+' ／ '+s.gravity+' G'],
        ['生命段階',s=>stages[s.life?.stage||0]],['発見数',s=>show(s.finds.length,'件')],
        ['知的種族',s=>s.life?.stage>=3?LivingWorld.info(s,s.branch).people:'未誕生'],
        ['文明の方針',s=>policies[s.life?.path]||'未決定'],['推計人口',s=>show(Math.round(s.life?.population||0),'人')],
        ['探査から帰還',s=>show(s.life?.returns.length||0,'回')],['受け継いだ知識',s=>s.life?.contacts?.map(c=>c.gift).join('、')||'なし']
      ];
      const table=$('compareBody');table.replaceChildren();
      $('headA').textContent=name(left.value)||'—';$('headB').textContent=sameSelection?'比較先を選択':name(right.value)||'—';
      for(const [title,f] of metrics){
        const row=table.insertRow(),label=document.createElement('th');label.scope='row';label.textContent=title;row.append(label);
        row.insertCell().textContent=a?f(a):'—';row.insertCell().textContent=b&&!sameSelection?f(b):'—';
      }
      for(const field of [left,right,kind,slots])field.disabled=editing;
      const seen=(s,peer)=>s.life.contacts?.some(c=>c.peer===peer.seed&&c.kind===mode);
      let reason='';
      if(!a||!b||a.seed===b.seed)reason='交流には、地形の異なる二つの星を選んでください。';
      else if(a.life.stage<4||b.life.stage<4)reason='両方の星に集落が成立すると交流できます。';
      else if(seen(a,b)&&seen(b,a))reason='この二つの文明では、この交流をすでに行いました。';
      $('exchangeNote').textContent=exchanges[mode][1]+' '+reason;
      $('exchange').disabled=!!reason||locked()||editing;
      for(const id of ['storeStar','newStar','resetStar'])$(id).disabled=locked()||editing;
      $('loadStar').disabled=$('deleteStar').disabled=!slots.value||locked()||editing;
      $('currentStar').textContent=name('now');
    }
    const reload=()=>{shelf=records();refresh()};
    async function mutate(fn){
      if(editing||locked())return;editing=true;refresh();
      try{
        const task=()=>{shelf=records();const next=structuredClone(shelf),current=structuredClone(active());
          const result=fn(next,current);if(!result)return;
          if(!commit(result.current||current,next))throw Error('保存容量が不足しているか、ブラウザの保存機能が利用できません。');
          shelf=next;replace(result.current||current,result.switching);message(result.text);
        };
        if(navigator.locks)await navigator.locks.request('planet-archive-edit',task);else task();
      }catch(e){message(e.message)}finally{editing=false;refresh()}
    }
    $('storeStar').onclick=()=>{
      const title=$('starName').value.trim();
      if(!title){message('保管する星の名前を入力してください。');$('starName').focus();return}
      mutate((next,current)=>{current.name=title;next.push({id:crypto.randomUUID(),name:title,star:structuredClone(current)});
        return {text:'「'+title+'」を保管しました。',current}});
    };
    $('loadStar').onclick=()=>{
      const id=slots.value;if(!confirm('育成中の星を、この保存時点に切り替えますか？ 現在の状態を残すには先に保管してください。'))return;
      mutate(next=>{const r=next.find(r=>r.id===id);if(!r)return;return {current:structuredClone(r.star),switching:true,text:'「'+r.name+'」の育成を再開しました。'}});
    };
    $('deleteStar').onclick=()=>{
      const id=slots.value;if(!confirm('選んだ保存記録を削除しますか？'))return;
      mutate(next=>{const index=next.findIndex(r=>r.id===id);if(index<0)return;next.splice(index,1);return {text:'選んだ記録を削除しました。'}});
    };
    for(const [i,[title]] of exchanges.entries())kind.add(new Option(title,i));
    $('exchange').onclick=()=>{
      const ids=[left.value,right.value],mode=Number(kind.value);
      mutate((next,current)=>{
        const stars=ids.map(id=>id==='now'?current:next.find(r=>r.id===id)?.star);
        if(stars.some(s=>!s||s.life?.stage<4)||stars[0].seed===stars[1].seed)return;
        function gift(s){
          const info=LivingWorld.info(s,s.branch);
          return [info.people+'の'+(s.life.work||'観察記録'),info.h[0]+'の生産技術',info.people+'の星図'][mode];
        }
        let changed=false;
        stars.forEach((s,i)=>{
          const peer=stars[1-i],contacts=s.life.contacts??=[];
          if(contacts.some(c=>c.peer===peer.seed&&c.kind===mode))return;
          changed=true;const gained=gift(peer);contacts.push({peer:peer.seed,kind:mode,gift:gained});
          s.events.unshift({year:s.years,text:(peer.name||'隣星')+'と'+exchanges[mode][0]+'を実施。「'+gained+'」を受け継いだ。'});s.events=s.events.slice(0,40);
        });
        if(changed)return {current,text:'交流成立。'+gift(stars[0])+' と '+gift(stars[1])+' を交換しました。'};
      });
    };
    for(const el of [left,right,kind,slots])el.onchange=refresh;
    window.addEventListener('storage',reload);reload();return refresh;
  }
  return {init,count};
})();
