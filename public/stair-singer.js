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
function parse(text){const out=[];for(let c of text.normalize('NFKC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96))){if(c==='ー'&&out.length){out.push({...out.at(-1),c:'ー',cons:''});continue;}let v=groups.findIndex(s=>s.includes(c));if(c==='ん'||c==='っ')v=5;if(v<0)continue;if('ゃゅょぁぃぅぇぉ'.includes(c)&&out.length){out.at(-1).v=v;out.at(-1).c+=c;continue;}let cons=/[かきくけこがぎぐげご]/.test(c)?'k':/[さしすせそざじずぜぞ]/.test(c)?'s':/[たちつてとだぢづでど]/.test(c)?'t':/[はひふへほ]/.test(c)?'h':/[ばびぶべぼぱぴぷぺぽ]/.test(c)?'p':/[まみむめもなにぬねのん]/.test(c)?'n':/[らりるれろ]/.test(c)?'r':'';out.push({c,v,cons});}return out;}
function phrase(score,s){if(s.vocalParts&&s.singing?.on){let beat=60/s.tempo,first=score.start??.55;return s.vocalParts.flatMap((seg,i)=>{let last=i===s.vocalParts.length-1,events=score.events.filter(e=>e.time>=first+seg.t*beat-.035&&(last||e.time<first+seg.end*beat-.035));return phrase({...score,events},{...s,vocalParts:null,singing:seg.settings});});}let text=s.singing?.reading?.trim()||s.singing?.text||'',tokens=parse(text);if(!s.singing?.on||!tokens.length)return [];
let lead=s.lanes.findIndex(l=>!l.mute&&l.role===0);if(lead<0)lead=s.lanes.findIndex(l=>!l.mute&&l.role!==3);if(lead<0)return [];
const unique=new Map();for(let e of score.events){if(e.lane===lead&&e.v<18&&e.amp>0){let k=e.step??e.time,prev=unique.get(k);if(!prev||e.m>prev.m)unique.set(k,e);}}
const notes=[...unique.values()].sort((a,b)=>a.time-b.time);if(!notes.length)return [];
// Allocate lyrics to onsets. More mora than notes share pitches; shorter texts sustain the final vowel.
const out=[];notes.forEach((e,i)=>{let start=Math.floor(i*tokens.length/notes.length),stop=Math.floor((i+1)*tokens.length/notes.length),duration=Math.min((notes[i+1]?.time??(e.time+e.len+.12))-e.time,Math.max(.15,e.len*1.55)),count=Math.max(1,stop-start);
for(let j=0;j<count;j++){const m=tokens[Math.min(tokens.length-1,start+j)];out.push({...m,cons:i>0&&start===Math.floor((i-1)*tokens.length/notes.length)&&j===0?'':m.cons,time:e.time+j*duration/count,len:duration/count,m:e.m,amp:e.amp});}});return out;}
function mix(data,syll,voice){const R=44100;let seed=98631;for(let q of syll){if(q.c==='っ')continue;let off=Math.round(q.time*R),n=Math.min(Math.round(q.len*R),data.length-off),freq=440*2**((q.m-69)/12);while(freq>520)freq/=2;while(freq<130)freq*=2;let f=freq*(voice===1?.5:1),res=vowels[q.v].map(v=>v*(voice===1?.89:voice===2?1.07:1)),wave=new Float32Array(512);
for(let h=1;h<=Math.min(48,Math.floor(7000/f));h++){let hz=f*h,g=.45/h+res.reduce((v,r,k)=>v+[1,.65,.33][k]*Math.exp(-((hz-r)**2)/(2*[110,150,220][k]**2)),0)/Math.sqrt(h);if(g>.006)for(let k=0;k<512;k++)wave[k]+=g*Math.sin(k*h*2*Math.PI/512);}
let ph=0,peak=Math.max(.2,...wave.map(Math.abs)),on=q.cons?Math.min(n*.24,1600):0;for(let k=0;k<n;k++){let t=k/R;ph+=f*512/R*(1+.004*Math.sin(34*t)*Math.min(1,t*5));seed=(Math.imul(seed,1664525)+1013904223)>>>0;let noise=seed/2147483648-1,a=on?Math.min(1,k/on):1,z=wave[ph&511]/peak;if(a<1){if('skthp'.includes(q.cons))z=z*a+noise*(1-a)*(q.cons==='s'?.7:.36);else z=z*(.3+.7*a)+Math.sin(ph*.01227)*(1-a)*.4;}data[off+k]+=z*Math.min(.65,.25+q.amp)*Math.min(1,k/200,(n-k)/480)*(voice===2?.83:1);}}let peak=1;for(let v of data)peak=Math.max(peak,Math.abs(v));if(peak>1)for(let k=0;k<data.length;k++)data[k]*=.96/peak;}
return {banks,generate,parse,phrase,mix};})();
