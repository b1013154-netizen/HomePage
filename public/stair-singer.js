// Japanese lyric phrases, deliberately in kana so display and pronunciation agree.
window.StairSinger=(()=>{
const banks=[
['恋愛','きみのこえ|ふたりのかげ|あかいかさ|つないだて','こいがめぶく|こころがはずむ|めとめがあう|そっとよりそう','きみにとどけ|となりにいて|いまつたえよう|てをつなごう'],
['青春','ほうかごのそら|あせのしずく|なつのコート|まぶしいきみ','かぜがわらう|チャイムがなる|くつひもむすぶ|ゆめがはしる','あすへはしれ|ここからだよ|いまをうたおう|もっととおく'],
['失恋','からのグラス|あめのホーム|にじむてがみ|さめたコーヒー','なまえがきえる|あさがしみる|なみだがおちる|きせつがめぐる','さよならしよう|ひとりでゆこう|きみをわすれない|あしたははれる'],
['人間賛歌','しわのあるて|ちいさなゆうき|だれかのえがお|きずだらけのくつ','ひとがささえる|いのちがつづく|こえがかさなる|ひかりがともる','ともにいきよう|きみをたたえよう|てをのばそう|ここにいるよ'],
['友情','いつものみち|かしたノート|ならんだくつ|ひみつのばしょ','かたをたたく|わらいがはじける|けんかもしたね|こころがほどける','またあそぼう|ずっとなかまだ|となりをあるこう|きみにありがとう'],
['旅立ち','あさのきっぷ|しろいかばん|みなとのふね|さいごのベル','ちずをひらく|まどがうごく|ふるさとがゆれる|かぜがよんでる','いまをこえよう|まだみぬまちへ|ふりむかずゆこう|ここからはじまる'],
['夢・挑戦','やぶれたちず|ゆびのまめ|ちいさなたね|しさくのやま','もういちどたつ|あせがひかる|ドアがひらく|ねがいがのびる','ゆめをつかもう|あきらめないよ|あといっぽだけ|たかくとべ'],
['夜の都会','ネオンのあめ|さいしゅうでんしゃ|ビルのすきま|あおいシグナル','くるまがながれる|ラジオがゆれる|よるがほどける|ガラスがひかる','よあけをまとう|まちをおよごう|このままおどろう|あかりをおって'],
['自然','つゆのくさ|きぎのこえ|かわのほとり|もりのこみち','ことりがうたう|みずがはしる|ひざしがおどる|つぼみがひらく','そらをみよう|かぜになろう|いきをすいこもう|はなをさかそう'],
['冒険','ふるいらしんばん|きりのしま|さばくのほし|みちのとびら','ほのおがゆれる|なぞがほどける|なみがさわぐ|かぎがおちる','たからをさがせ|うみをわたれ|つぎのとびらへ|いざすすもう'],
['郷愁','さびたぶらんこ|そぼのにわ|むぎのにおい|ゆうげのけむり','むかしがかおる|しゃしんがゆれる|なまえをよばれる|あかりがともる','またかえろう|わすれないよ|あのひのままで|ただいまといおう'],
['応援','ふるえるゆび|スタートライン|さいごのいちびょう|やけたグラウンド','こえがひびく|こぶしをにぎる|せなかをおす|ひとみがもえる','だいじょうぶだよ|きみならできる|まえをむいて|いっしょにゆこう'],
['幻想','ぎんのつばさ|るりのいずみ|つきのしずく|ほしのとびら','まほうがめざめる|じかんがとまる|つばさがひらく|よるがささやく','そらをこえよう|ほしをつなごう|まほうをかけて|ゆめのむこうへ'],
['日常','やけたトースト|ねぐせのあさ|あおいマグ|まどべのねこ','おゆがわいてる|すずめがはねる|とけいがうたう|おなかがなるよ','きょうもよろしく|おちゃにしよう|のんびりいこう|おはようせかい'],
['再生・希望','あめのあと|ひびわれたつち|ひがしのまど|ちいさなわかば','こおりがとける|あさひがのぼる|いぶきがもどる|にじがかかる','またはじめよう|ひかりのほうへ|たねをまこう|はるをむかえて']
];
const pick=a=>a[Math.floor(Math.random()*a.length)],intro=['ほら','いま','そっと','いつか','きっと','ふいに',''],end=['もういちど','どこまでも','ゆっくりと','あしたへ','このうたで',''];
function generate(i){let b=banks[i]||banks[0],word=k=>pick(b[k].split('|'));let lines=[word(1),word(2),word(3)],forms=[[pick(intro)+' '+lines[0],lines[1],lines[2]],[lines[0],pick(intro)+' '+lines[1],lines[2]+' '+pick(end)],[lines[1],lines[0],pick(intro)+' '+lines[2]]];return pick(forms).map(s=>s.trim()).join('\n');}
const groups=['あかさたなはまやらわがざだばぱぁゃ','いきしちにひみりゐぎじぢびぴぃ','うくすつぬふむゆるぐずづぶぷゔぅゅ','えけせてねへめれゑげぜでべぺぇ','おこそとのほもよろをごぞどぼぽぉょ'];
function parse(text){const out=[];for(let c of text.normalize('NFKC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96))){if(c==='ー'&&out.length){out.push({...out.at(-1),c:'あいうえおん'[out.at(-1).v],cons:''});continue;}let v=groups.findIndex(s=>s.includes(c));if(c==='ん'||c==='っ')v=5;if(v<0)continue;if('ゃゅょぁぃぅぇぉ'.includes(c)&&out.length){out.at(-1).v=v;out.at(-1).c+=c;continue;}let cons=/[かきくけこがぎぐげご]/.test(c)?'k':/[さしすせそざじずぜぞ]/.test(c)?'s':/[たちつてとだぢづでど]/.test(c)?'t':/[はひふへほ]/.test(c)?'h':/[ばびぶべぼぱぴぷぺぽ]/.test(c)?'p':/[まみむめもなにぬねのん]/.test(c)?'n':/[らりるれろ]/.test(c)?'r':'';out.push({c,v,cons});}return out;}
// Lay out a lyric line before assigning pitches. Instrumental subdivisions can
// move the pitch of a held vowel without starting the syllable again.
function lyricLines(text) {
  return text.split(/[\n、。！？!?，,；;]+/u).map(line => {
    const mora = parse(line), units = [];
    for (const token of mora) {
      const last = units.at(-1);
      if (last && 'あいうえお'.includes(token.c) && last.v === token.v && token.c !== 'っ' && last.c !== 'っ') {
        last.weight += .82;
      } else {
        units.push({...token,weight:token.c==='っ'?.58:token.c==='ん'?.82:1});
      }
    }
    return units;
  }).filter(line => line.length);
}
function phrase(score,s,limit=Infinity) {
  if (!s.singing?.on) return [];
  if (s.vocalParts) {
    const beat=60/s.tempo, first=score.start??.55;
    return s.vocalParts.flatMap(seg=>{
      const end=first+seg.end*beat;
      const events=score.events.filter(e=>e.time>=first+seg.t*beat-.035&&e.time<end-.035);
      return phrase({...score,events},{...s,vocalParts:null,singing:seg.settings},end);
    });
  }
  const lines=lyricLines(s.singing.reading?.trim()||s.singing.text||'');
  if (!lines.length) return [];
  const audible=score.events.filter(e=>e.v<18&&e.amp>0);
  const lead=[0,1,2,3].flatMap(role=>s.lanes.map((l,i)=>l.role===role?i:-1))
    .find(i=>i>=0&&audible.some(e=>e.lane===i));
  if (lead===undefined) return [];
  const unique=new Map();
  for (const e of audible.filter(e=>e.lane===lead)) {
    const key=e.step??e.time, prev=unique.get(key);
    if (!prev||e.m>prev.m) unique.set(key,e);
  }
  const notes=[...unique.values()].sort((a,b)=>a.time-b.time);
  const first=notes[0].time, last=notes.at(-1), end=Math.min(limit,last.time+last.len,score.end);
  const weights=lines.map(line=>line.reduce((sum,u)=>sum+u.weight,0)+.65);
  const total=weights.reduce((a,b)=>a+b,0), out=[];
  let elapsed=0,note=0;
  lines.forEach((line,lineIndex)=>{
    const grid=first+(end-first)*elapsed/total;
    elapsed+=weights[lineIndex];
    const bound=first+(end-first)*elapsed/total;
    const nextNote=notes.find(e=>e.time>=grid-.001);
    let t=nextNote && nextNote.time-grid<Math.min(.19,(bound-grid)*.12)?nextNote.time:grid;
    const space=bound-t;
    const breath=lineIndex<lines.length-1?Math.min(.20,space*.11):0;
    const weight=weights[lineIndex]-.65;
    const unit=Math.min(.43, (space-breath)/(weight+.28));
    let ideal=t,anchor=0;
    line.forEach((u,i)=>{
      const position=(i+.5)/line.length;
      ideal+=unit*(u.weight+(i===line.length-1?.28:0));
      // Gently align internal syllables to nearby melody onsets while keeping
      // the duration of the whole lyric line and its consonants intact.
      while(anchor+1<notes.length&&Math.abs(notes[anchor+1].time-ideal)<Math.abs(notes[anchor].time-ideal))anchor++;
      const offset=notes[anchor].time-ideal;
      const adjust=i<line.length-1&&Math.abs(offset)<unit*.24?offset*.65:0;
      const len=ideal+adjust-t;
      while(note+1<notes.length&&notes[note+1].time<=t+.001)note++;
      const pitch=[{at:0,m:notes[note].m}];
      for(let j=note+1;j<notes.length&&notes[j].time<t+len;j++){
        pitch.push({at:notes[j].time-t,m:notes[j].m});
      }
      out.push({...u,time:t,len,m:pitch[0].m,pitch,amp:notes[note].amp,
        expression:.88+.12*Math.sin(Math.PI*position),join:i>0&&line[i-1].c!=='っ'&&u.c!=='っ',voice:s.singing.voice});
      t+=len;
    });
  });
  return out;
}
return {banks,generate,parse,phrase};})();
