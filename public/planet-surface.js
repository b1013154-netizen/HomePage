function createPlanetView(canvas){
  const c=canvas.getContext('2d'),surface=document.createElement('canvas'),g=surface.getContext('2d');
  const W=576,H=288,T=W*H,N=336,P=N*N,TAU=2*Math.PI;
  surface.width=surface.height=N;
  const img=g.createImageData(N,N),pixels=img.data,height=new Float32Array(T),mist=new Float32Array(T),grit=new Float32Array(T),colors=new Uint8ClampedArray(T*3),cities=new Uint8Array(T);
  const lon=new Float32Array(P),row=new Int32Array(P),light=new Float32Array(P),rim=new Float32Array(P);
  let state,seed=-1,signature='',yaw=.15,pitch=.12,lastPitch=NaN,drag=null,drop=-3000;
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
      const v=height[k],f=grit[k],lat=Math.abs((Math.floor(k/W)/H-.5)*2);
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
    if(lastPitch!==pitch)geometry();
    for(let p=0;p<P;p++){
      const off=p*4;if(row[p]<0){pixels[off+3]=0;continue}
      const k=row[p]+((Math.floor((lon[p]+yaw)*W)%W+W)%W),s=light[p],glow=rim[p],lamp=cities[k]&&s<.48?(1-s/.48)*195:0;
      pixels[off]=colors[k*3]*s+glow*97+lamp;pixels[off+1]=colors[k*3+1]*s+glow*166+lamp*.73;pixels[off+2]=colors[k*3+2]*s+glow*185+lamp*.28;pixels[off+3]=255;
    }
    g.putImageData(img,0,0);c.clearRect(0,0,w,h);
    for(let i=1;i<97;i++){const x=(Math.sin(i*94.1)*17453.5%1+1)%1*w,y=(Math.sin(i*56.7)*18362.3%1+1)%1*h;c.fillStyle='rgba(217,235,223,'+(.2+(i%7)/13)+')';c.fillRect(x,y,i%9===0?1.8:1,i%9===0?1.8:1)}
    const R=Math.min(w*.335,h*.365),x=w/2,y=h*.49;
    const atm=c.createRadialGradient(x,y,R*.94,x,y,R*1.17);atm.addColorStop(0,'#7db9b57a');atm.addColorStop(.35,'#72a6a337');atm.addColorStop(1,'#61979800');c.fillStyle=atm;c.fillRect(x-R*1.18,y-R*1.18,R*2.36,R*2.36);
    c.save();c.translate(x,y);c.rotate(-.25);c.strokeStyle='#9bc2b83d';c.lineWidth=.8;c.beginPath();c.ellipse(0,0,R*1.39,R*.49,0,0,TAU);c.stroke();c.restore();
    c.drawImage(surface,x-R,y-R,2*R,2*R);
    const t=(now-drop)/1200;if(t>=0&&t<1){
      const hitX=x-R*.25,hitY=y-R*.44;c.strokeStyle='#ccfff2';c.fillStyle='#bcf1ef';c.lineWidth=2;
      c.beginPath();if(t<.48){const py=hitY-(1-(t/.48)**2)*R*.85;c.ellipse(hitX,py,3,7,0,0,TAU);c.fill()}else{const u=(t-.48)/.52;c.globalAlpha=1-u;c.ellipse(hitX,hitY,2+u*R*.41,1+u*R*.18,-.2,0,TAU);c.stroke();c.globalAlpha=1}
    }
  }
  function loop(now){
    frame=0;if(!state||!visible||document.hidden)return;
    if(!drag&&!reduced.matches)yaw+=Math.min(now-last,80)*.000009;
    last=now;paint(now);
    if(!reduced.matches||now-drop<1200)frame=setTimeout(()=>{frame=0;wake()},55);
  }
  function wake(){if(!frame)requestAnimationFrameOnce()}
  let pending=false;
  function requestAnimationFrameOnce(){if(pending)return;pending=true;requestAnimationFrame(now=>{pending=false;loop(now)})}
  function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);c.setTransform(d,0,0,d,0,0);wake()}
  new ResizeObserver(resize).observe(canvas);new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake()}).observe(canvas);
  document.addEventListener('visibilitychange',wake);
  canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!drag)return;yaw-=(e.clientX-drag[0])/Math.max(200,w);pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];wake()};
  canvas.onlostpointercapture=()=>drag=null;
  canvas.onkeydown=e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();yaw+=e.key==='ArrowRight'?-.04:e.key==='ArrowLeft'?.04:0;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.key==='ArrowUp'?.12:e.key==='ArrowDown'?-.12:0)));wake()};
  return {update(s,splash=false){state=s;if(seed!==s.seed){seed=s.seed;terrain(seed);signature=''}const key=[s.water,s.temp,s.gravity,s.age>=1,s.age>=3,s.civil].join('/');if(signature!==key){signature=key;texture()}if(splash&&!reduced.matches)drop=performance.now();wake()}};
}
