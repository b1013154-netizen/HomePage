'use strict';
const $=id=>document.getElementById(id),field=$('field'),ctx=field.getContext('2d');
const tabs=['描画室','進化実験','対戦場','飼育室'], roles={body:'からだ',leg:'脚',wing:'翼',tail:'しっぽ'};
const key='asobiba.doodle.lab.1',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function initial(){return {parts:[{kind:'image',id:0,x:417,y:237,size:2.7,role:'body'}],name:'コケトカゲ',gen:0,env:'forest',love:0,food:60,rest:70,history:'',wins:0}}
let pet;try{pet=JSON.parse(localStorage.getItem(key))}catch{}if(!pet||!Array.isArray(pet.parts))pet=initial();
let tab=0,tool='pen',role='body',color='#51745a',size=2,choice=null,stroke=null,undo=[],redo=[],libType='fauna',enemyId=30,duel=null,act=null,birth=0;
function say(msg){$('notice').textContent=msg}
function save(){try{localStorage.setItem(key,JSON.stringify(pet));return true}catch{say('このブラウザに保存できません。');return false}}
const specimenKey=key+'.specimen';
function saveDrawing(){
 if(!pet.parts.length)return say('保存する生物を描いてください。');
 if(choice||drag||stroke)return say('素材の配置を完了してから保存してください。');
 try{
   localStorage.setItem(specimenKey,JSON.stringify({at:Date.now(),pet}));
   if(!save())return;
   change(1);say('「'+subject()+'」をこのブラウザに保存しました。進化の条件を選んでください。');
 }catch{say('保存できませんでした。ブラウザの空き容量を確認してください。')}
}
function restoreDrawing(){
 try{
   const stored=JSON.parse(localStorage.getItem(specimenKey));
   if(!stored?.pet?.parts?.length)return say('保存した標本はありません。');
   if(!confirm('現在の生物を、最後に「描き終えて保存」した姿に戻しますか？'))return;
   pet=stored.pet;undo=[];redo=[];partClipboard=null;save();change(0);say('保存した標本を復元しました。');
 }catch{say('標本を読み込めませんでした。')}
}
function checkpoint(nameAfter){undo.push({parts:structuredClone(pet.parts),name:pet.name,nameAfter});if(undo.length>18)undo.shift();redo=[];syncTools()}
function item(tag,parent,txt,props={}){const el=document.createElement(tag);el.textContent=txt;Object.assign(el,props);parent.append(el);return el}
function button(parent,txt,fn,cls=''){let b=item('button',parent,txt,{className:cls});b.onclick=fn;return b}
function select(parent,title,values,value,change){const l=item('label',parent,title),s=item('select',l,'');s.setAttribute('aria-label',title);for(const [v,n] of values)item('option',s,n,{value:v});s.value=value;s.onchange=()=>change(s.value);return s}
const toolsBar=$('canvas-tools');
function toolbarIcon(name,path,fn){
 const b=button(toolsBar,'',fn);b.title=name;b.setAttribute('aria-label',name);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),shape=document.createElementNS(ns,'path');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');shape.setAttribute('d',path);svg.append(shape);b.append(svg);return b;
}
const undoButton=toolbarIcon('一手戻す','M9 5 3 11l6 6 M4 11h10a6 6 0 0 1 6 6',()=>historyStep(undo,redo,'一手戻しました。'));
const redoButton=toolbarIcon('やり直す','m15 5 6 6-6 6 M20 11H10a6 6 0 0 0-6 6',()=>historyStep(redo,undo,'やり直しました。'));
const clearButton=toolbarIcon('白紙にする','M4 6h16 M9 6V3h6v3 M6 6l1 14h10l1-14 M10 10v6 M14 10v6',()=>{
 checkpoint();pet.parts=[];choice=null;selected=null;save();syncTools();info();say('白紙にしました。「一手戻す」で復元できます。');
});
function historyStep(from,to,message){
 if(!from.length)return;
 const entry=from.pop();
 const restoreName=entry.nameAfter!==undefined && pet.name===entry.nameAfter;
 to.push({parts:structuredClone(pet.parts),name:pet.name,nameAfter:restoreName?entry.name:undefined});
 pet.parts=entry.parts;if(restoreName)pet.name=entry.name;
 save();renderPanel();say(message);
}
const replaceButton=button($('viewTitle').parentElement,'生物を変更',()=>openLibrary(true),'primary');
replaceButton.before($('generation'));
function syncTools(){
 replaceButton.hidden=tab!==0;
 toolsBar.hidden=tab!==0;undoButton.disabled=!undo.length;redoButton.disabled=!redo.length;clearButton.disabled=!pet.parts.length;
}
function subject(){return pet.name.trim()||'名もなき生物'}
function info(){syncFlip(); $('subject').textContent=subject();$('generation').textContent='GEN. '+String(pet.gen).padStart(2,'0');$('hint').textContent=tab===0?(choice?'押したまま動かし、離して配置':tool==='move'?'素材を押して選択・ドラッグで移動':'指またはマウスで描画'):pet.history||'生物の様子を観察しよう'}
function renderPanel(){syncTools();const p=$('panel');p.replaceChildren();$('viewTitle').textContent=['スケッチブック','適応観察フィールド','模擬対戦フィールド','生物のテラリウム'][tab];info();
 if(tab===0){item('h2',p,'標本をつくる');
 button(p,'描き終えて保存 → 進化実験',saveDrawing,'primary');
 try{if(localStorage.getItem(specimenKey))button(p,'保存した標本に戻す',restoreDrawing)}catch{}
 let l=item('label',p,'生物名');const n=item('input',l,'',{value:pet.name,maxLength:24});n.oninput=()=>{pet.name=n.value;info();save()};
 const row=item('div',p,'',{className:'row'});for(const [v,label] of [['pen','✎ 描く'],['move','✥ 移動']]){const b=button(row,label,()=>{tool=v;choice=null;selected=null;renderPanel()});b.setAttribute('aria-pressed',String(!choice&&tool===v))}
 select(p,'追加する部位',Object.entries(roles),role,v=>{role=v;if(choice&&choice.kind!=='part')choice.role=v});l=item('label',p,'インク');const sw=item('input',l,'',{type:'color',value:color});sw.oninput=()=>{color=sw.value;if(choice)choice.color=color};
 select(p,'素材の大きさ',[['1','小'],['2','中'],['3','大']],String(size),v=>{size=Number(v);if(choice)choice.size=size*(choice.kind==='shape'?1.15:.85)});
 button(p,'＋ 生物・部位・図形を挿入',()=>openLibrary(),'primary');item('p',p,'脚・翼・しっぽは付け根から先端へ描くと、関節の動きが線に伝わります。');
 }
 else if(tab===1)evolutionPanel(p);
 else if(tab===2){item('h2',p,'フィールド対戦');select(p,'対戦相手',[...DoodleAtlas.species.map((a,i)=>[String(30+i),a.name]),...Art.names.map((n,i)=>[String(i),n])],String(enemyId),v=>{enemyId=+v;duel=null;renderPanel()}).disabled=!!duel&&!duel.done;
 button(p,duel&&!duel.done?'対戦中…':'対戦を始める',startBattle,'primary').disabled=!!duel&&!duel.done;item('p',p,'接近してぶつかると攻撃。進化と飼育で体力が伸び、脚や翼は間合いの詰め方に影響します。');item('strong',p,'これまでの勝利　'+pet.wins+' 回')}
 else{item('h2',p,'一緒に暮らす');item('p',p,'食べ物に駆け寄ったり、遊んだあとにひと眠り。世話をすると親密度が上がります。');for(const [k,n] of [['feed','木の実をあげる'],['play','一緒に遊ぶ'],['sleep','休ませる']])button(p,n,()=>care(k),k==='feed'?'primary':'');item('p',p,'満腹 '+pet.food+'　元気 '+pet.rest+'　親密度 '+pet.love)}
}
function change(i){tab=i;stroke=null;drag=null;activePointer=null;choice=null;selected=null;duel=null;act=null;actor=makeActor(395);Array.from($('tabs').children).forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));renderPanel();say('')}
let replacingBody=false;
function openLibrary(replace=false){
 replacingBody=replace;
 if(replace)libType='fauna';
 $('library').querySelector('h2').textContent=replace?'変更する生物を選ぶ':'標本素材庫';
 paintLibrary();$('library').showModal();
}
function replaceBody(kind,id,name){
 const index=pet.parts.indexOf(baseAnimal());
 const base=index<0?initial().parts[0]:pet.parts[index];
 const oldName=base.kind==='image'?Art.names[base.id]:DoodleAtlas.species[base.id].name;
 const rename=!pet.name.trim()||pet.name===oldName;
 checkpoint(rename?name:undefined);
 const replacement={...base,kind,id,baseAnimal:true};
 if(index<0)pet.parts.unshift(replacement);else pet.parts[index]=replacement;
 if(rename)pet.name=name;
 choice=null;selected=replacement;save();renderPanel();say(name+'に変更しました。');
}
function paintLibrary(){const cats=$('categories'),items=$('items');cats.replaceChildren();items.replaceChildren();
 const books={fauna:['生物',DoodleAtlas.species.map(a=>a.name)],part:['部位',DoodleAtlas.parts.map(a=>a.name)],shape:['図形',Art.shapes],image:['旧標本',Art.names]};
 for(const [k,[label,names]] of Object.entries(books)){
   if(replacingBody && k!=='fauna' && k!=='image')continue;
   button(cats,label+' '+names.length,()=>{libType=k;paintLibrary()}).setAttribute('aria-pressed',String(k===libType));
 }
 books[libType][1].forEach((name,id)=>{
   const b=button(items,'',()=>{if(replacingBody){$('library').close();replaceBody(libType,id,name);return}choice={kind:libType,id,x:420,y:245,role:libType==='part'?DoodleAtlas.parts[id].role:role,color,size:size*(libType==='shape'?1.15:.85)};selected=null;$('library').close();renderPanel();field.scrollIntoView({block:'nearest'});say(name+'を選びました。押したまま位置を調整し、離すと配置できます。')});
   if(libType==='fauna')item('img',b,'',{src:DoodleAtlas.species[id].url,alt:'',className:'fauna-thumb'});
   else if(libType==='image'){
     const thumb=item('span',b,'',{className:'specimen-thumb'});
     thumb.style.backgroundPosition=(id%6)*20+'% '+Math.floor(id/6)*25+'%';
   }else{
     const c=document.createElement('canvas');c.width=150;c.height=104;
     const g=c.getContext('2d');const isPart=libType==='part';
     const limb=isPart?DoodleAtlas.parts[id].role:null;
     g.translate(limb==='wing'||limb==='tail'?108:75,limb==='wing'?73:limb==='leg'?20:53);g.scale(1.6,1.6);
     if(isPart)DoodleAtlas.part(g,id);else Art.shape(g,id,color);
     item('img',b,'',{src:c.toDataURL(),alt:''});
   }
   item('span',b,name);
 });
}
$('close').onclick=()=>$('library').close();
function pos(e){const r=field.getBoundingClientRect();return [(e.clientX-r.left)*840/r.width,(e.clientY-r.top)*490/r.height]}
let drag=null,activePointer=null,selected=null;
const flipBar=item('div',field.parentElement.parentElement,'',{className:'flip-controls'});
field.parentElement.after(flipBar);
const flipButtons=['flipX','flipY'].map((axis,i)=>button(flipBar,['↔ 左右反転','↕ 上下反転'][i],()=>{
 const target=choice||selected;
 if(!target||drag)return;
 if(!choice)checkpoint();
 target[axis]=!target[axis];
 if(!choice)save();
 syncFlip();
}));
function baseAnimal(){
 return pet.parts.find(p=>p.baseAnimal)||pet.parts.find(p=>p.role==='body'&&['image','fauna'].includes(p.kind));
}
let partClipboard=null;
function copyPart(){
 if(!selected||choice||drag)return;
 partClipboard=structuredClone(selected);delete partClipboard.baseAnimal;delete partClipboard.grown;
 syncFlip();say('コピーしました。「貼り付け」で配置できます。');
}
function pastePart(){
 if(!partClipboard||drag)return;
 choice=structuredClone(partClipboard);
 choice.x=clamp(choice.x+16,0,840);choice.y=clamp(choice.y+16,0,490);
 selected=null;renderPanel();say('コピーした部位を置く位置で離してください。');
}
function reorder(front){
 const index=pet.parts.indexOf(selected);
 if(index<0||choice||drag)return;
 checkpoint();
 const base=baseAnimal();if(base)base.baseAnimal=true;
 pet.parts.splice(index,1);if(front)pet.parts.push(selected);else pet.parts.unshift(selected);
 save();syncFlip();say(front?'最前面に移しました。':'最背面に移しました。');
}
const copyButton=button(flipBar,'コピー',copyPart);
const pasteButton=button(flipBar,'貼り付け',pastePart);
const frontButton=button(flipBar,'最前面へ',()=>reorder(true));
const backButton=button(flipBar,'最背面へ',()=>reorder(false));
const layerPicker=item('select',flipBar,'');
layerPicker.setAttribute('aria-label','重なった部位を選択');
layerPicker.onchange=()=>{selected=pet.parts[Number(layerPicker.value)];choice=null;tool='move';renderPanel()};
function layerName(p){
 if(p.kind==='crest')return crests[p.id].name;
 if(p.kind==='line')return '手描き・'+roles[p.role];
 if(p.kind==='image')return Art.names[p.id];
 if(p.kind==='shape')return Art.shapes[p.id];
 return (p.kind==='part'?DoodleAtlas.parts:DoodleAtlas.species)[p.id].name;
}
document.addEventListener('keydown',e=>{
 if(tab!==0||$('library').open||drag||stroke||e.target.closest('input,textarea,select,[contenteditable=true]'))return;
 if(e.key==='Escape'&&choice){choice=null;renderPanel();say('配置を取り消しました。');return}
 if(!e.ctrlKey&&!e.metaKey)return;
 const key=e.key.toLowerCase();
 if(key==='c'&&selected&&!choice){e.preventDefault();copyPart()}
 if(key==='v'&&partClipboard){e.preventDefault();pastePart()}
});
function syncFlip(){
 if(selected&&!pet.parts.includes(selected))selected=null;
 flipBar.hidden=tab!==0||!(choice||tool==='move'||selected||partClipboard);
 const index=pet.parts.indexOf(selected),locked=!!choice||!!drag;
 copyButton.disabled=index<0||locked;pasteButton.disabled=!partClipboard||!!drag;
 frontButton.disabled=index<0||index===pet.parts.length-1||locked;
 backButton.disabled=index<1||locked;
 layerPicker.disabled=!!drag||pet.parts.length===0;
 layerPicker.replaceChildren();
 const prompt=item('option',layerPicker,'重なった部位を選択',{value:''});prompt.disabled=true;
 for(let i=pet.parts.length-1;i>=0;i--)item('option',layerPicker,(i+1)+' · '+layerName(pet.parts[i]),{value:String(i)});
 layerPicker.value=index<0?'':String(index);
 flipButtons.forEach((b,i)=>{
   const target=choice||selected;
   b.disabled=!target||!!drag;
   b.setAttribute('aria-pressed',String(!!target?.[i?'flipY':'flipX']));
 });
}
function inside(x,y){return x>=0&&x<=840&&y>=0&&y<=490}
function moveDraft(x,y){
 drag.preview.x=clamp(x-drag.dx,0,840);
 drag.preview.y=clamp(y-drag.dy,0,490);
}
field.onpointerdown=e=>{
 if(tab!==0||activePointer!==null||e.button!==0)return;
 const [x,y]=pos(e);
 if(choice){drag={preview:{...choice},target:null,dx:0,dy:0};moveDraft(x,y)}
 else if(tool==='move'){
   selected=pet.parts.slice().reverse().find(p=>{
     const b=bounds(p);return x>=b[0]-8&&x<=b[2]+8&&y>=b[1]-8&&y<=b[3]+8;
   });
   if(!selected){syncFlip();return}
   drag={preview:{...selected},target:selected,dx:x-selected.x,dy:y-selected.y};
 }else{
   selected=null;checkpoint();stroke={kind:'line',role,color,x,y,pts:[[0,0]],size};pet.parts.push(stroke);
 }
 activePointer=e.pointerId;field.setPointerCapture(e.pointerId);syncFlip();
};
field.onpointermove=e=>{
 if(tab!==0)return;
 const [x,y]=pos(e);
 if(activePointer===null){
   if(choice&&e.pointerType!=='touch'){choice.x=x;choice.y=y}
   return;
 }
 if(activePointer!==e.pointerId)return;
 if(drag)moveDraft(x,y);
 if(stroke){
   const last=stroke.pts.at(-1),dx=x-stroke.x,dy=y-stroke.y;
   if(Math.hypot(dx-last[0],dy-last[1])>2)stroke.pts.push([dx,dy]);
 }
};
function finish(e){
 if(activePointer!==e.pointerId)return;
 activePointer=null;
 if(drag){
   const [x,y]=pos(e);
   if(e.type==='pointerup'&&inside(x,y)){
     moveDraft(x,y);
     if(!drag.target){
       checkpoint();selected=drag.preview;pet.parts.push(selected);choice=null;
       say('素材を配置しました。');
     }else if(drag.target.x!==drag.preview.x||drag.target.y!==drag.preview.y){
       checkpoint();Object.assign(drag.target,{x:drag.preview.x,y:drag.preview.y});
     }
     save();
   }else say('配置を取り消しました。');
   drag=null;
 }
 if(stroke){stroke=null;save()}
 syncTools();info();
}
field.onpointerup=field.onpointercancel=field.onlostpointercapture=finish;
function bounds(p){const [l,t,r,b]=localBounds(p);return [p.flipX?2*p.x-r:l,p.flipY?2*p.y-b:t,p.flipX?2*p.x-l:r,p.flipY?2*p.y-t:b]}
function localBounds(p){if(p.kind==='crest')return [p.x-43*p.size,p.y-49*p.size,p.x+43*p.size,p.y+6*p.size];let x=0,y=0,r=0,b=0;if(p.pts){for(const [a,d] of p.pts){x=Math.min(x,a);r=Math.max(r,a);y=Math.min(y,d);b=Math.max(b,d)}}else if(p.kind==='part'){const k=p.size;return [p.x-58*k,p.y-44*k,p.x+21*k,p.y+42*k]}else if(p.kind==='fauna'){const k=46*p.size;return [p.x-k,p.y-k,p.x+k,p.y+k]}else{r=(p.kind==='image'?57:27)*p.size;b=(p.kind==='image'?38:27)*p.size;x=-r;y=-b}return [p.x+x,p.y+y,p.x+r,p.y+b]}
function care(k){if(!pet.parts.length)return say('描画室で生物を描いてください。');if(act)return say('いまの様子を少し見守ってください。');if(k==='play'&&pet.rest<10)return say('少し疲れています。休ませてあげましょう。');act={k,time:0,x:actor.x<420?630:200};say({feed:'木の実の匂いに気づいたようです。',play:'跳ねる種を追いかけています。',sleep:'目を閉じて、ゆっくり休んでいます。'}[k])}
function endCare(){const k=act.k;pet.food=clamp(pet.food+(k==='feed'?20:k==='play'?-8:-2),0,100);pet.rest=clamp(pet.rest+(k==='sleep'?25:k==='play'?-10:2),0,100);pet.love+=k==='play'?3:1;act=null;save();renderPanel();say('世話の記録を保存しました。')}
function frameOf(parts){let l=Infinity,t=Infinity,r=-Infinity,b=-Infinity;for(const p of parts){const v=bounds(p);l=Math.min(l,v[0]);t=Math.min(t,v[1]);r=Math.max(r,v[2]);b=Math.max(b,v[3])}if(!parts.length)l=t=r=b=0;return {l,t,r,b,cx:(l+r)/2,cy:(t+b)/2,scale:Math.min(2,150/Math.max(1,r-l),105/Math.max(1,b-t))}}
function makeActor(x){return {x,y:280,animationTime:0,vx:0,vy:0,dir:1,phase:0,bend:0,feet:new Map(),cool:0}}
let actor=makeActor(395),rival=makeActor(620);
function startBattle(){if(!pet.parts.length)return say('描画室で生物を描いてください。');actor=makeActor(210);rival=makeActor(630);rival.dir=-1;const hp=65+Math.min(70,pet.gen*6+pet.love);duel={hp,max:hp,enemy:72+enemyId%5*5,enemyMax:72+enemyId%5*5,done:false};renderPanel();say('対戦開始！')}
const ground=x=>368+9*Math.sin(x/100)+4*Math.cos(x/42);
const backdrops=new Map();
function landscape(mode){if(backdrops.has(mode))return backdrops.get(mode);const c=document.createElement('canvas');c.width=840;c.height=490;const g=c.getContext('2d'),edit=mode==='paper',water=habitats[mode]?.[1]==='water',sky=habitats[mode]?.[1]==='sky';
 let seed=419;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 const fade=g.createLinearGradient(0,0,0,490);fade.addColorStop(0,edit?'#edeede':habitats[mode][4]);fade.addColorStop(1,edit?'#e4e9d7':water?'#36756d':'#8aae83');g.fillStyle=fade;g.fillRect(0,0,840,490);
 if(edit){g.fillStyle='#adbfac';for(let x=0;x<840;x+=15)for(let y=0;y<490;y+=15)g.fillRect(x,y,1.2,1.2);
 g.strokeStyle='#b4c3af';g.lineWidth=1;for(let r of [112,137,177]){g.beginPath();g.arc(417,237,r,0,Art.tau);g.stroke()}for(let x=20;x<840;x+=10)Art.line(g,[[x,10],[x,x%50===0?19:14]],'#839a89',1);
 g.fillStyle='#597060';g.font='12px Consolas,monospace';g.fillText('FIG. 01   /   MORPHOLOGY',26,455);
 }else{Art.oval(g,650,89,47,47,water?'#d2e5cd':'#f1d292',0,false);
 for(let n=0;n<3;n++){g.beginPath();g.moveTo(0,490);for(let x=0;x<=844;x+=4)g.lineTo(x,210+n*55+30*Math.sin(x/(112-n*20)+n*2)+13*Math.sin(x/64));g.lineTo(840,490);g.fillStyle=['#afc4ad','#8eae96','#719984'][n];g.fill()}
 g.beginPath();g.moveTo(0,490);for(let x=0;x<=844;x+=3)g.lineTo(x,ground(x));g.lineTo(840,490);g.fillStyle=habitats[mode][5];g.fill()}
 function frond(x,y,h,lean,col){g.save();g.translate(x,y);g.rotate(lean);Art.line(g,[[0,0],[1,-h*.48],[0,-h]],col,1.3);for(let j=1;j<10;j++){const yy=-h*j/10,len=h*(.24*Math.sin(j*Math.PI/11)+.02);for(const d of [-1,1])Art.oval(g,d*len*.65,yy-len*.45,len,len*.19,col,d===1?-.56:.56,false)}g.restore()}
 for(let j=0;j<(edit?13:65);j++){let x=random()*840;if(edit)x=j%2?random()*73:780+random()*72;let y=edit?510+random()*36:ground(x)+random()*123;frond(x,y,20+random()*(edit?94:65),(random()-.5)*1.1,edit?'#95ab91':['#536f5c','#69826a','#91a77d'][j%3])}
 if(['marsh','bog','mangrove','water','reef','ice'].includes(mode)){
   for(let j=0;j<48;j++){
     const x=random()*840,y=ground(x)+13+random()*100;
     Art.line(g,[[x,y],[x+6+random()*23,y]],'#ddf6ed77',1.4);
     if(['marsh','bog','mangrove'].includes(mode)&&j%3===0){
       const h=24+random()*45;
       for(let k=0;k<3;k++){
         const tip=x+(k-1)*9;
         Art.line(g,[[x,y],[tip,y-h+k*5]],'#516f55',1.8);
         Art.oval(g,tip,y-h+k*5,2.6,6.8,'#89684a',(k-1)*.16,false);
       }
     }
   }
 }
 for(let i=0;i<10000;i++){g.fillStyle=i%2?'#ffffff18':'#304b3610';g.fillRect(random()*840,random()*490,1,1)}backdrops.set(mode,c);return c}
