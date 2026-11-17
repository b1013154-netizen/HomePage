'use strict';
function townMap(canvas,api){
 const ctx=canvas.getContext('2d'),N=Town.N,{W,H,Z}=TownArt;
 let rotation=0,zoom=1,panX=0,panY=0,w=0,h=0,base=1,hover=null,drag=null,last=0,trafficTime=0;
 function rotate(x,y){return [[x,y],[y,-x],[-x,-y],[-y,x]][rotation]}
 function project(x,y,z=0){const [a,b]=rotate(x-8.2,y-8.6),k=base*zoom;return [w*.5+panX+(a-b)*W*k,h*.51+panY+((a+b)*H-z*Z)*k]}
 function cell(e){const r=canvas.getBoundingClientRect(),k=base*zoom,dx=(e.clientX-r.left-w*.5-panX)/(W*k),dy=(e.clientY-r.top-h*.51-panY)/(H*k),a=(dx+dy)*.5,b=(dy-dx)*.5,[x,y]=[[a,b],[-b,a],[-a,-b],[b,-a]][rotation];return {x:Math.floor(x+8.2),y:Math.floor(y+8.6)}}
 function resize(){w=canvas.clientWidth;h=canvas.clientHeight;base=Math.min(w/880,h/480);const dpr=Math.min(2,devicePixelRatio);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
 new ResizeObserver(resize).observe(canvas);resize();
 function path(a,b){const cells=[{...a}];let {x,y}=a;while(x!==b.x){x+=Math.sign(b.x-x);cells.push({x,y})}while(y!==b.y){y+=Math.sign(b.y-y);cells.push({x,y})}return cells}
 function zoneCells(a,b){
 const cells=[];for(let x=Math.max(0,Math.min(a.x,b.x));x<=Math.min(N-1,Math.max(a.x,b.x));x++)
 for(let y=Math.max(0,Math.min(a.y,b.y));y<=Math.min(N-1,Math.max(a.y,b.y));y++)cells.push({x,y});return cells}
 function setZoom(k){zoom=Math.max(.53,Math.min(5,zoom*k))}
 canvas.onwheel=e=>{e.preventDefault();setZoom(e.deltaY>0?.88:1.14)};
 canvas.oncontextmenu=e=>e.preventDefault();canvas.onpointerdown=e=>{
 if(drag)return;const start=cell(e);drag={id:e.pointerId,start,last:start,moving:api.mode()==='hand'||e.button===2||e.shiftKey,cx:e.clientX,cy:e.clientY};hover=start;canvas.setPointerCapture(e.pointerId)};
 canvas.onpointermove=e=>{if(drag&&e.pointerId!==drag.id)return;if(drag?.moving){panX+=e.clientX-drag.cx;panY+=e.clientY-drag.cy;drag.cx=e.clientX;drag.cy=e.clientY;hover=null;return}hover=cell(e);if(drag)drag.last=hover};
 canvas.onpointerup=e=>{if(e.pointerId!==drag?.id)return;const d=drag;drag=null;const end=cell(e);if(d.moving)return;if(e.clientX<canvas.getBoundingClientRect().left||e.clientX>canvas.getBoundingClientRect().right||e.clientY<canvas.getBoundingClientRect().top||e.clientY>canvas.getBoundingClientRect().bottom)return;
 if(api.mode()==='zone')api.zone(zoneCells(d.start,end));else if(api.mode()==='build'&&api.item()<2)api.placeRoad(path(d.start,end));else api.tap(end)};
 canvas.onpointercancel=canvas.onlostpointercapture=()=>{drag=null};canvas.onpointerleave=()=>{if(!drag)hover=null};
 function depth(x,y){const [a,b]=rotate(x,y);return a+b}
 let routes=[],oldNet=null;
 function traffic(net){if(oldNet===net)return;oldNet=net;routes=[];
 const streets=Array.from(net,k=>k.split(',').map(Number));if(streets.length<2)return;
 for(let j=0;j<27;j++){const walk=[streets[(j*7)%streets.length]];
 for(let t=0;t<14;t++){const [x,y]=walk.at(-1),back=walk.at(-2);
 let options=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>net.has(Town.key(a,b)));
 if(options.length>1&&back)options=options.filter(([a,b])=>a!==back[0]||b!==back[1]);
 if(!options.length)break;walk.push(options[(t*13+j)%options.length])}if(walk.length>1)routes.push(walk.concat(walk.slice(1,-1).reverse()))}}
 function paint(t){
 requestAnimationFrame(paint);if(t-last<28||!w||document.hidden)return;const dt=Math.min(.1,(t-last)/1000);last=t;if(api.running())trafficTime+=dt*api.running();
 const c=api.city(),st=api.stats(),night=api.night(),v=TownArt.view(ctx,project,rotation,night);
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#253747':'#cbdacf');bg.addColorStop(1,night?'#48555c':'#e5dcc6');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 v.block(-1,-1,-.48,N+2,N+2,.22,'#799c99',night?'#526d76':'#9abdb7');for(let i=0;i<52;i++){
 const a=(i*.73)%18,b=(i%3)*.21+.1,xx=i%2?a:N+b,yy=i%2?N+b:a;
 v.line([xx,yy,-.25],[xx+.16,yy,-.25],night?'#668085':'#c5d7c9',1);
 }v.block(0,0,-.28,N,N,.28,'#ac9c82','#c4cbb1');
 for(let x=0;x<N;x++)for(let y=0;y<N;y++){const b=st.map.get(Town.key(x,y)),road=b&&b.id<2,hash=(x*23+y*41)%7;
 const col=road?(b.id===0?'#768184':'#ad8472'):['#c6cbb1','#cbd1b9','#c3c9ad','#c5cbb3','#ccd1b6','#c9ceb2','#cbd0b9'][hash];
 const assigned=!b&&c.zones?.[Town.key(x,y)];v.tile(x+.015,y+.015,.97,.97,.005,assigned?(assigned==='home'?'#a3caa7':'#94b7cb'):col);
 if(road){
 const near=(dx,dy)=>{const n=st.map.get(Town.key(x+dx,y+dy));return n&&n.id<2};
 for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]])if(!near(dx,dy)){
 const ox=dx>0?.90:0,oy=dy>0?.90:0;v.tile(x+ox,y+oy,dx?.1:1,dy?.1:1,.015,'#c5beb0')}
 if((near(1,0)||near(-1,0))&&(near(0,1)||near(0,-1))){
 for(let j=0;j<5;j++)v.tile(x+.10+j*.17,y+.06,.09,.19,.02,'#e2dec8')}
 const clr=b.id===0?'#c9ccbb':'#cfb499';
 for(const [dx,dy] of [[1,0],[0,1]]){const n=st.map.get(Town.key(x+dx,y+dy));if(n&&n.id<2){
 v.line([x+.5+dx*.17,y+.5+dy*.17,.012],[x+.5+dx*.48,y+.5+dy*.48,.012],clr,1.2)}}
 }else if(!b&&hash===2){v.line([x+.18,y+.67,.015],[x+.2,y+.64,.03],'#a1ae91',1);v.line([x+.21,y+.69,.015],[x+.24,y+.69,.04],'#a1ae91',1)}}
 v.tile(-1,9,1,1,.013,'#758286');v.line([-.9,9.5,.03],[-.09,9.5,.03],'#f0dc9a',2);
 const preview=hover&&hover.x>=0&&hover.x<N&&hover.y>=0&&hover.y<N&&api.mode()!=='hand';
 let ghost=null;
 if(preview){const id=api.item(),s=id<2?1:api.scale(),b={...hover,id,s};const steps=api.mode()==='zone'&&drag?zoneCells(drag.start,hover):api.mode()==='build'&&id<2&&drag?path(drag.start,hover):[hover];
 for(const a of steps){const n=api.mode()==='build'?Town.sizes[s].n:1;
 const bad=api.mode()==='build'&&Town.valid(c,st.map,{...a,id,s});v.tile(a.x,a.y,n,n,.022,bad?'#bb806d':'#adcdb4','#376c66')}
 if(api.mode()==='build'&&id>=2&&!Town.valid(c,st.map,b))ghost=b}
 const list=[];
 for(const b of c.buildings){if(b.id<2)continue;const n=Town.sizes[b.s].n;list.push({d:depth(b.x+n/2,b.y+n/2),draw:()=>{v.structure(b,c.theme,trafficTime);if(!st.active.has(b)){const [x,y]=project(b.x+n*.5,b.y+n*.5,1);ctx.fillStyle='#af5845';ctx.fillRect(x-2,y-2,4,4)}}})}
 for(const b of c.buildings){if(b.id>=2||(b.x+2*b.y)%4!==0)continue;
 const x=b.x+.1,y=b.y+.14;list.push({d:depth(x,y),draw:()=>{v.block(x,y,.025,.031,.031,.43,'#586560');v.block(x-.037,y-.025,.45,.12,.09,.055,night?'#ffe5a3':'#d6c9a1')}})}
 for(let j=0;j<15;j++){const x=j%2?N+.46:-.47,y=1+j*1.02;if(y>17.6)continue;list.push({d:depth(x,y),draw:()=>v.tree(x,y,.72+(j%3)*.13)})}
 if(ghost){const n=Town.sizes[ghost.s].n;list.push({d:depth(ghost.x+n/2,ghost.y+n/2),draw:()=>{ctx.globalAlpha=.55;v.structure(ghost,c.theme);ctx.globalAlpha=1}})}
 traffic(st.net);
 routes.slice(0,Math.min(routes.length,Math.ceil(c.pop/5))).forEach((route,j)=>{
 const kind=['car','walk','cycle','walk','car','walk'][j%6],speed={car:.72,cycle:.46,walk:.26}[kind];
 const q=trafficTime*speed+j*1.7,pose=StreetMotion.sample(route,q,kind==='walk'?.34:kind==='cycle'?.24:.14);
 list.push({d:depth(pose.x,pose.y),draw:()=>StreetMotion.draw(ctx,project,pose,kind,j,trafficTime*(kind==='walk'?5.8:kind==='cycle'?4:9)+j,night)})
 });
 list.sort((a,b)=>a.d-b.d).forEach(o=>o.draw());
 if(night){ctx.fillStyle='#182a4c45';ctx.fillRect(0,0,w,h);for(const b of c.buildings){if(b.id>1&&Town.items[b.id].group===1&&st.active.has(b)){const [x,y]=project(b.x+.68,b.y+.68,.24),r=12*base*zoom,gl=ctx.createRadialGradient(x,y,0,x,y,r);gl.addColorStop(0,'#ffde8f88');gl.addColorStop(1,'#ffd18000');ctx.fillStyle=gl;ctx.fillRect(x-r,y-r,r*2,r*2)}}}
 }
 requestAnimationFrame(paint);
 return {street(){
 const s=api.stats(),roads=Array.from(s.net,k=>k.split(',').map(Number));
 if(!roads.length)return;
 const shops=Array.from(s.active).filter(b=>Town.items[b.id].group===1);
 const street=roads.reduce((best,r)=>{const score=shops.reduce((n,b)=>n+1/(1+(b.x-r[0])**2+(b.y-r[1])**2),0);return score>best.score?{r,score}:best},{score:-1}).r;
 zoom=3.6;panX=0;panY=0;const [px,py]=project(street[0]+.5,street[1]+.5);panX=w/2-px;panY=h*.57-py;
 },rotate(){rotation=(rotation+1)%4},zoom:setZoom,fit(){zoom=Math.min(1,w/(N*2*W*base+8),h/(N*2*H*base+40));panX=0;panY=0},project};
}
