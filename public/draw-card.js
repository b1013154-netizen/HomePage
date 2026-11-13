(()=>{
'use strict';
const $=id=>document.getElementById(id),ink=$('ink'),pen=ink.getContext('2d',{willReadFrequently:true}),back=$('back').getContext('2d'),card=$('card'),g=card.getContext('2d'),W=720,H=540;
const groups=[
 ['星の海','星降る夜|流星群|薄明の銀河|青い月夜|金色の星雲','182549/60699e|48234e/b05b81|563e76/f9ae92|223961/50a9bc|514052/e8b25e'],
 ['海辺','白波の浜|珊瑚の海|夕陽の入江|氷の海峡|真珠の浅瀬','84cee5/e9efd2|65c3c2/f1a58d|f6b884/aa6890|aac6e4/e2f5f9|b9dbcb/f8efd9'],
 ['山脈','黎明の峰|雪山の稜線|紅葉の峠|紫の峡谷|砂岩の台地','eda787/866f92|afcee7/e6f0f3|d4ac64/aa6959|a396cd/685e90|e4b882/b48365'],
 ['森','木漏れ日の森|霧の針葉樹林|深緑の谷|月影の森|冬の白樺林','f2d995/77a781|c1d6ca/819f9b|9bc999/447b6a|787baf/43476e|dce7e7/93aeb1'],
 ['街','夕暮れの街|ネオン都市|雨の港町|砂漠の都|朝焼けの王都','eda179/886582|7655aa/314478|94b0bd/58738c|e7c18e/aa8465|f1c2ac/c99cad'],
 ['結晶','水晶洞窟|翡翠の鉱脈|琥珀の回廊|紅玉の聖堂|氷晶の回廊','aea5dd/685a9a|89c9b7/45887a|ebc584/ae854b|dca0a9/965570|afd8e5/638fae']
];
const scenes=[];groups.forEach(([group,names,colors],type)=>{const opt=document.createElement('optgroup');opt.label=group;names.split('|').forEach((name,i)=>{const pair=colors.split('|')[i].split('/').map(s=>'#'+s),v=scenes.length;scenes.push({name,type,pair});opt.append(new Option(name,v));});$('scene').append(opt);});
let custom=null,fileVersion=0;
function paint(){back.clearRect(0,0,W,H);$('scene').disabled=!$('has-bg').checked;if(!$('has-bg').checked)return;
 if($('scene').value==='custom'&&custom){back.drawImage(custom,0,0);return;}
 const id=Number($('scene').value),{type,pair}=scenes[id],grad=back.createLinearGradient(0,0,W/2,H);grad.addColorStop(0,pair[0]);grad.addColorStop(1,pair[1]);back.fillStyle=grad;back.fillRect(0,0,W,H);
 let seed=id+17;const r=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),poly=pts=>{back.beginPath();pts.forEach(([x,y],i)=>i?back.lineTo(x,y):back.moveTo(x,y));back.closePath();back.fill();};
 back.save();
 if(type===0){back.fillStyle='#ffefd2';for(let i=0;i<105;i++){let x=r()*W,y=r()*H,z=1+r()*3;back.globalAlpha=.35+r()*.65;poly([[x,y-z*2],[x+z/2,y-z/2],[x+z*2,y],[x+z/2,y+z/2],[x,y+z*2],[x-z/2,y+z/2],[x-z*2,y],[x-z/2,y-z/2]]);}}
 if(type===1){for(let j=0;j<8;j++){back.fillStyle=j%2?'#fcf2d954':'#31779545';back.beginPath();back.moveTo(0,H);for(let x=0;x<=W;x+=4)back.lineTo(x,200+j*45+Math.sin(x/(45+id)+j+id)*18);back.lineTo(W,H);back.fill();}}
 if(type===2){for(let j=0;j<3;j++){back.fillStyle=['#ffffff61','#57496152','#302c4666'][j];let pts=[[0,H]];for(let x=-90;x<W+110;x+=75)pts.push([x,150+j*105+r()*110]);poly([...pts,[W,H]]);}}
 if(type===3){for(let j=0;j<60;j++){let x=r()*W,y=H*.48+j/60*H*.52,z=30+r()*100;back.fillStyle=j<30?'#ffffff39':'#173c4054';poly([[x,y-z],[x+z*.35,y],[x-z*.35,y]]);}}
 if(type===4){for(let row=0;row<2;row++){let x=-12;while(x<W){let w=35+r()*52,h=45+r()*180+row*20,y=H-h-(1-row)*80;back.fillStyle=row?'#24294299':'#4a496254';back.fillRect(x,y,w,H-y);back.fillStyle='#ffe1aa9c';for(let yy=y+12;yy<H;yy+=20)for(let xx=x+8;xx<x+w-6;xx+=14)if(r()>.48)back.fillRect(xx,yy,5,7);x+=w+3;}}}
 if(type===5){for(let j=0;j<35;j++){let x=r()*W,y=r()*H,z=12+r()*64;back.fillStyle='#ffffff35';poly([[x,y-z],[x+z*.4,y],[x,y+z],[x-z*.4,y]]);back.fillStyle='#352f5e29';poly([[x,y-z],[x+z*.4,y],[x,y+z]]);}}
 back.restore();}
$('scene').onchange=paint;$('has-bg').onchange=paint;paint();
$('file').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;const ver=++fileVersion;e.target.value='';
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){$('file-info').textContent='12MB以下のPNG・JPEG・WebPを選んでください。';return;}
 const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(ver!==fileVersion)return;
 const layer=document.createElement('canvas');layer.width=W;layer.height=H;const scale=Math.max(W/img.width,H/img.height);
 layer.getContext('2d').drawImage(img,(W-img.width*scale)/2,(H-img.height*scale)/2,img.width*scale,img.height*scale);custom=layer;
 if(!$('scene').querySelector('[value="custom"]'))$('scene').append(new Option('自分の背景画像','custom'));
 $('scene').value='custom';$('has-bg').checked=true;paint();$('file-info').textContent=file.name+' を背景にしました。';
 }catch{if(ver===fileVersion)$('file-info').textContent='画像を読み込めませんでした。別の画像を選んでください。';}finally{URL.revokeObjectURL(url);}
};
function bucket(x,y){
 const im=pen.getImageData(0,0,W,H),d=im.data,start=Math.min(H-1,Math.max(0,Math.floor(y)))*W+Math.min(W-1,Math.max(0,Math.floor(x))),origin=Array.from(d.slice(4*start,4*start+4)),hex=$('color').value,col=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).concat(255);
 if(origin.every((v,i)=>v===col[i]))return;
 const queue=new Int32Array(W*H),seen=new Uint8Array(W*H);let head=0,end=0;
 function visit(n){if(seen[n])return;seen[n]=1;let k=n*4;for(let j=0;j<4;j++)if(Math.abs(d[k+j]-origin[j])>14)return;queue[end++]=n;d.set(col,k);}
 visit(start);while(head<end){const n=queue[head++],x=n%W;if(x)visit(n-1);if(x<W-1)visit(n+1);if(n>=W)visit(n-W);if(n<W*(H-1))visit(n+W);}
 pen.putImageData(im,0,0);
}
let history=[],active=null,mode="brush",last;
function point(e){const b=ink.getBoundingClientRect();return [(e.clientX-b.left)*W/b.width,(e.clientY-b.top)*H/b.height];}
ink.onpointerdown=e=>{if(active!==null||e.button!==0)return;history.push(pen.getImageData(0,0,W,H));if(history.length>16)history.shift();$('undo').disabled=false;if(mode==='fill'){bucket(...point(e));return;}active=e.pointerId;ink.setPointerCapture(active);last=point(e);pen.globalCompositeOperation=mode==='eraser'?'destination-out':'source-over';pen.fillStyle=pen.strokeStyle=$('color').value;pen.lineWidth=+$('width').value;pen.lineCap=pen.lineJoin='round';pen.beginPath();pen.arc(...last,pen.lineWidth/2,0,2*Math.PI);pen.fill();};
ink.onpointermove=e=>{if(active!==e.pointerId)return;const p=point(e);pen.beginPath();pen.moveTo(...last);pen.lineTo(...p);pen.stroke();last=p;};
ink.onpointerup=ink.onpointercancel=ink.onlostpointercapture=e=>{if(active===e.pointerId)active=null;};
for(const id of ['brush','eraser','fill'])$(id).onclick=()=>{mode=id;for(const k of ['brush','eraser','fill'])$(k).setAttribute('aria-pressed',String(k===id));};
$('undo').onclick=()=>{if(history.length&&active===null)pen.putImageData(history.pop(),0,0);$('undo').disabled=!history.length;};
const ranks=[['コモン','#dfd9c6'],['アンコモン','#95daba'],['レア','#9acded'],['スーパー レア','#c7a6e5'],['ウルトラレア','#ead68b'],['レジェンド','#f0bf68'],['シークレットレア','#c3caeb'],['神話レア','#e6a9a2']],effects=[['先制','最初の行動が1拍早まる。'],['鉄壁','受けるダメージを2軽減する。'],['吸収','攻撃のたびにHPを2回復する。'],['追撃','3回目の攻撃ごとに4ダメージを追加。'],['逆転','HPが半分以下なら攻撃力が3上がる。'],['再生','自分の行動後、HPを3回復する。']];
const rand=n=>Math.floor(Math.random()*n),pick=a=>a[rand(a.length)],names=['星の','草原の','虹の','暁の','夢見る','小さな'],tails=['落書き竜','守り手','旅人','使い魔','騎士','冒険者'];
function roll(name,minRank=0){let v=rand(1000),rank=Math.max(minRank,v<360?0:v<620?1:v<810?2:v<910?3:v<962?4:v<987?5:v<997?6:7),cost=1+rand(6),pool=7+cost*2+rank*2,atk=3+rand(pool-4);const gloss=rand(1000),finish=[430,615,695,772,834,881,920,949,970,985,995,1000].findIndex(n=>gloss<n);return {name,rank,finish,cost,atk,def:pool-atk,e:rand(effects.length)};}
const finishes=InkEditions.finishes;let current=null;
function line(t,x,y,size,color='#282538',max=650){g.fillStyle=color;g.font='bold '+size+'px system-ui,sans-serif';g.fillText(t,x,y,max);}
function render(c){let [rarity,accent]=ranks[c.rank];g.fillStyle='#292638';g.fillRect(0,0,720,980);g.fillStyle=accent;g.fillRect(12,12,696,956);g.fillStyle='#fffaf0';g.fillRect(25,25,670,930);if(c.finish){const foil=g.createLinearGradient(0,0,720,980);['#93dddf','#e0b5fc','#fff3bc','#b5e8dc','#f4c1da'].forEach((v,i)=>foil.addColorStop(i/4,v));g.strokeStyle=foil;g.lineWidth=c.finish===2?24:14;g.strokeRect(18,18,684,944);if(c.finish===2){g.fillStyle='#e6e1fa';g.fillRect(31,31,658,111);}}
 line('INK CLUB   /   '+rarity+'   /   '+finishes[c.finish],46,68,24);line(c.name,46,133,48);g.fillStyle='#fff';g.fillRect(40,160,640,480);if(c.art)g.drawImage(c.art,40,160,640,480);else{g.drawImage($('back'),40,160,640,480);g.drawImage(ink,40,160,640,480);}
 if(c.finish){g.save();g.beginPath();g.rect(40,160,640,480);g.clip();const sheen=g.createLinearGradient(40,160,680,640);['#fff0','#b6f7ff44','#fff0','#fbd3f747','#fff0'].forEach((v,i)=>sheen.addColorStop(i/4,v));g.fillStyle=sheen;g.fillRect(40,160,640,480);g.fillStyle='#fff9';for(let i=0;i<22;i++){let x=48+(i*173)%618,y=170+(i*91)%455,r=3+i%9;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+2,y-2);g.lineTo(x+r,y);g.lineTo(x+2,y+2);g.lineTo(x,y+r);g.lineTo(x-2,y+2);g.lineTo(x-r,y);g.lineTo(x-2,y-2);g.fill();}g.restore();}
 g.strokeStyle='#292638';g.lineWidth=3;g.strokeRect(40,160,640,480);line('COST  '+c.cost+'      ATK  '+c.atk+'      DEF  '+c.def,45,714,37);g.fillStyle=accent;g.fillRect(42,744,636,5);line('✦ '+effects[c.e][0],45,815,39);line(effects[c.e][1],45,874,28);line(c.finish===2?'◆ PARALLEL EDITION  /  星紋特装':c.finish?'✧ SPECIAL PRINT  /  '+finishes[c.finish]:'DRAW & DUEL     /     INK CLUB',45,931,18);InkEditions.surface(g,c.finish);const desc=rarity+' ／ '+finishes[c.finish]+' ／ コスト '+c.cost+'・攻撃力 '+c.atk+'・防御力 '+c.def+' ／ '+effects[c.e].join('：');card.setAttribute('aria-label',c.name+'：'+desc);$('description').textContent=desc;}
