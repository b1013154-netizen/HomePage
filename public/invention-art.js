const WorkshopArt = (() => {
  function drawFallback(c,type,direction=0,progress=0,goal=0){
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
  const pieces=new Image(), devices=new Image();
  pieces.src='/assets/invention-components.webp';
  devices.src='/assets/invention-devices.webp';
  const ready=Promise.allSettled([pieces.decode(),devices.decode()]);
  // Source rectangles are measured on a half-size contact sheet.
  const crops={
    rail:[5,58,155,74],bend:[162,28,151,123],domino:[317,33,163,99],
    lever:[2,204,156,77],spring:[162,201,159,81],bell:[326,172,153,128],
    start:[320,154,158,161]
  };
  const targets=[[15,12,140,142],[177,2,130,151],[334,2,140,151],[23,156,131,160],[163,158,148,157]];
  function draw(c,type,direction=0,progress=0,goal=0){
    const endpoint=type==='goal'||type==='start',image=endpoint?devices:pieces;
    const crop=type==='goal'?targets[goal]:crops[type];
    if(!crop||!image.complete||!image.naturalWidth){drawFallback(c,type,direction,progress,goal);return}
    const [x,y,w,h]=crop,scale=Math.min(58/w,(endpoint?46:51)/h);
    const active=Math.sin(Math.PI*progress), sourceScale=image.naturalWidth/480;
    c.save();c.rotate(direction*Math.PI/2);c.scale(scale,scale);
    c.translate(-w/2,-h/2-(endpoint?2/scale:0));
    function slice(left,top,width,height){
      c.drawImage(image,(x+left)*sourceScale,(y+top)*sourceScale,width*sourceScale,height*sourceScale,left,top,width,height);
    }
    if(type==='domino'&&progress>0){
      const seam=h*.78;
      slice(0,seam,w,h-seam);
      for(let i=0;i<5;i++){
        const width=w/5,tilt=Math.max(0,Math.min(1,progress*6-i));
        c.save();c.translate(0,seam);c.transform(1,0,-.34*tilt,1-.65*tilt,0,0);c.translate(0,-seam);
        slice(i*width,0,width,seam);c.restore();
      }
    }else if(type==='lever'&&progress>0){
      slice(0,h*.48,w,h*.52);c.translate(w/2,h*.38);c.rotate(active*.24);c.translate(-w/2,-h*.38);slice(0,0,w,h*.53);
    }else if(type==='goal'&&goal===3&&progress>0){
      const pivotX=w*.53,pivotY=h*.33,r=h*.33;
      c.save();c.beginPath();c.rect(0,0,w,h);c.arc(pivotX,pivotY,r,0,2*Math.PI);c.clip('evenodd');slice(0,0,w,h);c.restore();
      c.translate(pivotX,pivotY);c.rotate(progress*Math.PI*2);c.beginPath();c.arc(0,0,r,0,2*Math.PI);c.clip();c.translate(-pivotX,-pivotY);slice(0,0,w,h);
    }else{
      if(type==='spring')c.scale(1-.17*active,1);
      if(type==='bell')c.translate(0,-active*2);
      if(type==='goal'&&goal===0){c.translate(w/2,h*.87);c.rotate(Math.sin(progress*20)*active*.12);c.translate(-w/2,-h*.87)}
      if(type==='goal'&&goal===2){c.translate(w*.28,h*.8);c.transform(1,0,active*.14,1+.06*active,0,0);c.translate(-w*.28,-h*.8)}
      slice(0,0,w,h);
      if(type==='goal'&&goal===1&&progress){
        const glow=c.createRadialGradient(w*.53,h*.3,0,w*.53,h*.3,w*.68);
        glow.addColorStop(0,'#ffe09ec9');glow.addColorStop(1,'#fff0a000');c.fillStyle=glow;c.fillRect(-w*.2,-h*.32,w*1.5,h*1.3);
      }
      if(type==='goal'&&goal===4&&progress){
        c.strokeStyle='#fff4dbc9';c.lineWidth=3;
        for(let i=0;i<3;i++){const drift=Math.sin(progress*9+i)*5;c.beginPath();c.moveTo(w*.89+i*3,h*.39);c.bezierCurveTo(w*.85+drift,h*.24,w*.99-drift,h*.17,w*.9+drift,h*(.15-progress*.17));c.stroke()}
      }
    }
    c.restore();
    if(type!=='goal'){
      c.save();c.rotate(direction*Math.PI/2);c.fillStyle='#31281c';c.strokeStyle='#ffe7aa';c.lineWidth=1.2;
      c.beginPath();c.moveTo(22,-4.5);c.lineTo(30,0);c.lineTo(22,4.5);c.closePath();c.fill();c.stroke();c.restore();
    }
  }
  return {draw,ball,ready};
})();