function traits(parts){let gait=null,leg=0,wing=0,tail=0;for(const p of parts){if(p.role==='leg')leg++;if(p.role==='wing')wing++;if(p.role==='tail')tail++;if(p.kind==='fauna'){
 const speciesGait=DoodleAtlas.species[p.id].gait;
 if(!gait||p.baseAnimal)gait=speciesGait;
 if(['walk','side','hop'].includes(speciesGait))leg+=2;
 if(speciesGait==='fly')wing++;
 if(['swim','pulse','slither'].includes(speciesGait))tail++;
 }if(p.kind==='image'){const f=Math.floor(p.id/5);if([0,1,2,4].includes(f))leg+=Art.limbs(p.id);if(f===2)wing++;if([0,3,5].includes(f))tail++}}return {leg,wing,tail,gait}}
function motion(a,target,tr,dt,t,sleep=false,water=false){const dx=target-a.x,pace=sleep?0:Math.min(138,47+tr.leg*6+tr.wing*10+tr.tail*(water?14:2));const stride=tr.leg||tr.wing?1:.55+.4*Math.cos(a.phase);const desired=clamp(dx*1.8,-pace,pace)*stride,old=a.vx;a.vx+=(desired-a.vx)*(1-Math.exp(-dt*3));a.x=clamp(a.x+a.vx*dt,58,782);if(Math.abs(a.vx)>6)a.dir=Math.sign(a.vx);
 a.phase+=dt*(2+Math.abs(a.vx)*.071);a.bend+=((old-a.vx)*4-a.bend)*dt*7;const floor=ground(a.x)-(tab===1?72:38),wave=Math.sin(a.phase);
 const floating=water&&tr.tail>0;let targetY=floor+(sleep?4:0)- (floating?38+Math.sin(t*2)*8:tr.wing?35+wave*11:Math.abs(wave)*Math.min(4,Math.abs(a.vx)*.07));
 if(tr.gait==='hop'&&!sleep)targetY-=Math.max(0,Math.sin(a.phase))*Math.min(21,Math.abs(a.vx)*.25);
 a.animationTime+=dt*(sleep ? .2 : .78+Math.min(.7,Math.abs(a.vx)/130));
 const lift=tr.wing&&!sleep?Math.max(0,-Math.cos(a.phase))*180:0;
 a.vy+=((targetY-a.y)*53-a.vy*11+110-lift)*dt;a.y+=a.vy*dt;if(a.y>floor+5){a.y=floor+5;a.vy=Math.min(0,a.vy)}a.cool=Math.max(0,a.cool-dt)}
