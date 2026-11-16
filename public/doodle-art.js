'use strict';
const Art=(()=>{
 const ink='#243e38',tau=Math.PI*2;
 const names='コケトカゲ 琥珀ヤモリ ミズイモリ ツノサンショウ 夜光ドラゴン ハナコガネ 銅甲虫 月テントウ 葉隠れゾウムシ 星カミキリ 霧フクロウ 桃羽スズメ シダカワセミ 雪ツバメ 金冠ヒヨコ 泡フグ 瑠璃グッピー 灯ランチュウ 縞マンボウ 虹コイ 木の実ウサギ 星耳キツネ 綿毛ネズミ 赤頬リス 森の仔ジカ 波クラゲ 夜光タコ 花イソギンチャク 真珠イカ 雨ヒドラ'.split(' ');
 const shapes='円 楕円 たまご しずく 半円 三日月 レンズ 葉 ハート 豆 三角 四角 五角 六角 八角 ひし形 台形 平行四辺形 矢印 十字 三芒星 四芒星 五芒星 六芒星 八芒星 三弁花 四弁花 五弁花 歯車 稲妻'.split(' ');
 const colors=['#95ad6d','#dc9967','#71afb1','#ad9bb8','#e0bf66'];
 function line(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin=c.lineCap='round';c.stroke()}
 function oval(c,x,y,rx,ry,color,angle=0,edge=true){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,tau);c.fillStyle=color;c.fill();if(edge){c.lineWidth=1.6;c.strokeStyle=ink;c.stroke()}}
 const paths=['M20 0A20 20 0 1 0 -20 0A20 20 0 1 0 20 0','M27 0A27 15 0 1 0 -27 0A27 15 0 1 0 27 0','M0 -25C25 -12 24 22 0 22C-24 22 -25 -12 0 -25','M0 -26Q37 20 0 22Q-37 20 0 -26','M-24 10A24 24 0 0 1 24 10Z','M10 -24A25 25 0 1 0 10 24Q-18 0 10 -24','M-27 0Q0 -32 27 0Q0 32 -27 0','M-20 19Q-23 -21 24 -22Q25 16 -20 19','M0 23C-44 -7 -15 -36 0 -14C18 -37 43 -6 0 23','M-23 4C-29 -25 -5 -29 1 -12C5 -2 23 -15 24 1C26 26 -17 31 -23 4'];
 const polygons={15:'0,-24 22,0 0,24 -22,0',16:'-13,-17 13,-17 25,17 -25,17',17:'-10,-17 26,-17 10,17 -26,17',18:'-25,-8 3,-8 3,-19 25,0 3,19 3,8 -25,8',19:'-8,-23 8,-23 8,-8 23,-8 23,8 8,8 8,23 -8,23 -8,8 -23,8 -23,-8 -8,-8',29:'3,-25 -20,4 -3,4 -9,25 21,-8 5,-8'};
 function shape(c,i,color){let p;if(paths[i])p=new Path2D(paths[i]+'Z');else if(polygons[i])p=new Path2D('M'+polygons[i].replaceAll(' ',' L')+'Z');else{p=new Path2D();const count=[3,4,5,6,8][i-10]||[3,4,5,6,8,3,4,5,12][i-20];const n=i>=25?120:i>=20?count*2:count;for(let j=0;j<n;j++){const a=j*tau/n-Math.PI/2,r=i>=25?18+5*Math.cos(j*tau/n*count):i>=20&&j%2?10:24;p[j?'lineTo':'moveTo'](r*Math.cos(a),r*Math.sin(a))}p.closePath()}c.fillStyle=color;c.fill(p);c.strokeStyle=ink;c.lineWidth=1.6;c.stroke(p)}
 function limbs(id){const f=Math.floor(id/5);return [4,6,2,0,4,6][f]}
 function foot(c,h,k,e,color){line(c,[h,k,e],ink,6);line(c,[h,k,e],color,3.4);line(c,[e,[e[0]+4,e[1]]],ink,2.5)}
 function specimen(c,id,t=0,pose={}) {
  const f=Math.floor(id/5),v=id%5,col=colors[v],cream='#f7edcf',w=[33,27,22,30,27,24][f],h=[13,18,22,18,17,20][f]+v*.65;
  const bend=pose.bend||0,beat=pose.beat??Math.sin(t*6),legs=pose.legs||[];
  if(f===0||f===3||f===4){const end=[-w-19,-5+Math.sin(t*3)*5+bend];if(f===3){oval(c,end[0],end[1]-5,13,6,col,.65);oval(c,end[0],end[1]+5,13,6,col,-.65)}else{line(c,[[-w+8,5],[-w-8,5+bend*.4],end],ink,9);line(c,[[-w+8,5],[-w-8,5+bend*.4],end],col,6)}}
  for(let j=0;j<limbs(id);j++){const x=(j%Math.ceil(limbs(id)/2)-((Math.ceil(limbs(id)/2)-1)/2))*22+(j>=limbs(id)/2?4:-4),hip=[x,7];if(f===5){const pts=[hip];for(let n=1;n<=8;n++)pts.push([x*.65+Math.sin(t*3-n*.58+j)*n*.85,7+n*3.7]);line(c,pts,ink,5);line(c,pts,col,3)}else{const e=legs[j]||[x+(j%2?6:-6),32];const k=knee(hip,e,17,17,j%2?1:-1);foot(c,hip,k,e,col)}}
  oval(c,0,0,w,h,col);oval(c,2,h*.45,w*.73,h*.4,cream,0,false);
  for(let j=0;j<7+v;j++){const x=(j*17%41)-20,y=-h*.6+(j*7%12);line(c,[[x,y],[x-3,y+3]],'#596e56',1)}
  if(f===1){c.beginPath();c.moveTo(-w,0);c.quadraticCurveTo(0,-h*.6,w,0);c.stroke();for(let j=0;j<3+v;j++)oval(c,-16+j*5,-7+(j%2)*5,2,2,ink,0,false)}
  if(f===2||f===3){c.save();c.translate(-4,0);c.rotate(-.25+beat*(f===2?.85:.22));for(let j=0;j<4;j++)oval(c,-10-j*2,j*2-4,16-j,4,col,-.3);c.restore()}
  const hx=f===5?7:w*.8,hy=f===4?-13:-4;
  if(f!==5)oval(c,hx,hy,f===1?12:15,f===4?16:13,col);
  if(f===4||f===2){for(let j=0;j<2;j++)oval(c,hx-9+j*13,hy-13-v,4+v*.4,8+(f===4?6:0)+v,col,-.4+j*.65)}
  if(f===1||f===5){for(let j=0;j<2;j++){const x=hx-8+j*13;line(c,[[x,hy-8],[x+2,hy-19],[x+8,hy-25+beat]],ink,1.8);oval(c,x+8,hy-25+beat,2.5,2.5,col)}}
  if(f===2)shapeBeak(c,hx+11,hy);
  oval(c,hx+5,hy-2,5,6,cream);oval(c,hx+6,hy-2,2.7,3.8,ink,0,false);oval(c,hx+7,hy-4,1,1,'white',0,false);
  if(v===3||v===4){for(let j=0;j<=v;j++)oval(c,-16+j*7,-h+2,2.5,5,col,j*.14)}
 }
 function shapeBeak(c,x,y){c.beginPath();c.moveTo(x,y);c.lineTo(x+14,y+3);c.lineTo(x,y+6);c.closePath();c.fillStyle='#e5a652';c.fill();c.strokeStyle=ink;c.stroke()}
 function knee(a,b,l1,l2,side){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(.01,Math.hypot(dx,dy)),reach=Math.min(l1+l2-.001,d),p=(l1*l1-l2*l2+reach*reach)/(2*reach),q=Math.sqrt(Math.max(0,l1*l1-p*p))*side;return [a[0]+(dx*p-dy*q)/d,a[1]+(dy*p+dx*q)/d]}
 return {names,shapes,shape,oval,line,foot,colors,limbs,tau,ink,specimen,knee};
})();
