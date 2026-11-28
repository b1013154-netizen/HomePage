(() => {
 const box=document.querySelector('#recent-pages'),shown=new Set();
 function read(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
 function link(path,text){if(shown.has(path)||shown.size===6)return;shown.add(path);const a=document.createElement('a');a.href=path;a.textContent=text;box.append(a)}
 const city=read('asobiba.scaleTown.v1'),planet=read('playground.little-planet.v1'),songs=read('playground.chime-ateliers.1'),letter=read('playground.yesterday.v1');
 if(city&&Number.isFinite(city.pop))link('/scale-town','人口'+Math.round(city.pop).toLocaleString('ja-JP')+'人の商店街を開く');
 if(planet&&Number.isFinite(planet.age))link('/little-planet',planet.age.toLocaleString('ja-JP')+'年目の惑星を開く');
 if(Array.isArray(songs)&&songs[0])link('/music-stairs#latest','保存曲「'+(songs[0].title||'無題')+'」を開く');
 if(read('asobiba.doodle.lab.1'))link('/doodle-lab','保存した生物の実験室へ');
 if(letter&&Number.isFinite(letter.at))link('/future',Date.now()>=letter.at?'未来の封書を開ける':'封印した手紙を確認する');
 const rows=read('playground.recent.v1');if(Array.isArray(rows))for(const r of rows.slice(0,4)){
 if(!r||[...shown].some(s=>s.split('#')[0]===r.url))continue;
 const a=[...document.querySelectorAll('.portal-card')].find(a=>a.getAttribute('href')===r.url);
 if(a)link(r.url,a.querySelector('strong').textContent+' をもう一度開く')}
 document.querySelector('#returning').hidden=!shown.size;
 const day=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});const k=Math.floor(Date.parse(day)/86400000)%115;
 if(typeof QuickCatalog!=='undefined'){const q=k<5?['たい焼きは、どこから食べる？','集合の10分前に着いたら？','旅先で朝食をひとつ選ぶなら？','好きな場面に出会った本は？','映画のエンドロールが流れたら？'][k]:QuickCatalog.votes[k-5]?.[0];if(q)document.querySelector('.daily-choice').textContent='今日の一票　'+q+' ↗'}
})();
