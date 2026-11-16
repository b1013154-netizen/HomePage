(()=>{
  const $=id=>document.getElementById(id),key='playground.little-planet.v1',view=createPlanetView($('globe'));
  function blank(){return {seed:crypto.getRandomValues(new Uint32Array(1))[0],water:0,temp:18,gravity:1,age:0,years:0,stableYears:0,started:false,sites:[],drops:0,span:1000000,streak:0,branch:'',civil:false,finds:[],events:[{age:0,text:'乾いた岩の表面に、最初の一滴を待つ。'}]}}
  let s=blank(),timer=null;
  try{const d=JSON.parse(localStorage.getItem(key));if(d&&Number.isInteger(d.seed)&&Number.isFinite(d.age)&&d.age>=0&&Number.isFinite(d.water)&&Number.isFinite(d.temp)&&Number.isFinite(d.gravity)&&Array.isArray(d.finds)&&Array.isArray(d.events))s=d}catch{}
  const million=1000000,format=n=>n.toLocaleString('ja-JP')+'年';

  s.years??=s.age*million;s.stableYears??=s.streak*million;s.started??=s.age>0;s.span??=million;
  s.sites??=s.site?[{site:s.site,amount:.5}]:[];s.drops??=s.sites.length;
  $('years').value=s.span;
  let busy=false,noticeTimer;
  function report(title,text){
    clearTimeout(noticeTimer);$('reportTitle').textContent=title;$('reportBody').textContent=text;$('report').hidden=false;
    noticeTimer=setTimeout(()=>{$('report').hidden=true},8500);
  }
  $('dismiss').onclick=()=>{$('report').hidden=true};
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
    input.oninput=()=>{const prev=environment();s[id]=Number(input.value);if(environment()!==prev||!s.water){s.stableYears=0;s.streak=0;s.civil=false;s.branch=environment()}render();save()};box.append(label,out,input);$('knobs').append(box);
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(s));$('saved').textContent='このブラウザに保存済み'}catch{$('saved').textContent='このブラウザでは保存できません'}}
  function add(text,year=s.years){s.events.unshift({year,text});s.events=s.events.slice(0,40)}
  let clipURL=null,clipVersion=0;
  function recordLanding(){
    const canvas=$('globe'),version=++clipVersion;
    if(!canvas.captureStream||typeof MediaRecorder==='undefined')return ()=>{};
    let stream;
    try{
      stream=canvas.captureStream(30);
      const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/mp4'].find(MediaRecorder.isTypeSupported.bind(MediaRecorder));
      const recorder=new MediaRecorder(stream,type?{mimeType:type}:{}),chunks=[];
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      const close=()=>stream.getTracks().forEach(track=>track.stop());
      recorder.onerror=close;
      recorder.onstop=()=>{
        close();if(version!==clipVersion||!chunks.length)return;
        if(clipURL)URL.revokeObjectURL(clipURL);clipURL=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));
        $('landingMovie').src=$('downloadMovie').href=clipURL;$('downloadMovie').download='惑星の着水.'+(recorder.mimeType.includes('mp4')?'mp4':'webm');$('watchLanding').hidden=false;
      };
      recorder.start();return ()=>{if(recorder.state!=='inactive')recorder.stop()};
    }catch{stream?.getTracks().forEach(track=>track.stop());return ()=>{}}
  }
  $('watchLanding').onclick=()=>{$('movie').showModal();$('landingMovie').currentTime=0;$('landingMovie').play().catch(()=>{})};
  $('closeMovie').onclick=()=>$('movie').close();$('movie').onclose=()=>$('landingMovie').pause();
  async function pour(target,amount){
    if(busy)return;
    busy=true;toggleAuto(false);$('report').hidden=true;
    const old=s.water,first=!s.started,added=Math.min(100-old,12+Math.round(18*amount));
    render();
    const rect=$('globe').getBoundingClientRect();
    if(rect.top<0||rect.bottom>innerHeight)$('globe').scrollIntoView({block:'center',behavior:'instant'});
    const stopRecording=recordLanding();
    try{
      await view.pour(target,amount,()=>{
        const before=environment();s.started=true;s.water+=added;s.drops++;
        const near=s.sites.find(b=>Math.hypot(...b.site.map((v,i)=>v-target.site[i]))<.04);
        if(near)near.amount=Math.min(1,near.amount+amount+.1);else s.sites.push({site:target.site,amount});
        const latitude=Math.round(Math.abs(target.lat)),place=(target.lat>=0?'北緯':'南緯')+latitude+'°';
        const local=s.temp-48*Math.sin(target.lat*Math.PI/180)**2;
        const effect=local<0?'水が凍り、着水地点に氷が広がった。':local>=43?'しずくが熱い地表を冷やし、熱泉に水が集まった。':'着水地点のくぼみに水が集まり、水面が広がった。';
        const text=place+' に着水。'+effect+' 水の量 '+old+' → '+s.water+'。';
        if(first||before!==environment()){s.branch=environment();s.streak=0;s.stableYears=0;s.civil=false}
        add(text);render();save();report(first?'最初の一滴が届いた':place+'の地表に着水',text);
      });
    }finally{stopRecording();busy=false;render()}
  }
  function advance(){
    if(!s.started||busy)return;
    if(!$('years').reportValidity()){toggleAuto(false);return}
    const span=Number($('years').value);s.span=span;
    const old=s.years,b=environment();
    const found=[];s.years+=span;s.age=s.years/million;
    if(b!==s.branch){s.branch=b;s.stableYears=0;add(habitats[b]+'に環境が移り変わった。',old)}
    s.stableYears=s.water?s.stableYears+span:0;s.streak=s.stableYears/million;
    found.push(...LivingWorld.step(s,b,old,s.years,add));
    s.civil=s.life.stage>=4&&s.water>0;
    const text=found.length?found.join('、')+'を観測。':!s.water?'地表は乾燥し、生命の成長は休止中。':habitats[b]+'の環境が続いた。';
    if(!found.length)add(text);
    report(format(old)+' → '+format(s.years),text);render();save();
  }
  function toggleAuto(on){
    clearInterval(timer);timer=on?setInterval(()=>{if(!document.hidden)advance()},3200):null;
    $('auto').setAttribute('aria-pressed',String(on));$('auto').textContent=on?'自動進行を止める':'自動で時間を進める';
  }
  function render(splash=false){
    for(const [id,,,,,unit] of settings){$(id).value=s[id];$(id).disabled=busy||(id==='water'&&!s.started);$(id+'Value').textContent=(id==='gravity'?s[id].toFixed(2):s[id])+unit}
    const b=environment(),l=LivingWorld.ensure(s);
    $('era').textContent=!s.started?'岩石の時代':!s.water?'休眠の時代':['水の時代','群体の時代','群れの時代','知性の時代','集落の時代','文明の時代'][l.stage];
    $('epoch').textContent='着水から '+format(s.years);$('step').disabled=$('auto').disabled=busy||!s.started;
    $('pour').disabled=$('restart').disabled=busy;$('pour').textContent=busy?'着水を観測中…':'中央に一滴落とす';
    $('condition').textContent=!s.started?'惑星の好きな場所を長押しして離してください。周辺惑星は今から観測できます。':!s.water?'もう一滴落とすと、水の循環が戻ります。':habitats[b]+'。'+(l.stage<2?'保護する生息地を選ぶと、群れの姿が変わります。':l.stage<4?'時間を進めて、この星の生物の暮らしを観察しましょう。':l.path<0?'評議会が開かれました。「生命と文明」で将来の方針を選べます。':'周辺惑星に探査艇を送れます。');
    renderLiving();
    $('events').replaceChildren(...s.events.slice().sort((a,b)=>(b.year??b.age*million)-(a.year??a.age*million)).map(e=>{const li=document.createElement('li'),time=document.createElement('time');time.textContent=format(e.year??e.age*million);li.append(time,String(e.text));return li}));
    $('finds').replaceChildren(...(s.finds.length?s.finds:['まだ発見されていません']).map(n=>{const li=document.createElement('li');li.textContent=n;return li}));
    view.update({...s,civil:s.life.stage>=4&&s.water>0},splash);
  }
  if(!s.life&&s.started){
    LivingWorld.ensure(s);
    const inherited=s.civil?Math.max(12*million,s.stableYears):s.stableYears;
    LivingWorld.step(s,environment(),0,inherited,()=>{});
  }
  const renderLiving=LivingWorld.setup(()=>({s,b:environment(),busy}), (title,text)=>{add(text);report(title,text);render()},save);
  view.bind(pour);$('pour').onclick=()=>pour(view.center(),.45);
  for(const btn of document.querySelectorAll('[data-span]'))btn.onclick=()=>{$('years').value=btn.dataset.span;s.span=Number(btn.dataset.span);save()};
  $('years').onchange=()=>{if($('years').validity.valid&&$('years').value){s.span=Number($('years').value);save()}};
  $('years').required=true;
  $('auto').onclick=()=>toggleAuto(!timer);$('step').onclick=advance;
  $('restart').onclick=()=>{if(!confirm('現在の惑星と日誌を手放して、新しい惑星を育てますか？'))return;toggleAuto(false);s=blank();clipVersion++;if(clipURL)URL.revokeObjectURL(clipURL);clipURL=null;$('watchLanding').hidden=true;$('report').hidden=true;$('years').value=s.span;$('restart').closest('details').open=false;render();save();$('pour').focus()};
  render();save();
})();
