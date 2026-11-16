'use strict';
const MuseumModels=(()=>{
 const T=THREE,P=Math.PI, cache=new Map();
 const palette={steel:'#b9c3c2',chrome:'#d1d9d8',iron:'#3c4242',brass:'#bb9559',copper:'#bd7753',wood:'#aa7650',oak:'#c8a77a',walnut:'#79533b',cream:'#eee4ce',white:'#e8e6dc',sage:'#739485',blue:'#507787',navy:'#334451',red:'#b65748',yellow:'#d2ab56',black:'#252a2a',rubber:'#353839',glass:'#a9cbcc',paper:'#e9dfcc',ink:'#555a55',pink:'#c98c88',clay:'#b47550'};
 function mat(k){
   if(cache.has(k))return cache.get(k);
   const metal=['chrome','steel','iron','brass','copper'].includes(k),wood=['wood','oak','walnut'].includes(k);
   const m=new T.MeshStandardMaterial({color:palette[k]||k,metalness:metal?.72:.05,roughness:metal?.29:wood?.59:.42,
     transparent:k==='glass',opacity:k==='glass'?.48:1,side:T.DoubleSide});
   if(wood){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.fillStyle='#fff8e9';g.fillRect(0,0,128,64);for(let j=0;j<62;j++){g.strokeStyle=j%3?'#b7947130':'#8b6b4e49';g.beginPath();for(let x=0;x<=128;x+=4){const y=j+1.7*Math.sin(x/18+j)*Math.sin(x/39+j*.3);if(x)g.lineTo(x,y);else g.moveTo(x,y)}g.stroke()}m.map=new T.CanvasTexture(c);m.map.colorSpace=T.SRGBColorSpace}
   cache.set(k,m);return m;
 }
 function build(id){
   const root=new T.Group(),meshes=[];
   function mesh(geo,k,x,y,z){const m=new T.Mesh(geo,mat(k));m.position.set(x,y,z);root.add(m);meshes.push(m);return m}
   function box(x,y,z,w,h,d,k='cream',r=.035){
     r=Math.min(r,w*.48,h*.48,d*.48);let geo;
     if(r<.004)geo=new T.BoxGeometry(w,h,d);
     else{const s=new T.Shape(),a=-w/2+r,b=w/2-r,l=-h/2+r,u=h/2-r;
       s.moveTo(a,l);s.lineTo(b,l);s.lineTo(b,u);s.lineTo(a,u);s.closePath();
       geo=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3});geo.translate(0,0,-(d-2*r)/2)}
     return mesh(geo,k,x,y,z)
   }
   function cyl(x,y,z,rt,rb,h,k='steel',n=36){return mesh(new T.CylinderGeometry(rt,rb,h,n),k,x,y,z)}
   function egg(x,y,z,a,b,c,k){const m=mesh(new T.SphereGeometry(1,32,20),k,x,y,z);m.scale.set(a,b,c);return m}
   function rod(a,b,r,k='steel',r2=r,n=16){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),m=cyl(0,0,0,r2,r,v.length(),k,n);m.position.copy(A.add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m}
   function tube(points,r,k){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(path,32,r,10,false),k,0,0,0)}
   function ring(x,y,z,R,r,k,plane='xy'){const m=mesh(new T.TorusGeometry(R,r,12,48),k,x,y,z);if(plane==='xz')m.rotation.x=P/2;return m}
   function pot(x,y,z,profile,k){return mesh(new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),48),k,x,y,z)}
   function vessel(r,h,k,base=.72){return pot(0,0,0,[[.001,0],[r*base,0],[r*base,.05],[r,h*.94],[r,h],[r-.045,h],[r*base-.035,.09],[.001,.09]],k)}
   function disk(x,y,z,r,h,k){const m=cyl(x,y,z,r,r,h,k);m.rotation.x=P/2;return m}
   function handle(x,y,z,w,h,k='cream'){tube([[x,y-h/2,z],[x+w,y-h*.43,z],[x+w*1.13,y,z],[x+w,y+h*.43,z],[x,y+h/2,z]],.067,k)}
   function panel(x,y,z,w,h,k='black'){return box(x,y,z,w,h,.055,k)}
   function dots(x,y,z,n,m,dx,dy,k='black',r=.028){for(let j=0;j<m;j++)for(let i=0;i<n;i++)disk(x+i*dx,y+j*dy,z,r,.023,k)}
   function buttons(x,y,z,n,k='cream'){for(let i=0;i<n;i++)box(x+i*.15,y,z,.1,.065,.06,k)}
   function spout(x,y,r,h,k){rod([x,y,0],[x+.45,y+h,0],r,k,r*.5)}
   function feet(w,d){for(const x of [-w,w])for(const z of [-d,d])cyl(x,.02,z,.09,.1,.06,'rubber')}
   function screen(w,h,d,k='navy'){box(0,h/2,0,w,h,d,k,.075);panel(0,h*.52,d*.51,w*.89,h*.81,'black');panel(0,h*.54,d*.51+.028,w*.82,h*.69,'blue')}
   function wheel(x,y,z,r){disk(x,y,z,r,.11,'rubber');disk(x,y,z+.055,r*.4,.025,'steel')}
   function tag(x,y,z,w,h,txt,bg='#e9dcc1',fg='#423d35'){
     const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,256,96);g.fillStyle=fg;g.textAlign='center';g.font='bold 43px Georgia';g.fillText(txt,128,62);
     const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.65}));m.position.set(x,y,z);root.add(m)
   }
   function blade(x,y,z,a,b,c,k,ang){const m=egg(x,y,z,a,b,c,k);m.rotation.z=ang;return m}
   function forkHandle(){rod([-.65,.06,0],[.28,.06,0],.073,'steel',.044)}
   switch(id){
   case 0:{
     // The inner surface dips below the rim. A second surface gives the bowl a rolled edge.
     const outline=[],indices=[],rings=12,slices=48;
     for(let side=0;side<2;side++)for(let j=0;j<=rings;j++)for(let i=0;i<=slices;i++){
       const a=2*P*i/slices,u=j/rings,xx=u*Math.cos(a),zz=u*Math.sin(a);
       outline.push(.38+.37*xx,.045+.101*u*u-.018*side+.022*xx,.232*zz*(1+.2*xx));
       if(j&&i){const k=outline.length/3-1;indices.push(k,k-1,k-slices-2,k,k-slices-2,k-slices-1)}
     }
     const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(outline,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,'chrome',0,0,0);
     const end=egg(-.7,.14,0,.22,.032,.082,'chrome');end.rotation.z=-.065;
     tube([[-.77,.14,0],[-.57,.137,0],[-.21,.105,0],[.055,.14,0]],.04,'chrome');break;
   }
   case 1:forkHandle();box(.33,.06,0,.17,.075,.32,'steel');for(let i=0;i<4;i++)rod([.38,.06,(i-1.5)*.093],[.79,.1,(i-1.5)*.093],.032,'chrome',.008);break;
   case 2:for(const z of [-.13,.13])rod([-.85,.06,z],[.85,.045,z*.38],.055,'walnut',.019,8);break;
   case 3:pot(0,0,0,[[.01,0],[.25,0],[.28,.09],[.53,.22],[.66,.51],[.66,.58],[.62,.58],[.47,.28],[.18,.12],[0,.12]],'cream');ring(0,.51,0,.638,.025,'blue','xz');break;
   case 4:vessel(.42,.82,'sage',.93);handle(.36,.43,0,.34,.52,'sage');break;
   case 5:pot(0,0,0,[[0,.05],[.33,0],[.48,.03],[.88,.16],[.9,.2],[.77,.19],[.55,.1],[0,.1]],'white');ring(0,.18,0,.82,.015,'brass','xz');break;
   case 6:cyl(0,.04,0,.34,.37,.07,'glass');cyl(0,.34,0,.044,.055,.6,'glass');pot(0,.58,0,[[.01,0],[.18,.06],[.36,.23],[.39,.41],[.32,.69],[.29,.69],[.34,.4],[.15,.12]],'glass');break;
   case 7:vessel(.43,1.04,'glass',.85);handle(.41,.56,0,.31,.72,'cream');spout(.32,.89,.14,.13,'glass');break;
   case 8:egg(0,.4,0,.55,.42,.46,'cream');spout(.33,.37,.18,.41,'cream');handle(-.4,.45,0,-.34,.47);cyl(0,.77,0,.32,.36,.07,'sage');egg(0,.86,0,.09,.09,.09,'brass');break;
   case 9:pot(0,0,0,[[0,0],[.34,0],[.32,.06],[.13,.13],[.12,.32],[.28,.48],[.32,.66],[.27,.66],[.19,.46],[.1,.39]],'blue');break;
   case 10:vessel(.64,.19,'iron',.85);rod([.53,.09,0],[1.41,.18,0],.085,'walnut',.115);break;
   case 11:vessel(.55,.56,'copper',.94);rod([.48,.39,0],[1.25,.5,0],.095,'walnut');break;
   case 12:pot(0,0,0,[[.01,0],[.22,.04],[.33,.16],[.32,.2],[.26,.13],[.01,.05]],'chrome');rod([.25,.12,0],[.89,.88,0],.045,'chrome');break;
   case 13:rod([0,0,0],[0,.59,0],.09,'walnut');for(let j=0;j<8;j++){let a=j*P/4;const x=Math.cos(a)*.3,z=Math.sin(a)*.3;tube([[0,.56,0],[x,.93,z],[x*.68,1.23,z*.68],[0,1.34,0]],.018,'steel')}break;
   case 14:rod([-.55,.23,0],[.55,.23,0],.23,'oak');rod([-.88,.23,0],[.88,.23,0],.087,'walnut');break;
   case 15:box(0,.07,0,1.47,.14,.91,'oak',.06);box(.81,.07,0,.35,.12,.28,'oak');ring(.93,.08,0,.085,.028,'walnut','xz');break;
   case 16:for(let j=1;j<=7;j++)ring(0,j*.052,0,Math.sqrt(j/7)*.55,.017,'steel','xz');for(let j=0;j<16;j++){let a=j*P/8;rod([0,.02,0],[.55*Math.cos(a),.37,.55*Math.sin(a)],.014)}handle(.5,.34,0,.23,.14,'steel');break;
   case 17:vessel(.42,.75,'glass');handle(.37,.39,0,.24,.43,'red');for(let j=1;j<6;j++)box(.07,j*.11,.36,.18,.013,.025,'red');break;
   case 18:cyl(0,.27,0,.2,.22,.54,'glass');egg(0,.57,0,.21,.12,.21,'steel');for(let j=0;j<5;j++)cyl(.09*Math.cos(j),.673,.09*Math.sin(j),.019,.019,.015,'black');break;
   case 19:for(let y of [.05,1])cyl(0,y,0,.36,.36,.09,'walnut');for(let i=0;i<3;i++)rod([.29*Math.cos(i*2.1),.08,.29*Math.sin(i*2.1)],[.29*Math.cos(i*2.1),.98,.29*Math.sin(i*2.1)],.029,'brass');pot(0,.1,0,[[.23,0],[.25,.12],[.045,.42],[.25,.76],[.23,.86]],'glass');cyl(0,.2,0,.015,.23,.2,'yellow');break;
   case 20:box(0,.38,0,1.2,.69,.73,'sage',.12);for(let z of [-.17,.17])box(0,.733,z,.85,.016,.085,'black');rod([.57,.29,0],[.74,.29,0],.045);feet(.4,.23);break;
   case 21:box(0,.46,0,1.5,.91,.95,'cream');panel(-.16,.48,.49,.98,.65);panel(-.16,.48,.526,.83,.49,'navy');disk(.55,.3,.5,.1,.06,'steel');buttons(.39,.68,.5,2);break;
   case 22:box(0,.93,0,.91,1.85,.78,'white');for(const [y,h] of [[.43,.82],[1.36,.94]])box(0,y,.41,.91,h,.08,'sage');box(-.32,1.04,.5,.04,.36,.05,'steel');break;
   case 23:box(0,.68,0,1.18,1.36,.93,'white');disk(0,.6,.49,.44,.07,'chrome');disk(0,.6,.54,.34,.06,'navy');disk(.37,1.14,.5,.095,.045,'steel');panel(-.23,1.15,.48,.39,.14);break;
   case 24:cyl(0,.13,0,.65,.64,.26,'rubber');cyl(0,.27,0,.63,.64,.065,'white');cyl(.2,.34,0,.17,.17,.09,'sage');break;
   case 25:box(0,.05,0,.72,.1,.6,'cream');cyl(0,.48,0,.06,.09,.8);for(let j=0;j<3;j++){let a=j*P*2/3;blade(Math.sin(a)*.18,1+Math.cos(a)*.18,0,.14,.3,.05,'sage',-a)}for(let r of [.15,.27,.39,.5])ring(0,1,.09,r,.014,'steel');for(let j=0;j<12;j++)rod([0,1,.12],[Math.sin(j*P/6)*.5,1+Math.cos(j*P/6)*.5,.09],.012);disk(0,1,.12,.09,.08,'cream');break;
   case 26:pot(0,0,0,[[.01,0],[.41,0],[.46,.14],[.37,.76],[.28,.9],[0,.9]],'steel');spout(.29,.61,.15,.24,'steel');handle(-.34,.46,0,-.29,.62,'black');break;
   case 27:box(0,.32,0,.98,.61,.85,'cream',.16);egg(0,.6,0,.49,.15,.42,'sage');panel(0,.36,.439,.48,.17,'black');tag(0,.36,.472,.34,.09,'06:30');break;
   case 28:box(0,.17,0,.7,.34,.61,'red');vessel(.28,.95,'glass');cyl(0,1,0,.33,.33,.08,'rubber');handle(.27,.68,0,.21,.47,'glass');disk(0,.18,.32,.09,.05,'chrome');break;
   case 29:pot(0,0,0,[[.01,0],[.53,0],[.53,.09],[.43,.24],[.01,.24]],'steel').scale.x=1.6;handle(0,.36,0,.55,.25,'blue');box(-.1,.41,0,.44,.13,.16,'blue');break;
   case 30:screen(1.55,.94,.14);box(0,-.18,0,.13,.34,.13,'steel');box(0,-.36,0,.73,.07,.44,'black');break;
   case 31:box(0,.37,0,1.22,.74,.44,'walnut');panel(-.22,.34,.24,.58,.51,'ink');dots(-.44,.17,.28,6,5,.085,.079,'cream',.018);disk(.39,.26,.25,.12,.06,'brass');tag(.29,.56,.257,.45,.14,'FM  88');rod([-.46,.74,0],[-.77,1.31,0],.018);break;
   case 32:box(0,.37,0,1.12,.72,.46,'black',.08);box(0,.7,0,1.07,.13,.45,'steel');disk(.05,.38,.32,.295,.26,'iron');disk(.05,.38,.48,.22,.09,'navy');box(-.29,.79,0,.24,.09,.24,'chrome');break;
   case 33:box(0,.67,0,.81,1.34,.66,'walnut');panel(0,.66,.34,.73,1.17,'ink');for(let [y,r] of [[.42,.24],[.98,.13]]){disk(0,y,.39,r,.06,'black');disk(0,y,.43,r*.45,.055,'steel')}break;
   case 34:tube([[-.48,.34,0],[-.51,.87,0],[0,1.16,0],[.51,.87,0],[.48,.34,0]],.078,'black');for(let x of [-.48,.48])egg(x,.33,0,.135,.27,.21,'rubber');break;
   case 35:cyl(0,.08,0,.32,.35,.1,'iron');cyl(0,.43,0,.043,.06,.67,'chrome');egg(0,.88,0,.22,.31,.19,'iron');for(let i=0;i<6;i++)ring(0,.71+i*.058,0,.185,.014,'steel','xz');break;
   case 36:cyl(0,.027,0,.71,.71,.045,'black');for(let i=0;i<8;i++)ring(0,.051,0,.29+i*.048,.003,'ink','xz');cyl(0,.053,0,.21,.21,.009,'red');cyl(0,.062,0,.03,.03,.01,'black');break;
   case 37:box(0,.35,0,1.12,.7,.14,'iron');panel(0,.42,.076,.99,.39,'cream');for(let x of [-.25,.25]){disk(x,.42,.12,.13,.018,'walnut');disk(x,.42,.14,.063,.02,'white')}break;
   case 38:box(0,.56,0,.4,1.12,.13,'rubber',.06);dots(-.11,.2,.08,3,5,.11,.12,'cream',.032);disk(-.11,.96,.08,.044,.03,'red');break;
   case 39:box(0,.39,0,1.12,.65,.72,'cream');disk(-.25,.42,.46,.22,.23,'iron');disk(-.25,.42,.59,.16,.03,'navy');for(let i=0;i<5;i++)box(.34,.23+i*.07,.365,.29,.019,.018,'ink');break;
   case 40:rod([-.72,.07,0],[.56,.07,0],.071,'yellow',.071,6);rod([.56,.07,0],[.79,.07,0],.071,'oak',.006,6);rod([.73,.07,0],[.8,.07,0],.025,'black',.001);rod([-.83,.07,0],[-.72,.07,0],.071,'pink');break;
   case 41:box(0,.12,0,.86,.24,.44,'cream');box(.1,.12,0,.51,.255,.45,'blue');tag(.1,.12,.231,.4,.12,'ERASER');break;
   case 42:box(0,.09,0,.85,.14,1.15,'paper');box(0,.17,0,.88,.04,1.19,'sage');for(let i=0;i<8;i++){const m=ring(-.4,.14,-.47+i*.13,.068,.014,'steel');m.rotation.y=P/2}break;
   case 43:box(0,.039,0,1.64,.078,.24,'oak');for(let i=0;i<31;i++)box(-.75+i*.05,.081,-.06,.009,.008,i%5?.065:.12,'ink');break;
   case 44:for(let d of [-1,1]){ring(-.43,.08,d*.19,.17,.047,'red','xz');rod([-.32,.08,d*.16],[.66,.08,-d*.25],.047,'steel',.008)}cyl(0,.1,0,.06,.06,.05,'chrome');break;
   case 45:box(0,.06,0,1,.1,.29,'rubber');rod([-.39,.1,0],[.4,.2,0],.065,'steel');box(0,.23,0,1,.16,.31,'red').rotation.z=.09;break;
   case 46:box(0,.1,0,1,.2,.4,'navy');ring(-.23,.38,0,.24,.11,'cream');box(.39,.23,0,.15,.25,.38,'navy');box(.39,.37,0,.14,.032,.39,'chrome');break;
   case 47:vessel(.31,.65,'iron',1);for(let i=0;i<3;i++)rod([-.12+i*.12,.4,0],[-.21+i*.21,1.04+i*.06,0],.036,['yellow','red','sage'][i]);break;
   case 48:tube([[.28,0,-.08],[-.28,0,-.08],[-.46,0,.02],[-.3,0,.14],[.33,0,.14],[.47,0,0],[.31,0,-.17],[-.35,0,-.17]],.03,'chrome');break;
   case 49:cyl(0,.06,0,.39,.41,.1,'sage');rod([0,.09,0],[-.2,.72,0],.04,'brass');rod([-.2,.72,0],[.26,1.06,0],.04,'brass');cyl(.29,.94,0,.12,.26,.3,'sage').rotation.z=.45;break;
   case 50:screen(.68,1.29,.095,'iron');box(0,.06,-.063,.38,.06,.04,'black');disk(-.2,1.13,-.075,.078,.035,'navy');break;
   case 51:box(0,.05,.06,1.41,.09,.88,'steel');box(0,.49,-.35,1.38,.86,.06,'iron').rotation.x=-.12;panel(0,.5,-.299,1.26,.72,'blue').rotation.x=-.12;for(let j=0;j<3;j++)for(let i=0;i<10;i++)box(-.55+i*.12,.101,-.19+j*.096,.092,.018,.065,'black');break;
   case 52:box(0,.07,0,1.54,.13,.6,'iron');for(let j=0;j<4;j++)for(let i=0;i<12;i++)box(-.68+i*.123,.157,-.212+j*.134,.099,.055,.099,'cream');break;
   case 53:egg(0,.13,0,.31,.17,.46,'white');box(0,.279,-.1,.028,.018,.33,'ink');egg(0,.301,-.12,.039,.035,.089,'rubber');break;
   case 54:box(-.11,.09,0,.71,.18,.31,'blue');box(.39,.09,0,.29,.13,.24,'chrome');for(let z of [-.06,.06])box(.42,.159,z,.07,.007,.047,'black');break;
   case 55:box(0,.31,0,1.37,.61,.12,'black',.077);panel(0,.31,.076,.85,.47,'blue');dots(-.54,.22,.09,1,2,0,.17,'sage',.064);dots(.46,.24,.09,2,2,.092,.11,'red',.035);break;
   case 56:screen(.95,1.23,.085,'steel');disk(0,.085,.09,.037,.02,'black');break;
   case 57:box(0,.12,0,1,.24,.62,'cream');for(let x of [-.39,.39])rod([x,.22,-.18],[x*1.28,.81,-.2],.038,'black');dots(-.28,.14,.325,5,1,.12,0,'sage',.021);break;
   case 58:box(0,.05,0,.6,.1,.34,'rubber');rod([0,.09,0],[0,.31,0],.06);egg(0,.44,0,.38,.21,.16,'black');disk(0,.44,.16,.12,.09,'blue');break;
   case 59:box(0,.27,0,.52,.52,.46,'white');for(let x of [-.14,.14])box(x,.67,0,.055,.3,.095,'chrome');panel(0,.25,.237,.23,.08);break;
   case 60:rod([-.73,.06,0],[.45,.09,0],.065,'sage',.042);box(.53,.09,0,.33,.082,.14,'sage');for(let i=0;i<7;i++)for(let j of [-1,1])box(.4+i*.042,.18,.037*j,.026,.13,.027,'cream');break;
   case 61:box(0,.09,0,1.15,.14,.12,'walnut');for(let i=0;i<18;i++)rod([-.52+i*.061,.09,.025],[-.52+i*.061,.09,.35],.022,'walnut',.009);break;
   case 62:disk(0,.7,0,.41,.1,'brass');disk(0,.7,.06,.36,.021,'chrome');box(0,.22,0,.115,.55,.095,'oak');break;
   case 63:box(0,.145,0,.8,.29,.49,'pink',.13);tag(0,.15,.25,.34,.1,'SAVON','#c98c88');break;
   case 64:box(0,.42,0,.59,.84,.38,'sage',.12);cyl(0,.91,0,.13,.15,.17,'cream');box(.09,1.02,0,.37,.08,.14,'cream');tag(0,.42,.193,.38,.29,'SOAP');break;
   case 65:cyl(0,.28,0,.15,.16,.56,'black');cyl(0,.61,0,.115,.115,.16,'brass');egg(0,.79,0,.1,.22,.1,'red').rotation.z=-.15;break;
   case 66:box(0,.34,0,.67,.65,.36,'glass',.075);cyl(0,.73,0,.1,.12,.19,'brass');box(0,.92,0,.27,.21,.23,'black');tag(0,.35,.186,.37,.24,'IRIS');break;
   case 67:rod([-.43,.69,0],[.44,.69,0],.25,'blue',.17);rod([-.16,.64,0],[-.28,.06,0],.105,'blue');rod([.44,.69,0],[.54,.69,0],.14,'black');break;
   case 68:rod([0,.03,0],[0,.77,0],.071,'sage',.049);box(0,.84,0,.49,.18,.13,'iron');for(let i=0;i<3;i++)box(0,.8+i*.035,.071,.4,.011,.02,'chrome');break;
   case 69:box(0,.07,0,.98,.14,.88,'glass',.065);box(0,.16,-.24,.34,.034,.14,'black');for(let x of [-.32,.32])box(x,.15,.08,.14,.03,.44,'chrome');break;
   case 70:box(0,.08,0,.29,.1,1.5,'walnut');cyl(0,.16,0,.31,.32,.12,'brass');cyl(0,.23,0,.27,.27,.03,'cream');rod([0,.25,0],[.15,.25,.025],.018,'black');rod([0,.25,0],[-.06,.25,-.18],.016,'black');break;
   case 71:for(let x of [-.31,.31]){ring(x,.27,0,.24,.028,'brass');rod([x*1.65,.32,0],[x*1.62,.29,-.64],.022,'brass')}rod([-.09,.31,0],[.09,.31,0],.017,'brass');break;
   case 72:ring(-.3,.06,0,.19,.062,'brass','xz');box(.18,.06,0,.64,.09,.11,'brass');for(let i=0;i<3;i++)box(.21+i*.12,.06,.09,.065,.09,.17-i*.028,'brass');break;
   case 73:box(0,.27,0,.62,.52,.29,'brass');tube([[-.2,.46,0],[-.2,.77,0],[0,.88,0],[.2,.77,0],[.2,.46,0]],.054,'chrome');disk(0,.27,.153,.055,.016,'black');break;
   case 74:cyl(0,.59,0,.08,.24,.96,'navy',8);cyl(0,.52,0,.198,.2,.085,'walnut');tube([[0,.14,0],[0,-.04,0],[.105,-.09,0],[.15,.03,0]],.043,'oak');break;
   case 75:cyl(0,.48,0,.23,.23,.93,'sage');cyl(0,.98,0,.2,.23,.13,'steel');cyl(0,1.1,0,.21,.21,.14,'rubber');break;
   case 76:rod([-.55,.2,0],[.24,.2,0],.13,'iron');rod([.2,.2,0],[.48,.2,0],.14,'iron',.245);rod([.48,.2,0],[.51,.2,0],.22,'cream');break;
   case 77:box(0,.1,0,.88,.2,.54,'walnut',.065);box(0,.216,0,.86,.04,.52,'wood');box(.29,.24,0,.15,.037,.32,'walnut');cyl(.29,.266,.08,.035,.035,.015,'brass');break;
   case 78:box(0,.6,0,.81,1.05,.49,'blue',.1);for(let x of [-.26,0,.26])box(x,.62,.255,.035,.79,.03,'navy');handle(-.12,1.14,0,.24,.18,'black');for(let x of [-.29,.29])wheel(x,.09,.16,.09);break;
   case 79:for(let x of [-.22,.22]){rod([x,.22,-.43],[x,.22,.34],.13,'iron',.21);disk(x,.22,.36,.17,.025,'navy')}box(0,.22,0,.4,.13,.22,'black');break;
   case 80:box(0,.3,0,.6,.6,.6,'cream',.07);for(let [x,y] of [[0,.3],[-.16,.46],[.16,.14]])disk(x,y,.306,.055,.014,'iron');for(let x of [-.14,.14])for(let z of [-.14,.14])cyl(x,.605,z,.05,.05,.012,'iron');for(let y of [.16,.44]){const p=disk(.306,y,0,.052,.017,'iron');p.rotation.y=P/2}break;
   case 81:pot(0,0,0,[[0,0],[.07,.085],[.4,.32],[.36,.39],[.2,.43],[.055,.44],[.055,.68],[0,.7]],'oak');ring(0,.33,0,.395,.027,'red','xz');break;
   case 82:for(let z of [-.087,.087])disk(0,.32,z,.32,.135,'red');disk(0,.32,.165,.19,.015,'cream');tube([[0,.33,0],[.03,.68,0],[.18,.94,0],[.16,1.02,0]],.012,'cream');break;
   case 83:rod([0,.03,0],[0,.74,0],.105,'oak',.065);rod([-.31,.53,0],[.31,.53,0],.12,'oak');egg(0,.86,0,.2,.2,.2,'red');tube([[.25,.55,0],[.48,.27,0],[.46,.74,0],[.15,.89,0]],.012,'cream');break;
   case 84:egg(0,.62,0,.33,.39,.055,'oak');egg(0,.63,.043,.315,.375,.033,'red');box(0,.17,0,.145,.45,.105,'walnut');break;
   case 85:egg(0,.09,0,.12,.1,.12,'oak');for(let i=0;i<12;i++){let a=i*P/6;rod([.07*Math.cos(a),.14,.07*Math.sin(a)],[.25*Math.cos(a),.58,.25*Math.sin(a)],.013,'cream');let m=egg(.19*Math.cos(a),.48,.19*Math.sin(a),.052,.16,.025,'white');m.rotation.z=-.35*Math.cos(a);m.rotation.y=-a}break;
   case 86:cyl(0,.11,0,.54,.54,.21,'wood');cyl(0,.23,0,.54,.54,.025,'cream');for(let i=0;i<8;i++)cyl(.53*Math.cos(i*P/4),.11,.53*Math.sin(i*P/4),.105,.105,.025,'brass');break;
   case 87:box(0,.13,0,1.05,.25,.29,'chrome');for(let i=0;i<10;i++)panel(-.445+i*.099,.12,.152,.062,.076);break;
   case 88:pot(0,0,0,[[0,0],[.3,0],[.32,.08],[.24,.16],[.17,.23],[.13,.58],[.25,.65],[.25,.77],[0,.77]],'walnut');for(let j=0;j<6;j++)box(.195*Math.cos(j*P/3),.81,.195*Math.sin(j*P/3),.12,.13,.12,'walnut');break;
   case 89:rod([-.54,.07,0],[.16,.32,0],.063,'walnut');const seed=egg(.32,.4,0,.31,.17,.18,'yellow');seed.rotation.z=.34;break;
   case 90:vessel(.47,.7,'clay',.67);cyl(0,.66,0,.5,.49,.15,'clay');cyl(0,.739,0,.43,.43,.01,'walnut');break;
   case 91:vessel(.39,.51,'sage',1.05);handle(-.31,.38,0,-.31,.43,'sage');rod([.32,.18,0],[.86,.7,0],.09,'sage',.048);egg(.87,.72,0,.13,.065,.12,'steel');break;
   case 92:rod([-.67,.1,0],[-.07,.13,0],.083,'oak');rod([-.09,.13,0],[.15,.12,0],.039,'steel');egg(.38,.1,0,.34,.055,.165,'steel');break;
   case 93:rod([-.49,.065,0],[.33,.19,0],.074,'oak',.087);box(.35,.2,0,.23,.22,.53,'iron');box(.35,.2,.3,.28,.26,.1,'steel');break;
   case 94:rod([-.62,.09,0],[.02,.09,0],.065,'oak');box(.12,.09,0,.27,.13,.37,'chrome');box(.43,.09,0,.39,.13,.36,'cream');for(let i=0;i<8;i++)rod([.35,.162,-.14+i*.04],[.62,.161,-.14+i*.04],.007,'oak');break;
   case 95:cyl(0,.31,0,.22,.22,.58,'red');for(let i=0;i<19;i++)ring(0,.07+i*.027,0,.222,.012,'pink','xz');for(let y of [.035,.59])cyl(0,y,0,.29,.29,.065,'oak');break;
   case 96:box(-.15,.28,0,.56,.55,.31,'yellow',.1);box(.43,.035,0,.73,.033,.14,'yellow');for(let i=0;i<9;i++)box(.12+i*.075,.055,-.03,.009,.006,.067,'ink');break;
   case 97:vessel(.46,.68,'steel');tube([[-.44,.52,0],[-.4,.9,0],[0,1.17,0],[.4,.9,0],[.44,.52,0]],.023,'iron');break;
   case 98:pot(0,0,0,[[0,0],[.25,0],[.28,.12],[.24,.43],[.11,.58],[.09,.74],[0,.74]],'glass');box(.06,.8,0,.37,.13,.16,'red');box(.205,.68,0,.05,.2,.07,'red').rotation.z=-.35;break;
   case 99:for(let z of [-.063,.063]){let p=box(0,.08,z,1,.12,.09,'oak');p.rotation.y=z*.85}ring(0,.12,0,.086,.023,'steel');rod([-.12,.14,.06],[.16,.14,-.07],.018,'steel');break;
   default:throw Error('Unknown museum object '+id);
   }
   const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
   const normalized=new T.Group(),scale=1.32/Math.max(size.x,size.y,size.z);
   root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);root.scale.setScalar(scale);normalized.add(root);
   return normalized;
 }
 return {build,mat};
})();
