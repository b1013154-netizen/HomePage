function createPlanetView(canvas){
  const c=canvas.getContext('2d'),surface=document.createElement('canvas'),g=surface.getContext('2d');
  let orbital=createOrbitalRenderer();
  const W=1024,H=512,T=W*H,N=512,P=N*N,TAU=2*Math.PI;
  surface.width=surface.height=N;
  const img=g.createImageData(N,N),pixels=img.data,height=new Float32Array(T),mist=new Float32Array(T),grit=new Float32Array(T),colors=new Uint8ClampedArray(T*3),cities=new Uint8Array(T);
  const lon=new Float32Array(P),row=new Int32Array(P),light=new Float32Array(P),rim=new Float32Array(P);
  let state,seed=-1,signature='',yaw=.15,pitch=.12,lastPitch=NaN,drag=null;
  let basinKey='',basins,siteList;
  let flight=null,press=null,onPour=()=>{},locked=false;
  const radius=()=>Math.min(w*.335,h*.365);
  function project(nx,ny){
    const z=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),lat=Math.asin(ny*Math.cos(pitch)+z*Math.sin(pitch)),lng=Math.atan2(nx,z*Math.cos(pitch)-ny*Math.sin(pitch))+yaw*TAU;
    return {nx,ny,lat:lat*180/Math.PI,site:[Math.cos(lat)*Math.cos(lng),Math.sin(lat),Math.cos(lat)*Math.sin(lng)]};
  }
  let frame=0,last=0,w=0,h=0,visible=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mix=(a,b,t)=>a+(b-a)*t;
  function terrain(s){
    let n=s>>>0;
    const table=new Float32Array(8192);for(let j=0;j<table.length;j++){n=(Math.imul(n,1664525)+1013904223)>>>0;table[j]=n/4294967296}
    function noise(x,y,z){
      const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z);x-=X;y-=Y;z-=Z;
      x=x*x*(3-2*x);y=y*y*(3-2*y);z=z*z*(3-2*z);
      const k=X+Y*83+Z*521;
      const a=mix(table[k&8191],table[(k+1)&8191],x),b=mix(table[(k+83)&8191],table[(k+84)&8191],x);
      const d=mix(table[(k+521)&8191],table[(k+522)&8191],x),e=mix(table[(k+604)&8191],table[(k+605)&8191],x);
      return mix(mix(a,b,y),mix(d,e,y),z);
    }
    for(let j=0;j<H;j++){
      const a=(j/H-.5)*Math.PI,cy=Math.sin(a),r=Math.cos(a);
      for(let i=0;i<W;i++){
        const b=i/W*TAU,x=r*Math.cos(b),z=r*Math.sin(b),k=j*W+i;
        const warp=noise(x*3+11,cy*3,z*3)*1.6;
        const coarse=noise(x*2.1+warp,cy*2.1+4,z*2.1),fine=noise(x*24,cy*24,z*24);
        height[k]=coarse*.53+noise(x*5+warp,cy*5,z*5)*.26+noise(x*12,cy*12,z*12)*.13+fine*.08;
        grit[k]=fine*.6+noise(x*76,cy*76,z*76)*.4;
        mist[k]=noise(x*5+warp,cy*12,z*5)*.62+noise(x*18,cy*34,z*18)*.38;
      }
    }
  }
  function texture(){
    const {water,temp,age,gravity}=state,sea=water===0?-1:.17+water*.0067;
    for(let k=0;k<T;k++){
      const lake=basins[(Math.floor(k/W)>>2)*256+((k%W)>>2)]/255*.38;
      const v=height[k]-lake,f=grit[k],lat=Math.abs((Math.floor(k/W)/H-.5)*2);
      const local=temp-48*lat**2-50*Math.max(0,v-.6);
      let rgb;
      if(water&&local< -8)rgb=[174,201,203];
      else if(v<sea)rgb=v<sea-.085?[16,65,95]:[28,123,138];
      else if(v<sea+.018)rgb=[196,173,120];
      else if(local>39||!age||water<15)rgb=[162,111,76];
      else if(age>=3&&v<.65)rgb=local>18?[52,111,72]:[86,115,80];
      else rgb=[149,139,108];
      if(v>.68&&local>=-8)rgb=[141,134,125];
      const relief=1+(v-.5)*.58+(f-.5)*.42+(v-height[(k+1)%T])*5;
      const cloud=age&&water>8?Math.min(.84,Math.max(0,(mist[k]-.67)*4)*(water/80+.22)*Math.min(1.3,gravity)):0;
      for(let ch=0;ch<3;ch++)colors[3*k+ch]=mix(rgb[ch]*relief,234,cloud);
      cities[k]=state.civil&&v>sea&&v<sea+.065&&f>.66&&mist[k]<.59?1:0;
    }
  }
  function geometry(){
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){
      const p=j*N+i,x=(i+.5-N/2)/(N/2-1),y=(N/2-j-.5)/(N/2-1),d=x*x+y*y;
      if(d>=1){row[p]=-1;continue}
      const z=Math.sqrt(1-d);
      lon[p]=Math.atan2(x,z*Math.cos(pitch)-y*Math.sin(pitch))/TAU;
      row[p]=Math.min(H-1,Math.floor((.5+Math.asin(Math.max(-1,Math.min(1,y*Math.cos(pitch)+z*Math.sin(pitch))))/Math.PI)*H))*W;
      light[p]=.12+.97*Math.max(0,-.61*x+.48*y+.53*z);
      rim[p]=Math.pow(1-z,4)*.66;
    }
    lastPitch=pitch;
  }
  function paint(now){
    const R=radius(),x=w/2,y=h*.49;
    const gpu=orbital&&orbital.draw(state,yaw,pitch,Math.max(64,Math.min(1600,Math.round(2*R*Math.min(devicePixelRatio,2)))),now,basins);
    if(!gpu){
    if(orbital){orbital=null;terrain(state.seed);texture()}
    if(lastPitch!==pitch)geometry();
    for(let p=0;p<P;p++){
      const off=p*4;if(row[p]<0){pixels[off+3]=0;continue}
      const k=row[p]+((Math.floor((lon[p]+yaw)*W)%W+W)%W),s=light[p],glow=rim[p],lamp=cities[k]&&s<.48?(1-s/.48)*195:0;
      pixels[off]=colors[k*3]*s+glow*97+lamp;pixels[off+1]=colors[k*3+1]*s+glow*166+lamp*.73;pixels[off+2]=colors[k*3+2]*s+glow*185+lamp*.28;pixels[off+3]=255;
    }
    g.putImageData(img,0,0);}
    c.clearRect(0,0,w,h);
    for(let i=1;i<97;i++){const x=(Math.sin(i*94.1)*17453.5%1+1)%1*w,y=(Math.sin(i*56.7)*18362.3%1+1)%1*h;c.fillStyle='rgba(217,235,223,'+(.2+(i%7)/13)+')';c.fillRect(x,y,i%9===0?1.8:1,i%9===0?1.8:1)}

    const atm=c.createRadialGradient(x,y,R*.94,x,y,R*1.17);atm.addColorStop(0,'#7db9b57a');atm.addColorStop(.35,'#72a6a337');atm.addColorStop(1,'#61979800');c.fillStyle=atm;c.fillRect(x-R*1.18,y-R*1.18,R*2.36,R*2.36);
    c.save();c.translate(x,y);c.rotate(-.25);c.strokeStyle='#9bc2b83d';c.lineWidth=.8;c.beginPath();c.ellipse(0,0,R*1.39,R*.49,0,0,TAU);c.stroke();c.restore();
    c.drawImage(gpu?orbital.canvas:surface,x-R,y-R,2*R,2*R);
    if(state.life?.stage&&state.water>0)drawColonies(now,x,y,R);
    if(press&&!press.moved&&press.target){
      const {nx,ny}=press.target,amount=Math.min(1,(now-press.time)/1300);
      const tx=x+nx*R,ty=y-ny*R;
      pipette(tx-18,ty-Math.min(R*.92,ty-8)-9,amount,1);
      c.strokeStyle='#d8fff2';c.lineWidth=2;c.beginPath();c.arc(x+nx*R,y-ny*R,11,-Math.PI/2,(-.5+2*Math.max(.08,amount))*Math.PI);c.stroke();
    }
    if(flight)drawPour(now,x,y,R);
  }
  // Project survey markers from the surface; occult colonies on the far side.
  function drawColonies(now,cx,cy,R){
    const l=state.life,clock=reduced.matches?0:now*.00055;
    const base=state.sites[0]?.site||[1,0,0];
    const longitude=Math.atan2(base[2],base[0]),latitude=Math.asin(base[1]);
    for(let i=0;i<Math.min(11,2+l.stage*2);i++){
      const roaming=l.stage>=2&&i%3!==0;
      const lng=longitude+(i===0?0:i*2.4)+(roaming?.037*Math.sin(clock*.6+i):0)-yaw*TAU;
      const lat=Math.max(-1.35,Math.min(1.35,latitude+Math.sin(i*2)*.52));
      const a=Math.cos(lat)*Math.cos(lng),b=Math.sin(lat),depth=a*Math.cos(pitch)+b*Math.sin(pitch);
      if(depth<.12)continue;
      c.save();c.translate(cx+R*Math.cos(lat)*Math.sin(lng),cy-R*(b*Math.cos(pitch)-a*Math.sin(pitch)));
      const scale=Math.min(1.6,R/150)*Math.sqrt(depth);c.scale(scale,scale);
      c.lineWidth=.9;c.strokeStyle='#d4f3b9';c.fillStyle='#afd4ae';c.shadowColor='#274536';c.shadowBlur=2;
      if(!roaming&&l.stage>=4){
        for(let j=0;j<4;j++){const h=3+(j*7+i)%6;c.fillStyle=l.path===1?'#ca9169':'#98b0a4';c.fillRect(j*3-6,-h,2.7,h);c.fillStyle='#ffe7a4';c.fillRect(j*3-5.6,1-h,1,1)}
        if(l.path===2){c.beginPath();c.moveTo(0,-8);c.lineTo(1,-14);c.stroke()}
      }else if(roaming){
        for(let j=0;j<3;j++){
          const beat=Math.sin(clock*4+i+j),x=j*5-5,y=Math.sin(i+j)*3;
          c.beginPath();c.ellipse(x,y,2,1.2,0,0,TAU);c.fill();c.beginPath();
          if(l.form===2){c.moveTo(x-3,y+beat*2);c.lineTo(x,y);c.lineTo(x+3,y+beat*2)}
          else{c.moveTo(x-1,y);c.lineTo(x-1+beat,y+2);c.moveTo(x+1,y);c.lineTo(x+1-beat,y+2)}c.stroke();
        }
      }else{for(let j=0;j<5;j++){c.beginPath();c.arc(Math.cos(j*2.2)*3,Math.sin(j*2.2)*2,1.2,0,TAU);c.fill()}}
      c.restore();
    }
  }
  function pipette(x,y,fill,alpha){
    c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(.31);
    const glass=c.createLinearGradient(-6,0,6,0);glass.addColorStop(0,'#bfecf1a0');glass.addColorStop(.23,'#ffffffc2');glass.addColorStop(.42,'#90bbc656');glass.addColorStop(1,'#d0f1f2ae');
    c.fillStyle=glass;c.strokeStyle='#e2f4f5';c.lineWidth=.85;c.beginPath();c.moveTo(-6,-46);c.lineTo(-5,-12);c.lineTo(-1,0);c.lineTo(1,0);c.lineTo(5,-12);c.lineTo(6,-46);c.closePath();c.fill();c.stroke();
    c.fillStyle='#74d5e8';c.beginPath();c.moveTo(-3.7,-12-23*fill);c.lineTo(3.7,-12-23*fill);c.lineTo(3,-12);c.lineTo(0,-4);c.lineTo(-3,-12);c.fill();
    c.fillStyle='#8eaeaa';c.fillRect(-7,-50,14,5);c.fillStyle='#385951';c.beginPath();c.roundRect(-7,-70,14,21,5);c.fill();c.restore();
  }
  function drawPour(now,x,y,R){
    const f=flight,elapsed=now-f.start,t=Math.min(1,elapsed/f.hitTime);
    const tx=x+R*f.target.nx,ty=y-R*f.target.ny;
    if(reduced.matches)return;
    c.save();
    if(t<1){
      const travel=Math.max(0,(t-.26)/.74)**2,dist=Math.min(R*.92,ty-8),py=ty-dist*(1-travel);
      const px=tx-18*(1-travel),size=4+f.amount*3;
      pipette(tx-18,ty-dist-9,Math.max(0,1-t*1.7)*f.amount,Math.min(1,(1-t)*2));
      c.translate(px,py);c.shadowColor='#a5f5ff';c.shadowBlur=11;
      const grad=c.createLinearGradient(-size,0,size,0);grad.addColorStop(0,'#48a4c3');grad.addColorStop(.36,'#e6ffff');grad.addColorStop(1,'#348fa5');
      c.fillStyle=grad;c.scale(Math.min(1,.4+t*2),Math.min(1,.4+t*2));c.beginPath();c.moveTo(0,-size*(1.65+t));c.bezierCurveTo(size*.1,-size*.5,size*1.1,0,size*.86,size*.65);c.bezierCurveTo(size*.5,size*1.7,-size*1.2,size*1.4,-size*.86,size*.3);c.quadraticCurveTo(-size*.5,-size*.55,0,-size*(1.65+t));c.fill();
    }else{
      const u=Math.min(1,(elapsed-f.hitTime)/1250);c.translate(tx,ty);c.rotate(-.22);
      for(let i=0;i<3;i++){const a=(u-i*.13)/.74;if(a<=0||a>=1)continue;c.globalAlpha=(1-a)*.87;c.lineWidth=2.1-a;c.strokeStyle='#c3feff';c.beginPath();c.ellipse(0,0,3+R*.38*a,2+R*.19*a,0,0,TAU);c.stroke()}
      for(let i=0;i<18;i++){const a=i*2.399,rad=R*(.14+.09*(i%4)/3)*u;c.globalAlpha=1-u;c.fillStyle='#cef8ff';c.beginPath();c.arc(Math.cos(a)*rad,Math.sin(a)*rad*.48-R*.2*4*u*(1-u),Math.max(.6,2*(1-u)),0,TAU);c.fill()}
    }c.restore();
  }
  function loop(now){
    frame=0;if(!state||!visible||document.hidden)return;
    if(!drag&&!flight&&!reduced.matches)yaw+=Math.min(now-last,80)*.000009;
    last=now;paint(now);
    if(!reduced.matches||flight||press)frame=setTimeout(()=>{frame=0;wake()},flight||press?16:40);
  }
  function wake(){if(!frame)requestAnimationFrameOnce()}
  let pending=false;
  function requestAnimationFrameOnce(){if(pending)return;pending=true;requestAnimationFrame(now=>{pending=false;loop(now)})}
  function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);c.setTransform(d,0,0,d,0,0);wake()}
  new ResizeObserver(resize).observe(canvas);new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake()}).observe(canvas);
  document.addEventListener('visibilitychange',wake);
  canvas.onpointerdown=e=>{
    if(locked||press||e.button!==0)return;const r=canvas.getBoundingClientRect(),nx=(e.clientX-r.left-w/2)/radius(),ny=(h*.49-e.clientY+r.top)/radius();
    press={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),moved:false,target:nx*nx+ny*ny<.98?project(nx,ny):null};
    drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);wake();
  };
  canvas.onpointermove=e=>{if(!press||e.pointerId!==press.id)return;
    if(!press.moved&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<6)return;
    press.moved=true;yaw-=(e.clientX-drag[0])/Math.max(200,w);pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];wake()};
  canvas.onpointerup=e=>{if(press?.id!==e.pointerId)return;const p=press;press=null;drag=null;if(!p.moved&&p.target)onPour(p.target,Math.min(1,(performance.now()-p.time)/1300));wake()};
  canvas.onlostpointercapture=()=>{press=null;drag=null};
  canvas.onkeydown=e=>{if(locked)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();onPour(project(0,0),.3);return}if(!e.key.startsWith('Arrow'))return;e.preventDefault();yaw+=e.key==='ArrowRight'?-.04:e.key==='ArrowLeft'?.04:0;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.key==='ArrowUp'?.12:e.key==='ArrowDown'?-.12:0)));wake()};
  return {
    bind(fn){onPour=fn},
    center(){return project(0,0)},
    async pour(target,amount,impact){
      locked=true;const hitTime=reduced.matches?80:940;flight={target,amount,start:performance.now(),hitTime};wake();
      try{await new Promise(r=>setTimeout(r,hitTime));impact();await new Promise(r=>setTimeout(r,reduced.matches?100:1250))}
      finally{locked=false;flight=null;wake()}
    },
    update(s){state=s;const id=s.seed+'/'+s.sites.length+'/'+s.drops;
      if(id!==basinKey||siteList!==s.sites){basins=buildPlanetBasins(s.sites);basinKey=id;siteList=s.sites;signature=''}
      if(seed!==s.seed){seed=s.seed;if(!orbital)terrain(seed);signature=''}
      const key=[s.water,s.temp,s.gravity,s.age>=1,s.age>=3,s.civil,id].join('/');if(signature!==key){signature=key;if(!orbital)texture()}wake()}
  };
}
