const WorkshopRequests=(()=>{
  // Client, invention, request, drive family, number of actions, turn, delivery distance.
  const requests=[
    ['パン屋のミツ','焼き上がりの呼び鈴','窯から出したトレーに触れると、売り場で一度だけ鳴るベルが欲しいの。','bell',1,0,1],
    ['図書館の司書','静かな返却台','返却口の玉でローラーを一度動かして、右手の棚にそっと送ってください。','rail',1,1,1],
    ['温室の庭師','二鉢用の水やり栓','留め金を二度叩いて水栓を開き、左の畝まで合図を送りたい。','domino',2,-1,2],
    ['港の渡し守','対岸の乗船合図','船着き場の鈴を二度鳴らし、乗船札を向こう岸へ飛ばしておくれ。','bell',2,0,3],
    ['映写技師','フィルム送り機','上映の間に送り車を三度回し、右の巻き取り側へ玉を渡したい。','rail',3,1,1],
    ['玩具店の孫','くるみ割り人形の拍手','左の舞台袖から人形が登場したら、三拍の拍手を聞かせたい！','domino',3,-1,1],
    ['天文台のカナ','星見の時報','観測の開始を四音で知らせて、右隣の望遠鏡にも合図を回したいんです。','bell',4,1,2],
    ['活版工のゲン','一枚送りの給紙台','薄紙を重ねないよう一度だけ送り、まっすぐ奥の印刷台へ渡したい。','rail',1,0,2],
    ['茶屋のおかみ','遠席のおかわり札','おかわりの注文を一打で受けて、左奥の給仕台に届けたいの。','domino',1,-1,3],
    ['羊飼いのソラ','迷子羊の帰宅鈴','右の牧柵で鈴を三回。羊の好きな合図を、丘の先にも届けて。','bell',3,1,3],
    ['織物職人','横糸の折り返し台','送り車を二回まわして糸巻きを左に返す、小さな織機を作ってください。','rail',2,-1,1],
    ['時計塔の番人','四拍の脱進機','四つの爪を順に外し、最後の玉で真下の鐘番に知らせたい。','domino',4,0,2],
    ['菓子工房のリン','砂糖菓子の完成チャイム','飴が固まったら一音。左に曲がって隣の包装台を呼んでほしいな。','bell',1,-1,1],
    ['鉱山の測量士','坑道の測量札送り','送り車を四回刻み、正面の坑道を越えて測量札を届けてほしい。','rail',4,0,4],
    ['仕立屋の双子','二連のボタン留め','ボタンを二つ続けて打ち、右の相棒の机へ合図を戻せるかい。','domino',2,1,1],
    ['野鳥観察員','夜明けの五音笛','鳥小屋を起こす五音の合図を作って、左奥の観察窓まで玉を送って。','bell',5,-1,2],
    ['薬草園の調剤師','小瓶の順送り','瓶を傷めず三回に分けて送り、左手の調合棚へ運びたい。','rail',3,-1,2],
    ['靴工房のタク','靴底の連打機','靴底を五回たたき終えたら、右手の仕上げ職人に知らせてくれ。','domino',5,1,2],
    ['灯台守のユイ','霧の遠達ベル','霧の日には二音が目印。灯台からまっすぐ遠くまで合図を飛ばしたい。','bell',2,0,5],
    ['養蜂家','巣箱の巣板送り','巣板を二刻みで動かし、右隣の巣箱に玉を送れるようにしたい。','rail',2,1,2],
    ['舞台監督','早替わりの幕引き','留め金をひと打ちで外すと、右の舞台袖まで玉が飛ぶ装置を頼む。','domino',1,1,4],
    ['郵便局の夜番','夜行便の着信機','左の窓から夜行便が着いたら、袋を開く係に三音で知らせたい。','bell',3,-1,3],
    ['製粉所の親方','粉袋の送り車','五回の送りで袋を持ち上げ、奥の荷受け場へ玉を渡してくれ。','rail',5,0,3],
    ['雪山の案内人','雪橋の点検打診機','正面の雪橋を三度打診し、安全札を向こう岸まで飛ばす道具が要る。','domino',3,0,4],
    ['楽団の指揮者','開演の六音チャイム','右の楽屋まで六音の開演合図を届けられたら、席を一つ用意するよ。','bell',6,1,1],
    ['博物館の学芸員','模型列車の転車台','送り車を四刻みで回し、左の展示線へ模型を折り返したい。','rail',4,-1,1],
    ['花火師の師匠','花火模型の点灯順送り','展示用の灯りを六つ順に叩いて、最後の合図を左奥へ飛ばしておくれ。','domino',6,-1,3],
    ['雲上ホテルの支配人','屋上の朝食ベル','屋上から七音の朝食ベルを鳴らし、正面の別棟へ玉を渡してほしい。','bell',7,0,4],
    ['からくり市の運送係','大運河の荷札便','送り機を六刻みで動かして、右手の大運河を一気に越える荷札便を作りたい。','rail',6,1,6],
    ['時計博の審査長','大時計のからくり行進','七度の連打で行進の時を刻み、左の大舞台まで合図を届けてください。','domino',7,-1,5]
  ];
  const kinds={bell:'音板・ベル',domino:'留め金・連打',rail:'ローラー送り'},turns={'-1':'左折',0:'直進',1:'右折'};
  function grade(r,d){
    const [, , ,drive,hits,turn,range]=r;
    const actual=WorkshopStock.items.drive[d.drive],count=actual.tier+1;
    return [
      ['用途',kinds[drive],kinds[actual.base],actual.base===drive?40:0,40],
      ['進路',turns[turn],turns[d.turn],turn===d.turn?20:0,20],
      ['到達距離',range+'マス',d.range+'マス',Math.max(0,25-10*Math.abs(range-d.range)),25],
      ['作動回数',hits+'回',count+'回',Math.max(0,15-5*Math.abs(hits-count)),15]
    ];
  }
  function init(){
    const el=id=>document.getElementById(id),list=el('clientList'),shelf=el('offerList'),result=el('appraisal');
    let busy=false;
    function showOrder(){
      const index=Number(list.value),r=requests[index],best=WorkshopMarket.bestOffer(index);
      el('clientLetter').textContent=r[0]+'「'+r[2]+'」';
      el('clientSpec').textContent='用途 '+kinds[r[3]]+'（40点） ／ '+turns[r[5]]+'（20点） ／ '+r[6]+'マス（25点） ／ '+r[4]+'回（15点）';
      el('bestOffer').textContent=best===null?'未納品':'最高 '+best+'点'+(best>=60?'・合格':'・改良待ち');
      result.replaceChildren();
    }
    function refreshShelf(id){
      const old=id||shelf.value,designs=DeviceLab.saved();
      shelf.replaceChildren(...designs.map(d=>new Option(d.name,d.id)));
      if(designs.some(d=>d.id===old))shelf.value=old;
      if(!designs.length)shelf.add(new Option('先に装置を設計してください',''));
      el('deliver').disabled=busy||!designs.length;
      const d=designs.find(d=>d.id===shelf.value);el('offerSpec').textContent=d?DeviceLab.describe(d):'';
    }
    requests.forEach((r,i)=>list.add(new Option((i+1)+'　'+r[1],i)));
    list.onchange=showOrder;shelf.onchange=()=>refreshShelf();
    window.addEventListener('workshop-design-saved',e=>{refreshShelf(e.detail);result.replaceChildren()});
    el('clientDesign').onclick=()=>el('openDesign').click();
    el('deliver').onclick=async()=>{
      if(busy)return;
      const i=Number(list.value),d=DeviceLab.saved().find(x=>x.id===shelf.value);if(!d)return;
      const rows=grade(requests[i],d),score=rows.reduce((n,row)=>n+row[3],0);
      busy=true;list.disabled=shelf.disabled=el('deliver').disabled=true;
      try{
        const coins=await WorkshopMarket.offer(i,score);
        showOrder();
        const head=document.createElement('strong');head.textContent=d.name+'　'+score+' / 100点　'+(score>=60?'合格':'要改良')+'　＋'+coins+' コイン';
        result.append(head);
        for(const [k,want,got,n,max] of rows){const line=document.createElement('div');line.textContent=k+'　'+n+' / '+max+'点　希望 '+want+'・納品 '+got;result.append(line)}
      }finally{busy=false;list.disabled=shelf.disabled=false;refreshShelf()}
    };
    showOrder();refreshShelf();
    if(location.hash==='#requests')el('requests').open=true;
  }
  return {init};
})();
