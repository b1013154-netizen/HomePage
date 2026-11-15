const WorkshopMarket=(()=>{
  const {items,goods,sections,effect}=WorkshopStock,$=id=>document.getElementById(id);
  const key='workshop.account.1';
  const rewardFor=i=>20+Math.floor(i/5)*3;
  function read(){
    const raw=localStorage.getItem(key);
    if(raw)return JSON.parse(raw);
    const old=[...new Set(JSON.parse(localStorage.getItem('workshop.solved')||'[]'))].filter(i=>Number.isInteger(i)&&i>=0&&i<28);
    return {coins:old.reduce((n,i)=>n+rewardFor(i),0),owned:[],cleared:old};
  }
  let account;
  try{account=read();if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(account))}catch{account={coins:0,owned:[],cleared:[]}}
  let section='intake',sceneTimer;
  function refresh(){
    $('wallet').textContent=account.coins+' コイン';$('shopBalance').textContent='所持 '+account.coins+' コイン';
    $('wares').replaceChildren();
    for(const item of goods.filter(g=>g.section===section)){
      const row=document.createElement('article'),desc=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('small'),button=document.createElement('button');
      const icon=document.createElement('canvas');icon.width=72;icon.height=60;icon.setAttribute('aria-hidden','true');
      const c=icon.getContext('2d');c.translate(36,30);WorkshopArt.draw(c,item.base);
      title.textContent=item.name;meta.textContent=effect(item);desc.append(title,meta);
      const owned=account.owned.includes(item.id);
      button.textContent=owned?'購入済':item.price+' コイン';button.disabled=owned||account.coins<item.price;
      button.onclick=()=>purchase(item);row.append(icon,desc,button);$('wares').append(row);
    }
  }
  async function change(fn){
    async function update(){
      try{account=read()}catch{}
      const result=fn(account);
      try{localStorage.setItem(key,JSON.stringify(account))}catch{$('shopNote').textContent='このブラウザでは進行を保存できません。'}
      refresh();return result;
    }
    return navigator.locks?navigator.locks.request(key,update):update();
  }
  async function purchase(item){
    const ok=await change(a=>{
      if(a.owned.includes(item.id)||a.coins<item.price)return false;
      a.coins-=item.price;a.owned.push(item.id);return true;
    });
    if(ok){$('shopNote').textContent=item.name+' を購入。装置の設計で何度でも使えます。';WorkshopMusic.chime()}
  }
  function scene(kind,title,detail){
    clearTimeout(sceneTimer);const el=$('workshopFilm');el.className='';void el.offsetWidth;
    $('filmTitle').textContent=title;$('filmDetail').textContent=detail;el.className='show '+kind;
    sceneTimer=setTimeout(()=>{el.className=''},1900);
  }
  async function victory(plan){
    const gain=await change(a=>{
      const first=!a.cleared.includes(plan.index),n=first?rewardFor(plan.index):5;
      if(first)a.cleared.push(plan.index);a.coins+=n;return n;
    });
    scene('victory','検査合格','＋'+gain+' コイン');WorkshopMusic.chime();return gain;
  }
  function init(){
    refresh();WorkshopArt.ready.then(refresh);
    for(const [id,name] of Object.entries(sections))$('shopSection').add(new Option(name,id));
    $('shopSection').onchange=e=>{section=e.target.value;refresh()};
    $('openShop').onclick=()=>{
      $('market').showModal();const el=$('shopArrival');el.classList.remove('arrival');void el.offsetWidth;el.classList.add('arrival');WorkshopMusic.chime();
    };
    $('closeShop').onclick=()=>$('market').close();
    window.addEventListener('storage',e=>{if(e.key===key){try{account=read();refresh()}catch{}}});
  }
  return {init,victory,reward:i=>account.cleared.includes(i)?5:rewardFor(i),available:item=>!item.price||account.owned.includes(item.id)};
})();
