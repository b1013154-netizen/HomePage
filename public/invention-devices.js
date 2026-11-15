const DeviceLab=(()=>{
  const intakes={rail:'直進レール',bend:'曲線ガイド',lever:'旋回レバー'};
  const drives={bell:'音板カム',domino:'ドミノ留め金',rail:'搬送ローラー'};
  const outputs={rail:'送りレール',spring:'ばね射出筒'};
  const directions=Workshop.dirs, slot='workshop.blueprints.v1';
  let designs=[];
  try {
    const saved=JSON.parse(localStorage.getItem(slot)||'[]');
    if(Array.isArray(saved))designs=saved.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string'&&Object.hasOwn(intakes,d.intake)&&Object.hasOwn(drives,d.drive)&&Object.hasOwn(outputs,d.output)&&[0,1,-1].includes(d.turn)&&[1,2,3].includes(d.range));
  }catch{}
  function draft(){
    const val=id=>document.getElementById(id).value;
    const intake=val('intake'),drive=val('drive'),output=val('output');
    return {name:val('deviceName').trim()||intakes[intake]+'式'+drives[drive],intake,drive,output,turn:intake==='rail'?0:Number(val('turn')),range:output==='rail'?1:Number(val('range'))};
  }
  function draw(c,d,dir=0,t=0){
    const entry=(dir-d.turn+4)%4;
    c.save();c.rotate(dir*Math.PI/2);
    const metal=c.createLinearGradient(0,-16,0,16);metal.addColorStop(0,'#b3935f');metal.addColorStop(.4,'#314d44');metal.addColorStop(1,'#162e27');
    c.fillStyle='#372419';c.beginPath();c.roundRect(-23,-14,47,33,4);c.fill();c.beginPath();c.roundRect(-23,-16,47,33,4);c.fillStyle=metal;c.fill();
    for(const [part,x,y,angle,s] of [[d.intake,-11,0,(entry-dir)*Math.PI/2,.47],[d.output,14,3,0,.49],[d.drive,-1,-3,0,.42]]){
      c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);
      const phase=part===d.drive?Math.min(1,Math.max(0,(t-.27)/.35)):Math.max(0,Math.sin(Math.PI*Math.min(1,t/.65)));
      WorkshopArt.draw(c,part,0,phase);c.restore();
    }
    c.restore();
  }
  function sample(d,dir,t){
    const [ix,iy]=directions[(dir-d.turn+4)%4],[dx,dy]=directions[dir];
    let x,y,z=0;
    if(t<.35){
      const u=t/.35;x=-ix*32*(1-u);y=-iy*32*(1-u);
    }else if(t<.62){
      const u=(t-.35)/.27;x=dx*9*u*u;y=dy*9*u*u;
    }else{
      const u=(t-.62)/.38,dist=9+(64*d.range-41)*u;
      x=dx*dist;y=dy*dist;if(d.output==='spring')z=4*(12+7*d.range)*u*(1-u);
    }
    return {action:t,balls:[{x,y,z,r:4.2}]};
  }
  function describe(d){return intakes[d.intake]+' → '+drives[d.drive]+' → '+outputs[d.output]+' ／ '+({'0':'直進','1':'右折','-1':'左折'}[d.turn])+'・'+d.range+'マス先へ';}
  function init(select){
    const el=id=>document.getElementById(id),dialog=el('designer'),preview=el('blueprintView'),shelf=el('designShelf');
    for(const [id,choices] of Object.entries({intake:intakes,drive:drives,output:outputs}))for(const [v,n] of Object.entries(choices))el(id).add(new Option(n,v));
    let testFrame;
    function previewDesign(){
      cancelAnimationFrame(testFrame);
      const d=draft();el('turn').disabled=d.intake==='rail';el('range').disabled=d.output==='rail';
      const c=preview.getContext('2d');c.clearRect(0,0,preview.width,preview.height);c.save();c.translate(90,56);c.scale(2.7,2.7);draw(c,d);c.restore();el('spec').textContent=describe(d);
    }
    function pick(d){
      select(d);
      for(const b of shelf.children)b.setAttribute('aria-pressed',b.dataset.id===d.id);
    }
    function renderShelf(){
      shelf.replaceChildren();for(const d of designs){
        const b=document.createElement('button');b.type='button';b.textContent=d.name;b.dataset.id=d.id;b.title=describe(d);b.onclick=()=>pick(d);shelf.append(b);
      }
    }
    el('trial').onclick=()=>{
      previewDesign();const d=draft(),start=performance.now(),c=preview.getContext('2d');
      // Fit the whole flight, including the three-cell spring throw.
      function test(now){
        if(!dialog.open)return;
        const t=Math.min(1,(now-start)/1500);
        c.clearRect(0,0,180,112);c.save();const zoom=Math.min(1.65,167/(40+64*d.range));
        c.translate(8+34*zoom,56);c.scale(zoom,zoom);draw(c,d,0,t);
        for(const b of sample(d,0,t).balls)WorkshopArt.ball(c,b.x,b.y-b.z,b.r);
        c.restore();
        if(t<1)testFrame=requestAnimationFrame(test);
      }
      testFrame=requestAnimationFrame(test);
    };
    dialog.onclose=()=>cancelAnimationFrame(testFrame);
    renderShelf();el('openDesign').onclick=()=>{dialog.showModal();previewDesign()};
    el('closeDesign').onclick=()=>dialog.close();dialog.onchange=previewDesign;
    el('deviceForm').onsubmit=e=>{e.preventDefault();const d={...draft(),id:crypto.randomUUID()};designs.push(d);
      let saved=true;try{localStorage.setItem(slot,JSON.stringify(designs))}catch{saved=false}
      renderShelf();dialog.close();pick(d);
      if(!saved)el('status').textContent+=' このブラウザでは設計図を保存できません。';
    };
    WorkshopArt.ready.then(()=>{if(dialog.open)previewDesign()});
  }
  return {init,draw,sample,describe};
})();
