// Original INK CLUB field guide and print finishes.
window.InkEditions=(()=>{
const sets=[
 ['朝露','若葉','#294d48','#98c7a4','leaf'],['星宵','星座','#252849','#a295f1','star'],['珊瑚','潮騒','#285369','#ffa993','wave'],['紅蓮','火山','#673948','#ffad66','peak'],
 ['氷晶','流氷','#416088','#ccefff','ice'],['砂金','砂丘','#795641','#f3d189','dune'],['雷光','雷雲','#504379','#f2df77','bolt'],['月影','遺跡','#394454','#b9ceda','arch']
];
// Silhouettes are authored separately, not recolors of one outline.
const species=[
 ['飛竜','M-85 30 Q-62 35 -42 3 L-83 -51 -32 -28 -22 -78 4 -29 35 -44 46 -66 51 -47 87 -42 66 -24 39 -23 Q20 48 -29 40 Q-57 61 -85 30Z'],
 ['海馬','M-18 64 Q-58 72 -50 39 Q-42 20 -25 39 Q-46 34 -35 48 Q-13 58 -8 33 Q-6 13 -34 -5 L-47 -29 -34 -24 -39 -48 -24 -41 -18 -68 2 -53 20 -62 23 -47 61 -32 53 -17 24 -23 Q7 -7 24 14 Q45 60 -18 64Z'],
 ['水母','M-69 8 Q-67 -62 0 -65 Q68 -62 72 8 Q62 21 48 8 Q37 23 26 9 Q14 23 0 9 Q-15 23 -27 9 Q-42 24 -54 8Z M-44 16Q-62 43 -38 70Q-48 42 -32 16Z M-6 16Q14 48 -7 75Q30 52 7 16Z M34 15Q19 43 51 62Q34 38 47 15Z'],
 ['天馬','M-85 4 L-61 -12 -54 -33 -25 -12 -44 -63 -12 -37 -2 -79 13 -36 32 -44 43 -64 50 -45 72 -32 61 -19 40 -22 25 4 34 45 22 59 8 22 -16 22 -36 58 -48 55 -39 14 -61 15 -83 40 -72 5Z'],
 ['灯火蛾','M0 -5 Q-36 -67 -84 -57 Q-95 -11 -37 8 Q-76 8 -60 50 Q-27 62 -6 20 L0 51 7 18 Q36 67 66 48 Q79 9 37 9 Q98 -11 83 -58 Q34 -65 0 -5Z'],
 ['角鹿','M-67 0 Q-39 -24 -12 -12 L16 -45 9 -59 -5 -65 -17 -82 -4 -73 9 -71 2 -91 13 -79 20 -65 31 -59 42 -78 38 -92 49 -80 62 -91 55 -74 42 -58 67 -43 63 -33 39 -35 22 -2 7 18 11 56 -2 59 -12 23 -34 22 -54 57 -67 57 -55 13 -73 10Z'],
 ['古代亀','M-75 13 Q-68 -44 -9 -43 Q40 -45 57 -5 L75 -15 88 -8 83 6 62 14 50 26 53 44 37 45 29 29 -36 30 -48 45 -60 40 -58 23 -83 25Z'],
 ['鳳凰','M0 -13 Q-56 -64 -85 -65 L-65 -36 -89 -42 -62 -12 -81 -18 Q-50 18 -12 14 L-45 72 -11 41 -9 82 10 39 26 69 19 15 Q61 12 87 -24 L61 -12 85 -46 62 -30 80 -67 Q42 -60 12 -25 L21 -48 40 -48 25 -36 18 -11Z'],
 ['深海鯨','M-83 2 Q-66 -38 -11 -33 Q27 -32 52 -5 Q57 -28 84 -37 Q86 -16 70 -3 Q87 -2 92 15 Q64 23 48 7 Q30 48 -19 44 Q-63 43 -83 13Z'],
 ['翼猫','M-52 16 Q-78 8 -68 -25 L-46 -9 -50 -41 -25 -24 Q-16 -45 -25 -67 L-4 -54 19 -65 24 -41 Q48 -32 33 -6 L49 -33 73 -54 67 -26 85 -35 Q79 4 45 10 Q49 50 6 53 Q-24 61 -41 39 Q-78 65 -84 34 Q-69 46 -52 16Z'],
 ['砂蠍','M-74 4 L-90 -15 -73 -10 -76 -32 -54 -13 -51 -1 -25 -6 4 -2 Q50 -6 43 -41 Q39 -56 26 -44 L35 -67 Q66 -77 71 -44 Q85 4 36 22 L51 44 31 33 11 22 -7 22 -30 48 -22 22 -54 39 -40 15 -70 22 -89 13Z'],
 ['岩巨人','M-75 48 L-69 2 -58 -31 -28 -34 -19 -59 12 -66 36 -49 35 -29 64 -23 80 9 72 48 52 45 48 17 34 22 29 60 7 66 1 36 -12 37 -23 64 -48 60 -42 21 -53 19 -55 48Z'],
 ['夢茸','M-80 8 Q-66 -22 -36 -41 Q-4 -80 24 -53 Q60 -46 81 4 Q45 26 13 15 Q13 38 31 62 Q9 77 -25 64 Q-12 38 -15 18 Q-54 25 -80 8Z'],
 ['小妖精','M-8 -22 Q-60 -79 -70 -52 Q-83 -18 -35 0 Q-71 -5 -55 29 Q-30 39 -8 16 L-20 42 -8 40 -17 67 -6 67 4 44 13 65 23 64 15 38 27 38 14 13 Q57 38 62 15 Q62 -1 35 -3 Q77 -23 56 -59 Q34 -55 11 -22 Q23 -48 2 -47 Q-18 -47 -8 -22Z'],
 ['双刃魚','M-87 -4 Q-52 -44 -10 -33 L23 -59 16 -28 45 -11 85 -42 75 -4 89 32 46 14 13 29 15 51 -9 33 Q-56 37 -87 6 L-62 2Z'],
 ['月狼','M-85 11 Q-63 6 -57 -28 Q-48 -14 -48 -5 L-20 -17 1 -38 13 -64 20 -47 37 -75 42 -47 68 -36 88 -41 72 -24 44 -16 31 6 49 50 38 57 12 22 -15 23 -39 59 -53 54 -37 12 Q-65 29 -85 11Z']
];
const catalogue=sets.flatMap(([region,place,bg,hue,motif],i)=>species.map(([beast,path],j)=>({name:region+'の'+beast,place,bg,hue,motif,path,serial:13+i*species.length+j})));
function art(c,parallel){let cv=document.createElement('canvas');cv.width=480;cv.height=360;let a=cv.getContext('2d'),gr=a.createLinearGradient(0,0,480,360);gr.addColorStop(0,c.bg);gr.addColorStop(1,c.hue);a.fillStyle=gr;a.fillRect(0,0,480,360);
 for(let i=0;i<36;i++){const x=(i*157+c.serial*7)%510-15,y=(i*97)%360,r=4+i%10;a.save();a.translate(x,y);a.strokeStyle='#fff7';a.fillStyle='#fff3';a.lineWidth=1.4;a.beginPath();switch(c.motif){case 'wave':case 'dune':a.arc(0,0,r,0,Math.PI);break;case 'peak':case 'ice':a.moveTo(-r,r);a.lineTo(0,-r);a.lineTo(r,r);a.closePath();break;case 'star':case 'bolt':a.moveTo(0,-r);a.lineTo(-r/2,2);a.lineTo(r/2,-2);a.lineTo(0,r);break;case 'leaf':a.ellipse(0,0,r,r*.4,-.7,0,Math.PI*2);break;default:a.arc(0,0,r,Math.PI,2*Math.PI);a.lineTo(r,r);}a.fill();a.stroke();a.restore();}
 a.save();a.translate(240,173);a.scale(parallel?-1.6:1.6,1.6);a.rotate((c.serial%5-2)*.035);let shape=new Path2D(c.path),metal=a.createLinearGradient(-65,-66,55,55);metal.addColorStop(0,'#fffceb');metal.addColorStop(.42,c.hue);metal.addColorStop(.75,c.bg);metal.addColorStop(1,'#32283e');a.lineJoin='round';a.lineWidth=3;a.shadowBlur=12;a.shadowColor='#241a35aa';a.shadowOffsetY=4;a.fillStyle=metal;a.fill(shape);a.shadowBlur=a.shadowOffsetY=0;a.strokeStyle='#fff2c9';a.stroke(shape);a.clip(shape);a.strokeStyle='#fff5';for(let i=0;i<9;i++){a.beginPath();a.arc(-25,-47,12+i*9,0,Math.PI*2);a.stroke();}a.restore();a.fillStyle='#fff';a.font='bold 13px monospace';a.fillText('FIELD NOTES  /  '+String(c.serial).padStart(3,'0'),18,336);return cv;}
const finishes=['通常版','キラ','パラレル','銀箔','金箔','プリズム格子','彫刻エッチング','星屑ホロ','白銀ゴースト','結晶フォイル','虹彩シークレット','浮彫レリーフ'];
let tile;
function surface(g,edition){if(!tile){tile=document.createElement('canvas');tile.width=tile.height=128;const t=tile.getContext('2d'),im=t.createImageData(128,128);let seed=123456;for(let i=0;i<im.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let n=seed%256;im.data[i]=im.data[i+1]=im.data[i+2]=n>125?255:24;im.data[i+3]=9+n%20;}t.putImageData(im,0,0);t.strokeStyle='#6e4b3e1b';for(let i=0;i<48;i++){let x=i*37%128,y=i*89%128;t.beginPath();t.moveTo(x,y);t.lineTo(x+2+i%5,y+.7);t.stroke();}}
 g.save();g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(0,0,720,980);let edge=g.createLinearGradient(0,0,720,980);['#fff9','#0003','#fff5','#0005'].forEach((v,i)=>edge.addColorStop(i/3,v));g.strokeStyle=edge;g.lineWidth=4;g.strokeRect(7,7,706,966);
 if(edition){let ink=g.createLinearGradient(0,0,480,480),palette=edition===3||edition===8?['#364356','#fff','#9aacc0','#fff']:edition===4?['#794214','#fff3aa','#ae6f26','#fff1a9']:['#7ce2e4','#fff4b9','#ce9deb','#97dce6'];palette.forEach((v,i)=>ink.addColorStop(i/3,v));g.strokeStyle=ink;g.lineWidth=edition===4?10:6;g.strokeRect(18,18,684,944);g.beginPath();g.rect(40,160,640,480);g.clip();g.lineWidth=1.2;g.globalAlpha=.35;
 for(let i=-600;i<1200;i+=edition===6?7:23){g.beginPath();if(edition===5){g.moveTo(i,160);g.lineTo(i,640);g.moveTo(40,i);g.lineTo(680,i);}else if(edition===6||edition===11){for(let x=40;x<=680;x+=4){let y=i+Math.sin(x/43+i*.007)*14;x===40?g.moveTo(x,y):g.lineTo(x,y);}if(edition===11){g.shadowColor='#292738';g.shadowOffsetY=2;}}else if(edition===9){g.moveTo(i,160);g.lineTo(i+180,420);g.lineTo(i+100,640);g.lineTo(i-90,410);g.closePath();}else if(edition===10||edition===2){g.moveTo(i,160);g.lineTo(i+480,640);}else if(edition===7){g.arc(58+(i+610)*71%590,175+(i+613)*29%440,2+(i+610)%4,0,Math.PI*2);}g.stroke();}
 if(edition===8){g.globalAlpha=.24;g.fillStyle='#eff8ff';g.fillRect(40,160,640,480);}}
 g.restore();}
return {catalogue,art,surface,finishes};
})();
