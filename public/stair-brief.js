window.StairBrief = (() => {
  const scenes = [
    ['放課後、走り出す青春', 0, 1, /青春|放課後|爽快/],
    ['夏の夜のドライブ', 2, 7, /都会|ドライブ|シティ|ネオン/],
    ['雨の日の失恋バラード', 4, 2, /失恋|切な|雨/],
    ['ライブハウスの疾走感', 1, 11, /疾走|ライブハウス|熱血/],
    ['深夜のヒップホップ', 3, 7, /ヒップホップ|ラップ|lo-?fi/i],
    ['旅立ちのアコースティック', 9, 5, /旅立ち|アコースティック|フォーク/],
    ['星空を渡るオーケストラ', 12, 12, /星空|壮大|オーケストラ/],
    ['和風の冒険ゲーム', 11, 9, /和風|冒険|和楽器/],
    ['喫茶店のジャズ', 8, 13, /喫茶|ジャズ|カフェ/],
    ['ダンスフロアの電子音', 10, 6, /ダンス|エレクトロ|電子音/],
    ['夕暮れのソウル', 7, 0, /ソウル|r&b/i],
    ['力強いロックバラード', 5, 14, /ロックバラード/],
    ['陰影のあるオルタナロック', 6, 6, /オルタナ/]
  ];
  const keys = ['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  function create(preset, raw) {
    const E = Ensemble, text = raw.normalize('NFKC'), pick = list => list[Math.floor(Math.random()*list.length)];
    const scene = scenes[preset] || scenes.find(row => row[3].test(text)) || pick(scenes);
    const genreWords = [/J.?POP/i,/J.?Rock|Jロック/i,/シティ[ー]?ポップ|city pop/i,/ヒップホップ/i,/バラード/,/ロックバラード/,/オルタナ/,/ソウル|R&B/i,/ジャズ/,/フォーク/,/エレクトロ/,/和風/,/オーケストラ/];
    const matched = genreWords.map((r,i)=>r.test(text)?i:-1).filter(i=>i>=0).at(-1);
    const suggested = scenes.find(row=>row[3].test(text));
    const genre = matched ?? suggested?.[1] ?? scene[1], style = E.styles[genre];
    const tempo = text.match(/(?:BPM\s*(\d{2,3})|(\d{2,3})\s*BPM)/i);
    const s = E.fresh();
    s.genre = genre;
    s.tempo = Math.max(50,Math.min(180,tempo ? Number(tempo[1]||tempo[2]) : Math.round((/ゆっくり|遅め|スロー/.test(text)?72:/速め|速く|アップテンポ/.test(text)?148:style[1])+pick([-4,-2,0,2,4]))));
    s.minor = /短調|マイナー|切な|失恋/.test(text) || (!/長調|メジャー|明る/.test(text) && style[2]===1);
    s.mood = s.minor?1:0; s.key=pick(s.minor?[2,4,9]:[0,5,7]);
    const meter = StairGroove.meters.findIndex(m=>text.includes(m.join('/')));
    s.meter=Math.max(0,meter); s.n=StairGroove.bar(s)*pick([6,8]); s.title=scene[0];
    s.lanes=[]; for(let role=0;role<4;role++) E.lane(s,role);
    const instruments = [['エレキギター',6],['アコギ',1],['ギター',1],['ピアノ',0],['フルート',4],['三味線',14],['ハープ',11],['チェロ',12],['オルゴール',3]];
    const requested = instruments.find(([word])=>text.includes(word));
    if(requested)s.lanes[0].voice=requested[1];
    const theme = StairSinger.banks.findIndex(b=>text.includes(b[0]));
    const lyricTheme = theme>=0?theme:suggested?.[2]??scene[2];
    s.singing={on:!(/インスト|歌なし|歌声なし|ボーカルなし|歌詞なし/.test(text)), voice:0,theme:lyricTheme,text:StairSinger.generate(lyricTheme),reading:''};
    s.brief={preset,raw};return s;
  }
  function describe(s,score) {
    const parts=s.lanes.filter(l=>!l.mute&&l.vol).map(l=>Ensemble.roles[l.role]+'（'+(l.role===3?'ドラム':Ensemble.voices[l.voice])+'）');
    const chords=StairNotation.model(s,score,0).cs.map(c=>c.label);
    const scene=scenes[s.brief?.preset]?.[0];
    return [scene,s.brief?.raw,Ensemble.styles[s.genre][0]+'、'+s.tempo+' BPM、'+StairGroove.meters[s.meter||0].join('/')+'拍子、'+keys[StairGroove.key(s)]+(StairGroove.minor(s)?'マイナー':'メジャー')+'。',parts.join('、')+'で演奏。',StairPhrases.riff[s.riffStyle]?.name,s.singing?.on&&StairPhrases.vocal[s.singing.style]?.name,chords.length?'コード進行 '+chords.join(' → ')+'。':'',s.sections?'構成 '+s.sections.map(x=>x.name).join(' → ')+'。':s.chorus?'Aメロからサビへ展開。':'約'+Math.ceil(s.n/StairGroove.bar(s))+'小節のフレーズ。',s.singing?.on?'日本語ボーカル。歌の旋律は楽器のリードと分け、語尾を伸ばし、フレーズの間に息継ぎを入れる。':'インストゥルメンタル。'].filter(Boolean).join('\n');
  }
  return {scenes,create,describe};
})();
