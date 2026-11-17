'use strict';
const StreetMotion=(()=>{
 // Consecutive quadratics share a lane midpoint and a tangent; the controller
 // advances more slowly near a bend, including the loop at a dead end.
 function sample(route,q,lane){
 const n=route.length,i=Math.floor(q)%n,u=q%1;
 const A=route[(i+n-1)%n],B=route[i],C=route[(i+1)%n];
 const ux=B[0]-A[0],uy=B[1]-A[1],vx=C[0]-B[0],vy=C[1]-B[1];
 const bend=ux!==vx||uy!==vy,t=bend?u+.24*Math.sin(u*2*Math.PI)/(2*Math.PI):u;
 const U=[(A[0]+B[0])/2+.5-uy*lane,(A[1]+B[1])/2+.5+ux*lane];
 const V=[(B[0]+C[0])/2+.5-vy*lane,(B[1]+C[1])/2+.5+vx*lane];
 const back=ux===-vx&&uy===-vy;
 const K=[B[0]+.5-(uy+vy)*lane/2+(back?ux*.39:0),B[1]+.5+(ux+vx)*lane/2+(back?uy*.39:0)];
 const w=1-t,x=w*w*U[0]+2*w*t*K[0]+t*t*V[0],y=w*w*U[1]+2*w*t*K[1]+t*t*V[1];
 return {x,y,angle:Math.atan2(w*(K[1]-U[1])+t*(V[1]-K[1]),w*(K[0]-U[0])+t*(V[0]-K[0])),braking:bend&&u<.65};
 }
 function draw(ctx,project,pose,kind,j,phase,night){
 const {x,y,angle}=pose,co=Math.cos(angle),si=Math.sin(angle);
 const age=Math.floor(j/2)%3,gender=j%2,size=kind==='walk'?[.7,1,.88][age]:1;
 const pt=(a,b,z)=>project(x+size*(a*co-b*si),y+size*(a*si+b*co),z*size);
 const origin=pt(0,0,0),unit=Math.abs(pt(0,0,1)[1]-origin[1]);
 function path(points){ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(...pt(...v)):ctx.moveTo(...pt(...v)))}
 function fill(points,col){path(points);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
 function line(points,width,col){path(points);ctx.lineWidth=Math.max(.45,width*unit);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.stroke()}
 function oval(a,b,z,rx,ry,col){ctx.beginPath();ctx.ellipse(...pt(a,b,z),rx*unit,ry*unit,0,0,Math.PI*2);ctx.fillStyle=col;ctx.fill()}
 function wheel(a,b,z,r,spokes){
 const rim=[];for(let k=0;k<=20;k++){const t=k*Math.PI/10;rim.push([a+r*Math.cos(t),b,z+r*Math.sin(t)])}
 if(!spokes)fill(rim,'#262d30');line(rim,spokes?.011:.014,'#364044');
 for(let k=0;k<(spokes?6:3);k++){const t=phase+k*Math.PI/3;line([[a,b,z],[a+r*.82*Math.cos(t),b,z+r*.82*Math.sin(t)]],.007,spokes?'#bac7bd':'#9ba5a3')}
 }
 const near=pt(0,1,0)[1]>origin[1]?1:-1;
 oval(0,.02,.004,kind==='car'?.28:kind==='cycle'?.18:.078,kind==='car'?.09:.035,'#233d3844');
 if(kind==='bus'){
 const body='#4f8b81',edge=near*.18;
 fill([[-.51,edge,.09],[.51,edge,.09],[.51,edge,.43],[-.51,edge,.43]],body);
 const end=pt(1,0,0)[1]>origin[1]? .51:-.51;
 fill([[end,-.18,.09],[end,.18,.09],[end,.18,.43],[end,-.18,.43]],'#588379');
 fill([[-.51,-.18,.43],[.51,-.18,.43],[.51,.18,.43],[-.51,.18,.43]],'#d4d2bb');
 for(let i=0;i<5;i++){const a=-.47+i*.19;fill([[a,edge,.25],[a+.15,edge,.25],[a+.15,edge,.38],[a,edge,.38]],night?'#e7d5a5':'#acc3c3')}
 line([[-.49,edge,.19],[.49,edge,.19]],.032,'#f2d394');
 for(const a of [-.32,.33])wheel(a,edge,.095,.08,false);return}
 if(kind==='car'){
 const paint=['#c76c50','#728daf','#e7bc72','#72a194','#c4c9c3'][j%5],front=pt(1,0,0)[1]>origin[1]?1:-1;
 const rings=[[.05,.275,.11],[.105,.318,.14],[.16,.28,.138],[.17,.23,.125],[.257,.125,.10]];
 function ring([z,len,breadth],k){const a=k*Math.PI/10,dx=Math.cos(a),dy=Math.sin(a);return [Math.sign(dx)*Math.pow(Math.abs(dx),.43)*len-(z>.18?.025:0),Math.sign(dy)*Math.pow(Math.abs(dy),.42)*breadth,z]}
 for(const a of [-.18,.18])wheel(a,-near*.12,.066,.06,false);
 for(let h=1;h<rings.length;h++){const faces=[];for(let k=0;k<20;k++){
 const pts=[ring(rings[h-1],k),ring(rings[h-1],k+1),ring(rings[h],k+1),ring(rings[h],k)];faces.push({pts,d:pt(...pts[0])[1]+pt(...pts[1])[1]})}
 faces.sort((a,b)=>a.d-b.d).forEach(({pts})=>{const top=pt(...pts[3]),low=pt(...pts[0]),sheen=ctx.createLinearGradient(top[0],top[1],low[0]+.1,low[1]+.1);
 sheen.addColorStop(0,h===4?'#adc7ce':paint);sheen.addColorStop(1,h===4?'#466171':h===1?'#556063':paint);fill(pts,sheen);if(h===4&&Math.abs(pts[0][0])>.19&&Math.abs(pts[0][1])>.10)line([pts[0],pts[3]],.009,paint)})
 }fill(Array.from({length:20},(_,k)=>ring(rings[4],k)),paint);
 for(const a of [-.18,.18])wheel(a,near*.145,.066,.06,false);
 line([[-.14,near*.143,.154],[.17,near*.143,.154]],.009,'#d0d6cc');
 for(const b of [-.081,.081]){oval(front*.289,b,.122,.023,.012,front>0?'#ffe5ae':pose.braking?'#ff7050':'#ae463c');
 if(night)fill([[.295,b,.018],[.64,b-.072,.011],[.64,b+.072,.011]],'#ffde9a38')}
 return}
 const coat=['#b46c51','#476781','#84925f','#c2945d','#a58395','#527e76'][j%6],skin=['#cb9776','#d6ad8c','#9f7359'][j%3];
 if(kind==='scooter'||kind==='scooterRack'){
 for(const a of [-.16,.16])wheel(a,0,.055,.05,false);line([[-.16,0,.07],[.12,0,.07],[.16,0,.36]],.024,'#73968e');line([[.16,-.045,.36],[.16,.045,.36]],.024,'#455852');
 if(kind==='scooter'){line([[-.075,0,.09],[-.045,0,.21],[0,0,.28],[.025,0,.40]],.053,coat);line([[.025,0,.38],[.08,near*.035,.32],[.16,near*.035,.36]],.026,skin);oval(.03,0,.455,.046,.056,skin);oval(.03,0,.49,.05,.028,'#677680')}
 return}
 if(kind==='cycle'||kind==='bikeRack'){
 const rear=[-.18,0,.12],hub=[.18,0,.12],crank=[0,0,.10],seat=[-.08,0,.31],bars=[.125,0,.33];
 wheel(...rear,.116,true);wheel(...hub,.116,true);line([rear,seat,crank,rear],.018,coat);line([seat,bars,crank],.017,coat);line([hub,bars,[.14,.05,.36]],.017,'#657678');
 line([[-.13,0,.323],[-.045,0,.323]],.028,'#423c37');
 if(kind==='bikeRack')return;
 for(const side of [-near,near]){const a=phase+(side===near?0:Math.PI),pedal=[.057*Math.cos(a),side*.035,.12+.057*Math.sin(a)];line([[ -.065,side*.024,.32],[.08,side*.036,.25+.018*Math.sin(a)],pedal],.043,'#435057')}
 line([[-.065,0,.32],[.012,0,.46]],.084,coat);line([[.018,near*.024,.437],[.074,near*.038,.366],[.14,near*.04,.35]],.029,skin);
 oval(.041,0,.512,.049,.061,skin);oval(.036,0,.544,.05,.028,'#5a5450');return}
 if(age===2)phase*=.77;
 const bob=.009*Math.cos(phase*2),hip=.17+bob,shoulder=.296+bob;
 for(const side of [-near,near]){
 const a=phase+(side===near?0:Math.PI),swing=Math.sin(a),lift=Math.max(0,Math.cos(a)),foot=[.088*swing,side*.021,.018+.045*lift],knee=[.04*swing+.035*lift,side*.021,.092+.019*lift];
 line([[0,side*.022,hip],knee,foot],.035,'#48535a');line([foot,[foot[0]+.027,foot[1],foot[2]]],.025,'#403c39')
 }
 // Jacket silhouette, collar and a shaded side panel follow the shoulder bob.
 const [cx,cy]=pt(.004,0,shoulder);
 const cloth=ctx.createLinearGradient(cx-unit*.06,cy,cx+unit*.06,cy+unit*.07);
 cloth.addColorStop(0,coat);cloth.addColorStop(.8,coat);cloth.addColorStop(1,'#59605a');
 ctx.fillStyle=cloth;ctx.beginPath();ctx.moveTo(cx-unit*.045,cy);
 ctx.quadraticCurveTo(cx,cy-unit*.022,cx+unit*.047,cy);
 ctx.quadraticCurveTo(cx+unit*.055,cy+unit*.037,cx+unit*.036,cy+unit*.089);
 ctx.lineTo(cx+unit*.046,cy+unit*.141);ctx.quadraticCurveTo(cx,cy+unit*.153,cx-unit*.043,cy+unit*.136);ctx.closePath();ctx.fill();
 oval(.006,0,shoulder+.016,.021,.024,skin);
 for(const side of [-near,near]){const swing=Math.sin(phase+(side===near?0:Math.PI));line([[.008,side*.036,shoulder],[.003-.039*swing,side*.046,.237+bob]],.033,coat);line([[.003-.039*swing,side*.046,.237+bob],[.019-.075*swing,side*.045,.20+bob]],.024,skin)}
 oval(.011,0,.357+bob,.043,.053,skin);oval(.003,0,.383+bob,.045,.031,age===2?'#c5c0b4':'#514941');if(gender)oval(-.034,0,.355+bob,.023,.035,age===2?'#beb9ad':'#594e47');oval(.046,0,.357+bob,.012,.014,skin);
 if(age===2)line([[.064,near*.045,.20+bob],[.09,near*.05,.012]],.013,'#806448');
 if(age===0)oval(-.056,0,.24+bob,.042,.06,'#b75f48');
 if(j%3===1){line([[-.03,near*.024,shoulder],[.015,near*.03,hip+.01]],.011,'#706047');oval(-.022,near*.036,hip+.013,.037,.032,'#795945')}
 }
 return {sample,draw};
})();
