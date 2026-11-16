'use strict';

// name, landscape, inherited organ, camouflage, horizon and ground colors
const habitats={
 forest:['苔むす森林','forest',16,'#658458','#d1d9b9','#7e986a'],
 marsh:['葦の湿地','water',15,'#679e78','#cee1c0','#668168'],
 bog:['霧の泥炭湿原','water',16,'#84709a','#d5cbd7','#776c80'],
 mangrove:['汽水のマングローブ','water',14,'#667d50','#a4d5bf','#638773'],
 reef:['珊瑚礁','water',13,'#ef9a80','#93d6d2','#619ea0'],
 deep:['深海の熱水域','water',24,'#76d8dc','#67788b','#44596c'],
 water:['湖の浅瀬','water',25,'#70b8ba','#baded5','#89b4a6'],
 ice:['流氷海岸','water',12,'#95cfea','#e0ebef','#9baec3'],
 sky:['風の高原','sky',3,'#8ca2d1','#c5dadb','#8ca177'],
 cliff:['切り立つ断崖','sky',0,'#ba9672','#d8d1bf','#a09378'],
 cloud:['雲上の浮島','sky',9,'#c0a8dc','#ded9ed','#a7b0b9'],
 dune:['砂丘','forest',18,'#dfa85b','#f2dfb0','#bfa578'],
 volcano:['火山の裾野','forest',20,'#d87961','#dfc5b5','#857976'],
 cave:['結晶洞窟','forest',21,'#ac96cd','#b7b4d4','#84819c'],
 tundra:['雪のツンドラ','forest',22,'#adc4d1','#e0e6eb','#a4ada8'],
 jungle:['熱帯雨林','forest',7,'#73a764','#c6d8ac','#678866']
};
// Local specialists set the adult silhouette on the adaptation route.
const specialists={
 forest:[7,11,10,17],marsh:[20,26,14,23],bog:[25,45,41,44],mangrove:[32,26,34,23],
 reef:[35,30,32,34],deep:[31,30,36,33],water:[15,14,23,21],ice:[22,39,38,37],
 sky:[18,40,41,47],cliff:[8,18,17,16],cloud:[40,16,24,41],dune:[5,27,43,47],
 volcano:[3,29,43,28],cave:[16,44,27,45],tundra:[7,9,39,22],jungle:[24,12,42,40]
};
const pressures=[
 ['豊富な餌','満ち足りた',1,1.22],['強風','風切りの',3,1.22],['天敵が多い','守護の',5,1.25],
 ['夜だけ活動','宵闇の',9,1.12],['長い乾季','砂渡りの',18,.95],['豪雨','雨渡りの',15,1.23],
 ['寒波','霜衣の',22,1.28],['強い潮流','潮駆けの',25,1.23],['競争が激しい','決闘の',19,1.25],
 ['食料不足','細身の',17,.78],['花粉の季節','花舞う',8,1.17],['濃い霧','灯火の',27,1.1]
];
// Each lineage has a distinct adult body pool, accessory and mature crest.
const lineages=[
 ['重装・守護型','鎧獣',[3,25,4,32],20,0],['愛玩・ふわふわ型','綿精',[10,9,17,22],22,1],
 ['環境最適化型','適応種',[],0,2],['飛翔・滑空型','天翔種',[18,16,40,24],0,3],
 ['深海・遊泳型','潮竜',[36,37,31,38],25,4],['夜光・幻想型','星霊',[40,17,30,24],8,5],
 ['俊足・追跡型','疾走種',[2,6,7,47],17,6],['擬態・潜伏型','擬態種',[25,27,45,46],11,7]
];
const donorOrgans=[20,17,17,20,15,17,14,17,17,22,22,23,18,22,15,26,5,2,0,27,18,3,12,15,4,20,23,24,20,18,24,24,19,19,25,13,25,25,25,12,7,9,19,23,19,24,16,14];
const crests=[
 ['棘の装甲','M-29 4Q-25 -11 -18 -16L-19 -32 -6 -20 0 -39 7 -18 22 -31 17 -12Q29 -9 31 4Z','M-19 -12L-9 -2 0 -15 8 -2 18 -12'],
 ['花びらのたてがみ','M-27 4C-43 -15 -26 -27 -17 -19C-23 -43 -4 -44 0 -24C10 -47 28 -37 21 -19C45 -30 45 -6 28 5Z','M-23 -14L-13 -1 M0 -24V-5 M19 -17L12 -2'],
 ['枝分かれした感覚角','M-6 2L-10 -14 -23 -23 -26 -34 -18 -27 -13 -24 -15 -42 -9 -34 -5 -20 0 -12 8 -22 9 -38 14 -31 12 -24 27 -34 24 -25 14 -17 5 3Z','M-7 -17L0 -6 11 -18'],
 ['羽毛の冠','M-24 3Q-36 -21 -31 -36L-14 -16Q-23 -38 -16 -48L-3 -20Q-5 -45 5 -49L9 -17 22 -34Q26 -13 16 3Z','M-19 -8L-28 -29 M-7 -9L-13 -34 M5 -7L5 -35'],
 ['帆状の背びれ','M-34 5Q-24 -26 -9 -38L-6 -28 6 -46 7 -29 22 -36 18 -18 29 -20 31 4Z','M-22 2L-9 -30 M-8 0L4 -35 M4 1L18 -25 M16 1L24 -13'],
 ['結晶の冠','M-25 4L-32 -15 -24 -27 -13 -18 -10 -38 0 -49 10 -34 8 -15 22 -32 31 -20 21 4Z','M-24 -23L-19 -6 M0 -42L-2 -10 M23 -25L18 -8'],
 ['流線の双角','M-24 4Q-21 -12 -42 -33Q-16 -29 -4 -10Q0 -21 -12 -42Q12 -30 16 -8L25 3Z','M-30 -25L-9 -5 M-4 -32L9 -7'],
 ['葉脈の外套','M-31 4Q-33 -16 -18 -34L-12 -23 -4 -44 3 -29 19 -39 17 -22 33 -27Q30 -8 23 3Z','M-23 0L16 -31 M-12 -9L-16 -24 M-3 -16L-4 -32 M2 -19L18 -20']
].map(([name,outline,veins])=>({name,outline:new Path2D(outline),veins:new Path2D(veins)}));
function renderCrest(g,p,phase){
 g.rotate(Math.sin(phase)*.035);
 const shade=g.createLinearGradient(0,-44,0,5);shade.addColorStop(0,'#fff0c0');shade.addColorStop(.5,p.color);shade.addColorStop(1,'#52786e');
 const crest=crests[p.id];g.lineJoin='round';g.fillStyle=shade;g.strokeStyle='#3b5149';g.lineWidth=1.8;g.fill(crest.outline);g.stroke(crest.outline);g.lineWidth=1;g.stroke(crest.veins);
}
function evolutionPanel(p){
 const prefs=pet.experiment??={line:2,pressure:0,mate:-1};
 const pick=(label,options,value,set)=>select(p,label,options,String(value),v=>{set(v);save()});
 item('h2',p,'次の世代を設計');
 pick('生息地',Object.entries(habitats).map(([id,h])=>[id,h[0]]),pet.env,v=>pet.env=v);
 pick('環境条件',pressures.map((v,i)=>[i,v[0]]),prefs.pressure,v=>prefs.pressure=+v);
 pick('交配相手',[[-1,'交配なし（単独進化）'],...DoodleAtlas.species.map((v,i)=>[i,v.name])],prefs.mate,v=>prefs.mate=+v);
 pick('進化の方向',lineages.map((v,i)=>[i,v[0]]),prefs.line,v=>prefs.line=+v);
 button(p,'次の世代へ進化',evolve,'primary');
 item('p',p,'第2世代で体格、第3世代で冠、第5世代で器官の対が発達します。その後も世代交代で別の姿へ分岐します。');
 if(pet.previousForm){
   const pair=item('div',p,'',{className:'evo-comparison'});
   for(const [id,label] of [['beforeForm','第'+(pet.gen-1)+'世代'],['afterForm','第'+pet.gen+'世代']]){
     const figure=item('figure',pair,'');
     item('canvas',figure,'',{id,width:200,height:132});
     item('figcaption',figure,label);
   }
 }
 if(pet.records?.length){const list=item('details',p,'');item('summary',list,'進化の記録');for(const log of pet.records.slice().reverse())item('p',list,log)}
}
function paintComparison(canvas,parts){
 if(!canvas||!parts?.length)return;
 const g=canvas.getContext('2d'),f=frameOf(parts);
 const scale=Math.min(180/Math.max(1,f.r-f.l),116/Math.max(1,f.b-f.t),3);
 g.clearRect(0,0,200,132);g.save();g.translate(100,66);g.scale(scale,scale);g.translate(-f.cx,-f.cy);
 parts.forEach(p=>drawPart(g,p,0));g.restore();
}
function evolve(){
 if(!pet.parts.length)return say('描画室で生物を描いてください。');
 pet.previousForm=structuredClone(pet.parts);
 const gen=pet.gen+1,{line,pressure,mate}=pet.experiment;
 const [region,,localOrgan,color]=habitats[pet.env], climate=pressures[pressure];
 const [,suffix,pool,organ,crest]=lineages[line];
 const nextForm=pool.length?pool:specialists[pet.env];
 const oldBody=baseAnimal(),oldLine=pet.lineage;
 // Preserve the drawing and its hand-placed parts, replacing only the previous generation's organs.
 pet.parts=pet.parts.filter(p=>!p.grown);
 const sketch=frameOf(pet.parts),was=oldBody||{x:sketch.cx,y:sketch.cy,size:Math.max(1,Math.min(2.7,(sketch.r-sketch.l)/96))};
 const originalSize=oldLine?.size||was.size;
 const seed=oldLine?.seed??Math.floor(Math.random()*65536);
 const variant=(seed+gen+pressure+(mate+1)*3)%nextForm.length;
 const inherited=mate>=0?mate:(oldLine?.ancestor??-1);
 const bodyId=(gen===2||gen%5===4)&&inherited>=0?inherited:nextForm[variant];
 let scale=originalSize;
 if(gen>=2){
   scale=Math.min(3.3,originalSize*(line===1?.78:line===0?1.18:1)*(.91+.035*Math.min(gen,9)));
   const body={kind:'fauna',role:'body',id:bodyId,x:was.x,y:was.y,size:scale,baseAnimal:true,flipX:was.flipX,flipY:was.flipY};
   if(oldBody)pet.parts[pet.parts.indexOf(oldBody)]=body;else pet.parts.unshift(body);
 }
 const body=baseAnimal()||was,dir=body.flipX?-1:1,up=body.flipY?-1:1;
 const grown=[],rear=[],stage=Math.min(1.65,.76+.13*gen);
 function graft(id,x,y,k,mirror=false,behind=false){
   const part=DoodleAtlas.parts[id];(behind?rear:grown).push({kind:'part',role:part.role,id,x:body.x+x*scale*dir,y:body.y+y*scale*up,
     size:scale*k*stage,flipX:mirror!==(dir<0),flipY:up<0,grown:true});
 }
 const flank=line===2?localOrgan:organ;
 function attach(id,side,k,mirror=false){const role=DoodleAtlas.parts[id].role;
   const [x,y]=role==='tail'?[-29,8]:role==='leg'?[side*18,16]:[side*12,-11];
   graft(id,x,y,k,mirror,side<0 && role!=='tail');
 }
 attach(flank,-1,.82);
 if(localOrgan!==flank)attach(localOrgan,1,.62,true);
 if(inherited>=0)attach(donorOrgans[inherited],1,.78);
 if(gen>=2)attach(climate[2],-1,.58*climate[3]);
 if(gen>=5)attach(flank,1,.93,true);
 if(gen>=8)graft(22+(seed+gen+pressure)%6,-24,1,.9);
 if(gen>=3)grown.push({kind:'crest',id:crest,role:'body',color,x:body.x+9*scale*dir,y:body.y-24*scale*up,
   size:scale*stage*(gen>=6?.9:.64),flipX:body.flipX,flipY:body.flipY,grown:true});
 pet.parts.splice(Math.max(0,pet.parts.indexOf(body)),0,...rear);
 pet.parts.push(...grown);
 const formName=gen>=2?DoodleAtlas.species[bodyId].name:subject();
 const mutation=gen>=3?crests[crest].name:DoodleAtlas.parts[flank].name;
 pet.history='第'+gen+'世代 · '+climate[1]+suffix+'　'+formName+'の体形・'+mutation;
 if(inherited>=0)pet.history+=' ／ '+DoodleAtlas.species[inherited].name+'由来の'+DoodleAtlas.parts[donorOrgans[inherited]].name;
 pet.records=[...(pet.records||[]),region+' ｜ '+pet.history].slice(-16);
 pet.gen=gen;pet.lineage={size:originalSize,seed,ancestor:inherited};undo=[];redo=[];selected=null;birth=3;
 save();renderPanel();say(pet.history);
}
