'use strict';
(()=>{
 const $=id=>document.getElementById(id),key='asobiba.scaleTown.v1',fmt=n=>Math.round(n).toLocaleString('ja-JP');
 let city=Town.start(),speed=1,paused=false,night=false,mode='build',group=1,id=2,scale=1;
 try{const s=JSON.parse(localStorage.getItem(key));if(s?.version===1&&Array.isArray(s.buildings)&&Array.isArray(s.history))city=s}catch{}
 city.peak=Math.max(city.peak||0,city.pop,...city.history);
 let zoneType='home';city.zones??={};let status=Town.stats(city),mapView,simulationClock=0;
 function say(text){$('message').textContent=text}
 function persist(){try{localStorage.setItem(key,JSON.stringify(city))}catch{say('このブラウザでは保存できません。')}}
 function option(el,value,text){el.add(new Option(text,String(value)))}
 function controls(){const v=Town.items[id],sz=Town.sizes[scale],price=Town.price(id,id<2?1:scale);
 $('selectedName').textContent=({zone:'区画指定・'+({home:'住宅地',shop:'商業地',clear:'解除'})[zoneType],inspect:'区画を調べる',hand:'地図を移動',resize:'建設済みの縮尺を変更',remove:'区画を撤去'})[mode]||v.name;
 $('scale').disabled=mode==='build'?id<2:mode!=='resize';$('scale').value=scale;
 $('spec').textContent=mode==='build'?(id<2?'隣り合う区画をドラッグして道路を引きます。 1区画 ':sz.n+'×'+sz.n+' 区画 ／ ')+(city.free?'無料':fmt(price)+' G')+(v.homes?' ／ 住宅 '+Math.round(v.homes*sz.fac*(city.theme===3&&v.homes>=18?1.15:1))+' 人':'')+(v.jobs?' ／ 雇用 '+Math.round(v.jobs*sz.fac)+' 人':''):
 ({zone:'空き地をドラッグして範囲を指定。道路と需要がそろうと民間の建物が1日最大1軒育ちます。',inspect:'区画を押すと、入居枠・雇用・営業状況を確認できます。',hand:'ドラッグで移動。＋・−またはホイールで拡大・縮小。',resize:'縮尺を選び、街にある建物を押してください。拡大には空き地と建設費の差額が必要です。',remove:'取り除く建物・道路を選択。支払った建設費の半額が戻ります。'})[mode];
 for(const k of ['inspect','hand','resize','remove'])$(k).setAttribute('aria-pressed',String(mode===k));
 document.querySelectorAll('#palette button[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(mode==='build'&&+b.dataset.id===id)));
 $('speed').textContent=speed+'×';$('pause').textContent=paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',paused?'時間を再開':'時間を停止');
 }
 function rewardStatus(){
 const peak=city.peak||city.pop,next=Town.milestones.find(m=>m.pop>peak);
 const names=m=>m.ids.map(id=>Town.items[id].name).join('・');
 $('milestoneText').textContent=next?'最高人口 '+peak+' 人 ／ '+next.pop+' 人で '+names(next):'最高人口 '+peak+' 人 ／ すべての人口報酬を達成';
 $('milestoneProgress').max=next?.pop||500;$('milestoneProgress').value=peak;
 const list=$('rewardList');list.replaceChildren();
 for(const m of Town.milestones){const row=document.createElement('p');row.textContent=(peak>=m.pop?'✓ 達成':'未達成')+'　'+m.pop+' 人　'+names(m);list.append(row)}
 }
 $('rewardsOpen').onclick=()=>{rewardStatus();$('rewards').showModal()};
 function hud(){rewardStatus();status=Town.stats(city);$('cityName').textContent=city.name;$('day').textContent='第 '+city.day+' 日';$('pop').textContent=fmt(city.pop)+' 人';$('cash').textContent=fmt(city.cash)+' G';$('income').textContent=(status.balance>=0?'+':'')+fmt(status.balance)+' G';$('happy').textContent=status.happy+' %';controls();if($('stats').open)details()}
 function icon(button,item){const cv=document.createElement('canvas');cv.width=120;cv.height=78;button.append(cv);const g=cv.getContext('2d'),p=(x,y,z=0)=>[60+(x-y)*32,58+(x+y-1)*15-z*25];
 const art=TownArt.view(g,p,0,false);art.tile(0,0,1,1,0,'#d6dbc6');if(item.id<2){art.tile(.05,.05,.96,.96,.01,item.id===0?'#707d82':'#ae8672');art.line([.2,.5,.02],[.8,.5,.02],'#efd5ac',2)}else art.structure({x:0,y:0,s:1,id:item.id},city.theme)}
 function palette(){const list=$('palette');list.replaceChildren();if(group===5){
 for(const [value,name] of [['home','住宅地'],['shop','商業地'],['clear','指定解除']]){const b=document.createElement('button');b.className='zone-choice';b.textContent=name;b.setAttribute('aria-pressed',String(zoneType===value&&mode==='zone'));b.onclick=()=>{zoneType=value;mode='zone';palette();setMode('zone')};list.append(b)}
 }Town.items.filter(o=>o.group===group).forEach(v=>{const b=document.createElement('button');b.dataset.id=v.id;b.disabled=!Town.unlocked(city,v.id);if(b.disabled)b.title='最高人口 '+Town.required(v.id)+' 人で解放';b.onclick=()=>{id=v.id;setMode('build')};icon(b,v);b.append(document.createTextNode(v.name+(b.disabled?'・'+Town.required(v.id)+'人':'')));list.append(b)});Array.from($('groups').children).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===group)));controls()}
 function setMode(value){mode=value;controls();say(mode==='build'?(id<2?'道路を引く始点から終点までドラッグ。':'空き区画を押して「'+Town.items[id].name+'」を建設。'):$('spec').textContent)}
 [...Town.groups,'区画指定'].forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.onclick=()=>{group=i;if(i<5)id=Town.items.find(o=>o.group===i).id;mode=i===5?'zone':'build';palette();setMode(mode)};$('groups').append(b)});
 Town.sizes.forEach((s,i)=>option($('scale'),i,s.name+'（'+s.n+'×'+s.n+'）'));$('scale').onchange=()=>{scale=+$('scale').value;controls()};
 for(const v of ['hand','inspect','resize','remove'])$(v).onclick=()=>setMode(v);
 function spend(amount){if(city.free)return true;if(amount>city.cash){say('資金が足りません。日次収入を待つか「街の設定」で自由建築を選べます。');return false}city.cash-=amount;return true}
 function changed(msg){hud();say(msg);persist()}
 function placeRoad(cells){const fresh=cells.filter(o=>!status.map.has(Town.key(o.x,o.y)));
 for(const o of cells){const here=status.map.get(Town.key(o.x,o.y));if((here&&here.id>=2)||o.x<0||o.x>=Town.N||o.y<0||o.y>=Town.N)return say('道路が建物または街の外と重なります。')}
 if(!fresh.length)return say('すでに道路が通っています。');const cost=Town.price(id,1);if(!spend(fresh.length*cost))return;
 city.buildings.push(...fresh.map(o=>({...o,id,s:1,paid:city.free?0:cost})));changed(fresh.length+' 区画の道路を開通しました。')}
 function tap(pos){const {x,y}=pos,b=status.map.get(Town.key(x,y));
 if(mode==='build'){
 if(!Town.unlocked(city,id))return say('人口条件を達成すると建設できます。');const obj={id,s:scale,x,y},err=Town.valid(city,status.map,obj);if(err)return say(err);const cost=Town.price(id,scale);if(!spend(cost))return;
 obj.paid=city.free?0:cost;city.buildings.push(obj);changed(Town.items[id].name+'が完成しました。');if(!status.active.has(obj))say('完成しました。町外につながる道路を建物の辺に接続してください。');return}
 if(!b)return say('ここは空き区画です。');const v=Town.items[b.id],paid=b.paid??Town.price(b.id,b.s);
 if(mode==='inspect'){const s=Town.sizes[b.s];return say(v.name+' ／ '+(b.id<2?(status.net.has(Town.key(x,y))?'町外に接続':'孤立した道路'):s.name+'・'+(status.active.has(b)?'道路接続済み':'道路未接続')+' ／ 入居枠 '+Math.round(v.homes*s.fac*(city.theme===3&&v.homes>=18?1.15:1))+' 人・雇用 '+Math.round(v.jobs*s.fac)+' 人'))}
 if(mode==='remove'){if(b.x===0&&b.y===9)return say('この入口は町外とつながる幹線です。');delete city.zones[Town.key(b.x,b.y)];city.buildings.splice(city.buildings.indexOf(b),1);const refund=Math.floor(paid/2);city.cash+=refund;changed(v.name+'を撤去しました。返金 '+refund+' G');return}
 if(mode==='resize'){if(b.id<2)return say('道路の縮尺は固定です。');if(scale===b.s)return say('すでに同じ縮尺です。');
 const n=Town.sizes[scale].n,spread=Math.max(0,n-Town.sizes[b.s].n),spots=[];
 for(let a=0;a<=spread;a++)for(let e=0;e<=spread;e++){const candidate={...b,x:b.x-a,y:b.y-e,s:scale};if(!Town.valid(city,status.map,candidate,b))spots.push(candidate)}
 if(!spots.length)return say('周囲に必要な空き区画がありません。');
 const cost=Math.max(0,Town.price(b.id,scale)-Town.price(b.id,b.s));if(cost&&!spend(cost))return;
 Object.assign(b,spots[0]);b.paid=Math.min(Town.price(b.id,scale),paid+(city.free?0:cost));changed(v.name+'を「'+Town.sizes[scale].name+'」に変更しました。')}
 }
 function details(){const s=status,el=$('details');el.replaceChildren();for(const line of ['人口 '+fmt(city.pop)+' 人 ／ 入居枠 '+fmt(s.homes)+' 人','営業中のお店 '+s.shops+' 軒 ／ 雇用 '+fmt(s.jobs)+' 人','道路未接続の施設 '+s.inactive+' 件','日次収支 '+(s.balance>=0?'+':'')+s.balance+' G ／ 税率 '+city.tax+'%','街の方針　'+Town.themes[city.theme][0]]){const p=document.createElement('p');p.textContent=line;el.append(p)}
 const cv=$('trend'),g=cv.getContext('2d'),hist=city.history,max=Math.max(...hist,10);g.fillStyle='#eaf0df';g.fillRect(0,0,460,125);g.beginPath();hist.forEach((v,i)=>{const x=12+i*434/Math.max(1,hist.length-1),y=110-v*90/max;if(i)g.lineTo(x,y);else g.moveTo(x,y)});g.strokeStyle='#347969';g.lineWidth=3;g.stroke();g.fillStyle='#347969';g.fillText(fmt(hist.at(-1))+' 人',12,14)}
 mapView=townMap($('map'),{mode:()=>mode,item:()=>id,scale:()=>scale,city:()=>city,stats:()=>status,night:()=>night,running:()=>paused?0:speed,placeRoad,tap,zone(cells){
 let count=0;for(const {x,y} of cells){const k=Town.key(x,y);if(zoneType==='clear'){if(k in city.zones){delete city.zones[k];count++}}else if(!status.map.has(k)&&city.zones[k]!==zoneType){city.zones[k]=zoneType;count++}}
 changed(count+' 区画の指定を更新しました。')
 }});
 $('streetView').onclick=()=>{setMode('hand');mapView.street()};$('rotate').onclick=()=>mapView.rotate();$('fit').onclick=()=>mapView.fit();$('plus').onclick=()=>mapView.zoom(1.22);$('minus').onclick=()=>mapView.zoom(.82);$('night').onclick=()=>{night=!night;$('night').setAttribute('aria-pressed',String(night))};
 $('statsOpen').onclick=()=>{details();$('stats').showModal()};$('speed').onclick=()=>{speed=speed===1?2:speed===2?4:1;controls()};$('pause').onclick=()=>{paused=!paused;controls()};
 Town.themes.forEach((a,i)=>option($('theme'),i,a[0]));for(let t=5;t<=15;t++)option($('tax'),t,t+'%');
 $('theme').onchange=()=>$('themeInfo').textContent=Town.themes[+$('theme').value][2];
 $('settings').onclick=()=>{$('name').value=city.name;$('theme').value=city.theme;$('tax').value=city.tax;$('free').checked=city.free;$('theme').onchange();$('setup').showModal()};
 function readSettings(){city.name=$('name').value.trim()||'こもれび商店街';city.theme=+$('theme').value;city.tax=+$('tax').value;city.free=$('free').checked}
 $('apply').onclick=()=>{readSettings();$('setup').close();palette();changed('街の設定を保存しました。')};
 $('newTown').onclick=()=>{
 if(!confirm('保存中の街を更地の新しい街に置き換えますか？'))return;
 city=Town.start();city.buildings=[{x:0,y:9,id:0,s:1,paid:0}];city.zones={};city.pop=0;city.history=[0];
 readSettings();simulationClock=0;group=0;id=0;mode='build';scale=1;
 mapView.fit();$('setup').close();palette();changed('新しい街が誕生しました。入口の道路から通りを延ばしてください。')
 };
 setInterval(()=>{if(paused||document.hidden||$('setup').open)return;simulationClock+=speed;if(simulationClock<7)return;simulationClock-=7;const prev=city.peak||city.pop;Town.day(city);const reached=Town.milestones.filter(m=>prev<m.pop&&m.pop<=city.peak);if(reached.length){palette();say('人口報酬を獲得！ '+reached.flatMap(m=>m.ids.map(id=>Town.items[id].name)).join('・')+' が建設できます。')}hud();persist()},1000);
 palette();hud();say('道路沿いの空き区画に最初のお店を置こう。街の名前と方針は「街の設定」から。');
})();