let revealTimer;
function reveal(images,title){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const modal=$('reveal');$('reveal-title').textContent=title;
 $('reveal-cards').replaceChildren(...images.map((src,i)=>{let wrap=document.createElement('span'),im=document.createElement('img');wrap.style.setProperty('--i',i);im.src=src;im.alt='';wrap.append(im);return wrap;}));
 if(!modal.open)modal.showModal();clearTimeout(revealTimer);revealTimer=setTimeout(()=>modal.close(),images.length===1?2150:2800);
}
$('skip-reveal').onclick=()=>$('reveal').close();$('reveal').onclose=()=>clearTimeout(revealTimer);
$('make').onclick=()=>{const pixels=pen.getImageData(0,0,W,H).data;let drawn=false;for(let i=3;i<pixels.length;i+=4)if(pixels[i]){drawn=true;break;}if(!drawn){$('notice').textContent='まずキャンバスに絵を描いてください。';return;}current=roll($('name').value.trim()||pick(names)+pick(tails));document.querySelectorAll('#pack-list button').forEach(b=>b.setAttribute('aria-pressed','false'));render(current);$('placeholder').hidden=true;$('output').hidden=false;$('log').textContent='';reveal([card.toDataURL()],'インクを定着、カード完成！');$('notice').textContent='「'+current.name+'」が生まれました！';if(matchMedia('(max-width:760px)').matches)$('output').scrollIntoView({block:'start'});};
const animals=[
 ['月見うさぎ','rabbit','#ad8cd1','#efdcfc'],['銀河うさぎ','rabbit','#5a87af','#d5eff8'],['夕焼けぎつね','fox','#c36546','#ffe2a9'],['雪原ぎつね','fox','#8fadd3','#f4f6ff'],
 ['星屑ねこ','cat','#73578e','#ecc8e2'],['木陰の三毛','cat','#ab795a','#ffeac6'],['流氷くま','bear','#568d9a','#e7fcff'],['蜂蜜くま','bear','#be8951','#ffdf8c'],
 ['夜明けフクロウ','owl','#927eb6','#ffe3a4'],['森番フクロウ','owl','#648276','#dfefba'],['朝露スライム','slime','#538ec3','#b4efff'],['若葉スライム','slime','#579977','#c5f4a6']
];
function sampleArt([name,kind,bg,body],parallel){const cv=document.createElement('canvas');cv.width=480;cv.height=360;const a=cv.getContext('2d'),dark='#332b49';
 function oval(x,y,w,h,color,angle=0){a.fillStyle=color;a.beginPath();a.ellipse(x,y,w,h,angle,0,Math.PI*2);a.fill();}
 function poly(pts,color){a.fillStyle=color;a.beginPath();pts.forEach(([x,y],i)=>i?a.lineTo(x,y):a.moveTo(x,y));a.closePath();a.fill();}
 a.fillStyle=bg;a.fillRect(0,0,480,360);for(let i=0;i<55;i++){let x=(i*137)%480,y=(i*73)%360,z=2+i%7;poly([[x,y-z],[x+z*.35,y-z*.35],[x+z,y],[x,y+z*.35],[x,y+z],[x-z*.35,y],[x-z,y]],'#ffffff85');}
 a.save();a.translate(240,190);if(parallel)a.rotate(-.12);
 oval(0,110,113,17,'#32294540');
 if(kind==='rabbit'){for(const k of [-1,1]){oval(k*42,-62,24,78,body,k*.17);oval(k*42,-72,11,50,'#edabc0',k*.17);}}
 if(kind==='bear'){for(const k of [-1,1]){oval(k*71,-52,35,35,body);oval(k*73,-53,20,20,'#b08f99');}}
 if(['cat','fox','owl'].includes(kind)){for(const k of [-1,1]){poly([[k*98,-96],[k*85,2],[k*12,-42]],body);poly([[k*85,-72],[k*76,-22],[k*43,-41]],'#c99ba9');}}
 oval(0,19,kind==='slime'?115:97,86,body);
 if(kind==='fox'){poly([[-91,14],[-33,27],[0,50],[31,28],[93,14],[49,69],[0,93],[-50,66]],'#fff4db');}
 if(kind==='owl'){for(const k of [-1,1])oval(k*37,0,36,36,'#fff4dc');}
 if(kind==='slime')oval(-50,-28,21,10,'#ffffffae',-.5);
 for(const k of [-1,1]){oval(k*37,3,9,13,dark);oval(k*37-2,-2,3,4,'white');oval(k*57,28,10,5,'#dc95a3a0');}
 if(kind==='owl')poly([[-11,27],[11,27],[0,41]],'#e79841');else{a.strokeStyle=dark;a.lineWidth=4;a.lineCap='round';a.beginPath();a.arc(0,27,12,.15,Math.PI-.15);a.stroke();}
 if(kind==='cat'){a.strokeStyle=dark;a.lineWidth=3;for(const k of [-1,1])for(let i=0;i<2;i++){a.beginPath();a.moveTo(k*70,26+i*10);a.lineTo(k*107,21+i*17);a.stroke();}}
 if(parallel){poly([[-26,-61],[-35,-94],[-13,-82],[0,-106],[15,-83],[38,-98],[28,-61]],'#ffe189');}
 a.restore();return cv;}
