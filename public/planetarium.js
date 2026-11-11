'use strict';
const $ = selector => document.querySelector(selector);
const canvas=$('#stars'), overlay=$('#overlay'), ctx=overlay.getContext('2d');
const DEG=Math.PI/180;
let width=1,height=1,dpr=1,yaw=83*DEG,pitch=0,fov=90,limit=6.5;
let stars=[],figures=[],starNames={},namedStars=[],starBuffer=null,gl=null,gpu=null,fallback=null;
let selected=null,ready=false,pendingFrame=false,contextLost=false;
let basis,scale,loadController,labelExclusions=[],labelBoxes=[];
const pointers=new Map();
let gesture=null,dragDistance=0;
const toVector=(ra,dec)=>{const a=ra*DEG,d=dec*DEG;return [Math.cos(d)*Math.cos(a),Math.cos(d)*Math.sin(a),Math.sin(d)];};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const normalize=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function color(bv){
  if(bv===null)return [0.88,0.92,1];
  const stops=[[-0.4,[0.56,0.72,1]],[0,[0.77,0.85,1]],[0.6,[1,0.95,0.84]],[1.3,[1,0.75,0.46]],[2.2,[1,0.48,0.25]]];
  const x=clamp(bv,-0.4,2.2);
  for(let i=1;i<stops.length;i++)if(x<=stops[i][0]){const t=(x-stops[i-1][0])/(stops[i][0]-stops[i-1][0]);return stops[i][1].map((c,j)=>stops[i-1][1][j]*(1-t)+c*t);}
  return stops.at(-1)[1];
}
function requestRender(){if(!pendingFrame){pendingFrame=true;requestAnimationFrame(()=>{pendingFrame=false;render();});}}
function updateBasis(){
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  basis={right:[sy,-cy,0],up:[-sp*cy,-sp*sy,cp],forward:[cp*cy,cp*sy,sp]};
  scale=width/(2*Math.tan(fov*DEG/2));
}
function project(v){const z=dot(v,basis.forward);if(z<0.03)return null;const x=width/2+scale*dot(v,basis.right)/z,y=height/2-scale*dot(v,basis.up)/z;if(Math.abs(x-width/2)>width*3||Math.abs(y-height/2)>height*3)return null;return {x,y,z};}
function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);for(const c of [canvas,overlay]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}requestRender();}
function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('星空の描画プログラムを準備できませんでした。');return sh;}
function setupGPU(){
  const vertex=`attribute vec3 a_position; attribute float a_mag; attribute vec3 a_color;
uniform vec3 u_right,u_up,u_forward; uniform float u_tan,u_aspect,u_dpr,u_limit;
varying vec3 v_color; varying float v_alpha;
void main(){float z=dot(a_position,u_forward); if(z<=0.01 || a_mag>u_limit){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=1.;v_alpha=0.;return;}
gl_Position=vec4(dot(a_position,u_right)/u_tan,dot(a_position,u_up)*u_aspect/u_tan,0.,z);
float radius=max(0.42,3.3*pow(10.,-0.18*a_mag));gl_PointSize=radius*6.*u_dpr;
v_color=a_color;v_alpha=clamp(1.1-0.045*max(a_mag,0.),0.38,1.);}`;
  const fragment=`precision mediump float; varying vec3 v_color; varying float v_alpha;
void main(){float r=length(gl_PointCoord-vec2(.5))*2.;if(r>1.)discard;float light=exp(-r*r*15.)+.12*exp(-r*r*3.);gl_FragColor=vec4(v_color,min(1.,light*v_alpha));}`;
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('星空の描画プログラムを接続できませんでした。');gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,starBuffer,gl.STATIC_DRAW);
  [['a_position',3,0],['a_mag',1,12],['a_color',3,16]].forEach(([name,size,offset])=>{const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,28,offset);});
  gpu={program,uniforms:Object.fromEntries(['right','up','forward','tan','aspect','dpr','limit'].map(k=>[k,gl.getUniformLocation(program,'u_'+k)]))};
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);
}
function initializeRenderer(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'high-performance'});
  if(gl){setupGPU();$('#render-status').textContent='全天星図';}
  else{fallback=canvas.getContext('2d');if(!fallback)throw Error('このブラウザでは星空を描画できません。別のブラウザでお試しください。');$('#render-status').textContent='全天星図 · 簡易描画';}
}
function drawStars(){
  if(gl&&gpu){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.009,.018,.038,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(gpu.program);for(const key of ['right','up','forward'])gl.uniform3fv(gpu.uniforms[key],basis[key]);gl.uniform1f(gpu.uniforms.tan,Math.tan(fov*DEG/2));gl.uniform1f(gpu.uniforms.aspect,width/height);gl.uniform1f(gpu.uniforms.dpr,dpr);gl.uniform1f(gpu.uniforms.limit,limit);gl.drawArrays(gl.POINTS,0,stars.length);}
  else if(fallback){fallback.setTransform(dpr,0,0,dpr,0,0);fallback.fillStyle='#02050a';fallback.fillRect(0,0,width,height);for(const s of stars){if(s.mag>limit)break;const p=project(s.v);if(!p||p.x<0||p.x>width||p.y<0||p.y>height)continue;const radius=Math.max(.4,2.3*Math.pow(10,-.18*s.mag));fallback.fillStyle=s.css;fallback.globalAlpha=clamp(1-s.mag*.05,.3,1);fallback.beginPath();fallback.arc(p.x,p.y,radius,0,Math.PI*2);fallback.fill();}fallback.globalAlpha=1;}
}
function strokePath(points){let last=null;ctx.beginPath();for(const v of points){const p=project(v);if(!p){last=null;continue;}if(last&&Math.hypot(p.x-last.x,p.y-last.y)<Math.max(width,height))ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);last=p;}ctx.stroke();}
function label(text,p,fill='rgba(197,211,232,.7)',font='10px "Noto Sans JP", sans-serif'){
  if(!p||p.x<30||p.y<85||p.x>width-35||p.y>height-50)return;
  if(labelExclusions.some(r=>p.x>r.left-35&&p.x<r.right+35&&p.y>r.top-10&&p.y<r.bottom+15))return;
  ctx.font=font;const half=ctx.measureText(text).width/2+5,box={left:p.x-half,right:p.x+half,top:p.y-12,bottom:p.y+5};
  if(labelBoxes.some(r=>box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top))return;
  labelBoxes.push(box);ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(3,8,16,.85)';ctx.strokeText(text,p.x,p.y);ctx.fillStyle=fill;ctx.fillText(text,p.x,p.y);
}
const gridPaths=[];
for(let dec=-60;dec<=60;dec+=30){const path=[];for(let ra=0;ra<=360;ra+=3)path.push(toVector(ra,dec));gridPaths.push(path);}
for(let ra=0;ra<360;ra+=30){const path=[];for(let dec=-90;dec<=90;dec+=3)path.push(toVector(ra,dec));gridPaths.push(path);}
function render(){
  updateBasis();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  if(!ready||contextLost)return;
  labelBoxes=[];
  labelExclusions=['.intro','#settings','#selection','.zoom'].map(selector=>$(selector)).filter(el=>!el.hidden).map(el=>el.getBoundingClientRect());
  drawStars();
  if($('#grid').checked){ctx.strokeStyle='rgba(120,155,205,.12)';ctx.lineWidth=.7;gridPaths.forEach(strokePath);}
  if($('#lines').checked){ctx.strokeStyle='rgba(165,190,225,.28)';ctx.lineWidth=.8;for(const f of figures)f.paths.forEach(strokePath);}
  if($('#constellation-names').checked)for(const f of figures)label(f.name,project(f.center),'rgba(213,186,128,.75)','11px "Noto Sans JP", sans-serif');
  if($('#star-names').checked)for(const s of namedStars){if(s.mag>Math.min(limit,2))continue;const p=project(s.v);if(p)label(starNames[s.id].name,{...p,y:p.y+18},'rgba(191,206,228,.8)','9px "Noto Sans JP", sans-serif');}
  if(selected){const p=project(selected.v);if(p){ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.strokeStyle='#d5ba80';ctx.lineWidth=1;ctx.stroke();}}
  $('#fov-label').textContent=Math.round(fov)+'°';
  $('#view-direction').textContent=`赤経 ${((((yaw/DEG)%360+360)%360)/15).toFixed(1)}h · 赤緯 ${(pitch/DEG).toFixed(1)}°`;
  canvas.dataset.view=`${yaw.toFixed(4)},${pitch.toFixed(4)},${fov.toFixed(1)}`;
}
function updateCount(){const n=stars.findIndex(s=>s.mag>limit);$('#star-count').textContent=`表示対象 ${(n<0?stars.length:n).toLocaleString('ja-JP')} / ${stars.length.toLocaleString('ja-JP')} 個（全天）`;$('#mag-value').textContent=`${limit.toFixed(1)}等まで`;}
function changeLimit(value){limit=Number(value);$('#magnitude').value=limit;updateCount();if(selected&&selected.mag>limit)clearSelection();requestRender();}
function clearSelection(){selected=null;$('#selection').hidden=true;requestRender();}
function zoom(value){fov=clamp(value,18,115);requestRender();}
function goTo(id){const matches=figures.filter(f=>f.id===id);if(!matches.length)return;const v=matches[0].center;yaw=Math.atan2(v[1],v[0]);pitch=Math.asin(v[2]);fov=75;clearSelection();$('#destination').value=id;$('#announcement').textContent=matches[0].name+'へ移動しました';if(width<=700)toggleSettings(false);requestRender();}
function reset(){yaw=83*DEG;pitch=0;fov=90;changeLimit(6.5);$('#lines').checked=true;$('#constellation-names').checked=true;$('#star-names').checked=true;$('#grid').checked=false;$('#destination').value='';clearSelection();requestRender();}
function pick(x,y){let nearest=null,best=18*18;for(const s of stars){if(s.mag>limit)break;const p=project(s.v);if(!p)continue;const distance=(p.x-x)**2+(p.y-y)**2;if(distance<best){best=distance;nearest=s;}}if(!nearest){clearSelection();return;}selected=nearest;const n=starNames[nearest.id];$('#selected-name').textContent=n?.name||`HIP ${nearest.id}`;$('#selected-description').textContent=`${n?.en ? n.en+' · ' : ''}HIP ${nearest.id} ｜ ${nearest.mag.toFixed(2)}等星${n?.c ? ' ｜ '+(constellationCatalog.find(c=>c.abbr===n.c)?.name||n.c) : ''}`;$('#selection').hidden=false;requestRender();}

