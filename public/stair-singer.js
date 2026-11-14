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
const vowels=[[810,1250,2650],[300,2250,3000],[350,1150,2400],[510,1850,2690],[480,870,2400],[250,1000,1800]];
function parse(text){const out=[];for(let c of text.normalize('NFKC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96))){if(c==='ー'&&out.length){out.push({...out.at(-1),c:'あいうえおん'[out.at(-1).v],cons:''});continue;}let v=groups.findIndex(s=>s.includes(c));if(c==='ん'||c==='っ')v=5;if(v<0)continue;if('ゃゅょぁぃぅぇぉ'.includes(c)&&out.length){out.at(-1).v=v;out.at(-1).c+=c;continue;}let cons=/[かきくけこがぎぐげご]/.test(c)?'k':/[さしすせそざじずぜぞ]/.test(c)?'s':/[たちつてとだぢづでど]/.test(c)?'t':/[はひふへほ]/.test(c)?'h':/[ばびぶべぼぱぴぷぺぽ]/.test(c)?'p':/[まみむめもなにぬねのん]/.test(c)?'n':/[らりるれろ]/.test(c)?'r':'';out.push({c,v,cons});}return out;}
function phrase(score,s){if(s.vocalParts&&s.singing?.on){let beat=60/s.tempo,first=score.start??.55;return s.vocalParts.flatMap((seg,i)=>{let last=i===s.vocalParts.length-1,events=score.events.filter(e=>e.time>=first+seg.t*beat-.035&&(last||e.time<first+seg.end*beat-.035));return phrase({...score,events},{...s,vocalParts:null,singing:seg.settings});});}let text=s.singing?.reading?.trim()||s.singing?.text||'',tokens=parse(text);if(!s.singing?.on||!tokens.length)return [];
const audible=score.events.filter(e=>e.v<18&&e.amp>0);
let lead=[0,1,2,3].flatMap(role=>s.lanes.map((l,i)=>l.role===role?i:-1)).find(i=>i>=0&&audible.some(e=>e.lane===i));
if(lead===undefined)return [];
const unique=new Map();for(let e of score.events){if(e.lane===lead&&e.v<18&&e.amp>0){let k=e.step??e.time,prev=unique.get(k);if(!prev||e.m>prev.m)unique.set(k,e);}}
const notes=[...unique.values()].sort((a,b)=>a.time-b.time);if(!notes.length)return [];
// Allocate lyrics to onsets. More mora than notes share pitches; shorter texts sustain the final vowel.
const out=[];notes.forEach((e,i)=>{let start=Math.floor(i*tokens.length/notes.length),stop=Math.floor((i+1)*tokens.length/notes.length),duration=Math.min((notes[i+1]?.time??(e.time+e.len+.12))-e.time,Math.max(.15,e.len*1.55)),count=Math.max(1,stop-start);
for(let j=0;j<count;j++){const m=tokens[Math.min(tokens.length-1,start+j)];const sustained=i>0&&start===Math.floor((i-1)*tokens.length/notes.length)&&j===0;out.push({...m,c:sustained?'あいうえおん'[m.v]:m.c,cons:i>0&&start===Math.floor((i-1)*tokens.length/notes.length)&&j===0?'':m.cons,time:e.time+j*duration/count,len:duration/count,m:e.m,amp:e.amp});}});return out;}
return {banks,generate,parse,phrase};})();