function planted(a,key,phase,homeX,homeY,scale){let s=a.feet.get(key);const swing=Math.sin(phase)>0;const fx=a.x+homeX*a.dir*scale;
 if(!s||Math.abs(fx-s.x)>35*scale+8){s={x:fx,y:ground(fx),swing:false};a.feet.set(key,s)}
 if(swing){s.x=fx+a.vx*.10*Math.sin(phase);s.y=ground(s.x)-Math.max(0,Math.sin(phase))*9*scale}else if(s.swing){s.y=ground(s.x)}s.swing=swing;
 return [(s.x-a.x)*a.dir/scale,clamp((s.y-a.y)/scale,homeY-12,homeY+11)]}
function drawPart(g,p,t,pose){g.save();g.translate(p.x,p.y);g.scale(p.flipX?-1:1,p.flipY?-1:1);const a=pose?.a,phase=a?.phase||0,wing=Math.sin(phase*1.7),idx=pose?.i||0;
 if(p.pts){let pts=p.pts;if(a&&p.role!=='body'&&pts.length>1){const end=pts.at(-1),len=Math.max(1,Math.hypot(...end));let ex=end[0],ey=end[1],joint;
 if(p.role==='leg'){const f=pose.f,s=f.scale,z=planted(a,'pen'+idx,phase+idx*2.4,p.x-f.cx+ex,p.y-f.cy+ey,s);ex=z[0]-(p.x-f.cx);ey=z[1]-(p.y-f.cy);joint=Art.knee([0,0],[ex,ey],len*.62,len*.62,idx%2?1:-1)}
 pts=pts.map(([x,y],i)=>{const u=i/(pts.length-1);if(joint){const k=Math.sin(Math.PI*u);return [x+(ex-end[0])*u+(joint[0]-ex*.5)*k,y+(ey-end[1])*u+(joint[1]-ey*.5)*k]}const angle=p.role==='wing'?wing*.7*u:(Math.sin(phase-u*2)*.45+a.bend*.02)*u;return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)]})}
 if(pts.length===1)Art.oval(g,...pts[0],2*p.size,2*p.size,p.color,0,false);else Art.line(g,pts,p.color,p.size*2+1)}
 else{if(a&&p.kind!=='part'){if(p.role==='wing')g.rotate(wing*.7);if(p.role==='tail')g.rotate(Math.sin(phase-.6)*.36+a.bend*.02);if(p.role==='leg')g.rotate(Math.sin(phase+idx*2)*.38)}g.scale(p.size,p.size);
 if(p.kind==='crest')renderCrest(g,p,phase);
 else if(p.kind==='fauna')DoodleAtlas.animal(g,p.id,a);
 else if(p.kind==='part'){
   if(!a)DoodleAtlas.part(g,p.id);
   else{
     let ankle=null;
     if(p.role==='leg'){
       const f=pose.f,ax=(p.x-f.cx)/p.size,ay=(p.y-f.cy)/p.size;
       const contact=planted(a,'limb'+idx,phase+idx*2.4,ax,ay+35,f.scale*p.size);
       ankle=[clamp(contact[0]-ax,-15,15),clamp(contact[1]-ay,20,36)];
     }
     DoodleAtlas.movingPart(g,p.id,phase*(p.role==='wing'?1.7:1)+idx*.35,ankle);
   }
 }
 else if(p.kind==='shape')Art.shape(g,p.id,p.color);else{const legs=[],n=Art.limbs(p.id);if(a)for(let j=0;j<n;j++){const hx=(j%Math.ceil(n/2)-(Math.ceil(n/2)-1)/2)*22+(j>=n/2?4:-4),f=pose.f,s=f.scale*p.size,cx=(p.x-f.cx)/p.size,cy=(p.y-f.cy)/p.size;const e=planted(a,idx+'-'+j,phase+Math.PI*(j%2),cx+hx,cy+32,s);legs.push([clamp(e[0]-cx,hx-16,hx+16),e[1]-cy])}Art.specimen(g,p.id,t,{legs,bend:a?.bend||0,beat:a?wing:0})}}
 g.restore()}
