// Each step gives the outgoing direction. D = domino relay, B = chime,
// J = two-square jump, L = hinged lever. Other turns use the curved rail.
const Workshop = (() => {
  const parts = {
    rail:['直線レール','玉は矢印の向きにまっすぐ転がります。'],
    bend:['曲線レール','横から来た玉を受けて、矢印の方向に直角に曲げます。'],
    domino:['ドミノ列','後ろから玉が当たると順に倒れ、先頭の留め金から次の玉が出ます。'],
    lever:['跳ねレバー','横から玉が乗ると腕が傾き、矢印の方向へ次の玉を送り出します。'],
    spring:['ばね台','後ろから入った玉が一マス飛び越え、二マス先へ着地します。'],
    bell:['音板','直進する玉が真鍮の板を叩いて音を鳴らします。'],
    erase:['取り外す','取り外したい部品のマスを押してください。']
  };
  const goals = ['呼び鈴','読書灯','合図の旗','風車','やかん'];
  const recipes = [
    ['はじめての呼び鈴','> D> >',0],
    ['書斎の角を曲がって','> v Bv',1],
    ['机の溝をひとっ飛び','> J> >',2],
    ['風車の裏口','> Lv v >',3],
    ['お茶まであと一押し','> D> v Bv >',4],
    ['宵待ちの二重奏','> B> v Bv <',0],
    ['夜ふかしの点灯係','v Dv > J> ^',1],
    ['窓際の伝令','> v L> D>',2], 
    ['折り返し送風機','> D> Lv < D<',3],
    ['湯気の遠回り','^ J^ > B> v',4],
    ['引き出し越しの来客','> J> v Dv < B<',0],
    ['曲がり角の読書会','v > D> ^ L> B>',1],
    ['郵便屋の小さな旗','> Lv Dv > J> ^',2],
    ['午後三時のそよ風','^ > J> Lv Dv <',3],
    ['お茶くみの輪舞','< B< v < Lv >',4],
    ['真夜中の三連チャイム','> B> v Bv < B<',0],
    ['屋根裏への配線','^ D^ > J> Lv <',1],
    ['ジグザグの信号所','> Lv > L^ > Lv',2],
    ['風を渡す飛び石','> J> v Jv < B<',3],
    ['やかんの逆回り','< D< L^ B^ > J>',4],
    ['時計職人の目覚まし','v Dv > B> L^ J^',0],
    ['灯台守の引き継ぎ','> J> Lv Dv < B< ^',1],
    ['開幕の旗揚げ','< J< v Dv L> B> ^',2],
    ['二階建ての風車','> D> Lv Bv < J< ^',3],
    ['博士のお茶会・大仕掛け','> B> J> Lv Dv < B< L^',4]
  ];
  const dirs=[[1,0],[0,1],[-1,0],[0,-1]];
  const plans=recipes.map(([name,recipe,goal],index)=>{
    let x=0,y=0,previous;
    const route=recipe.split(' ').map((token,i)=>{
      const dir='>v<^'.indexOf(token.at(-1));
      const type=i===0?'start':({D:'domino',L:'lever',J:'spring',B:'bell'}[token[0]] ?? (previous===dir?'rail':'bend'));
      const step={x,y,dir,type};
      const distance=type==='spring'?2:1;
      x+=dirs[dir][0]*distance;y+=dirs[dir][1]*distance;previous=dir;
      return step;
    });
    route.push({x,y,type:'goal',dir:0});
    const xs=route.map(p=>p.x),ys=route.map(p=>p.y);
    const offset=(values,size)=>Math.floor((size-1-Math.max(...values)-Math.min(...values))/2);
    for(const p of route){p.x+=offset(xs,7);p.y+=offset(ys,5);p.key=p.y*7+p.x;}
    return {name,goal,route,index};
  });
  // Commission constraints describe observable results instead of a parts recipe.
  for(const [name,start,dir,goal,target,conditions,brief,hint] of [
    ['一坪の呼び鈴工場',15,0,0,17,{drive:'bell'},'部品を置けるのは一マスだけ。玉が通ると音を鳴らし、そのまま隣の呼び鈴を押す装置を発明しよう。','直進する入口と音板カムを組み、出口を右に向けましょう。'],
    ['谷越え郵便局',14,0,2,18,{range:3},'机の割れ目を越えて旗まで届けよう。一台で三マス先に玉を送れる装置が必要です。','直進する入口とばね射出筒を選び、射程を3マスにしましょう。'],
    ['角の向こうのお茶会',2,1,4,12,{range:3,drive:'bell'},'上から来る玉で音を鳴らし、角の向こうのやかんまで飛ばす一台を設計しよう。','下向きに進む玉を左折させると右向きに。音板カムと射程3のばねを組みましょう。']
  ]){
    const dock=start+dirs[dir][0]+7*dirs[dir][1];
    plans.push({index:plans.length,name,goal,conditions,brief,hint,dock,route:[{type:'start',key:start,dir},{type:'goal',key:target,dir:0}]});
  }
  for(const [name,start,dir,out,range,slot,id,goal] of [
    ['雨上がりの銀鈴',14,0,0,2,'drive','drive-bell-1',0],
    ['琥珀色の書斎',20,2,2,1,'intake','intake-rail-3',1],
    ['運河を渡る伝令',7,1,0,4,'output','output-spring-2',2],
    ['風見鶏の休日',4,1,2,2,'intake','intake-lever-2',3],
    ['木琴のお茶会',28,0,3,2,'drive','drive-bell-2',4],
    ['二段巻上げ灯台',30,3,0,3,'drive','drive-rail-4',1],
    ['磁石街の朝便',5,1,2,3,'intake','intake-bend-1',2],
    ['時計塔の目覚まし',14,0,0,4,'drive','drive-domino-4',0],
    ['月明かりの長距離便',7,1,0,5,'output','output-spring-5',2],
    ['南風の送風室',32,3,3,2,'drive','drive-rail-3',3],
    ['水琴窟の合図',33,3,2,3,'drive','drive-bell-5',4],
    ['大運河の六間跳び',7,1,0,6,'output','output-spring-6',3]
  ]){
    const step=n=>dirs[n][0]+7*dirs[n][1],dock=start+step(dir),target=dock+step(out)*range;
    const item=WorkshopStock.items[slot][id],turn=dir===out?'直進':(out-dir+4)%4===1?'右折':'左折';
    plans.push({index:plans.length,name,goal,dock,conditions:{[slot]:id,range},
      brief:item.name+' を組み込んだ装置で、'+goals[goal]+' を動かしてください。',
      hint:'部品商店の「'+WorkshopStock.sections[slot]+'」で '+item.name+' を購入。'+turn+'の入口と射程'+range+'の出口を組み、矢印を'+'右下左上'[out]+'へ向けます。',
      route:[{type:'start',key:start,dir},{type:'goal',key:target,dir:0}]});
  }
  return {plans,parts,goals,dirs};
})();

