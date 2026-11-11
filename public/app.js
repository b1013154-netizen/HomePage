const regionNames = {north:'北天',equator:'天の赤道付近',south:'南天'};
const seasonalLabels = {spring:'春',summer:'夏',autumn:'秋',winter:'冬'};
// Preserve the longer guides for the original twelve entries, while taking all
// names, diagrams, abbreviations and reference dates from the complete catalog.
const constellations = constellationCatalog.map(entry => {
  const featured = featuredConstellations.find(c => c.latin === entry.latin);
  return {...entry, find:featured?.find, story:featured?.story};
});
const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const dialog = document.querySelector('#detail');
const region = document.querySelector('#region');
const sort = document.querySelector('#sort');
let activeSeason = 'all';
const normalize = value => value.normalize('NFKC').toLowerCase()
  .replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0)-0x60))
  .replace(/\s+/g,' ').trim();
const summaries = {all:'世界の88星座へ、星空の旅に出よう。',spring:'春の夜風に、星をたどろう。',summer:'夏の夜に、天の川を想おう。',autumn:'秋の夜長に、星をつなごう。',winter:'冬の澄んだ空に、星を見つけよう。'};

function diagram(c) {
  return `<svg class="constellation" viewBox="0 0 290 200" role="img" aria-label="${c.name}の星座線・配置図">${c.lines.map(line => `<polyline points="${line.map(i => c.points[i].join(',')).join(' ')}"/>`).join('')}${c.points.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.4"/>`).join('')}</svg>`;
}

function render() {
  const query = normalize(search.value);
  const list = constellations.filter(c =>
    (activeSeason === 'all' || c.season === activeSeason) &&
    (region.value === 'all' || c.region === region.value) &&
    (!query || normalize(`${c.name} ${c.meaning} ${c.latin} ${c.abbr}`).includes(query))
  );
  if (sort.value === 'latin') list.sort((a,b) => a.latin.localeCompare(b.latin,'en'));
  if (sort.value === 'area') list.sort((a,b) => b.area-a.area);
  cards.innerHTML = list.map(c => `<button class="card" data-id="${c.id}" aria-label="${c.name}の詳細を見る"><div class="card-art">${diagram(c)}<span class="art-caption">${c.abbr.toUpperCase()} · ${regionNames[c.region]}</span></div><div class="card-body"><div class="card-top"><h3>${c.name}</h3><span class="pill">${c.abbr}</span></div><p class="latin">${c.latin.toUpperCase()}</p><p class="description">${c.description}</p><div class="card-bottom"><span>${seasonalLabels[c.season]}の空 · ${regionNames[c.region]}</span><span>星座を知る ↗</span></div></div></button>`).join('');
  document.querySelector('#empty').hidden = list.length > 0;
  document.querySelector('#result-count').textContent = `${list.length} / 88 星座`;
  document.querySelectorAll('[data-season]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.season === activeSeason)));
  document.querySelector('#season-summary').textContent = summaries[activeSeason];
}

document.querySelectorAll('[data-season]').forEach(b => b.addEventListener('click', () => {activeSeason=b.dataset.season;render();}));
search.addEventListener('input',render);
region.addEventListener('change',render);
sort.addEventListener('change',render);
document.querySelector('#reset').addEventListener('click', () => {
  activeSeason='all';search.value='';region.value='all';sort.value='japanese';render();
});

cards.addEventListener('click', event => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  const c = constellations.find(c => c.id === button.dataset.id);
  const find = c.find || `${c.name}の星の並びは上の配置図で確認できます。位置の目安は${c.transit}。これは東京で20時ごろに星座のおよその中心が子午線を通過する時期です。${c.region === 'south' ? '南天には、日本からは一部または全体を見ることができない星座もあります。観察地に対応した星図で確認してください。' : '実際の観察には、日付・時刻・観察地に対応した星図を併用しましょう。'}`;
  document.querySelector('#detail-content').innerHTML = `<p class="eyebrow gold">THE 88 CONSTELLATIONS</p><div class="detail-art">${diagram(c)}</div><h2 id="detail-title">${c.name}</h2><p class="latin">${c.latin.toUpperCase()} · ${c.abbr}</p><p class="detail-meta">${regionNames[c.region]} · ${seasonalLabels[c.season]}の空</p><p>${c.description}</p><dl class="facts"><div><dt>正式な略符</dt><dd>${c.abbr}</dd></div><div><dt>面積</dt><dd>${c.area.toLocaleString('ja-JP',{minimumFractionDigits:3})} 平方度</dd></div><div><dt>学名の属格</dt><dd>${c.genitive}</dd></div><div><dt>20時の位置の目安</dt><dd>${c.transit}</dd></div></dl><h3>探すときのヒント</h3><p>${find}</p>${c.story ? `<h3>星座の物語</h3><p>${c.story}</p>` : ''}${c.abbr === 'Ser' ? '<p class="detail-note">へび座は頭部と尾部の2領域に分かれていますが、公式には1つの星座です。位置の目安：頭部は7月中旬、尾部は8月中旬。</p>' : ''}<p class="detail-note">位置の目安は国立天文台の一覧に基づきます。南天の星座も同じ時期の区分に含めていますが、日本から見えることを保証するものではありません。配置図は星の座標を投影して個別に拡大したものです。星座線の結び方は一例で、星の明るさと実際の空の方位は再現していません。</p><a class="detail-source" href="https://www.nao.ac.jp/new-info/constellation.html" target="_blank" rel="noopener noreferrer">国立天文台の公式一覧を見る ↗</a>`;
  dialog.setAttribute('aria-labelledby','detail-title');
  dialog.showModal();
  dialog.scrollTop=0;
});
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();
});
document.addEventListener('keydown', event => {
  if(event.key==='/' && !dialog.open && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault();search.focus();search.scrollIntoView({block:'center'});
  }
});
render();
