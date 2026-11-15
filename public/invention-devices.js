const DeviceLab=(()=>{
  const {items,maxRange,effect}=WorkshopStock;
  const stages=d=>[items.intake[d.intake],items.drive[d.drive],items.output[d.output]];
  function timing(d){
    const [i,m,o]=stages(d),a=350-i.tier*35,b=310+m.tier*58,c=425/(1+o.tier*.12);
    return {duration:a+b+c,entry:a/(a+b+c),release:(a+b)/(a+b+c),hits:1+m.tier};
  }
  function cues(d){
    const {entry,release,hits}=timing(d);
    return [entry*.7,...Array.from({length:hits},(_,i)=>entry+(release-entry)*(i+.35)/hits),release];
  }
  const directions=Workshop.dirs, slot='workshop.blueprints.v1';
  let designs=[];
  try {
    const saved=JSON.parse(localStorage.getItem(slot)||'[]');
    if(Array.isArray(saved))designs=saved.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string'&&Object.hasOwn(items.intake,d.intake)&&Object.hasOwn(items.drive,d.drive)&&Object.hasOwn(items.output,d.output)&&[0,1,-1].includes(d.turn)&&Number.isInteger(d.range)&&d.range>=1&&d.range<=maxRange(items.output[d.output]));
  }catch{}
  function draft(){
    const val=id=>document.getElementById(id).value;
    const intake=val('intake'),drive=val('drive'),output=val('output');
    return {name:val('deviceName').trim()||items.intake[intake].name+'式'+items.drive[drive].name,intake,drive,output,turn:items.intake[intake].base==='rail'?0:Number(val('turn')),range:items.output[output].base==='rail'?1:Number(val('range'))};
  }
  function draw(c,d,dir=0,t=0){
    const entry=(dir-d.turn+4)%4;
    c.save();c.rotate(dir*Math.PI/2);
    const metal=c.createLinearGradient(0,-16,0,16);metal.addColorStop(0,'#b3935f');metal.addColorStop(.4,'#314d44');metal.addColorStop(1,'#162e27');
    c.fillStyle='#372419';c.beginPath();c.roundRect(-23,-14,47,33,4);c.fill();c.beginPath();c.roundRect(-23,-16,47,33,4);c.fillStyle=metal;c.fill();
    const [i,m,o]=stages(d),{entry:end,release,hits}=timing(d);
    const inner=Math.min(1,Math.max(0,(t-end)/(release-end)));
    for(const [part,x,y,angle,s,phase] of [[i,-11,0,(entry-dir)*Math.PI/2,.47,Math.min(1,t/end)],[o,14,3,0,.49,Math.max(0,(t-release)/(1-release))],[m,-1,-3,0,.42,(inner*hits)%1]]){
      c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);
      WorkshopArt.draw(c,part.base,0,phase);
      if(part.tier){
        c.fillStyle=['#b48a51','#c2bfac','#ad714c','#7ea793','#bcc8d3','#efc46e'][part.tier-1];
        c.beginPath();c.arc(1,10,6,0,Math.PI*2);c.fill();c.strokeStyle='#463d31';c.lineWidth=2;c.beginPath();
        const theta=phase*Math.PI*2;c.moveTo(1,10);c.lineTo(1+4*Math.cos(theta),10+4*Math.sin(theta));c.stroke();
      }
      c.restore();
    }
    c.restore();
  }
  function sample(d,dir,t){
    const [ix,iy]=directions[(dir-d.turn+4)%4],[dx,dy]=directions[dir];
    const {entry,release}=timing(d),out=items.output[d.output];
    let x,y,z=0;
    if(t<entry){
      const u=t/entry;x=-ix*32*(1-u);y=-iy*32*(1-u);
    }else if(t<release){
      const u=(t-entry)/(release-entry);x=dx*9*u*u;y=dy*9*u*u;
    }else{
      const u=(t-release)/(1-release),dist=9+(64*d.range-41)*u;
      x=dx*dist;y=dy*dist;if(out.base==='spring')z=4*(12+7*d.range)*(1+out.tier*.12)*u*(1-u);
    }
    return {action:t,balls:[{x,y,z,r:4.2}]};
  }
  function describe(d){return stages(d).map(p=>p.name).join(' → ')+' ／ '+({'0':'直進','1':'右折','-1':'左折'}[d.turn])+'・'+d.range+'マス先へ';}
  function init(select){
    const el=id=>document.getElementById(id),dialog=el('designer'),preview=el('blueprintView'),shelf=el('designShelf');
    function stock(){
      for(const [id,choices] of Object.entries(items)){
        const field=el(id),old=field.value;
        field.replaceChildren(...Object.values(choices).filter(WorkshopMarket.available).map(p=>new Option(p.name,p.id)));
        if(choices[old]&&WorkshopMarket.available(choices[old]))field.value=old;
      }
    }
    let testFrame;
    function previewDesign(){
      cancelAnimationFrame(testFrame);
      const out=items.output[el('output').value],field=el('range'),last=Number(field.value)||1;
      field.replaceChildren(...Array.from({length:maxRange(out)},(_,i)=>new Option((i+1)+'マス先',i+1)));
      field.value=Math.min(last,maxRange(out));
      const d=draft();el('turn').disabled=items.intake[d.intake].base==='rail';field.disabled=out.base==='rail';
      const c=preview.getContext('2d');c.clearRect(0,0,preview.width,preview.height);c.save();c.translate(90,56);c.scale(2.7,2.7);draw(c,d);c.restore();el('spec').textContent=describe(d)+' ／ '+effect(items.drive[d.drive]);
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
        const t=Math.min(1,(now-start)/timing(d).duration);
        c.clearRect(0,0,180,112);c.save();const zoom=Math.min(1.65,167/(40+64*d.range));
        c.translate(8+34*zoom,56);c.scale(zoom,zoom);draw(c,d,0,t);
        for(const b of sample(d,0,t).balls)WorkshopArt.ball(c,b.x,b.y-b.z,b.r);
        c.restore();
        if(t<1)testFrame=requestAnimationFrame(test);
      }
      testFrame=requestAnimationFrame(test);
    };
    dialog.onclose=()=>cancelAnimationFrame(testFrame);
    renderShelf();el('openDesign').onclick=()=>{stock();dialog.showModal();previewDesign()};
    el('closeDesign').onclick=()=>dialog.close();dialog.onchange=previewDesign;
    el('deviceForm').onsubmit=e=>{e.preventDefault();const d={...draft(),id:crypto.randomUUID()};designs.push(d);
      let saved=true;try{localStorage.setItem(slot,JSON.stringify(designs))}catch{saved=false}
      renderShelf();dialog.close();pick(d);window.dispatchEvent(new CustomEvent('workshop-design-saved',{detail:d.id}));
      if(!saved)el('status').textContent+=' このブラウザでは設計図を保存できません。';
    };
    WorkshopArt.ready.then(()=>{if(dialog.open)previewDesign()});
  }
  return {init,draw,sample,describe,stages,timing,cues,saved:()=>designs.slice()};
})();
