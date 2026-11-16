const LivingWorld=(()=>{
  const M=1000000;
  const habitats={
    green:['河口林','胞子の薄膜','苔角の群獣','葉舟を曳く甲羅獣','樹冠の滑空獣',1],
    ocean:['浅海の礁','発光する潮藻','珊瑚を耕す六腕貝','帆冠の遊泳獣','潮風に乗る浮遊貝',2],
    frost:['氷床の割れ目','氷晶の糸状藻','氷洞を掘る毛皮獣','氷下の灯魚','雪帆の滑空獣',3],
    dry:['砂岩の峡谷','砂粒を包む菌膜','井戸掘りの殻獣','夜露を集める旅獣','砂丘の帆翼虫',1],
    steam:['熱泉の段丘','硫黄を食べる菌糸','煙突礁の多脚獣','蒸気をまとう遊泳獣','上昇気流の翼虫',3],
    heavy:['重力棚','磁鉄の石苔','岩を削る六脚獣','鉱床を渡る平殻獣','低空を跳ぶ膜翼虫',1],
    light:['浮雲高原','浮遊する胞子膜','空根を渡る樹上獣','雲海の翼魚','気嚢を持つ帆翼獣',3]
  };
  const refuges=['根を張れる岩礁を保全','群れが往来する回廊を開く','風を受ける高台を保護'];
  const paths=[
    ['共生','生態系を守る','生きた水路を編む庭師評議会','惑星規模の共生庭園','礁と森林をつなぐ生態回廊が完成し、都市そのものが渡りの群れを養っている。'],
    ['工芸','道具と都市を育てる','鉱物の響きで通信する工匠連盟','環状工房都市','集落を結ぶ共鳴塔が完成。離れた都市の職人が同じ設計図を音で共有している。'],
    ['探航','星々への航路を築く','星図を交換する帆船議会','星間航路の母港','成層圏の港から初めての移民船が出航し、星系に暮らしの場が広がった。']
  ];
  const neighbors=[
    ['灼けた岩石惑星','鉄の蒸気が弧を描き、夜側には金属の霜が降る。','耐熱合金',1,235],
    ['潮汐の海洋惑星','塩分の異なる海流が、赤道付近に明るい縞をつくる。','循環水路の模型',0,19],
    ['輪を持つ巨大惑星','輪の切れ目を小衛星が縫う。周期的な電波は極域の放電によるものらしい。','重力航路図',2,-87],
    ['氷殻惑星','青い亀裂から水蒸気の柱が噴き上がる。氷の底には海の兆候。','氷中の共生鉱物',0,-132]
  ];
  const alternateNeighbors=[
    ['双子火口の溶岩惑星','明暗境界に細い高原がある。二つの巨大火口が交互に赤外線で輝く。','溶岩繊維の標本',1,318],
    ['雲に包まれた湿原惑星','黄色い雲が途切れるたび、浅い湿原から規則的な反射光が届く。','結露を集める膜',0,34],
    ['青い嵐の巨大惑星','極の渦がほどけると、二重のジェット気流が衛星の影を押し流す。','極渦の航法記録',2,-104],
    ['夕映えの小惑星','赤い尾のような塵が公転軌道に沿って伸びている。地殻には有機物を含む氷が残る。','低温培養用の氷床',0,-151]
  ];
  function hash(n){n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0}
  function planet(seed,i){
    const n=hash(seed+i*7919),name=['セラ','ミラ','シア','ノル','ルナ','イル','ヴェル','テラ'][n%8]+['ネ','リス','ト','ノア','メア','ディア','ラム','セ'][n>>>8&7];
    const data=(n&16)?neighbors[i]:alternateNeighbors[i];
    return {name:name+' '+['b','c','e','f'][i],distance:([.38,.78,3.6,8.1][i]+(n%27)/100).toFixed(2),temp:data[4]+(n%35)-17,gravity:([.6,.8,2.8,.24][i]+(n%29)/100).toFixed(2),moons:(n%4)+(i===2?8:0),data};
  }
  function ensure(s){
    if(!s.life)s.life={progress:0,stage:0,refuge:-1,origin:'',form:0,path:-1,scans:[],returns:[],target:0,mission:null};
    return s.life;
  }
  function info(s,b){
    const l=ensure(s),h=habitats[l.origin||b]||habitats.green;
    const language=['明滅の間隔で数を伝える','石を打つ音で遠くの仲間を呼ぶ','身振りと色彩を組み合わせて地図を描く'][hash(s.seed+l.form)%3];
    const people=['ルーヤ','シルカ','オルネ','メーヴ','ユラ','テネス','アステ','クオン'][hash(s.seed+l.form*97)%8]+'族';
    return {h,people,language,animal:h[2+l.form]};
  }
  const thresholds=[.6,2.4,5.2,8,17];
  function step(s,b,start,end,add){
    const l=ensure(s),news=[];
    function evolve(a,z){
      if(z<=a)return;
      if(!s.water){if(l.population)l.population=Math.max(40,l.population*Math.exp(-(z-a)/(3*M)));return}
      const hadTown=l.stage>=4;let townYear=a;
      const speed=(.81+(hash(s.seed)%37)/100)*(l.origin&&l.origin!==b ? .65 : 1)*(l.refuge>=0?1.13:1)*(1+.06*PlanetArchive.count(l,0))*(1+l.returns.length*.08+l.returns.filter(i=>neighbors[i][3]===l.path).length*.12);
      const previous=l.progress;
      l.progress=Math.min(l.path<0?thresholds[3]:1000,previous+(z-a)/M*speed);
      while(l.stage<5&&l.progress>=thresholds[l.stage]){
        const when=Math.min(z,Math.round(a+Math.max(0,thresholds[l.stage]-previous)*M/speed));l.stage++;
        if(l.stage===1)l.origin=b;
        if(l.stage===4){townYear=when;l.population=420+hash(s.seed)%480}
        if(l.stage===2)l.form=l.refuge>=0?l.refuge:hash(s.seed+Math.round(s.water)*7+s.drops)%3;
        const {h,people,language,animal}=info(s,b);
        const name=[h[1],animal,people,people+'の川辺の集落',paths[l.path]?.[3]][l.stage-1];
        const story=[h[0]+'の岩に'+h[1]+'の群体が定着した。',animal+'が群れになり、餌場を親から子へ伝え始めた。',animal+'の子孫が道具を使い始めた。'+people+'は'+language+'。',people+'の家々が広場を囲み、初めての評議会が開かれた。',paths[l.path]?.[4]][l.stage-1];
        if(!s.finds.includes(name))s.finds.push(name);add(story,when);news.push(name);
      }
      if(hadTown||l.stage>=4){
        const capacity=(1+.10*PlanetArchive.count(l,1))*(l.origin===b?1:.34)*(50000+(hash(s.seed)%90000))*(1+l.returns.length*.18)*(l.path===1?2.2:l.path===0?1.5:1);
        const duration=(z-townYear)/M;
        const pop=l.population||600;
        l.population=capacity/(1+(capacity/pop-1)*Math.exp(-duration*.57));
        if(l.path>=0&&!l.work&&l.progress>=12){
          l.work=['種子を保管する森の図書館','水車で動く共同工房','二つの月を追う航海天文台'][l.path];
          add(l.work+'が完成し、市民に開放された。',Math.min(z,Math.round(a+Math.max(0,12-previous)*M/speed)));news.push(l.work);
        }
      }
    }
    if(l.mission&&l.mission.due<=end){
      const {index,due}=l.mission;evolve(start,due);l.returns.push(index);l.mission=null;
      const p=planet(s.seed,index),msg=p.name+'の探査隊が「'+p.data[2]+'」を持ち帰った。';add(msg,due);news.push(p.data[2]);evolve(due,end);
    }else evolve(start,end);
    return news;
  }
  function setup(get,observe,save){
    const $=id=>document.getElementById(id);
    const orbit=$('orbitList'),choices=$('policy'),shore=$('refuge');
    for(const [i,text] of refuges.entries())shore.add(new Option(text,i));
    for(let i=0;i<4;i++){const b=document.createElement('button');b.onclick=()=>{get().s.life.target=i;save();render()};orbit.append(b)}
    function record(title,detail){observe(title,detail);save();render()}
    shore.onchange=()=>{const {s}=get(),l=ensure(s);l.refuge=Number(shore.value);record('生息地を整備',l.refuge<0?'生息地を自然の遷移に委ねた。':refuges[l.refuge]+'方針が決まった。')};
    for(const [i,p] of paths.entries()){
      const btn=document.createElement('button');btn.textContent=p[1];btn.onclick=()=>{const {s}=get(),l=ensure(s);if(l.stage<4||l.path!==-1)return;l.path=i;record('評議会の決議',p[2]+'が発足した。')};choices.append(btn);
    }
    $('scan').onclick=()=>{const {s}=get(),l=ensure(s),i=l.target;if(l.scans.includes(i))return;l.scans.push(i);const p=planet(s.seed,i);record(p.name+'を分光観測',p.data[1])};
    $('launch').onclick=()=>{const {s}=get(),l=ensure(s),i=l.target;if(l.stage<4||l.mission||!l.scans.includes(i)||l.returns.includes(i))return;
      const p=planet(s.seed,i);l.mission={index:i,due:s.years+Math.round((Number(p.distance)*30000+45000)/(1+.15*PlanetArchive.count(l,2)))};record('探査艇が出発',p.name+'へ向かって観測船が離陸した。')};
    function render(){
      const {s,b,busy}=get(),l=ensure(s),{h,animal,people,language}=info(s,b),p=planet(s.seed,l.target),scanned=l.scans.includes(l.target);
      const stage=l.stage;
      $('lifeArt').dataset.panel=stage===0?'0':stage===1?'0':stage===2?String(l.form===2?3:l.form===1&&l.origin==='ocean'?2:h[5]):stage===3?'4':'5';
      $('lifeArt').classList.toggle('empty',stage===0);
      $('organism').textContent=['生命反応を探索中',h[1],animal,people,people+'の集落',paths[l.path]?.[3]][stage];
      $('bioText').textContent=[
        '地形は星ごとに異なります。水がある環境で時間を進めると、最初の群体が生まれます。',
        h[0]+'に小さな群体が広がっています。次の世代が生まれる前に、生息地を選んでみましょう。',
        animal+'の幼体は群れを追い、移動経路を覚えています。',people+'は'+language+'。道具を受け継ぐ生活が始まりました。',
        l.path<0?'住民が広場に集まりました。評議会で、この文明が歩む道を一つ選んでください。決議はこの星の歴史に残ります。':paths[l.path]?.[2]+'が新しい技術を育てています。',
        paths[l.path]?.[4]
      ][stage];
      shore.value=l.refuge;shore.disabled=busy||stage>=2;
      choices.hidden=stage<4;for(let i=0;i<3;i++){choices.children[i].disabled=busy||l.path!==-1;choices.children[i].setAttribute('aria-pressed',String(l.path===i))}
      $('census').textContent=stage>=4?'推計人口 '+Math.round(l.population||600).toLocaleString('ja-JP')+' 人　／　'+(l.work||'最初の広場と住居群'):'';
      $('lineage').textContent=stage>=2?h[1]+' → '+animal+(stage>=3?' → '+people:''):'';
      if(!s.water)$('lifeProgress').textContent='水があると世代交代が進みます。';
      else if(stage===5)$('lifeProgress').textContent='この星の文明史は観測日誌に保存されました。';
      else if(stage===4&&l.path<0)$('lifeProgress').textContent='文明の次の節目には評議会の決議が必要です。';
      else $('lifeProgress').textContent='次の節目までの進行　'+Math.min(99,Math.floor(100*(l.progress-(thresholds[stage-1]||0))/(thresholds[stage]-(thresholds[stage-1]||0))))+'%';
      for(let i=0;i<4;i++){const btn=orbit.children[i];btn.textContent=planet(s.seed,i).name;btn.dataset.planet=i;btn.setAttribute('aria-pressed',String(i===l.target))}
      $('neighborTitle').textContent=p.name+' · '+p.data[0];$('neighborFacts').textContent='公転軌道 '+p.distance+' AU ／ 衛星 '+p.moons+' 個';
      $('neighborDetail').textContent=scanned?p.data[1]+'　平均 '+p.temp+' °C ／ 重力 '+p.gravity+' G'+'　探査成果は「'+paths[p.data[3]][0]+'」の文明と好相性。':'光のスペクトルを調べると、大気や地表の様子がわかります。';
      $('scan').disabled=busy||scanned;$('scan').textContent=scanned?'観測済み':'分光観測する';
      $('launch').disabled=busy||stage<4||!!l.mission||!scanned||l.returns.includes(l.target);
      $('missionStatus').textContent=l.mission?planet(s.seed,l.mission.index).name+'へ航行中。帰還まで '+(l.mission.due-s.years).toLocaleString('ja-JP')+'年。':l.returns.includes(l.target)?'探査成果　'+p.data[2]+'（研究速度 ＋8%、'+paths[p.data[3]][0]+'方針でさらに＋12%）':stage<4?'集落が成立すると、観測済みの惑星に探査艇を送れます。':'探査艇は時間を進めると帰還します。';
    }
    return render;
  }
  return {ensure,step,setup,info};
})();