function renderActor(a,parts,t){if(!parts.length)return;const f=frameOf(parts);ctx.save();ctx.globalAlpha=.19;Art.oval(ctx,a.x,ground(a.x)+2,47,6,'#23493f',0,false);ctx.restore();
 ctx.save();ctx.translate(a.x,a.y);ctx.scale(a.dir,1);ctx.rotate(clamp(a.vx*.00043*a.dir+Math.sin(a.phase)*.021,-.12,.12));const body=traits(parts),crawl=(!body.gait && !body.leg && !body.wing) ? .075*Math.sin(a.phase) : 0;const zoom=tab===1?1.65:1;ctx.scale(zoom*f.scale*(1+crawl),zoom*f.scale*(1-crawl+(body.gait?0:Math.sin(t*3)*.008)));ctx.translate(-f.cx,-f.cy);parts.forEach((p,i)=>drawPart(ctx,p,t,{a,f,i}));ctx.restore()}
function rivalParts(){return [{kind:enemyId>=30?'fauna':'image',id:enemyId>=30?enemyId-30:enemyId,role:'body',x:0,y:0,size:1}]}
function tick(dt,t){if(tab===0)return;birth=Math.max(0,birth-dt);const tr=traits(pet.parts),op=rivalParts();let goal=420+220*Math.sin(t*.34);if(tab===3&&act){act.time+=dt;goal=act.k==='sleep'?actor.x:act.x;if(act.k==='sleep'?act.time>3:Math.abs(actor.x-goal)<20&&act.time>1.4)endCare()}
 if(tab===2)goal=duel&&!duel.done?rival.x:240;
 motion(actor,goal,tr,dt,t,act?.k==='sleep',habitats[pet.env]?.[1]==='water');
 if(tab===2){motion(rival,duel&&!duel.done?actor.x:600,traits(op),dt,t);if(duel&&!duel.done&&Math.abs(actor.x-rival.x)<84&&actor.cool<=0){duel.enemy=Math.max(0,duel.enemy-Math.round(10+Math.random()*8+Math.min(10,pet.gen)+Math.min(5,tr.leg*.4)));duel.hp=Math.max(0,duel.hp-Math.round(8+Math.random()*9+enemyId%5));actor.vx=-170;rival.vx=170;actor.vy=-65;rival.vy=-75;actor.cool=1.15;
 if(!duel.enemy||!duel.hp){duel.done=true;const win=duel.hp>duel.enemy;if(win)pet.wins++;save();renderPanel();say(win?'勝利！ '+subject()+'がフィールドを制しました。':duel.hp===duel.enemy?'引き分け！ お互いによく戦いました。':'今回は相手の勝ち。飼育や進化を試してみよう。')}}}}
