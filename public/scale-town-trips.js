'use strict';
const TownTrips=(()=>{
 const neighbors=[[1,0],[0,1],[-1,0],[0,-1]];
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const center=([x,y])=>[x+.5,y+.5];
 function entrance(b,net){
   const n=Town.sizes[b.s].n,edges=[[0,1],[-1,0],[0,-1],[1,0]];
   for(let turn=0;turn<4;turn++){
     const [dx,dy]=edges[((b.dir||0)+turn)%4];
     for(let i=0;i<n;i++){
       const x=b.x+(dx>0?n:dx<0?-1:i),y=b.y+(dy>0?n:dy<0?-1:i);
       if(net.has(Town.key(x,y)))return {road:[x,y],door:[x+.5-dx*.58,y+.5-dy*.58],b};
     }
   }
 }
 function route(from,to,net){
   const start=Town.key(...from),end=Town.key(...to),parents=new Map([[start,null]]),queue=[from];
   for(let i=0;i<queue.length&&!parents.has(end);i++){
     const cur=queue[i];for(const [dx,dy] of neighbors){const p=[cur[0]+dx,cur[1]+dy],k=Town.key(...p);
       if(net.has(k)&&!parents.has(k)){parents.set(k,cur);queue.push(p)}}
   }
   const points=[];for(let p=to;p;p=parents.get(Town.key(...p)))points.push(center(p));
   return points.reverse();
 }
 function timeline(){return {legs:[],length:0}}
 function wait(t,seconds,extras=[]){t.legs.push({end:t.length+=seconds,seconds,extras,activity:t.activity,destination:t.destination})}
 function move(t,path,kind,j,extras=[]){
   if(path.length>2){const lane=kind==='walk'?.27:kind==='bus'?.09:.13;
     path=path.map((point,i)=>{if(!i||i===path.length-1)return point;const before=path[i-1],after=path[i+1],dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy)||1;
       return [point[0]-dy/len*lane,point[1]+dx/len*lane]});
   }
   const speed={walk:.42,car:1.05,cycle:.76,scooter:.69,bus:.85}[kind];let heading=0,previous=null;
   for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=distance(a,b);if(len<.001)continue;
     heading=Math.atan2(b[1]-a[1],b[0]-a[0]);const seconds=len/speed;
     const leg={end:t.length+=seconds,seconds,a,b,heading,kind,j,extras,activity:t.activity,destination:t.destination};
     if(previous){previous.next=heading;leg.prev=previous.heading}
     t.legs.push(leg);previous=leg;
   }return heading;
 }
 function fixed(p,kind,j,angle=0){return {pose:{x:p[0],y:p[1],angle,braking:true},kind,j,phase:0}}
 function plan(c,st){
   const doors=Array.from(st.active,b=>entrance(b,st.net));
   const homes=doors.filter(e=>Town.items[e.b.id].homes),shops=doors.filter(e=>Town.items[e.b.id].group===1);
   const destinations=shops.length?shops:doors.filter(e=>Town.items[e.b.id].jobs&&e.b.id!==46);
   const parking=doors.filter(e=>e.b.id===46),stops=doors.filter(e=>e.b.id===24),people=[];
   const streets=(a,b)=>route(a.road,b.road,st.net);
   for(let j=0;j<30&&homes.length&&destinations.length;j++){
     const h=homes[j%homes.length],d=destinations[(j*5+Math.floor(j/5))%destinations.length],t=timeline();t.home=Town.items[h.b.id].name;t.destination=Town.items[d.b.id].name;t.activity='買い物へ';
     const car=j%4===2&&Math.floor(j/2)%3!==0,kind=car?'car':j%5===4?'scooter':j%4===3?'cycle':'walk';
     const lot=car?parking[Math.floor(j/4)>>1]:null;
     const park=lot||d,points=streets(h,park),home=center(h.road),stop=center(park.road);
     const bay=lot?[lot.b.x+Town.sizes[lot.b.s].n*(Math.floor(j/4)%2?.69:.31),lot.b.y+Town.sizes[lot.b.s].n*.53]:[stop[0]+(park.door[0]-stop[0])*.48,stop[1]+(park.door[1]-stop[1])*.48];
     const foot=lot?[bay,park.door,...streets(park,d),d.door]:[bay,d.door];
     if(kind==='walk'){
       const path=[h.door,...points,d.door];move(t,path,'walk',j);t.activity='店内で買い物';wait(t,5);t.activity='帰宅中';t.destination=t.home;move(t,path.slice().reverse(),'walk',j);
     }else{
       const ride=[...points,...(lot?[park.door]:[]),bay];move(t,[h.door,home],'walk',j);
       const angle=move(t,ride,kind,j),vehicle=[fixed(bay,kind==='cycle'?'bikeRack':kind==='scooter'?'scooterRack':kind,j,angle)];
       wait(t,1,vehicle);move(t,foot,'walk',j,vehicle);t.activity='店内で買い物';wait(t,5,vehicle);t.activity='帰宅中';t.destination=t.home;
       move(t,foot.slice().reverse(),'walk',j,vehicle);wait(t,.9,vehicle);
       move(t,ride.slice().reverse(),kind,j);move(t,[home,h.door],'walk',j);
     }
     t.activity='自宅で休憩';wait(t,4);people.push(t);
   }
   const bus=timeline(),passengers=[];
   if(stops.length>=2)for(let i=0;i<stops.length;i++){
     const stop=stops[i],next=stops[(i+1)%stops.length],at=center(stop.road),road=streets(stop,next);
     const p=timeline(),dest=destinations.slice().sort((a,b)=>distance(a.door,stop.door)-distance(b.door,stop.door))[0];
     if(dest){const path=[at,stop.door,...streets(stop,dest),dest.door];move(p,path,'walk',i+6);wait(p,3);move(p,path.slice().reverse(),'walk',i+6);
       passengers.push({start:bus.length,p})}
     const second=road[1]||at,angle=Math.atan2(second[1]-at[1],second[0]-at[0]);
     wait(bus,3,[fixed(at,'bus',0,angle)]);move(bus,road,'bus',0);
   }
   return {people,bus,passengers};
 }
 function sample(t,time,out){
   const q=time%t.length,leg=t.legs.find(l=>q<l.end);if(!leg)return;
   out.push(...leg.extras.map(actor=>({...actor,home:t.home,destination:leg.destination,activity:'駐車中'})));if(!leg.kind)return;
   const u=1-(leg.end-q)/leg.seconds;
   const delta=a=>Math.atan2(Math.sin(a-leg.heading),Math.cos(a-leg.heading));
   const angle=leg.heading+(u<.25&&leg.prev!==undefined?delta(leg.prev)*(.5-2*u):u>.75&&leg.next!==undefined?delta(leg.next)*(2*u-1.5):0);
   out.push({home:t.home,destination:leg.destination,activity:leg.activity,kind:leg.kind,j:leg.j,phase:time*(leg.kind==='walk'?6:9),pose:{x:leg.a[0]+(leg.b[0]-leg.a[0])*u,y:leg.a[1]+(leg.b[1]-leg.a[1])*u,angle}});
 }
 function actors({people,bus,passengers},time,pop){
   const out=[];people.slice(0,Math.ceil(pop/4)).forEach((t,i)=>sample(t,time+i*5.37,out));
   if(bus.length&&pop){sample(bus,time,out);for(const {start,p} of passengers){const elapsed=(time-start+bus.length)%bus.length;
     // Walk out after arrival, return from the shop for the next boarding.
     const visit=p.legs.find(l=>!l.kind),outEnd=visit.end-visit.seconds,returnLength=p.length-visit.end;
     if(outEnd+returnLength+1>bus.length)continue;
     if(elapsed<outEnd)sample(p,elapsed,out);else if(elapsed>bus.length-returnLength)sample(p,p.length-(bus.length-elapsed),out);
   }}
   return out;
 }
 return {plan,actors};
})();
