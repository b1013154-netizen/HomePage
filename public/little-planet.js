(()=>{
  const $=id=>document.getElementById(id),key='playground.little-planet.v1',view=createPlanetView($('globe'));
  const branches={
    dry:['砂の眠り苔','根で歩く乾生樹','地下貯水都市'],
    frost:['氷晶藻','氷床を透かす光虫','氷窟の灯火都市'],
    steam:['熱泉菌の輪','煙をまとう浮遊クラゲ','蒸気塔の集落'],
    ocean:['潮を染める藍藻','帆を張る海獣','潮流を渡る浮島都市'],
    heavy:['地を這う石苔','六脚の岩角獣','環状の石造都市'],
    light:['空に胞子をまく苔','気嚢をもつ翼魚','浮力帆の空中港'],
    green:['水辺の光合成膜','森を運ぶ甲羅獣','河口の庭園都市']
  };
  function blank(){return {seed:crypto.getRandomValues(new Uint32Array(1))[0],water:0,temp:18,gravity:1,age:0,streak:0,branch:'',civil:false,finds:[],events:[{age:0,text:'乾いた岩の表面に、最初の一滴を待つ。'}]}}
  let s=blank(),timer=null;
  try{const d=JSON.parse(localStorage.getItem(key));if(d&&Number.isInteger(d.seed)&&Number.isInteger(d.age)&&d.age>=0&&Number.isFinite(d.water)&&Number.isFinite(d.temp)&&Number.isFinite(d.gravity)&&Array.isArray(d.finds)&&Array.isArray(d.events))s=d}catch{}
  function environment(){
    if(s.water<12)return 'dry';
    if(s.temp<=0)return 'frost';
    if(s.temp>=43)return 'steam';
    if(s.water>=72)return 'ocean';
    if(s.gravity>=1.5)return 'heavy';
    if(s.gravity<=.65)return 'light';
    return 'green';
  }
  const habitats={dry:'乾燥した盆地',frost:'氷の海',steam:'熱泉地帯',ocean:'外洋',heavy:'重力の強い岩棚',light:'軽い重力の高地',green:'温暖な水辺'};
  const settings=[['water','水の量',0,100,1,' / 100'],['temp','平均気温',-45,80,1,' °C'],['gravity','表面重力',.3,2.5,.05,' G']];
  for(const [id,name,min,max,step,unit] of settings){
    const box=document.createElement('div'),label=document.createElement('label'),input=document.createElement('input'),out=document.createElement('output');
    box.className='control';label.htmlFor=id;label.textContent=name;Object.assign(input,{id,type:'range',min,max,step});out.id=id+'Value';out.htmlFor=id;
    input.oninput=()=>{s[id]=Number(input.value);render();save()};box.append(label,out,input);$('knobs').append(box);
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(s));$('saved').textContent='このブラウザに保存済み'}catch{$('saved').textContent='このブラウザでは保存できません'}}
  function add(text){s.events.unshift({age:s.age,text});s.events=s.events.slice(0,40)}
  function advance(){
    const first=!s.age;s.age++;
    if(first){s.water=43;add('一滴をきっかけに水が地表を巡り、低地に水が集まり始めた。')}
    const b=environment();if(b!==s.branch){s.branch=b;s.streak=0;if(!first)add(habitats[b]+'に、環境が移り変わった。')}
    const dried=!s.water&&s.streak>0;
    s.streak=s.water?s.streak+1:0;s.civil=s.streak>=7&&s.water>0;
    if(s.water>0){
      const milestones=[2,4,7],names=branches[b];
      for(let i=0;i<3;i++)if(s.streak===milestones[i]&&!s.finds.includes(names[i])){
        s.finds.push(names[i]);add(names[i]+(i===2?'が築かれ、夜側に明かりがともった。':'を初めて観測した。'));
      }
    }else if(dried||s.events[0]?.text.includes('環境が移り変わった'))add('水が尽き、生命の成長が休止した。');
    render(first);save();
  }
  function toggleAuto(on){
    clearInterval(timer);timer=on?setInterval(()=>{if(!document.hidden)advance()},3200):null;
    $('auto').setAttribute('aria-pressed',String(on));$('auto').textContent=on?'自動進行を止める':'自動で時間を進める';
  }
  function render(splash=false){
    for(const [id,,, , ,unit] of settings){$(id).value=s[id];$(id).disabled=id==='water'&&!s.age;$(id+'Value').textContent=(id==='gravity'?s[id].toFixed(2):s[id])+unit}
    const b=environment(),adapt=b===s.branch?s.streak:0;
    $('era').textContent=!s.age?'岩石の時代':!s.water?'休眠の時代':adapt>=7?'文明の時代':adapt>=4?'多様な生命の時代':adapt>=2?'芽生えの時代':'水の時代';
    $('epoch').textContent='第 '+s.age+' 紀';$('step').textContent=s.age?'次の時代へ進む':'水を一滴落とす';$('auto').disabled=!s.age;
    const next=[2,4,7].find(n=>n>adapt);
    $('condition').textContent=!s.age?'最初の一滴が、乾いた地表に水の循環を生みます。':!s.water?'水が尽きています。水の量を増やすと生命が育ちます。':habitats[b]+'。'+(next?'この環境をあと'+(next-adapt)+'紀保つと変化を観測できます。':'文明が根づきました。環境を変えると別の進化を観測できます。');
    $('events').replaceChildren(...s.events.map(e=>{const li=document.createElement('li'),time=document.createElement('time');time.textContent='第'+e.age+'紀';li.append(time,String(e.text));return li}));
    $('finds').replaceChildren(...(s.finds.length?s.finds:['まだ発見されていません']).map(n=>{const li=document.createElement('li');li.textContent=n;return li}));
    view.update({...s,civil:s.civil&&adapt>=7&&s.water>0},splash);
  }
  $('auto').onclick=()=>toggleAuto(!timer);$('step').onclick=advance;
  $('restart').onclick=()=>{if(!confirm('現在の惑星と日誌を手放して、新しい惑星を育てますか？'))return;toggleAuto(false);s=blank();$('restart').closest('details').open=false;render();save();$('step').focus()};
  render();save();
})();
