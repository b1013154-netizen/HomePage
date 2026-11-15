const WorkshopMusic=(()=>{
  const chords=[[50,57,62,65],[43,55,59,64],[48,55,60,64],[45,57,61,67],[46,53,58,62],[43,55,58,65],[45,52,61,64],[50,57,62,65]];
  const melody=[[74,77,76],[71,69,67],[72,76,79],[76,73,69],[70,74,77],[79,77,74],[73,76,69],[74,0,0]];
  let ctx,bus,timer,step=0,next=0,activated=false,enabled=true,volume=.33;
  try{enabled=localStorage.getItem('workshop.music')!=='off';const saved=localStorage.getItem('workshop.volume');if(saved!==null)volume=Math.min(1,Math.max(0,Number(saved)||0))}catch{}
  function note(midi,time,len,gain,wave='sine'){
    const osc=ctx.createOscillator(),env=ctx.createGain();osc.type=wave;osc.frequency.value=440*2**((midi-69)/12);
    env.gain.setValueAtTime(.0001,time);env.gain.exponentialRampToValueAtTime(gain,time+.012);env.gain.exponentialRampToValueAtTime(.0001,time+len);
    osc.connect(env).connect(bus);osc.start(time);osc.stop(time+len+.02);
  }
  function schedule(){
    if(ctx.state!=='running')return;
    if(next<ctx.currentTime)next=ctx.currentTime+.03;
    while(next<ctx.currentTime+.25){
      const bar=Math.floor(step/6)%8,pulse=step%6,c=chords[bar];
      if(!pulse)note(c[0],next,.86,.22,'triangle');
      if(pulse===2||pulse===4){note(c[2],next,.56,.10,'triangle');note(c[3],next+.022,.51,.065)}
      if(pulse%2===0){const pitch=melody[bar][pulse/2];if(pitch){note(pitch,next+.035,.72,.18);note(pitch+12,next+.038,.24,.036)}}
      next+=.29;step++;
    }
  }
  async function sync(){
    clearInterval(timer);timer=null;
    if(!activated||document.hidden||!enabled){if(ctx)await ctx.suspend().catch(()=>{});return}
    try{
      if(!ctx){ctx=new AudioContext();bus=ctx.createGain();bus.connect(ctx.destination)}
      bus.gain.value=volume*.28;await ctx.resume();
      if(!enabled||document.hidden)return;
      clearInterval(timer);next=ctx.currentTime+.035;schedule();timer=setInterval(schedule,100);
    }catch{}
  }
  function chime(){if(ctx?.state==='running'&&enabled)[74,78,81].forEach((n,i)=>note(n,ctx.currentTime+.02+i*.075,.42,.14))}
  function init(){
    const toggle=document.getElementById('bgm'),slider=document.getElementById('bgmLevel');
    function label(){toggle.textContent='BGM '+(enabled?'オン':'オフ');toggle.setAttribute('aria-pressed',enabled)}
    function activate(){if(!activated){activated=true;sync()}}
    document.addEventListener('click',activate,{once:true});document.addEventListener('keydown',activate,{once:true});
    toggle.onclick=()=>{activated=true;enabled=!enabled;try{localStorage.setItem('workshop.music',enabled?'on':'off')}catch{}label();sync()};
    slider.value=Math.round(volume*100);slider.oninput=()=>{volume=slider.value/100;if(bus)bus.gain.setTargetAtTime(volume*.28,ctx.currentTime,.03);try{localStorage.setItem('workshop.volume',volume)}catch{}};
    label();document.addEventListener('visibilitychange',sync);
  }
  return {init,chime};
})();