let nextComparisonPaint=0;
function paint(t){if(tab===1&&pet.previousForm&&t>=nextComparisonPaint){paintComparison($('beforeForm'),pet.previousForm);paintComparison($('afterForm'),pet.parts);nextComparisonPaint=t+.25}ctx.drawImage(landscape(tab===0?'paper':tab===2?'forest':pet.env),0,0);if(tab===0){pet.parts.forEach(p=>{drawPart(ctx,p===drag?.target?drag.preview:p,0)});
 const preview=drag?.preview||choice;
 if(preview&&!drag?.target){ctx.save();ctx.globalAlpha=.78;drawPart(ctx,preview,0);ctx.restore()}
 const focus=preview||selected;
 if(focus){const [l,y,r,b]=bounds(focus);ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle='#356d60';ctx.lineWidth=1.5;ctx.strokeRect(l-3,y-3,r-l+6,b-y+6);ctx.restore()}
 return}
 renderActor(actor,pet.parts,t);if(tab===2){renderActor(rival,rivalParts(),t);if(duel){for(const [x,v,max,col] of [[35,duel.hp,duel.max,'#427961'],[505,duel.enemy,duel.enemyMax,'#c77350']]){ctx.fillStyle='#f6f3df';ctx.fillRect(x,36,300,12);ctx.fillStyle=col;ctx.fillRect(x,36,300*v/max,12)}ctx.fillStyle=Art.ink;ctx.font='bold 16px sans-serif';ctx.fillText(subject(),35,31);ctx.fillText((enemyId>=30?DoodleAtlas.species[enemyId-30].name:Art.names[enemyId]),505,31)}}
 if(act){if(act.k==='sleep'){ctx.font='bold 22px Georgia';ctx.fillStyle=Art.ink;ctx.fillText('z Z',actor.x+20,actor.y-45+Math.sin(t*2)*4)}else{const x=act.x,y=ground(x)-(act.k==='play'?20+Math.abs(Math.sin(t*4))*45:5);Art.oval(ctx,x,y,9,8,'#df8660');Art.oval(ctx,x+4,y-9,6,3,'#769350',-.5)}}
 if(birth>0){for(let i=0;i<22;i++){const a=i*2.4,r=(3-birth)*42+22;ctx.fillStyle='rgba(255,249,206,'+birth/3+')';ctx.fillRect(actor.x+r*Math.cos(a),actor.y+r*Math.sin(a),4,4)}}}
let prev=0,time=0,bank=0;function animate(ms){bank+=Math.min(.08,(ms-prev)/1000);prev=ms;while(bank>=1/60){time+=1/60;tick(1/60,time);bank-=1/60}paint(time);requestAnimationFrame(animate)}
tabs.forEach((n,i)=>button($('tabs'),n,()=>change(i)));change(0);requestAnimationFrame(animate);
