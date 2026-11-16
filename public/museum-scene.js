'use strict';
const MuseumScene=(()=>{
 const T=THREE,base='/assets/future-museum/';
 function lighting(scene){
   scene.add(new T.HemisphereLight(0xfff0d8,0x787e77,1.75));
   const key=new T.DirectionalLight(0xffe3ba,3.1);key.position.set(-3,7,5);scene.add(key);
   const edge=new T.DirectionalLight(0xc1dafa,1.7);edge.position.set(5,4,-3);scene.add(edge);
   const cube=new T.CubeTexture(Array.from({length:6},(_,i)=>{
     const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),h=g.createLinearGradient(0,0,0,128);
     h.addColorStop(0,i===3?'#494741':'#ede6da');h.addColorStop(.42,'#99968c');h.addColorStop(.53,'#464944');h.addColorStop(1,'#aeac9f');g.fillStyle=h;g.fillRect(0,0,128,128);
     g.fillStyle='#fff7df';g.fillRect(12,7,17,73);g.fillRect(34,7,6,73);return c
   }));cube.needsUpdate=true;cube.colorSpace=T.SRGBColorSpace;scene.environment=cube;
 }
 function dispose(object){object.traverse(m=>{m.geometry?.dispose();if(m.material&&m.material.map?.isCanvasTexture&&m.material.type==='MeshStandardMaterial'&&m.material.map.image?.width===256){m.material.map.dispose();m.material.dispose()}})}
 function photograph(renderer,id,angle=.63){
   const scene=new T.Scene();scene.background=new T.Color('#e6e1d7');lighting(scene);const model=MuseumModels.build(id);scene.add(model);
   const box=new T.Box3().setFromObject(model),middle=box.getCenter(new T.Vector3());const camera=new T.OrthographicCamera(-.96,.96,.8,-.8,.1,30);
   camera.position.set(Math.sin(angle)*3,middle.y+1.56,Math.cos(angle)*3);camera.lookAt(middle);renderer.render(scene,camera);dispose(model);scene.environment.dispose();
 }
 function gallery(canvas,show,focusCallback,tourFocus,tourStatus){
   const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(1.7,devicePixelRatio));
   renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
   const scene=new T.Scene();scene.background=new T.Color('#b9aea0');scene.fog=new T.FogExp2('#b9aea0',.038);lighting(scene);
   const camera=new T.PerspectiveCamera(42,1,.04,65), room=new T.Group();scene.add(room);
   const owned=[], textures=[];
   function material(color,roughness=.8,metalness=0){const m=new T.MeshStandardMaterial({color,roughness,metalness});owned.push(m);return m}
   function block(x,y,z,w,h,d,material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);room.add(m);return m}
   const limestone=material('#c9c0ac'),joint=material('#968f82'),oak=material('#816449'),brass=material('#b39b63',.33,.53),dark=material('#31453f'),ivory=material('#ede4cc');
   block(0,-.08,0,22,.15,22,limestone);
   for(let i=-8;i<=8;i+=2){block(i,.001,0,.014,.008,18,joint);block(0,.002,i,18,.008,.014,joint)}
   block(0,2,-4.6,15,4.1,.2,dark);block(-7,2,0,.2,4.1,9,ivory);block(7,2,0,.2,4.1,9,ivory);
   for(let x=-6;x<=6;x+=3){block(x,2,-4.43,.055,4,.09,brass);block(x,3.7,-4.3,1.65,.045,.26,ivory)}
   block(0,.1,-4.38,14,.15,.09,oak);
   function placard(text,x,y,z,w,h,fg,bg){
     const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.font='54px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,128,960);
     const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=new T.MeshBasicMaterial({map:tex});owned.push(m);
     const plate=new T.Mesh(new T.PlaneGeometry(w,h),m);plate.position.set(x,y,z);room.add(plate);return plate;
   }
   placard('未来生活史博物館',0,2.55,-4.42,5.7,1.25,'#ecdfbc','#31453f');
   const positions=show.ids.map((_,i)=>(i-(show.ids.length-1)/2)*2.17);
   const models=[],lamps=[],watchers=[];
   positions.forEach((x,i)=>{
     block(x,.57,0,1.68,1.14,1.48,limestone);block(x,1.14,0,1.72,.045,1.5,brass);block(x,1.19,0,1.54,.07,1.34,dark);
     const model=MuseumModels.build(show.ids[i]);model.position.set(x,1.24,0);model.userData.slot=i;scene.add(model);models.push(model);
     placard(objects[show.ids[i]].myth,x,.86,.747,1.41,.30,'#493e2f','#eee5d0');
     const bulb=new T.PointLight(0xffdfa2,10,8);bulb.position.set(x,3.3,.7);scene.add(bulb);lamps.push(bulb);
   });
   const guests=new T.Group();scene.add(guests);
   const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
   const brush=shadowCanvas.getContext('2d'),gradient=brush.createRadialGradient(64,64,1,64,64,64);
   gradient.addColorStop(0,'rgba(40,31,21,.45)');gradient.addColorStop(.55,'rgba(40,31,21,.20)');gradient.addColorStop(1,'rgba(40,31,21,0)');
   brush.fillStyle=gradient;brush.fillRect(0,0,128,128);
   const shadowMap=new T.CanvasTexture(shadowCanvas);textures.push(shadowMap);
   const shadowMat=new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false});owned.push(shadowMat);
   function contact(x,y,z,w,d,parent){const shade=new T.Mesh(new T.PlaneGeometry(w,d),shadowMat);shade.rotation.x=-Math.PI/2;shade.position.set(x,y,z);parent.add(shade)}
   positions.forEach(x=>{contact(x,.012,.05,2.65,2.35,room);contact(x,1.232,0,1.45,1.28,room)});
   const spots=[[-3.6,.95],[3.6,.55],[-2.7,-2.7],[2.1,-2.6],[-5.2,-.85],[5.0,-1.5]];
   spots.forEach(([x,z],i)=>{
     contact(x,.016,z,.71,.43,guests);const tex=new T.TextureLoader().load(base+'guest-'+i+'.webp',()=>{
       if(dead)return;
       const h=[1.69,1.76,1.69,1.7,1.84,1.62][i];person.scale.set(h*tex.image.width/tex.image.height,h,1)
     });textures.push(tex);tex.colorSpace=T.SRGBColorSpace;
     const m=new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false});owned.push(m);const person=new T.Sprite(m);
     person.center.set(.5,0);person.position.set(x,0,z);guests.add(person);watchers.push({person,tex,target:positions.reduce((best,next)=>Math.abs(next-x)<Math.abs(best-x)?next:best,positions[0])})
   });
   let yaw=.23,pitch=.19,radius=show.ids.length===1?5.1:7.5,targetX=0,targetY=1.24,dead=false,raf,active=null,moved=0;
   function fit(){const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
   const observer=new ResizeObserver(fit);observer.observe(canvas);fit();
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   let touring=false,tourStart=0,tourSlot=-1,lit=-1,last=performance.now();
   const gaze=new T.Vector3(),eye=new T.Vector3(),aim=new T.Vector3(),right=new T.Vector3();
   const dustGeometry=new T.BufferGeometry(),coords=[];
   for(let i=0;i<80;i++)coords.push(Math.sin(i*9.8)*4,.7+((i*37)%100)/36,Math.cos(i*2.72)*1.7);
   dustGeometry.setAttribute('position',new T.Float32BufferAttribute(coords,3));
   const dustMaterial=new T.PointsMaterial({color:0xffebc3,transparent:true,opacity:.45,size:.012,depthWrite:false});
   const dust=new T.Points(dustGeometry,dustMaterial);scene.add(dust);dust.visible=!reduced;
   function stopTour(){if(touring){touring=false;tourStatus(false)}}
   function draw(){
     if(dead)return;
     const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
     if(touring){const elapsed=(now-tourStart)/1000,j=Math.floor(elapsed/5.5)%positions.length;
       if(j!==tourSlot){tourSlot=j;frame(j);tourFocus(j)}
       if(!reduced)yaw=-.38+.76*((elapsed%5.5)/5.5);
     }
     eye.set(targetX+Math.sin(yaw)*Math.cos(pitch)*radius,targetY+Math.sin(pitch)*radius,Math.cos(yaw)*Math.cos(pitch)*radius);
     aim.set(targetX,targetY,0);const blend=reduced?1:1-Math.exp(-dt*6);
     camera.position.lerp(eye,blend);gaze.lerp(aim,blend);camera.lookAt(gaze);camera.updateMatrixWorld();
     right.setFromMatrixColumn(camera.matrixWorld,0);
     for(const {person,tex,target} of watchers){
       const side=(target-person.position.x)*right.x-person.position.z*right.z;
       if(Math.abs(side)>.08){tex.repeat.x=side<0?-1:1;tex.offset.x=side<0?1:0}
     }
     lamps.forEach((light,i)=>{light.intensity+=((lit===i?17:9)-light.intensity)*blend});
     if(!reduced){dust.position.y=.09*Math.sin(now*.0003);dust.rotation.y=.05*Math.sin(now*.00018)}
     renderer.render(scene,camera);raf=requestAnimationFrame(draw)
   }
   function frame(slot){lit=slot??-1;targetX=slot===null?0:positions[slot];targetY=slot===null?1.24:1.65;radius=slot===null?(show.ids.length===1?5.1:Math.max(7.5,5.3/camera.aspect)):3.25;yaw=.23;pitch=slot===null?.19:.27}
   function focus(slot){stopTour();frame(slot)}
   function zoom(factor){stopTour();radius=Math.max(2.25,Math.min(10,radius*factor))}
   canvas.onpointerdown=e=>{if(active||e.button!==0)return;stopTour();active={id:e.pointerId,x:e.clientX,y:e.clientY};moved=0;canvas.setPointerCapture(e.pointerId)};
   canvas.onpointermove=e=>{if(active?.id!==e.pointerId)return;const dx=e.clientX-active.x,dy=e.clientY-active.y;moved+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.009;pitch=Math.max(.05,Math.min(1.12,pitch+dy*.006));active.x=e.clientX;active.y=e.clientY};
   canvas.onpointerup=e=>{if(active?.id!==e.pointerId)return;active=null;if(moved>6)return;const rect=canvas.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height),camera);
     let hit=ray.intersectObjects(models,true)[0]?.object;while(hit&&hit.userData.slot===undefined)hit=hit.parent;if(hit)focusCallback(hit.userData.slot)};
   canvas.onpointercancel=canvas.onlostpointercapture=()=>active=null;
   canvas.onwheel=e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001))};
   focus(null);camera.position.set(1.1,2.6,radius+1);gaze.set(0,1.24,0);draw();
   return {focus,zoom,tour(){if(touring){stopTour();return}tourStart=performance.now();tourSlot=-1;touring=true;tourStatus(true)},turn:()=>{stopTour();yaw+=.45},visitors:on=>guests.visible=on,close(){
     dead=true;dustGeometry.dispose();dustMaterial.dispose();cancelAnimationFrame(raf);observer.disconnect();models.forEach(dispose);guests.traverse(m=>{if(m.isMesh)m.geometry.dispose()});room.traverse(m=>m.geometry?.dispose());textures.forEach(x=>x.dispose());owned.forEach(m=>m.dispose());scene.environment.dispose();renderer.dispose();renderer.forceContextLoss();
     canvas.onpointerdown=canvas.onpointerup=canvas.onpointermove=canvas.onwheel=canvas.onpointercancel=canvas.onlostpointercapture=null;
   }};
 }
 return {photograph,gallery};
})();
