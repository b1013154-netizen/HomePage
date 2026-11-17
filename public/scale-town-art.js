'use strict';
const TownArt=(()=>{
 const W=30,H=15,Z=37,N=Town.N;
 const shade=(hex,k)=>{let n=parseInt(hex.slice(1),16);return 'rgb('+[16,8,0].map(s=>Math.min(255,Math.round(((n>>s)&255)*k))).join(',')+')'};
 function view(g,projection,rotation,night){
 const p=projection,c=g;
 function poly(points,fill,edge){c.beginPath();points.forEach(([x,y,z],i)=>{const v=p(x,y,z||0);i?c.lineTo(...v):c.moveTo(...v)});c.closePath();c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=.65;c.stroke()}}
 function line(a,b,color,w=1){c.beginPath();c.moveTo(...p(...a));c.lineTo(...p(...b));c.strokeStyle=color;c.lineWidth=w;c.stroke()}
 function ellipse(x,y,z,rx,ry,color){const [a,b]=p(x,y,z);const scale=Math.abs(p(x+1,y,z)[0]-a)/W;c.beginPath();c.ellipse(a,b,Math.max(.12,rx*scale),Math.max(.12,ry*scale),0,0,Math.PI*2);c.fillStyle=color;c.fill()}
 function tile(x,y,w,d,z,fill,edge){poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],fill,edge)}
 const sx=[1,-1,-1,1][rotation],sy=[1,1,-1,-1][rotation];
 function block(x,y,z,w,d,h,base,roof=base){
 const X=x+w,Y=y+d,T=z+h,front=sy>0?Y:y,side=sx>0?X:x;
 poly([[x,front,z],[X,front,z],[X,front,T],[x,front,T]],shade(base,sy>0?.85:.78));poly([[side,y,z],[side,Y,z],[side,Y,T],[side,y,T]],shade(base,.69));tile(x,y,w,d,T,roof)}
 function tree(x,y,s=.75){ellipse(x+.05,y+.04,.01,10*s,4*s,'#345a4838');block(x-.035*s,y-.035*s,0,.07*s,.07*s,.47*s,'#765d48');for(const [a,b,z,r,col] of [[0,.01,.51,10,'#526f59'],[-.07,0,.62,8,'#779673'],[.045,-.05,.74,7,'#92aa77']])ellipse(x+a*s,y+b*s,z*s,r*s,r*1.18*s,col)}
 function label(x,y,z,text,col='#f7eed4'){const [a,b]=p(x,y,z),u=Math.abs(p(x+1,y,z)[0]-a)/W;c.save();c.translate(a,b);c.scale(u,u);c.font='bold 6px sans-serif';c.fillStyle=col;c.textAlign='center';c.fillText(text,0,1,44);c.restore()}
 function structure(b,theme=0,time=0){
 const v=Town.items[b.id],sz=Town.sizes[b.s],n=sz.n,s=sz.draw,x=b.x+n/2,y=b.y+n/2,form=v.form;
 if(b.dir){
 const spin=(a,e,z=0)=>{const dx=a-x,dy=e-y;const [u,v]=[[],[-dy,dx],[-dx,-dy],[dy,-dx]][b.dir];return p(x+u,y+v,z)};
 return view(g,spin,(rotation-b.dir+4)%4,night).structure({...b,dir:0},theme,time)
 }
 const base=b.style===1?'#af8769':b.style===2?'#92aca9':v.color,trim=['#704f46','#638578','#685772','#697f91'][theme],light=night?'#ffd98a':'#b3d7d5',glass=night?'#f2c67d':'#617d80';
 function B(a,e,z,w,d,h,col,top){block(x+a*s,y+e*s,z*s,w*s,d*s,h*s,col,top)}
 function T(a,e,z,w,d,col){tile(x+a*s,y+e*s,w*s,d*s,z*s,col)}
 function E(a,e,z,rx,ry,col){ellipse(x+a*s,y+e*s,z*s,rx*s,ry*s,col)}
 function L(a,e,col,w){line([x+a[0]*s,y+a[1]*s,a[2]*s],[x+e[0]*s,y+e[1]*s,e[2]*s],col,w)}
 tile(b.x+.035,b.y+.035,n-.07,n-.07,.013,v.group===4?'#b7c59c':'#cfccbc');
 E(.08,.09,.022,20,8.6,'#394c4530');
 function beam(a,b,col,width){L(a,b,col,Math.max(.6,width*Math.abs(p(x+1,y,0)[0]-p(x,y,0)[0])/W*s))}
 function face(points,col){poly(points.map(([a,b,z])=>[x+a*s,y+b*s,z*s]),col)}
 // The entrance stays on the building's local south side as the camera turns.
 T(-.15,.35,.024,.3,.17,'#b49979');
 if(b.style===1){for(const a of [-.38,0,.38])B(a,.44,.03,.035,.04,.25,'#80634c');B(-.43,.37,.28,.86,.15,.055,'#866c50')}
 if(b.style===2){B(.32,-.34,.03,.16,.68,.15,'#627e7b');for(const e of [-.26,0,.26])E(.4,e,.22,2.6,2.8,'#738f69');B(-.43,.39,.035,.74,.10,.045,'#ebe0c8')}
 if(form==='parking'){
 T(-.49,-.46,.028,.98,.92,'#677275');for(const a of [-.46,0,.46])T(a,-.42,.032,.015,.69,'#ede6ca');
 for(const a of [-.35,.11])B(a,-.38,.034,.23,.05,.035,'#e6d69b');
 B(-.42,.34,.03,.035,.035,.39,'#52615e');B(-.49,.31,.36,.18,.05,.15,'#48778a');label(x-.4*s,y+.37*s,.43*s,'P');return}
 if(form==='stage'){B(-.42,-.33,.03,.84,.65,.14,'#9d8167');for(const a of [-.37,.33])B(a,-.23,.17,.04,.04,.52,trim);B(-.45,-.32,.68,.9,.52,.05,base);return}
 if(form==='beacon'){for(let i=0;i<5;i++){const d=.36-i*.035;B(-d/2,-d/2,.03+i*.17,d,d,.17,i%2?base:'#e8e1c9')}B(-.14,-.14,.88,.28,.28,.16,light);B(-.17,-.17,1.04,.34,.34,.04,trim);return}
 if(form==='wheel'){
   const R=.455,center=.64;
   for(const dy of [-.15,.15]){beam([-.30,dy,0],[0,dy,center],'#526975',3);beam([.30,dy,0],[0,dy,center],'#77939e',3)}
   const rim=[];for(let j=0;j<32;j++){const a=j*Math.PI/16;rim.push([Math.cos(a)*R,.01,center+Math.sin(a)*R])}
   for(let j=0;j<32;j++)beam(rim[j],rim[(j+1)%32],'#a66657',2);
   for(let j=0;j<10;j++){const a=j*Math.PI/5+time*.16,X=R*Math.cos(a),z=center+R*Math.sin(a);beam([0,.01,center],[X,.01,z],'#d4b197',1);beam([X,.01,z],[X,.01,z-.055],'#405560',1);B(X-.043,-.043,z-.13,.086,.09,.082,['#ba715a','#73958d','#ccaa65'][j%3])}
   E(0,.02,center,3.4,3.2,'#e2b66d');return
 }
 if(form==='windmill'){
   const wall=[];for(let j=0;j<12;j++){const a=j*Math.PI/6;wall.push([.31*Math.cos(a),.31*Math.sin(a)])}
   for(let j=0;j<12;j++){const [a,b]=wall[j],[d,e]=wall[(j+1)%12];if((a+d)*sx+(b+e)*sy<0)continue;
   face([[a,b,.025],[d,e,.025],[d*.64,e*.64,.72],[a*.64,b*.64,.72]],shade('#d3b99b',.81+j*.012))}
   for(let j=0;j<10;j++)E(0,0,.72+j*.019,9-j*.82,4.5-j*.35,'#74594f');
   for(let j=0;j<4;j++){const a=time*.64+j*Math.PI/2,co=Math.cos(a),si=Math.sin(a);
   const tip=(r,w)=>[r*co-w*si,.24,.67+r*si+w*co];
   face([tip(.10,0),tip(.45,0),tip(.45,.085),tip(.18,.05)],'#ece1c2');beam(tip(-.02,0),tip(.47,0),'#755c47',1.6);
   for(let k=0;k<4;k++)beam(tip(.21+k*.06,0),tip(.21+k*.06,.06),'#96866e',.65)}
   E(0,.24,.67,2.4,2.4,'#725847');return
 }
 if(form==='carousel'){
   E(0,0,.1,18,8,'#966952');E(0,0,.14,18,8,'#e0bb81');B(-.035,-.035,.12,.07,.07,.55,'#ad8760');
   for(let j=0;j<8;j++){const a=time*.47+j*Math.PI/4,X=.32*Math.cos(a),Y=.32*Math.sin(a),z=.31+.043*Math.sin(2*a);beam([X,Y,.13],[X,Y,.63],'#a0824d',1);E(X,Y,z,3.2,1.7,j%2?'#ceb18e':'#967960');E(X+.055,Y,z+.05,1.4,1.9,'#bd9e7a')}
   for(let j=0;j<12;j++){const a=j*Math.PI/6,d=a+Math.PI/6;face([[0,0,.93],[.48*Math.cos(a),.48*Math.sin(a),.63],[.48*Math.cos(d),.48*Math.sin(d),.63]],j%2?'#e6cc9d':'#b95f5b')}E(0,0,.95,2,2.4,'#c9a359');return
 }
 if(form==='clockgarden'||form==='clocktower'){
   const tower=form==='clocktower',z=tower?.93:.11;
   if(tower){B(-.23,-.23,0,.46,.46,.86,'#b88f73');B(-.29,-.29,.81,.58,.58,.30,'#c7a88a');
   for(let j=0;j<12;j++)E(0,0,1.12+j*.025,14-j,7-j*.5,'#648378');
   E(0,.3,z+.045,5,5,'#fff0c5');beam([0,.3,z+.045],[.08*Math.sin(time*.14),.3,z+.045+.08*Math.cos(time*.14)],'#494943',1.2)}
   else{E(0,0,z,19,9,'#73835e');for(let j=0;j<12;j++){const a=j*Math.PI/6;E(.35*Math.cos(a),.35*Math.sin(a),z+.03,2.3,2,['#dc9b92','#e6c390','#a8afcc'][j%3])}
   beam([0,0,z+.045],[.27*Math.cos(time*.1),.27*Math.sin(time*.1),z+.045],'#f1e3bc',2);beam([0,0,z+.047],[-.11,.13,z+.047],'#dbc188',2)}
   return
 }
 if(['park','grove','button','market','bus','tank'].includes(form)){
 if(form==='park'||form==='grove'){tree(x-.19*s,y-.17*s,1.05*s);if(form==='grove'){tree(x+.25*s,y-.19*s,.86*s);tree(x+.08*s,y+.22*s,.65*s)}B(-.32,.22,.08,.34,.13,.085,'#946e4c');return}
 if(form==='button'){E(0,0,.09,19,9,'#798985');E(0,0,.145,17,8,'#91c5c0');for(const i of [-1,1])for(const j of [-1,1]){E(i*.14,j*.14,.16,2.4,1.4,'#4a777c');L([i*.14,j*.14,.16],[i*.08,j*.08,.52],'#d7f3df',1.4)}return}
 if(form==='tank'){for(const a of [-.23,.23])for(const e of [-.23,.23])B(a,e,0,.055,.055,.88,'#555f5c');E(0,0,.79,14,7,'#526970');for(let j=0;j<12;j++)E(0,0,.8+j*.036,14,7,'#95b0b0');E(0,0,1.24,14,7,'#bfd1c5');return}
 if(form==='bus'){B(-.39,-.17,0,.76,.06,.45,'#7f9f9c');for(const a of [-.36,.32])B(a,.15,0,.04,.04,.51,'#556866');B(-.43,-.25,.5,.86,.51,.065,'#648f81');B(-.28,-.05,.14,.55,.17,.07,'#ae815a');return}
 for(const a of [-.3,.13]){B(a,-.28,0,.31,.48,.22,'#a87f57');for(const e of [-.24,.14])B(a+.03,e,.22,.034,.034,.27,'#715747');B(a-.03,-.32,.48,.38,.55,.075,a<0?'#c16f56':'#d7ad62')}return
 }
 if(form==='cup'||form==='cap'){const col=form==='cup'?'#d9aa82':'#cdb691';for(let j=0;j<16;j++)E(0,0,.06+j*.033,12+j*.32,6+j*.17,col);
 if(form==='cup'){E(0,0,.59,17,8.6,'#f2dac1');E(0,0,.60,14.4,6.6,'#77503b');L([.33,0,.44],[.57,0,.47],'#b88869',4);L([.57,0,.47],[.57,0,.27],'#b88869',4);L([.57,0,.27],[.34,0,.17],'#b88869',4)}
 else{for(let j=0;j<13;j++)E(0,0,.51+j*.033,21*Math.sqrt(1-(j/13)**2),10*Math.sqrt(1-(j/13)**2),'#ba6952');E(.07,.17,.81,3,1.5,'#eed9af');E(-.2,.08,.72,3,1.6,'#eed9af')}
 B(-.15,.21,.01,.22,.13,.26,'#685c52');return}
 if(form==='civicPlaza'){
   T(-.43,-.43,.04,.86,.86,'#d2cbbc');E(0,0,.08,13,6,'#aba790');E(0,0,.13,10,4.8,'#d9cbb0');
   B(-.08,-.08,.13,.16,.16,.6,'#aa9162');E(0,0,.82,4.8,5,'#d1ab65');tree(x-.30*s,y+.24*s,.5*s);tree(x+.3*s,y-.24*s,.5*s);return
 }
 const urban={resTower:[7,2],stationMall:[4,2],terraces:[4,3],office:[9,2],skyGarden:[6,3],cityCentre:[5,3]}[form];
 if(urban){
   let height=.04;
   for(let tier=0;tier<urban[1];tier++){
     const width=.86-tier*.18,count=tier===0?urban[0]:3;
     B(-width/2,-width/2,height,width,width,count*.16,base);
     for(let f=0;f<count;f++){
       const z=height+f*.16+.05;
       B(-width*.44,sy>0?width/2:-width/2-.012,z,width*.88,.012,.068,glass);
       B(sx>0?width/2:-width/2-.012,-width*.44,z,.012,width*.88,.068,light)
     }
     height+=count*.16;B(-width/2-.02,-width/2-.02,height,width+.04,width+.04,.035,trim,form==='skyGarden'||form==='terraces'?'#92ad88':base);height+=.04
   }
   B(-.12,-.08,height,.24,.16,.095,'#8e9f9e');return
 }
 const floors=({court:3,fire:2,photo:2,tower:7,flat:3,department:4,library:2,school:3,mixed:2,cinema:2,glass:2})[form]||1;
 const w=form==='tower'?.62:.8,d=form==='house'?.64:.76,h=.46+(floors-1)*.31;
 B(-w/2,-d/2,.03,w,d,h,base);
 for(let f=0;f<floors;f++){const z=.11+f*.32;for(let j=0;j<3;j++){const a=-w*.38+j*w*.28;
 B(a,sy>0?d/2:-d/2-.012,z,w*.17,.016,.16,glass,light);
 B(sx>0?w/2:-w/2-.015,-d*.36+j*d*.27,z,.018,d*.16,.15,light)}
 if(f&&['tower','flat','mixed'].includes(form))B(-w/2-.035,sy>0?d/2:-d/2-.085,z-.03,w+.07,.09,.055,'#acaaa0')}
 if(sy>0)B(-.1,d/2,.03,.16,.029,.22,'#585e58');
 if(b.style===1){B(-.39,-.26,h+.08,.26,.23,.24,'#85654f');for(const a of [-.38,-.2,0,.2,.37])B(a,sy>0?d/2:-d/2-.025,.035,.028,.03,h,'#765a48')}
 if(b.style===2){B(-.35,-.27,h+.08,.62,.35,.14,'#b9cac4');for(let j=0;j<3;j++)B(-.31+j*.18,-.25,h+.22,.15,.28,.022,'#597c89')}
 // Cornices, masonry courses and roof fittings give each frontage a material scale.
 for(const a of [-w*.47,w*.45])B(a,sy>0?d/2:-d/2-.017,.04,.026,.024,h-.01,'#b4a78d');
 if(['library','bath','books','cinema'].includes(form)){
 for(let j=1;j<7;j++)L([-w*.48,sy*d*.502,j*.058],[w*.48,sy*d*.502,j*.058],'#957f7070',.55)}
 B(-w/2-.025,-d/2-.025,h+.03,w+.05,d+.05,.045,trim);
 if(form==='ice'){E(.02,.03,h+.20,6,7,'#e5bca7');E(.02,.03,h+.34,5,5,'#d7a2ba')}
 if(form==='watch'){E(0,.03,h+.27,7,7,'#735e4c');E(0,.04,h+.27,5,5,'#f2dfb5');L([0,.04,h+.27],[0,.04,h+.36],trim,1.5)}
 if(form==='photo'){B(-.24,-.15,h+.08,.47,.30,.24,trim);E(.04,.16,h+.2,4,4,glass)}
 if(form==='tea')for(const a of [-.26,0,.26])B(a,.41,.23,.18,.035,.20,'#758956');
 if(form==='observatory')for(let i=0;i<10;i++)E(0,0,h+.08+i*.027,12*Math.sqrt(1-(i/10)**2),6*Math.sqrt(1-(i/10)**2),'#c3d0cd');
 if(form==='glasshouse')for(let i=0;i<5;i++)B(-.38+i*.16,-.34,h+.08,.14,.68,.08,glass,light);
 if(form==='fire'){B(-.35,-.3,h+.08,.20,.22,.39,'#98574c');for(let i=0;i<3;i++)B(-.34+i*.24,.38,.03,.19,.035,.31,'#677577')}
 if(form==='house'||form==='row'||form==='library'||form==='lodge'){
 const X=x-w*s*.57,Y=y-d*s*.58,A=x+w*s*.57,D=y+d*s*.58,z=(h+.075)*s,peak=z+.27*s;
 poly([[X,Y,z],[A,Y,z],[A,y,peak],[X,y,peak]],'#927061');poly([[X,y,peak],[A,y,peak],[A,D,z],[X,D,z]],'#ae8067');
 for(let j=1;j<=7;j++){const rx=X+(A-X)*j/8;line([rx,y,peak],[rx,sy>0?D:Y,z],'#795e525e',.8)}
 const end=sx>0?A:X;poly([[end,Y,z],[end,D,z],[end,y,peak]],'#dcc3a0');B(-.23,-.14,h+.13,.095,.10,.22,'#956f59');return}
 if(sy>0&&['awning','produce','cafe','flowers','lantern','mixed','books'].includes(form)){
 const edge=d/2*sy;for(let j=0;j<6;j++){const a=-w/2+j*w/6;
 poly([[x+a*s,y+edge*s,.4*s],[x+(a+w/6)*s,y+edge*s,.4*s],[x+(a+w/6)*s,y+(edge+.18*sy)*s,.32*s],[x+a*s,y+(edge+.18*sy)*s,.32*s]],j%2?'#f3dfba':base)}
 if(form==='produce'||form==='flowers')for(let j=0;j<4;j++)E(-.28+j*.17,edge+.13*sy,.1,2.7,2.5,['#c67b4e','#748b56','#d5aa59','#be7160'][j]);
 if(form==='lantern')E(.36,edge,.29,3.3,5,'#d57b58');
 const sign={'awning':'商 店','produce':'市 場','cafe':'COFFEE','flowers':'花 屋','lantern':'中 華','mixed':'STORE','books':'BOOKS'}[form];
 B(-.31,edge,.43,.62,.034,.115,trim);const nameplate=sy>0?edge+.045:edge-.045;
 const a=p(x-.3*s,y+nameplate*s,.545*s),b=p(x+.3*s,y+nameplate*s,.545*s),lower=p(x-.3*s,y+nameplate*s,.425*s);
 c.save();if(b[0]<a[0]){const e=p(x+.3*s,y+nameplate*s,.425*s);c.transform((a[0]-b[0])/90,(a[1]-b[1])/90,(e[0]-b[0])/20,(e[1]-b[1])/20,b[0],b[1])}else c.transform((b[0]-a[0])/90,(b[1]-a[1])/90,(lower[0]-a[0])/20,(lower[1]-a[1])/20,a[0],a[1]);
 c.fillStyle=trim;c.fillRect(0,0,90,20);c.fillStyle='#f4e7c8';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText(sign,45,15);c.restore();
 if(form==='books')B(-.33,edge,.02,.21,.12,.24,'#8a785e');
 }
 if(form==='bath'){B(-.3,-.27,h+.075,.14,.15,.52,'#9f795f');label(x,y,h*s,'♨')}
 else if(form==='clinic'){B(-.14,-.11,h+.08,.28,.22,.26,'#efe5d4');label(x,y+.12*s,(h+.24)*s,'✚','#a95148')}
 else if(form==='match'){for(let i=0;i<6;i++)B(-.33+i*.112,-.29,h+.08,.044,.61,.04,'#dcc09d');for(let i=0;i<6;i++)E(-.31+i*.112,.27,h+.13,2,1.8,'#ac5649')}
 else if(form==='cinema'){B(-.44,.26,h*.67,.88,.2,.18,'#e7c68c');label(x,y+.44*s,h*.78*s,'CINEMA','#684743')}
 else if(form==='tower'||form==='department'||form==='school'){B(-.24,-.18,h+.08,.35,.29,.12,'#a3ada7');B(.07,.06,h+.09,.2,.17,.09,'#829294')}
 else{B(-.27,-.2,h+.08,.18,.14,.06,'#a3a69a')}
 }
 return {tile,line,poly,block,ellipse,tree,structure}
 }
 return {W,H,Z,view,shade};
})();
