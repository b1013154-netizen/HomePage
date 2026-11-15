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
  return {plans,parts,goals,dirs};
})();

