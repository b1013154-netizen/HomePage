(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STAT_NAMES = ['筋力', '耐久', '敏捷', '知性', '精神', '幸運'];
  const STAT_KEYS = ['STR', 'VIT', 'AGI', 'INT', 'WIL', 'LUK'];
  const WORLDS = {
    fantasy: { label:'ファンタジー', jobs:['剣士','魔法使い','盗賊','薬師','騎士','吟遊詩人','狩人','僧侶'], names:['リオ','セナ','ノア','ユイ','ルカ','エル','ミラ','カイ','フィン','アリア','レイ','ティオ'], surnames:['アステル','ヴェイル','リンド','クレスト','フェルン','アルク','ソレイユ','オルディア'], places:['霧に包まれた辺境の村','古い水路の街','忘れられた塔の麓','砂漠の交易都市','深い森に隠れた集落'], objects:['欠けた紋章','師匠の古い手帳','音の鳴らない鈴','封の開かない手紙'], goals:['失われた故郷の記録を探している','仲間にかけられた呪いを解こうとしている','誰も見たことのない景色を地図に残したい','名前のない遺跡の謎を追っている'] },
    modern: { label:'現代・異能', jobs:['探偵','学生','研究者','救急隊員','格闘家','記者','料理人','配達員'], names:['ハル','アオイ','レン','ユズ','ナギ','ソラ','トウマ','ヒナ','リツ','マコト','シオン','イズミ'], surnames:['朝霧','白瀬','月島','七瀬','一ノ瀬','御影','青葉','風見'], places:['海沿いの小さな街','眠らない繁華街','閉鎖された研究都市','坂道の多い旧市街','郊外の団地'], objects:['壊れた懐中時計','古い録音機','差出人不明の写真','誰かとおそろいの鍵'], goals:['街で起こる奇妙な失踪事件を調べている','大切な人と交わした約束を果たそうとしている','自分だけが聞こえる声の正体を探している','日常に紛れた異変を記録している'] },
    scifi: { label:'SF・宇宙', jobs:['宇宙探偵','パイロット','エンジニア','衛生兵','傭兵','航海士','情報屋','惑星調査員'], names:['エコー','ノヴァ','アッシュ','リラ','ゼノ','イオ','キリ','アルト','ネム','テラ','リオン','セイル'], surnames:['ヴェクター','オービット','クロム','ヘリックス','レイヴン','アーク','ネビュラ','フラックス'], places:['外縁宙域の採掘コロニー','軌道上の巨大ステーション','地図にない移民惑星','廃棄された観測船','人工の夜明けを迎える都市'], objects:['読み取れないメモリチップ','旧式の航法端末','出所不明の金属片','途絶えた救難信号の記録'], goals:['消えた調査船の航路を追っている','故郷のコロニーを救う資源を探している','星間ネットワークの空白に隠れた真実を求めている','帰る場所のない旅人たちの居場所を作ろうとしている'] }
  };
  const ROLES = [
    { id:'fighter', regex:/剣|騎士|戦士|格闘|傭兵|武士|侍|兵士|レスラー/, best:[0,1], title:['暁を切り拓く','砕けぬ誓いの','逆境を越える'], skills:[['突破の一撃','筋力を活かした一撃で、相手の守りを崩す。'],['守りの構え','危険を引き受け、次の行動まで味方をかばう。']] },
    { id:'mage', regex:/魔法|魔術|術師|研究|学者|科学|錬金/, best:[3,4], title:['未知を読み解く','境界を渡る','静かな叡智の'], skills:[['理の解析','相手や現象を観察し、弱点の手がかりを得る。'],['集束の波動','知性を力に変え、狙った対象へ放つ。']] },
    { id:'rogue', regex:/盗賊|忍者|暗殺|探偵|情報|記者|調査/, best:[2,3], title:['影を歩く','真実を拾う','夜明けを待つ'], skills:[['気配を読む','小さな違和感を拾い、危険や隠されたものを探る。'],['死角の一手','相手の注意が逸れた瞬間に素早く行動する。']] },
    { id:'healer', regex:/薬|医|僧|聖|救急|衛生|看護|料理|ヒーラー/, best:[4,3], title:['命をつなぐ','灯火を守る','癒やしを運ぶ'], skills:[['応急処置','限られた道具で仲間の傷と疲れを和らげる。'],['安らぎの手','落ち着いた声と手当てで、味方の動揺を鎮める。']] },
    { id:'ranger', regex:/狩|弓|パイロット|航海|配達|斥候|走/, best:[2,5], title:['風を追う','遠景を見つめる','迷わぬ軌跡の'], skills:[['経路予測','地形や軌道を読み、安全なルートを見つける。'],['狙い澄ます','機会を待ち、素早い正確な一手を放つ。']] },
    { id:'maker', regex:/技師|エンジニア|職人|鍛冶|整備|工/, best:[3,1], title:['明日を組み立てる','歯車をつなぐ','小さな奇跡の'], skills:[['即席修理','手近な部品を使い、壊れた装備を一時的に復旧する。'],['仕掛けの妙','周囲の道具を組み合わせ、状況を有利に変える。']] },
    { id:'support', regex:/吟遊|歌|踊|商人|交渉|芸|アイドル/, best:[4,5], title:['心を動かす','旅路を彩る','希望を紡ぐ'], skills:[['心をつなぐ','言葉や表現で味方を鼓舞し、連携のきっかけを作る。'],['場を変える','相手の感情を読み、対話や交渉の流れを引き寄せる。']] },
    { id:'wanderer', regex:/$^/, best:[5,4], title:['まだ見ぬ明日の','名もなき物語の','旅を続ける'], skills:[['機転の一手','周囲を観察し、職業の経験を意外な方法で役立てる。'],['最後の粘り','諦めずに踏みとどまり、次の機会を待つ。']] }
  ];
  const TRAITS = [
    {regex:/冷静|無口|慎重|完璧|孤独/, habit:['決断の前に必ず一度、周囲を見渡す','持ち物をきっちり同じ順に並べる'], flaw:['考えすぎて助けを求めるのが遅くなる','本音を言葉にすることが苦手'], quote:['「焦らなくていい。まだ、見えていない道がある。」','「言葉よりも、次の一手で示そう。」']},
    {regex:/臆病|優し|誠実|穏やか|心配/, habit:['誰かの無事を確かめてから、自分の荷物を下ろす','困っている人を見ると足を止めてしまう'], flaw:['自分のことを後回しにしがち','相手を傷つける決断に迷ってしまう'], quote:['「怖くないわけじゃない。でも、置いてはいけないから。」','「できることからでいい。ひとつずつ、助けよう。」']},
    {regex:/勇敢|熱血|負けず|大胆/, habit:['難しい局面ほど、一歩前に出る','決意を固めるたび装備の留め具を締め直す'], flaw:['危険を引き受けすぎてしまう','後先を考えるより先に動いてしまう'], quote:['「道がないなら、ここから作ればいい。」','「まだ終わってない。私たちは、ここにいる。」']},
    {regex:/陽気|自由|お調子|好奇|明る|楽観/, habit:['見知らぬ道を見つけると目を輝かせる','緊張した場面ほど軽口をひとつ挟む'], flaw:['興味を持つと周りが見えなくなる','つい予定にない寄り道をしてしまう'], quote:['「ねえ、この先、ちょっと見てみたくない？」','「うまくいくかは、やってから考えよう！」']},
    {regex:/.*/, habit:['旅先で拾った小物を大切に保管する','考えごとをすると指先で小さくリズムを刻む'], flaw:['大切な過去についてはなかなか話せない','一度決めたことを曲げるのが苦手'], quote:['「この先で、きっと何かが変わる。」','「私の物語は、まだ途中だ。」']}
  ];
  const PALETTES = [['#d6b77b','#4f6974','#c1a5c8'],['#8bb8ac','#4b607c','#cab189'],['#df9c80','#625170','#82a6b4'],['#a5a3d4','#465a7b','#c59a7e'],['#91b4d0','#4a6a62','#d3af78']];
  const STORAGE = 'playground.character-forge.v1';
  let current = null, saved = [];
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function hash(text) { let n=2166136261; for(const ch of text){n^=ch.codePointAt(0);n=Math.imul(n,16777619);} return n>>>0; }
  function randomSource(seed) { let a=hash(seed); return () => {a=(a+0x6D2B79F5)|0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
  function freshSeed(){const a=new Uint32Array(2);crypto.getRandomValues(a);return [...a].map(n=>n.toString(36)).join('-');}
  function choose(list,rng){return list[Math.floor(rng()*list.length)];}
  function shuffle(list,rng){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function readInput(){
    const mode=document.querySelector('input[name=mode]:checked').value;
    let values=null,total=null;
    if(mode==='total'){
      total=Number($('total').value);
      if(!$('total').value || !Number.isInteger(total)||total<6||total>600)throw Error('ステータスの合計は6〜600の整数で入力してください。');
    } else {
      const tokens=$('values').value.normalize('NFKC').trim().split(/[\s,、，]+/);
      if(tokens.length!==6 || tokens.some(t=>!/^\d+$/.test(t)||Number(t)<1||Number(t)>999))throw Error('1〜999の整数を、カンマか空白で区切って6個入力してください。');
      values=tokens.map(Number);
    }
    return {world:$('world').value,mode,total,values,job:$('job').value.trim(),personality:$('personality').value.trim(),name:$('character-name').value.trim(),distribution:$('distribution').value};
  }
  function allocate(input,role,rng){
    if(input.mode==='values'){
      const stats=shuffle(input.values,rng);
      if(input.distribution==='role'){
        const order=shuffle([0,1,2,3,4,5],rng).filter(i=>!role.best.includes(i));
        const ranked=[...stats].sort((a,b)=>b-a), slots=[...role.best,...order];
        return slots.reduce((out,index,i)=>(out[index]=ranked[i],out),[]);
      }
      return stats;
    }
    const weights=Array.from({length:6},()=>.1+Math.pow(rng(),1.4));
    if(input.distribution==='role'){weights[role.best[0]]*=2.4;weights[role.best[1]]*=1.7;}
    const remaining=input.total-6,sum=weights.reduce((a,b)=>a+b,0),raw=weights.map(w=>w/sum*remaining);
    const stats=raw.map(n=>1+Math.floor(n));
    const extras=input.total-stats.reduce((a,b)=>a+b,0);
    const order=raw.map((n,i)=>({i,f:n%1})).sort((a,b)=>b.f-a.f);
    for(let i=0;i<extras;i++)stats[order[i].i]++;
    return stats;
  }
  function generate(input,seed){
    const rng=randomSource(JSON.stringify(input)+'|'+seed),world=WORLDS[input.world];
    const job=input.job||choose(world.jobs,rng),personality=input.personality||choose(['好奇心旺盛','冷静沈着','勇敢','臆病だけど優しい','自由奔放'],rng);
    const role=ROLES.find(r=>r.regex.test(job))||ROLES.at(-1),trait=TRAITS.find(t=>t.regex.test(personality));
    const stats=allocate(input,role,rng),top=stats.indexOf(Math.max(...stats)),low=stats.indexOf(Math.min(...stats));
    const first=choose(world.names,rng),last=choose(world.surnames,rng);
    const name=input.name||(input.world==='modern'?last+' '+first:first+'・'+last);
    const habit=choose(trait.habit,rng),flaw=choose(trait.flaw,rng);
    const origin=choose(world.places,rng),object=choose(world.objects,rng),goal=choose(world.goals,rng);
    const strength=['重い荷を軽々と運ぶ力','粘り強く旅を続ける体力','一瞬の隙を逃さない身のこなし','複雑な問題をほどく洞察力','揺らぐ仲間を支える意志','不思議と好機を引き寄せる運'][top];
    const weakness=stats.every(n=>n===stats[0])?'能力は均等で、状況に合わせて役割を変えられる。':`${STAT_NAMES[low]}を補う工夫も必要で、仲間との連携が力になる。`;
    const skills=role.skills.map(([name,description])=>({name,description}));
    if(role.id==='wanderer')skills[0]={name:job+'の知恵',description:`「${job}」として培った経験で、目の前の問題に独自の解決策を見つける。`};
    const visual={palette:choose(PALETTES,rng),hair:Math.floor(rng()*4),skin:choose(['#d9b79c','#b68b71','#e5c7b0','#8d6553'],rng),accessory:role.id};
    return {schemaVersion:1,generatorVersion:'1.0',id:hash(JSON.stringify(input)+seed).toString(36),seed,input,name,job,personality,world:input.world,title:choose(role.title,rng)+job,stats:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,stats[i]])),total:stats.reduce((a,b)=>a+b,0),story:`${origin}出身の${job}。「${personality}」という性格で、${habit}。${object}を携え、今は${goal}。`,strength,weakness,flaw,skills,quote:choose(trait.quote,rng),visual};
  }
  function portrait(c){
    const {palette:[accent,coat,hair],skin,accessory,hair:style}=c.visual;
    const headwear=style===0?`<path d="M59 83Q49 38 85 37Q125 34 116 88L103 59 84 70 66 60Z" fill="${hair}"/>`:style===1?`<path d="M56 105L54 65Q59 35 87 38Q121 33 120 68L124 111 109 106 106 57 82 69 65 64 65 105Z" fill="${hair}"/>`:style===2?`<path d="M55 74L48 51 67 56 72 36 86 48 105 36 105 52 124 54 116 84 103 60 79 65 66 58Z" fill="${hair}"/>`:`<path d="M54 77Q48 40 83 38Q120 35 120 74L106 56 96 68 89 55 66 63 64 86Z" fill="${hair}"/>`;
    let gear='';
    if(accessory==='mage')gear=`<path d="M135 189L142 75" stroke="${accent}" stroke-width="5"/><path d="M142 48L154 64 142 80 130 64Z" fill="${accent}"/><circle cx="142" cy="64" r="4" fill="#fff"/>`;
    else if(accessory==='fighter')gear=`<path d="M135 113L141 45 148 115 142 127Z" fill="#b8cad4"/><path d="M127 123H157M142 123V154" stroke="${accent}" stroke-width="5"/><path d="M40 122L62 139 57 170 40 183 23 170 18 139Z" fill="${coat}" stroke="${accent}" stroke-width="2"/>`;
    else if(accessory==='healer')gear=`<rect x="124" y="119" width="30" height="37" rx="5" fill="${accent}"/><path d="M139 126V148M130 137H148" stroke="#18222d" stroke-width="5"/>`;
    else if(accessory==='rogue')gear=`<circle cx="137" cy="132" r="16" fill="none" stroke="${accent}" stroke-width="3"/><path d="M126 145L114 166" stroke="${accent}" stroke-width="6"/>`;
    else if(accessory==='ranger')gear=`<path d="M140 66Q180 121 140 183L140 66" fill="none" stroke="${accent}" stroke-width="3"/><path d="M121 124H164M157 118L164 124 157 130" fill="none" stroke="#becdda" stroke-width="2"/>`;
    else if(accessory==='maker')gear=`<path d="M137 117L123 151M132 113L128 102 137 92 137 106 145 110 155 100 151 115 142 120" fill="none" stroke="${accent}" stroke-width="7"/>`;
    else if(accessory==='support')gear=`<path d="M135 96V142Q120 137 120 150Q131 162 141 149V107L155 103V135Q142 132 143 143Q151 153 161 141V92Z" fill="${accent}"/>`;
    else gear=`<path d="M133 109L153 117 149 155 128 148Z" fill="${accent}"/><path d="M138 121L146 123M136 129L145 131" stroke="#171d28" stroke-width="2"/>`;
    return `<svg viewBox="0 0 180 220" role="img" aria-label="${escape(c.job)}をイメージしたキャラクターのイラスト"><g opacity=".35" fill="none" stroke="${accent}" stroke-width=".6"><circle cx="90" cy="93" r="70"/><circle cx="90" cy="93" r="60"/><path d="M90 10V25M8 93H24M156 93H172"/></g><path d="M32 205L42 142Q47 123 71 117H101Q125 123 132 142L146 205Z" fill="${coat}"/><path d="M61 124L88 157 112 123 119 205H53Z" fill="#17212d"/><path d="M74 103V123L88 136 101 123V102" fill="${skin}"/><ellipse cx="87" cy="81" rx="29" ry="37" fill="${skin}"/>${headwear}<path d="M72 83H79M96 83H103" stroke="#34303a" stroke-width="2.5" stroke-linecap="round"/><path d="M83 101Q88 104 93 101" fill="none" stroke="#855e58" stroke-width="1.5"/><path d="M47 127L62 122 88 142 113 121 127 129 114 146 90 153 62 143Z" fill="${accent}"/><path d="M88 153V199" stroke="${accent}" stroke-width="1" opacity=".5"/><circle cx="88" cy="153" r="4" fill="${accent}"/>${gear}<g fill="${accent}" opacity=".8"><path d="M30 49L32 55 38 57 32 59 30 65 28 59 22 57 28 55Z"/><circle cx="147" cy="32" r="1.5"/></g></svg>`;
  }
  function radar(values){
    const max=Math.max(...values),point=(i,r)=>[90+Math.sin(i*Math.PI/3)*r,88-Math.cos(i*Math.PI/3)*r],poly=r=>values.map((_,i)=>point(i,r).join(',')).join(' ');
    return `<svg viewBox="0 0 180 178" class="radar" aria-hidden="true">${[20,40,60].map(r=>`<polygon points="${poly(r)}" class="radar-guide"/>`).join('')}${values.map((_,i)=>`<path d="M90 88L${point(i,60).join(' ')}" class="radar-guide"/>`).join('')}<polygon points="${values.map((n,i)=>point(i,n/max*60).join(',')).join(' ')}" class="radar-fill"/>${values.map((_,i)=>{const [x,y]=point(i,77);return `<text x="${x}" y="${y+3}">${STAT_KEYS[i]}</text>`;}).join('')}</svg>`;
  }
  function render(c){
    current=c;const values=STAT_KEYS.map(k=>c.stats[k]),max=Math.max(...values);
    $('character-card').style.setProperty('--accent',c.visual.palette[0]);
    $('character-card').innerHTML=`<div class="character-topline"><span>CHARACTER FILE / ${escape(c.id.toUpperCase())}</span><span>${escape(WORLDS[c.world].label)}</span></div><div class="identity"><div class="portrait">${portrait(c)}<span class="portrait-caption">ORIGINAL CHARACTER</span></div><div><p class="character-kicker">${escape(c.title)}</p><h3>${escape(c.name)}</h3><p class="character-role">${escape(c.job)}</p><div class="character-tags"><span>${escape(c.personality)}</span><span>${c.input.distribution==='role'?'職業らしい配分':'ランダム配分'}</span></div></div></div><div class="stats-block"><p class="section-caption">BASE ATTRIBUTES <b>TOTAL ${c.total}</b></p><div class="stats-layout"><dl class="stats-list">${values.map((n,i)=>`<div><div class="stat-head"><dt>${STAT_NAMES[i]}<small>${STAT_KEYS[i]}</small></dt><dd>${n}</dd></div><div class="stat-track" aria-hidden="true"><span style="width:${n/max*100}%"></span></div></div>`).join('')}</dl>${radar(values)}</div></div><div class="character-story"><h4>BACKGROUND / 物語のはじまり</h4><p>${escape(c.story)}</p><div class="skills">${c.skills.map(s=>`<div class="skill"><strong>${escape(s.name)}</strong><span>${escape(s.description)}</span></div>`).join('')}</div><h4>PERSONALITY / 強みと弱み</h4><p>得意なのは、${escape(c.strength)}。${escape(c.weakness)}<br>ただし、${escape(c.flaw)}。</p><blockquote class="character-quote">${escape(c.quote)}</blockquote></div><div class="character-foot"><span>SEED / ${escape(c.seed)}</span><span>FORGE v1.0 · CREATIVE GAME ASSET</span></div>`;
  }
  function textFor(c){return `${c.name} — ${c.title}\n世界観：${WORLDS[c.world].label}\n職業：${c.job}\n性格：${c.personality}\n\n${Object.entries(c.stats).map(([key,n],i)=>`${STAT_NAMES[i]} (${key}): ${n}`).join('\n')}\n合計：${c.total}\n\n【背景】\n${c.story}\n\n【スキル】\n${c.skills.map(s=>s.name+'：'+s.description).join('\n')}\n\n【強みと弱み】\n得意：${c.strength}\n${c.weakness}\n弱点：${c.flaw}\n\n${c.quote}\n\nシード：${c.seed}\nCHARACTER FORGE v1.0`;}
  function renderSaved(){
    $('saved-count').textContent=`${saved.length} / 20`;
    $('saved-characters').innerHTML=saved.length?saved.map((c,i)=>`<article class="saved-item"><button class="saved-open" data-open="${i}" aria-label="${escape(c.name)}の詳細を表示"><small>${escape(WORLDS[c.world].label)} / TOTAL ${c.total}</small><strong>${escape(c.name)}</strong><span>${escape(c.job)} · ${escape(c.personality)}</span></button><button class="saved-delete" data-delete="${i}" aria-label="${escape(c.name)}を保存リストから外す">×</button></article>`).join(''):'<p class="saved-empty">まだ、パーティーは空っぽ。気になるキャラを保存してみよう。</p>';
  }
  function persist(next){try{localStorage.setItem(STORAGE,JSON.stringify(next));saved=next;renderSaved();return true;}catch{$('action-status').textContent='ブラウザへの保存ができませんでした。JSONで出力して保存してください。';return false;}}
  function generateFromForm(){
    $('form-error').hidden=true;
    try{const input=readInput(),seed=$('seed').value.trim()||freshSeed();render(generate(input,seed));$('result-status').textContent='新しいキャラクターが生まれました';$('action-status').textContent='';return true;}catch(error){$('form-error').textContent=error.message;$('form-error').hidden=false;return false;}
  }
  function syncMode(){const total=document.querySelector('input[name=mode]:checked').value==='total';$('total-field').hidden=!total;$('values-field').hidden=total;$('total').disabled=!total;$('values').disabled=total;}
  function syncJobs(){$('job-options').innerHTML=WORLDS[$('world').value].jobs.map(j=>`<option>${j}</option>`).join('');}
  $('character-form').addEventListener('submit',event=>{event.preventDefault();if(generateFromForm()&&matchMedia('(max-width:760px)').matches)$('result-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});});
  document.querySelectorAll('input[name=mode]').forEach(r=>r.addEventListener('change',syncMode));
  $('world').addEventListener('change',syncJobs);
  $('random-input').addEventListener('click',()=>{
    const rng=randomSource(freshSeed()),world=choose(Object.keys(WORLDS),rng);$('world').value=world;syncJobs();
    $('job').value=choose(WORLDS[world].jobs,rng);$('personality').value=choose(['好奇心旺盛','冷静沈着','勇敢','臆病だけど優しい','陽気なお調子者','孤独な完璧主義者','無口で誠実','自由奔放'],rng);
    $('total').value=String(180+Math.floor(rng()*241));$('values').value=Array.from({length:6},()=>10+Math.floor(rng()*91)).join(', ');$('character-name').value='';$('seed').value='';$('form-error').hidden=true;$('action-status').textContent='入力をランダムに設定しました。「キャラクターを生成」で作成できます。';
  });
  $('save-character').addEventListener('click',()=>{
    if(saved.some(c=>c.id===current.id&&c.seed===current.seed)){$('action-status').textContent='このキャラクターは保存済みです。';return;}
    if(saved.length>=20){$('action-status').textContent='保存は20体までです。不要なカードを外してから保存してください。';return;}
    if(persist([current,...saved]))$('action-status').textContent=`${current.name}をこのブラウザに保存しました。`;
  });
  $('copy-character').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(textFor(current));$('action-status').textContent='キャラクター情報をコピーしました。';}catch{$('action-status').textContent='コピーできませんでした。JSONで出力して保存してください。';}
  });
  $('download-character').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({...current,statLabels:Object.fromEntries(STAT_KEYS.map((k,i)=>[k,STAT_NAMES[i]]))},null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`character-${current.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('action-status').textContent='キャラクターのJSONファイルを出力しました。';
  });
  $('saved-characters').addEventListener('click',event=>{
    const open=event.target.closest('[data-open]'),remove=event.target.closest('[data-delete]');
    if(open){const c=saved[Number(open.dataset.open)];render(c);const input=c.input;$('world').value=input.world;syncJobs();document.querySelector(`input[name=mode][value="${input.mode}"]`).checked=true;syncMode();$('total').value=input.total??300;$('values').value=input.values?.join(', ')||'80, 65, 55, 45, 35, 20';$('job').value=input.job;$('personality').value=input.personality;$('character-name').value=input.name;$('distribution').value=input.distribution;$('seed').value=c.seed;$('form-error').hidden=true;$('result-status').textContent='保存したキャラクターを表示中';$('action-status').textContent='入力条件も復元しました。シードを空欄にすると新しい結果を生成できます。';$('result-title').scrollIntoView({block:'start',behavior:'auto'});}
    if(remove){const index=Number(remove.dataset.delete),name=saved[index].name;if(persist(saved.filter((_,i)=>i!==index)))$('action-status').textContent=`${name}を保存リストから外しました。`;}
  });
  function validSaved(c){
    return c?.generatorVersion==='1.0'&&Object.hasOwn(WORLDS,c.world)&&c.input&&c.input.world===c.world&&['total','values'].includes(c.input.mode)&&['random','role'].includes(c.input.distribution)&&['job','personality','name'].every(k=>typeof c.input[k]==='string')&&(c.input.mode==='total'?Number.isInteger(c.input.total)&&c.input.total>=6&&c.input.total<=600:Array.isArray(c.input.values)&&c.input.values.length===6&&c.input.values.every(n=>Number.isInteger(n)&&n>=1&&n<=999))&&c.visual&&Array.isArray(c.visual.palette)&&c.visual.palette.length===3&&[...c.visual.palette,c.visual.skin].every(v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v))&&Array.isArray(c.skills)&&c.skills.length===2&&c.skills.every(s=>typeof s.name==='string'&&typeof s.description==='string')&&STAT_KEYS.every(k=>Number.isInteger(c.stats?.[k])&&c.stats[k]>=1&&c.stats[k]<=999)&&c.total===STAT_KEYS.reduce((sum,k)=>sum+c.stats[k],0)&&['id','seed','name','job','personality','title','story','strength','weakness','flaw','quote'].every(k=>typeof c[k]==='string');
  }
  try{const data=JSON.parse(localStorage.getItem(STORAGE)||'[]');if(Array.isArray(data))saved=data.filter(validSaved).slice(0,20);}catch{}
  syncMode();syncJobs();renderSaved();render(generate(readInput(),'first-adventure'));
})();
