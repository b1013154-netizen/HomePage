const WorkshopStock=(()=>{
  // Rows within a family share a mechanism; tuning changes its timing or travel.
  const groups={
    intake:[
      ['rail','直進レール','瑪瑙の受け皿|樫の樋|琥珀の導入口|蒸気仕切弁'],
      ['bend','曲線ガイド','磁石の曲がり角|真珠の螺旋溝|水晶の旋回皿|青銅の湾曲管'],
      ['lever','旋回レバー','天秤クラッチ|風見鶏レバー|鋳鉄の振り子|銀の跳ね橋']
    ],
    drive:[
      ['bell','音板カム','銀鈴カム|木琴ハンマー|黄銅チャイム|星音オルゴール|水琴共鳴器|鐘楼カム'],
      ['domino','ドミノ留め金','連爪ラチェット|象牙の逃がし爪|連結ハンマー|振子ストッパー|からくり連杵|時限ラッチ'],
      ['rail','搬送ローラー','革帯コンベア|水車ローラー|歯車変速機|二段巻上機|蒸気フライホイール|遊星歯車列']
    ],
    output:[
      ['rail','送りレール','水平シュート|磁石の送り台|滑車コンベア|羽根車シュート|時計送り機|風圧レール'],
      ['spring','ばね射出筒','葉ばねカタパルト|青銅ピストン|空気圧ポンプ|二重コイル筒|月面ジャンパー|大巻ばね投射機']
    ]
  };
  const sections={intake:'入口',drive:'内部機構',output:'出口'},items={intake:{},drive:{},output:{}},goods=[];
  for(const [section,rows] of Object.entries(groups))for(const [base,name,list] of rows){
    items[section][base]={id:base,name,base,section,tier:0,price:0};
    list.split('|').forEach((name,i)=>{
      const tier=i+1,id=section+'-'+base+'-'+tier;
      const item={id,name,base,section,tier,price:10+tier*5};
      items[section][id]=item;goods.push(item);
    });
  }
  function effect(p){
    if(p.section==='intake')return (p.base==='rail'?'直進':'左右に旋回')+'・受入時間 '+(350-35*p.tier)+' ms';
    if(p.section==='drive')return (p.base==='bell'?'調律音':p.base==='domino'?'連打':'ローラー送り')+' ×'+(1+p.tier)+' 回';
    return p.base==='spring'?'射程 1〜'+maxRange(p)+' マス・弾道高 '+(100+12*p.tier)+'%':'直進・送出速度 '+(100+12*p.tier)+'%';
  }
  function maxRange(p){return p.base==='rail'?1:3+Math.floor(p.tier/2)}
  return {items,goods,sections,effect,maxRange};
})();