canvas.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);pointers.set(event.pointerId,[event.clientX,event.clientY]);dragDistance=0;
  const points=[...pointers.values()];gesture=points.length>=2?{distance:Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]),fov}:{x:event.clientX,y:event.clientY,yaw,pitch};canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId))return;
  const previous=pointers.get(event.pointerId);dragDistance+=Math.hypot(event.clientX-previous[0],event.clientY-previous[1]);pointers.set(event.pointerId,[event.clientX,event.clientY]);
  if(pointers.size>=2&&gesture?.distance){const p=[...pointers.values()];const distance=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);zoom(2*Math.atan(Math.tan(gesture.fov*DEG/2)*gesture.distance/Math.max(distance,1))/DEG);}
  else if(gesture&&'x'in gesture){const sensitivity=2*Math.tan(fov*DEG/2)/width;yaw=gesture.yaw+(event.clientX-gesture.x)*sensitivity;pitch=clamp(gesture.pitch+(event.clientY-gesture.y)*sensitivity,-Math.PI/2+.001,Math.PI/2-.001);requestRender();}
});
function release(event,cancelled=false){if(!pointers.has(event.pointerId))return;const wasPinch=pointers.size>1;if(!cancelled&&!wasPinch&&dragDistance<5&&ready){const r=canvas.getBoundingClientRect();pick(event.clientX-r.left,event.clientY-r.top);}pointers.delete(event.pointerId);if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);const remaining=[...pointers.values()];gesture=remaining.length?{x:remaining[0][0],y:remaining[0][1],yaw,pitch}:null;dragDistance=Infinity;if(!remaining.length)canvas.classList.remove('dragging');}
canvas.addEventListener('pointerup',event=>release(event));
canvas.addEventListener('pointercancel',event=>release(event,true));
canvas.addEventListener('lostpointercapture',event=>{pointers.delete(event.pointerId);if(!pointers.size){gesture=null;canvas.classList.remove('dragging');}});
canvas.addEventListener('wheel',event=>{event.preventDefault();zoom(fov*Math.exp(clamp(event.deltaY,-200,200)*.0015));},{passive:false});
canvas.addEventListener('keydown',event=>{const step=fov*DEG*.04;let handled=true;switch(event.key){case'ArrowLeft':yaw-=step;break;case'ArrowRight':yaw+=step;break;case'ArrowUp':pitch-=step;break;case'ArrowDown':pitch+=step;break;case'+':case'=':zoom(fov*.85);break;case'-':zoom(fov/ .85);break;case'Home':reset();break;default:handled=false;}if(handled){event.preventDefault();pitch=clamp(pitch,-Math.PI/2+.001,Math.PI/2-.001);requestRender();}});
$('#zoom-in').addEventListener('click',()=>zoom(fov*.8));$('#zoom-out').addEventListener('click',()=>zoom(fov/ .8));
$('#magnitude').addEventListener('input',event=>changeLimit(event.target.value));
document.querySelectorAll('[data-mag]').forEach(b=>b.addEventListener('click',()=>changeLimit(b.dataset.mag)));
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.target)));
['lines','constellation-names','star-names','grid'].forEach(id=>$('#'+id).addEventListener('change',requestRender));
$('#destination').innerHTML+=[...constellationCatalog].map(c=>`<option value="${c.abbr}">${c.name}</option>`).join('');
$('#destination').addEventListener('change',event=>goTo(event.target.value));
$('#reset').addEventListener('click',reset);$('#clear-selection').addEventListener('click',clearSelection);
function toggleSettings(open){$('#settings').hidden=!open;$('#settings-button').setAttribute('aria-expanded',String(open));requestRender();}
$('#settings-button').addEventListener('click',()=>toggleSettings($('#settings').hidden));
['help-button','credits-button'].forEach(id=>$('#'+id).addEventListener('click',()=>$('#help').showModal()));
$('#close-help').addEventListener('click',()=>$('#help').close());
if(matchMedia('(max-width:700px)').matches)toggleSettings(false);
window.addEventListener('resize',resize);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;$('#render-status').textContent='描画を復旧しています…';});
canvas.addEventListener('webglcontextrestored',()=>{try{setupGPU();contextLost=false;$('#render-status').textContent='全天星図';requestRender();}catch{showError('描画を再開できませんでした。ページを再読み込みしてください。');}});
function showError(message){$('#loading').hidden=false;$('#loading h2').textContent='星空を読み込めませんでした';$('#loading p').textContent=message;$('#retry').hidden=false;}
async function load(){
  $('#retry').hidden=true;$('#loading h2').textContent='星空をひらいています';$('#loading p').textContent='実在する11万8千個以上の星を読み込み中。';
  loadController?.abort();loadController=new AbortController();
  try{
    const responses=await Promise.all(['assets/stars.json','assets/constellations.lines.json'].map(async url=>{const response=await fetch(url,{signal:loadController.signal});if(!response.ok)throw Error('星のデータを取得できません。通信状態を確認して再試行してください。');return response.json();}));
    const [data,lines]=responses;starNames=data.names;
    stars=data.stars.map(([id,ra,dec,mag,bv])=>{const rgb=color(bv);return {id,v:toVector(ra,dec),mag,rgb,css:`rgb(${rgb.map(x=>Math.round(x*255)).join(',')})`};});
    namedStars=stars.filter(s=>starNames[s.id]&&s.mag<=2);
    starBuffer=new Float32Array(stars.length*7);stars.forEach((s,i)=>starBuffer.set([...s.v,s.mag,...s.rgb],i*7));
    let serpent=0;
    figures=lines.features.map(f=>{const vectors=f.geometry.coordinates.flat().map(p=>toVector(...p));const unique=[...new Map(vectors.map(v=>[v.join(','),v])).values()];const center=normalize([0,1,2].map(i=>unique.reduce((sum,v)=>sum+v[i],0)));const name=constellationCatalog.find(c=>c.abbr===f.id)?.name||f.id;const paths=f.geometry.coordinates.map(coords=>{const vs=coords.map(p=>toVector(...p)),path=[];for(let i=0;i<vs.length-1;i++){const a=vs[i],b=vs[i+1],angle=Math.acos(clamp(dot(a,b),-1,1)),steps=Math.max(1,Math.ceil(angle/(3*DEG)));for(let j=0;j<steps;j++)path.push(normalize(a.map((v,k)=>v*(1-j/steps)+b[k]*j/steps)));}path.push(vs.at(-1));return path;});return {id:f.id,name:name+(f.id==='Ser'?(serpent++===0?'（頭部）':'（尾部）'):''),center,paths};});
    if(!gl&&!fallback)initializeRenderer();else if(gl)setupGPU();
    ready=true;$('#loading').hidden=true;canvas.dataset.totalStars=String(stars.length);updateCount();resize();
  }catch(error){if(error.name!=='AbortError')showError(error.message);}
}
$('#retry').addEventListener('click',()=>{if(contextLost)location.reload();else load();});
resize();load();