let pack=[];
function showSample(i){current=pack[i];render(current);$('placeholder').hidden=true;$('output').hidden=false;$('log').textContent='';$('pack-info').textContent=current.name+'を選択中。完成カード欄から保存・対戦できます。';[...$('pack-list').children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));}
$('open-pack').onclick=()=>{const pool=[...animals,...InkEditions.catalogue],rareSlot=rand(5);pack=Array.from({length:5},(_,i)=>{const animal=pool.splice(rand(pool.length),1)[0],c=roll(animal.name||animal[0],i===rareSlot?2:0);c.art=animal.path?InkEditions.art(animal,c.finish===2):sampleArt(animal,c.finish===2);render(c);const thumb=document.createElement("canvas");thumb.width=180;thumb.height=245;thumb.getContext("2d").drawImage(card,0,0,180,245);c.thumb=thumb.toDataURL();return c;});$('pack-list').replaceChildren(...pack.map((c,i)=>{let b=document.createElement('button'),img=document.createElement('img'),label=document.createElement('b'),tag=document.createElement('span');img.src=c.thumb;img.alt='';label.textContent=c.name;tag.textContent=ranks[c.rank][0]+'・'+finishes[c.finish];b.append(img,label,tag);b.onclick=()=>showSample(i);return b;}));showSample(0);reveal(pack.map(c=>c.thumb),'封を切ると、5枚の出会い。');};
$('download').onclick=()=>card.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ink-club-card.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('duel').onclick=()=>{const cpu=roll(pick(['インクゴーレム','クレヨンナイト','折り紙の竜','消しゴムおばけ'])),units=[current,cpu].map(c=>({c,hp:24+c.def,max:24+c.def,next:c.cost-(c.e===0?1:0),moves:0})),logs=[];let win=null;
for(let t=0;t<100;t++){let i=units[0].next===units[1].next?rand(2):Number(units[1].next<units[0].next),a=units[i],b=units[1-i];a.moves++;const hit=Math.max(1,a.c.atk+rand(4)-Math.floor(b.c.def/3)-(b.c.e===1?2:0)+(a.c.e===3&&a.moves%3===0?4:0)+(a.c.e===4&&a.hp<=a.max/2?3:0));b.hp=Math.max(0,b.hp-hit);a.hp=Math.min(a.max,a.hp+(a.c.e===2?2:a.c.e===5?3:0));logs.push(a.c.name+' → '+hit+'ダメージ（相手HP '+b.hp+'）');if(!b.hp){win=i;break;}a.next+=3+a.c.cost;}
$('log').textContent=(win===null?'引き分け':win===0?'勝利！':'惜しくも敗北')+'　対 '+cpu.name+'（'+effects[cpu.e][0]+'）\n'+logs.slice(-4).join('\n')+'\nコストが低いほど、次の攻撃までの間隔が短くなります。';};
})();
