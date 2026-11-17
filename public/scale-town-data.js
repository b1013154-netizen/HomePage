'use strict';
const Town=(()=>{
 const N=18,groups=['道路','お店','住宅','公共','緑地'];
 // name, architectural form, facade color, construction cost, homes, jobs, appeal, service
 const rows=[
 ['商店街通り','road','#6e7982',12,0,0,0,0,0],['レンガの小路','brick','#b88068',16,0,0,1,0,0],
 ['パン屋','awning','#ce8a58',100,0,6,4,0,1],['青果店','produce','#76a277',95,0,5,5,0,1],['鮮魚店','awning','#5695ac',110,0,6,4,0,1],['喫茶店','cafe','#bb8566',130,0,7,6,0,1],['本屋','books','#788ea9',120,0,6,5,0,1],['花屋','flowers','#cb9394',110,0,5,7,0,1],['ラーメン屋','lantern','#c86851',140,0,8,5,0,1],['駄菓子屋','produce','#d6ae68',85,0,4,5,0,1],['洋服店','glass','#9c89a7',155,0,8,5,0,1],['レコード店','books','#5d9593',135,0,6,7,0,1],['家電店','glass','#698dab',195,0,12,4,0,1],['映画館','cinema','#a45e65',240,0,14,10,0,1],['銭湯','bath','#6b9faf',190,0,8,8,1,1],['百貨店','department','#a89883',340,0,23,9,0,1],['巨大カップ喫茶','cup','#e4b28e',175,0,8,10,0,1],['マッチ箱の雑貨店','match','#c29c72',120,0,6,8,0,1],['きのこベーカリー','cap','#bf775d',160,0,7,9,0,1],
 ['戸建て','house','#d9b790',90,9,0,1,0,2],['長屋','row','#b89778',150,18,0,1,0,2],['アパート','flat','#c9af99',210,30,0,1,0,2],['高層マンション','tower','#829cab',410,58,0,1,0,2],['店舗付き住宅','mixed','#a4ae8b',170,13,4,3,0,2],
 ['バス停','bus','#78a394',100,0,2,2,2,3],['診療所','clinic','#d1c6b4',220,0,8,3,3,3],['図書館','library','#a0806c',200,0,6,7,2,3],['学校','school','#d1b693',290,0,12,4,3,3],['交番','police','#879daf',145,0,4,2,2,3],['給水塔','tank','#8ea8ac',200,0,3,1,4,3],
 ['街角の公園','park','#87a785',65,0,0,7,1,4],['並木広場','grove','#6d9777',100,0,0,10,1,4],['ボタン噴水','button','#7ba6af',130,0,0,12,1,4],['屋台広場','market','#d49a59',145,0,7,9,0,4]
 ];
 const items=rows.map(([name,form,color,cost,homes,jobs,appeal,service,group],id)=>({id,name,form,color,cost,homes,jobs,appeal,service,group}));
 const themes=[['下町商店街','#e7ba87','個人商店の売上 +15%'],['緑のガーデンタウン','#a3c8a2','緑地による満足度 +25%'],['ネオン横丁','#bb97c4','飲食・娯楽店の売上 +25%'],['駅前都市','#8ab3ce','集合住宅の収容人数 +15%']];
 const sizes=[{name:'ミニ',n:1,fac:.58,draw:.65},{name:'標準',n:1,fac:1,draw:.87},{name:'巨大',n:2,fac:2.6,draw:1.64},{name:'超巨大',n:3,fac:5.1,draw:2.52}];
 const start=()=>({version:1,name:'こもれび商店街',theme:0,cash:3500,pop:32,day:1,tax:9,history:[32],free:false,buildings:[
 ...Array.from({length:12},(_,i)=>({x:i,y:9,id:0,s:1})),...Array.from({length:5},(_,i)=>({x:6,y:i+4,id:1,s:1})),
 ...Array.from({length:6},(_,i)=>({x:7+i,y:5,id:1,s:1})),...Array.from({length:4},(_,i)=>({x:12,y:6+i,id:0,s:1})),
 ...[[7,4,30],[8,4,19],[9,4,23],[10,4,7],[11,4,20],[12,4,24],[8,6,16],[9,6,32],[11,6,5],[13,7,22],[13,8,21],[11,8,20],[5,5,29],[5,4,31],[2,8,2],[3,8,3],[4,8,5],[5,8,7],[7,8,14],[8,8,4],[9,8,30],[2,10,19],[3,10,20],[4,10,21],[5,10,19],[6,10,24],[7,10,19],[8,10,23],[5,6,6],[7,6,30]].map(([x,y,id])=>({x,y,id,s:1}))]});
 const key=(x,y)=>x+','+y;
 function index(city){const map=new Map();for(const b of city.buildings){const n=sizes[b.s].n;for(let i=0;i<n;i++)for(let j=0;j<n;j++)map.set(key(b.x+i,b.y+j),b)}return map}
 function connected(map){const seen=new Set(),queue=[[0,9]];for(let i=0;i<queue.length;i++){const [x,y]=queue[i],k=key(x,y);if(seen.has(k))continue;const b=map.get(k);if(!b||items[b.id].group!==0)continue;seen.add(k);queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])}return seen}
 function access(b,net){const n=sizes[b.s].n;for(let i=0;i<n;i++)if(net.has(key(b.x+i,b.y-1))||net.has(key(b.x+i,b.y+n))||net.has(key(b.x-1,b.y+i))||net.has(key(b.x+n,b.y+i)))return true;return false}
 function price(id,s){return Math.round(items[id].cost*sizes[s].fac)}
 function stats(c){const map=index(c),net=connected(map);let homes=0,jobs=0,beauty=0,service=0,upkeep=0,inactive=0,shops=0,gross=0,green=0;const kinds=new Set(),active=new Set();
 for(const b of c.buildings){const v=items[b.id],f=sizes[b.s].fac;if(v.group===0){upkeep+=.18;continue}upkeep+=f*(v.group===3?3:1);if(!access(b,net)){inactive++;continue}active.add(b);
 homes+=Math.round(v.homes*f*(c.theme===3&&v.homes>=18?1.15:1));jobs+=Math.round(v.jobs*f);beauty+=v.appeal*Math.sqrt(f);service+=v.service*f;
 if(v.group===4)green+=v.appeal*f;if(v.group===1){shops++;kinds.add(b.id);gross+=v.jobs*f*(c.theme===0?1.15:c.theme===2&&['cafe','cinema','lantern','cup','cap'].includes(v.form)?1.25:1)}}
 const happy=Math.max(15,Math.min(99,Math.round(48+Math.min(17,beauty*.20)+Math.min(13,service*1.5)+Math.min(10,green*(c.theme===1?.63:.5))+Math.min(10,kinds.size*1.3)-(c.tax-9)*2.4)));
 const target=Math.floor(Math.min(homes,(jobs*2.1+6)*(happy/85)));
 const balance=Math.round(c.pop*c.tax*.12+gross*Math.min(1,c.pop/Math.max(12,jobs))*.85-upkeep);
 return {map,net,homes,jobs,happy,target,balance,inactive,shops,active}}
 function valid(c,map,b,ignore=null){const n=sizes[b.s].n;if(b.x<0||b.y<0||b.x+n>N||b.y+n>N)return '敷地の外です';for(let x=b.x;x<b.x+n;x++)for(let y=b.y;y<b.y+n;y++){const o=map.get(key(x,y));if(o&&o!==ignore)return 'ほかの建物・道路と重なっています'}return ''}
 function develop(c,s){
 const sorted=Object.entries(c.zones||{});if(!sorted.length)return;
 for(let i=0;i<sorted.length;i++){
 const [k,type]=sorted[(i+c.day)%sorted.length],[x,y]=k.split(',').map(Number);
 if(s.map.has(k))continue;
 const housing=type==='home';
 if(housing?s.homes>c.pop*1.5+20:s.jobs>c.pop*.85+15)continue;
 const choices=housing?[19,20,21,23]:[2,3,4,5,6,7,8,9,10,11,16,17,18];
 const b={x,y,s:1,id:choices[(x*3+y+c.day+c.theme)%choices.length],paid:0};
 if(!access(b,s.net))continue;
 c.buildings.push(b);return;
 }}
 function day(c){let s=stats(c);develop(c,s);s=stats(c);c.cash+=s.balance;c.pop+=Math.sign(s.target-c.pop)*Math.min(Math.abs(s.target-c.pop),Math.ceil(Math.abs(s.target-c.pop)*.19));c.day++;c.history.push(c.pop);if(c.history.length>24)c.history.shift()}
 return {N,groups,items,themes,sizes,start,index,key,stats,price,valid,day};
})();
