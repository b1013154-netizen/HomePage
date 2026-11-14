window.StairNotation=(()=>{
const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'],natural=[0,0,1,2,2,3,3,4,5,5,6,6],acc=[0,1,0,-1,0,0,1,0,-1,0,-1,0],suffix=['','', 'm','5','sus2','sus4','6','m7','maj7','7','add9','m9','dim','aug','maj9','13','7♭9','6/9'];
const note=m=>names[m%12]+(Math.floor(m/12)-1);
function model(s,score,idx){let beat=60/s.tempo,first=score.start??.55,ev=score.events.filter(e=>e.lane===idx&&e.amp>0),cs=[];for(let e of score.events.filter(e=>e.chord&&e.amp>0).sort((a,b)=>a.time-b.time)){let label=names[e.chord.root%12]+(e.chord.label??suffix[e.chord.q]);if(cs.at(-1)?.label!==label)cs.push({t:(e.time-first)/beat,label});}
return {ev:ev.map(e=>({...e,t:Math.max(0,(e.time-first)/beat),dur:e.len/beat})),cs,beat,bars:Math.max(1,Math.ceil(Math.max(s.n,...score.events.map(e=>(e.time+e.len-first)/beat)) /StairGroove.bar(s)))};}
function show(s,score,idx){const width=StairGroove.bar(s),{ev,cs,bars}=model(s,score,idx),bass=s.lanes[idx].role===2,drums=s.lanes[idx].role===3,base=bass?18:30;const part=document.getElementById('sheet-part'), range=document.getElementById('sheet-bars'), start=Number(range.value||0);
const label=l=>Ensemble.roles[l.role]+' ／ '+(l.role===3?'ドラム':Ensemble.voices[l.voice]);
part.replaceChildren(...s.lanes.map((l,i)=>new Option((i+1)+' · '+label(l),i)));part.value=idx;
range.replaceChildren(new Option('全小節',0),...Array.from({length:bars},(_,i)=>new Option('第'+(i+1)+'小節',i+1)));
range.value=start<=bars?start:0;
document.getElementById('sheet-title').textContent='パート '+(idx+1)+'　'+label(s.lanes[idx])+'　／　'+(Number(range.value)?'第'+range.value+'小節':'全'+bars+'小節');
let sections=[];for(let bar=0;bar<bars;bar++){if(Number(range.value)&&bar+1!==Number(range.value))continue;let mark=cs.filter(c=>c.t>=bar*width-.001&&c.t<(bar+1)*width-.001),notes=ev.filter(e=>e.t>=bar*width-.001&&e.t<(bar+1)*width-.001),parts=['<rect width="520" height="155" fill="#fffaf0"/>'];for(let y=55;y<=95;y+=10)parts.push('<path d="M33 '+y+'H505" stroke="#928e85"/>');parts.push('<path d="M504 55v40" stroke="#544d47"/><text x="8" y="83" font-size="24">'+(drums?'Ⅱ':bass?'𝄢':'𝄞')+'</text><text x="8" y="19" font-size="11">'+(bar+1)+'</text>');
if(!notes.length)parts.push('<text x="240" y="80">𝄻</text>');
for(let c of mark)parts.push('<text x="'+(38+(c.t-bar*width)*(448/width))+'" y="23" fill="#704d25" font-size="14">'+c.label+'</text>');
for(let e of notes){let x=40+(e.t-bar*width)*(448/width),m=e.m,pc=m%12,y=drums?85-(e.v-18)*10:95-5*((Math.floor(m/12)-1)*7+natural[pc]-base);y=Math.min(137,Math.max(32,y));for(let a=105;a<=y;a+=10)parts.push('<path d="M'+(x-6)+' '+a+'h12" stroke="#555"/>');for(let a=45;a>=y;a-=10)parts.push('<path d="M'+(x-6)+' '+a+'h12" stroke="#555"/>');parts.push('<ellipse cx="'+x+'" cy="'+y+'" rx="4.7" ry="3.5" fill="'+(e.dur>=1.65?'white':'#252332')+'" stroke="#252332"/>');let dir=y<70?-1:1,stem=x+dir*4;parts.push('<path d="M'+stem+' '+y+'v'+(-dir*23)+'" stroke="#252332"/>');if(e.dur<.72)parts.push('<path d="M'+stem+' '+(y-dir*23)+'q8 3 6 9" fill="none" stroke="#252332"/>');if(!drums&&acc[pc])parts.push('<text x="'+(x-12)+'" y="'+(y+3)+'" font-size="10">'+(acc[pc]>0?'♯':'♭')+'</text>');}
let held=cs.filter(c=>c.t<bar*width-.001).at(-1);
let harmony=[...(held&&(!mark.length||mark[0].t>bar*width+.025)?[held.label+'（継続）']:[]),...mark.map(c=>c.label)];
let fig=document.createElement('figure'),caption=document.createElement('figcaption');
let section=s.sections?.filter(x=>x.t<=(bar+.001)*width).at(-1)?.name||(s.chorus?(bar*width>=s.chorus?'サビ':'Aメロ'):'');
caption.textContent='第'+(bar+1)+'小節'+(section?' · '+section:'')+'　｜　'+(harmony.join(' → ')||'コード指定なし');
fig.append(caption);fig.insertAdjacentHTML('beforeend','<svg role="img" aria-label="'+(bar+1)+'小節" viewBox="0 0 520 155">'+parts.join('')+'</svg>');sections.push(fig);}
document.getElementById('sheet-view').replaceChildren(...sections);document.getElementById('chord-chart').textContent=Array.from({length:bars},(_,b)=>{let here=cs.filter(c=>Math.floor((c.t+.001)/width)===b);return (b+1)+'｜'+(here.length?here.map(c=>c.label).join(' → '):cs.filter(c=>c.t<b*width).at(-1)?.label||'—');}).join('　');
document.getElementById('pitch-list').textContent=ev.filter(e=>!Number(range.value)||Math.floor(e.t/width)+1===Number(range.value)).map(e=>(1+Math.floor(e.t/width))+'小節 '+(1+(e.t%width)).toFixed(2)+'拍：'+(e.v>=18?['キック','スネア','ハット'][e.v-18]:note(e.m))).join(' ／ ')||'休み';}
return {show,model};})();
