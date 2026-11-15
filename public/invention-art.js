const WorkshopArt = (() => {
  function draw(c,type,direction=0,progress=0,goal=0){
    c.save(); c.rotate(direction*Math.PI/2);
    const metal=(y,h,colors=['#694927','#fae6a6','#bc894a','#53361b'])=>{
      const g=c.createLinearGradient(0,y,0,y+h);
      colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g;
    };
    function box(x,y,w,h,fill,r=2){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill()}
    function line(points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()}
    function disc(x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()}
    const brass=metal(-16,32), steel=metal(-14,28,['#414943','#f4faf2','#81928e','#343c39']);
    const active=Math.sin(Math.PI*progress);
    c.shadowColor='#24180f99';c.shadowBlur=2;c.shadowOffsetY=2;
    if(type==='goal'){
      box(-21,11,42,8,brass);
      if(goal===0){c.save();c.rotate(active*.31);c.beginPath();c.moveTo(-17,8);c.bezierCurveTo(-10,0,-16,-16,0,-16);c.bezierCurveTo(16,-16,10,0,17,8);c.closePath();c.fillStyle=brass;c.fill();disc(0,10,3,'#9e682a');c.restore()}
      if(goal===1){box(-3,-9,6,23,brass);if(progress){c.shadowColor='#ffdb70';c.shadowBlur=18}disc(0,-9,12,progress?'#ffeaa0':'#9fae91');box(-6,0,12,5,steel)}
      if(goal===2){box(-10,-20,3,34,brass);box(-7,-7-12*progress,21,11,'#c34f34')}
      if(goal===3){box(-2,-7,4,22,brass);c.rotate(progress*Math.PI*3);for(let n=0;n<4;n++){box(0,-4,18,7,brass);c.rotate(Math.PI/2)}disc(0,0,4,steel)}
      if(goal===4){box(-14,-11,28,23,brass,8);line([[10,0],[20,-9],[23,-9]],'#d4ad6d',5);box(-9,-14,18,4,steel);if(progress)for(let n=0;n<3;n++)line([[16+n*2,-13],[13+n*3,-17-progress*4],[17+n*2,-22-progress*6]],'#fbf2db',1.5)}
    }else if(type==='erase'){line([[-11,-11],[11,11]],'#995441',5);line([[11,-11],[-11,11]],'#995441',5)}
    else{
      box(-22,-12,44,24,type==='start'?'#3c6651':'#553d2b',4);
      if(type==='rail'||type==='start'){for(const y of [-10,6])box(-24,y,48,4,metal(y,4));if(type==='start'&&!progress)ball(c,-9,0,9)}
      if(type==='bend'){disc(0,0,18,brass);disc(0,0,14,metal(-14,28,['#485b50','#9b9e7c','#526052']));box(7,-8,17,16,steel)}
      if(type==='domino'){for(let n=0;n<5;n++){const tilt=Math.min(1,Math.max(0,progress*6-n));c.save();c.translate(-17+n*7,7);c.transform(1,0,-tilt*.58,1-tilt*.3,0,0);box(-2,-20,5,22,metal(-13,20,['#faf2d7','#b5a58a','#746853']),1);disc(.2,-9,1,'#4e423c');c.restore()}}
      if(type==='spring'){box(-21,-10,5,20,steel);const zig=[];for(let i=0;i<13;i++)zig.push([-15+i*(2.4+active*.35),i%2?-7:7]);line(zig,'#414b48',4);line(zig,'#d7e3db',1.4)}
      if(type==='lever'){c.save();c.rotate(-.22+active*.5);box(-23,-4,46,8,brass);disc(-17,-5,5,steel);c.restore();disc(0,1,5,steel)}
      if(type==='bell'){for(let n=0;n<3;n++)box(-13+n*9,-12-active*2,6,24,brass);line([[-16,10],[5,-6+active*7]],'#645744',3);disc(5,-6+active*7,4,steel)}
      c.shadowBlur=0;c.shadowOffsetY=0;line([[16,-3],[20,0],[16,3]],'#fff4be',1.9);
    }
    c.restore();
  }
  function ball(c,x,y,r){const g=c.createRadialGradient(x-r*.35,y-r*.5,r*.05,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.23,'#e5ede8');g.addColorStop(.5,'#60756c');g.addColorStop(.72,'#354638');g.addColorStop(1,'#bfc7ad');c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=g;c.fill()}
  return {draw,ball};
})();
