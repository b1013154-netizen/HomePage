// Coordinates are in workbench units. A cell is 64 units wide.
// Each segment hands the marble to the next one at their shared edge.
const WorkshopMotion = (() => {
  const dirs=Workshop.dirs;
  const clamp=v=>Math.min(1,Math.max(0,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const phase=(t,a,b)=>clamp((t-a)/(b-a));
  const ease=t=>t*t*(3-2*t);
  const lengths={start:580,rail:535,bend:545,bell:550,spring:1080,domino:1140,lever:805,goal:980,stop:550,pit:485};
  const beats={start:[.13],rail:[],bend:[],bell:[.34,.50,.66],spring:[.18,.48,.91],domino:[.15,.27,.39,.51,.63,.75],lever:[.31,.55],goal:[.28],stop:[.63],pit:[.78]};
  function sample(type,dir,incoming,t){
    const [dx,dy]=dirs[dir], [ix,iy]=dirs[incoming??dir],balls=[];
    function ball(x,y,z=0,r=4.2){balls.push({x,y,z,r})}
    function along(s,side=0,z=0){ball(dx*s-dy*side,dy*s+dx*side,z)}
    function entry(s){ball(ix*s,iy*s)}
    let action=0;
    if(type==='start'){
      // The pictured chute slopes down and right from the hopper to its lip.
      const u=phase(t,.13,1), travel=.24*u+.76*u*u;
      if(t>=.13){
        const x=lerp(-1,32,travel);
        const y=x<17?lerp(4,12,clamp((x+1)/18)):12*(1-ease((x-17)/15));
        along(x,y,2*(1-travel));
      }
      action=Math.sin(Math.PI*phase(t,.035,.54));
    }else if(type==='bend'){
      // A quarter-circle tangent to both the input and output rails.
      const r=19,arc=Math.PI*r/2,dist=t*(26+arc);
      if(dist<13)entry(-32+dist);
      else if(dist>13+arc)along(r+dist-13-arc);
      else{
        const a=(dist-13)/r, forward=r*(1-Math.cos(a)),back=r*(Math.sin(a)-1);
        ball(dx*forward+ix*back,dy*forward+iy*back);
      }
    }else if(type==='rail'||type==='bell'){
      along(-32+64*(.94*t+.06*t*t));action=t;
    }else if(type==='spring'){
      const load=ease(phase(t,.18,.43)), launch=phase(t,.48,.91);
      action=t<.48?load:Math.exp(-12*(t-.48))*Math.cos(32*(t-.48));
      if(t<.18)along(lerp(-32,-9,t/.18),-8*ease(t/.18));
      else if(t<.48)along(-9-8*load,-8);
      else if(t<.91)along(lerp(-17,88,launch),-8*(1-ease(launch)),4*29*launch*(1-launch));
      else{const u=phase(t,.91,1);along(88+8*u,0,2.4*4*u*(1-u))}
    }else if(type==='domino'||type==='lever'){
      const domino=type==='domino',impact=domino ? .15 : .31,release=domino ? .75 : .55;
      const catchPoint=domino?-26:-7,rest=domino?23:18;
      const approach=phase(t,0,impact);
      const contact=lerp(-32,catchPoint,approach);
      const offset=domino?0:-17*ease(approach);
      ball(ix*contact+dx*offset,iy*contact+dy*offset);
      const u=phase(t,release,1);
      along(lerp(rest,32,u*(.6+.4*u)),0,domino?0:4*Math.sin(Math.PI*u));
      action=domino?phase(t,impact,.79):phase(t,impact,.89);
    }else if(type==='goal'){
      entry(lerp(-32,-15,phase(t,0,.28))-2.5*Math.sin(Math.PI*phase(t,.28,.5)));
      action=phase(t,.28,1);
    }else if(type==='stop'||type==='pit'){
      const u=type==='pit'?phase(t,0,.78):t;
      const dist=24*u*(2-u),fall=type==='pit'?phase(t,.52,.86):0;
      if(fall<1)ball(ix*(dist-32),iy*(dist-32)+fall*3,0,4.2*(1-fall));
    }
    return {balls,action};
  }
  return {sample,lengths,beats};
})();
