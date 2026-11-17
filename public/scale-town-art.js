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
 function structure(b,theme=0){
 const v=Town.items[b.id],sz=Town.sizes[b.s],n=sz.n,s=sz.draw,x=b.x+n/2,y=b.y+n/2,form=v.form;
 const base=v.color,trim=['#704f46','#638578','#685772','#697f91'][theme],light=night?'#ffd98a':'#b3d7d5',glass=night?'#f2c67d':'#617d80';
 function B(a,e,z,w,d,h,col,top){block(x+a*s,y+e*s,z*s,w*s,d*s,h*s,col,top)}
 function T(a,e,z,w,d,col){tile(x+a*s,y+e*s,w*s,d*s,z*s,col)}
 function E(a,e,z,rx,ry,col){ellipse(x+a*s,y+e*s,z*s,rx*s,ry*s,col)}
 function L(a,e,col,w){line([x+a[0]*s,y+a[1]*s,a[2]*s],[x+e[0]*s,y+e[1]*s,e[2]*s],col,w)}
 tile(b.x+.035,b.y+.035,n-.07,n-.07,.013,v.group===4?'#b7c59c':'#cfccbc');
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
 const floors=({tower:7,flat:3,department:4,library:2,school:3,mixed:2,cinema:2,glass:2})[form]||1;
 const w=form==='tower'?.62:.8,d=form==='house'?.64:.76,h=.46+(floors-1)*.31;
 B(-w/2,-d/2,.03,w,d,h,base);
 for(let f=0;f<floors;f++){const z=.11+f*.32;for(let j=0;j<3;j++){const a=-w*.38+j*w*.28;
 B(a,sy>0?d/2:-d/2-.012,z,w*.17,.016,.16,glass,light);
 B(sx>0?w/2:-w/2-.015,-d*.36+j*d*.27,z,.018,d*.16,.15,light)}
 if(f&&['tower','flat','mixed'].includes(form))B(-w/2-.035,sy>0?d/2:-d/2-.085,z-.03,w+.07,.09,.055,'#acaaa0')}
 B(-.1,sy>0?d/2:-d/2-.024,.03,.16,.029,.22,'#585e58');
 B(-w/2-.025,-d/2-.025,h+.03,w+.05,d+.05,.045,trim);
 if(form==='house'||form==='row'||form==='library'){
 const X=x-w*s*.57,Y=y-d*s*.58,A=x+w*s*.57,D=y+d*s*.58,z=(h+.075)*s,peak=z+.27*s;
 poly([[X,Y,z],[A,Y,z],[A,y,peak],[X,y,peak]],'#927061');poly([[X,y,peak],[A,y,peak],[A,D,z],[X,D,z]],'#ae8067');
 const end=sx>0?A:X;poly([[end,Y,z],[end,D,z],[end,y,peak]],'#dcc3a0');B(-.23,-.14,h+.13,.095,.10,.22,'#956f59');return}
 if(['awning','produce','cafe','flowers','lantern','mixed','books'].includes(form)){
 const edge=d/2*sy;for(let j=0;j<6;j++){const a=-w/2+j*w/6;
 poly([[x+a*s,y+edge*s,.4*s],[x+(a+w/6)*s,y+edge*s,.4*s],[x+(a+w/6)*s,y+(edge+.18*sy)*s,.32*s],[x+a*s,y+(edge+.18*sy)*s,.32*s]],j%2?'#f3dfba':base)}
 if(form==='produce'||form==='flowers')for(let j=0;j<4;j++)E(-.28+j*.17,edge+.13*sy,.1,2.7,2.5,['#c67b4e','#748b56','#d5aa59','#be7160'][j]);
 if(form==='lantern')E(.36,edge,.29,3.3,5,'#d57b58');
 const sign={'awning':'商 店','produce':'市 場','cafe':'COFFEE','flowers':'花 屋','lantern':'中 華','mixed':'STORE','books':'BOOKS'}[form];
 B(-.31,edge,.43,.62,.034,.115,trim);label(x,y+(edge+.035*sy)*s,.475*s,sign);
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
