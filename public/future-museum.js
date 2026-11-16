'use strict';
(()=>{
 const $=id=>document.getElementById(id),asset='/assets/future-museum/',key='asobiba.future-museum.1';
 const img=id=>asset+'item-'+id+'.webp';
 function fresh(){return {cells:Array(9).fill(null),years:1000,period:7,show:null,history:[]}}
 let state=fresh();try{const stored=JSON.parse(localStorage.getItem(key));if(stored&&Array.isArray(stored.cells)&&stored.cells.length===9&&Array.isArray(stored.history))state=stored}catch{}
 let room='',selectedCell=null,scene=null,slot=0,people=true,sortKey='visitors',lastTick=0;
 function say(s){$('note').textContent=s}
 function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{say('このブラウザでは記録を保存できません。')}}
 function add(tag,parent,txt,props={}){const el=document.createElement(tag);el.textContent=txt;Object.assign(el,props);parent.append(el);return el}
 function btn(parent,name,fn){const b=add('button',parent,name,{type:'button'});b.onclick=fn;return b}
 function selected(){return state.cells.filter(Number.isInteger)}
 add('option',$('group'),'すべて',{value:'all'});museumGroups.forEach(([name],i)=>add('option',$('group'),name,{value:i}));
 $('years').value=state.years;$('period').value=state.period;
 for(const id of ['years','period'])$(id).onchange=()=>{state[id]=Number($(id).value);save()};
 function remove(id){state.cells[state.cells.indexOf(id)]=null;selectedCell=null;save();drawDig()}
 function toggle(id){const ids=selected();if(ids.includes(id)){remove(id);return}if(ids.length===3)return say('埋められるのは3品までです。入れ替える品をもう一度押してください。');
   const position=[4,3,5,0,1,2,6,7,8].find(i=>state.cells[i]===null);state.cells[position]=id;save();drawDig();say(objects[id].name+'を区画に置きました。')}
 function drawDig(){const list=$('catalog'),plot=$('plot'),contents=$('contents');list.replaceChildren();plot.replaceChildren();contents.replaceChildren();const ids=selected(),term=$('search').value.trim();
   const found=objects.filter(o=>($('group').value==='all'||o.category===Number($('group').value))&&o.name.includes(term));
   if(!found.length)add('p',list,'該当する品物がありません。');
   for(const o of found){const b=btn(list,'',()=>toggle(o.id));b.setAttribute('aria-pressed',String(ids.includes(o.id)));add('img',b,'',{src:img(o.id),alt:'',loading:'lazy'});add('b',b,o.name)}
   state.cells.forEach((id,i)=>{const name=id===null?'·':objects[id].name;const b=btn(plot,name,()=>{
     if(selectedCell===null){if(state.cells[i]===null)return say('先に動かしたい品物の区画を押してください。');selectedCell=i;say('移動先の区画を押してください。')}
     else{[state.cells[selectedCell],state.cells[i]]=[state.cells[i],state.cells[selectedCell]];selectedCell=null;save();say('配置を更新しました。')}drawDig()
   });b.setAttribute('aria-label','区画'+(i+1)+' '+(id===null?'空き':name));b.setAttribute('aria-pressed',String(i===selectedCell))});
   for(const id of ids)btn(contents,objects[id].name+' ×',()=>remove(id));$('bury').disabled=!ids.length;
 }
 $('group').onchange=$('search').oninput=drawDig;
 function change(r){if(scene){scene.close();scene=null}
   room=r;for(const id of ['dig','exhibit','rank'])$(id).hidden=id!==r;
   document.querySelectorAll('#rooms button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.room===r)));say('');
   if(r==='dig')drawDig();if(r==='rank')ranking();if(r==='exhibit')displayExhibit();
 }
 document.querySelectorAll('#rooms button').forEach(b=>b.onclick=()=>change(b.dataset.room));
 $('toDig').onclick=()=>change('dig');
 function interpretation(ids,positions,years){
   const cats=new Set(ids.map(id=>objects[id].category)),mode=ids.length===1?'single':Math.max(...positions.map(p=>p%3))-Math.min(...positions.map(p=>p%3))<=1&&Math.max(...positions.map(p=>Math.floor(p/3)))-Math.min(...positions.map(p=>Math.floor(p/3)))<=1?'cluster':positions.every(p=>Math.floor(p/3)===Math.floor(positions[0]/3))?'row':'spread';
   const layout={single:'単独で安置された',cluster:'同じ一角に寄せて納められた',row:'一列に並べられた',spread:'離れた地点から出土した'}[mode];
   const era=years===300?'現存する古い図版にも似た形が残る。':years===1000?'刻印は読めず、手に収まる形だけが手掛かりだ。':'当時の文字は失われ、輪郭と出土位置だけが残った。';
   const records=ids.map((id,i)=>{const o=objects[id],other=objects[ids[(i+1)%ids.length]];
     const relation=mode==='single'?'対になる品は見つからず、ひとつで儀式を完結できたらしい。':mode==='cluster'?other.name+'と同時に使う一組の道具だったと考えられる。':mode==='row'?'並び順は「'+other.myth+'」への受け渡しの手順を示すという。':'「'+other.myth+'」との距離が、かつての部屋の境界を示している。';
     return {name:o.myth,text:layout+o.name+'。'+era+relation}
   });
   const heading=mode==='single'?records[0].name+'展':({cluster:'ひと組の秘宝',row:'失われた行列',spread:'散らばった星座'})[mode]+' ― '+objects[ids[0]].theme;
   return {records,heading,mode,diversity:cats.size};
 }
 $('bury').onclick=()=>{if(!selected().length)return;
   if(state.show&&state.show.phase!=='closed'&&!confirm('進行中の発掘・展覧会を終了し、新しい品を埋めますか？ 未閉幕の展覧会はランキングに入りません。'))return;
   const ids=selected(),positions=state.cells.flatMap((v,i)=>v===null?[]:[i]),year=new Date().getFullYear()+state.years;
   state.show={...interpretation(ids,positions,state.years),id:crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),ids,positions,year,period:state.period,dug:ids.map(()=>false),phase:'buried',day:0,visitors:0,points:0,seed:Math.floor(Math.random()*1e7),daily:[]};save();change('exhibit');
   say('砂に埋めた品が、'+state.years.toLocaleString('ja-JP')+'年後の地層から見つかりました。');
 };
 function displayExhibit(){
   const s=state.show,buried=s?.phase==='buried';
   $('empty').hidden=!!s;$('excavation').hidden=!buried;$('openHall').hidden=!s||buried;if(!s)return;
   if(buried){$('epoch').textContent='西暦 '+s.year+' 年';const m=$('mounds');m.replaceChildren();
     s.ids.forEach((id,i)=>{const b=btn(m,s.dug[i]?'':'区画 '+(s.positions[i]+1)+' を発掘',()=>{s.dug[i]=true;save();displayExhibit();say(objects[id].name+'を発掘しました。')});
       if(s.dug[i]){b.disabled=true;b.className='dug';add('img',b,'',{src:img(id),alt:''});add('span',b,objects[id].name)}});
     $('openShow').disabled=!s.dug.every(Boolean);return;
   }
   $('showTitle').textContent=s.heading;$('yearStamp').textContent='西暦 '+s.year+' 年';slot=0;
   const old=$('hall'),canvas=old.cloneNode(false);old.replaceWith(canvas);canvas.hidden=false;$('altHall').hidden=true;
   try{scene=MuseumScene.gallery(canvas,s,i=>chooseSlot(i,true));scene.visitors(people);$('guests').setAttribute('aria-pressed',String(people))}catch(e){canvas.hidden=true;$('altHall').hidden=false;scene=null}
   for(const id of ['overview','turn','near','far','guests'])$(id).disabled=!scene;
   chooseSlot(0,false);report();lastTick=performance.now();
 }
 $('openShow').onclick=()=>{const s=state.show;if(s.phase!=='buried'||!s.dug.every(Boolean))return;s.phase='open';save();displayExhibit();say('開幕しました。展示室では約2秒で会期が1日進みます。')};
 function chooseSlot(i,focus){
   slot=i;const s=state.show,el=$('plates');el.replaceChildren();add('h3',el,'展示解説');
   s.records.forEach((r,j)=>btn(el,objects[s.ids[j]].name,()=>chooseSlot(j,true)).setAttribute('aria-pressed',String(j===i)));
   add('strong',el,s.records[i].name);add('p',el,s.records[i].text);
   if(scene&&focus)scene.focus(i);
   if(!scene){const alt=$('altHall');alt.replaceChildren();add('img',alt,'',{src:img(s.ids[i]),alt:objects[s.ids[i]].name});add('p',alt,'この環境では立体展示の見本画像を表示しています。')}
 }
 $('overview').onclick=()=>scene?.focus(null);$('turn').onclick=()=>scene?.turn();$('near').onclick=()=>scene?.zoom(.8);$('far').onclick=()=>scene?.zoom(1.25);
 $('guests').onclick=()=>{people=!people;scene?.visitors(people);$('guests').setAttribute('aria-pressed',String(people))};
 const fmt=n=>n.toLocaleString('ja-JP');
 function daily(s){
   let n=(s.seed+s.day*7919)>>>0;function random(){n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}
   const rating=Math.min(99,Math.round(61+s.diversity*3+s.ids.length*2+(s.mode==='cluster'?4:2)+random()*16));
   const weekend=s.day%7>=5;const visitors=Math.round((32+rating*.48+random()*76+s.ids.length*7)*(weekend?1.55:1)*(1+Math.min(.5,s.day*.025)));
   s.day++;s.visitors+=visitors;s.points+=visitors*rating;s.daily.push(visitors);
   if(s.day>=s.period){
     s.phase='closed';if(!state.history.some(h=>h.id===s.id))state.history.push({id:s.id,title:s.heading,period:s.period,visitors:s.visitors,rating:Math.round(s.points/s.visitors*10)/10});
   }
 }
 function report(){const s=state.show,el=$('report');el.replaceChildren();const closed=s.phase==='closed';
   add('small',el,(closed?'閉幕':'開催中')+'　'+s.day+' / '+s.period+' 日');el.append(document.createElement('br'));
   add('b',el,fmt(s.visitors)+' 人');add('span',el,'　評判 '+(s.visitors?(s.points/s.visitors).toFixed(1):'—')+' / 100');
   if(s.day)add('p',el,'直近1日の来館者 '+fmt(s.daily.at(-1))+' 人');
   $('quote').textContent=s.day?'来館者の声　「'+['これを毎朝使っていたなんて。','並べ方まで記録してあって面白い。','本当は何に使ったのだろう。','この形、手に持ってみたくなる。'][s.day%4]+'」':'ドラッグで展示室を見回せます。品名を押すと近くで鑑賞できます。';
   $('skip').hidden=closed;$('again').textContent=closed?'ランキングを見る':'埋設室に戻る';
 }
 function advance(all=false){const s=state.show;if(!s||s.phase!=='open')return;do{daily(s)}while(all&&s.phase==='open');save();report();if(s.phase==='closed')say('閉幕しました。展覧会の成績をランキングに登録しました。')}
 $('skip').onclick=()=>advance(true);$('again').onclick=()=>change(state.show.phase==='closed'?'rank':'dig');
 setInterval(()=>{if(room==='exhibit'&&!document.hidden&&state.show?.phase==='open'&&performance.now()-lastTick>=2000){advance();lastTick=performance.now()}},250);
 function ranking(){const box=$('chart');box.replaceChildren();document.querySelectorAll('#sort button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sort===sortKey)));
   const rows=state.history.slice().sort((a,b)=>b[sortKey]-a[sortKey]||b.visitors-a.visitors);
   if(!rows.length){add('p',box,'展覧会が閉幕すると、会期中の成績がここに記録されます。');return}
   const table=add('table',box,''),head=table.createTHead().insertRow();for(const name of ['順位','展覧会','会期','総来客数','評判'])add('th',head,name);
   const body=table.createTBody();rows.forEach((r,i)=>{const tr=body.insertRow();for(const v of [i+1,r.title,r.period+'日',fmt(r.visitors)+'人',r.rating.toFixed(1)])tr.insertCell().textContent=v});
 }
 document.querySelectorAll('#sort button').forEach(b=>b.onclick=()=>{sortKey=b.dataset.sort;ranking()});
 change(state.show&&state.show.phase!=='closed'?'exhibit':'dig');
})();
