(() => {
  const path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '').replace(/^\/index$/, '') || '/';
  const pages = [
    { url: '/', title: 'ホームページの遊び場', sub: 'すべての遊び場への入り口', icon: '⌂' },
    {"url": "/last-vote", "title": "最後の一票は、あなたです", "sub": "115の二択に投票。自分の投票箱も作れる", "icon": "✉"},
    {"url": "/my-measures", "title": "私の「すぐ行く」は何分後？", "sub": "自分の言葉のものさしを作る", "icon": "◷"},
    {"url": "/no-price", "title": "値札のない雑貨店", "sub": "不思議な品物に値段をつける", "icon": "￥"},
    {"url": "/holiday-council", "title": "存在しない祝日の制定会議", "sub": "自分だけの休日を制定する", "icon": "☀"},
    {"url": "/seen-it", "title": "見たつもり選手権", "sub": "今日の喫茶店を5秒で覚える", "icon": "☕"},
    {"url": "/take-one", "title": "一個だけ持って帰れる展", "sub": "思い出の展示からひとつ選ぶ", "icon": "◇"},
    {"url": "/same-blue", "title": "同じ青を見つけた人", "sub": "情景を色で答え合わせする", "icon": "▦"},
    { url: '/scale-town', title: '縮尺が壊れた商店街', sub: '道路と店舗を配置して街を育てる', icon: '▤' },
    { url: '/future-museum', title: '現代のものを未来で展示すると', sub: '日用品を埋めて未来の3D博物館へ', icon: '◇' },
    { url: '/doodle-lab', title: '落書き生物の進化実験', sub: '描いた命と遊び、進化を観察', icon: '✎' },
    { url: '/little-planet', title: '一滴から育つ、小さな惑星', sub: '環境を変えて生命と文明を育てる', icon: '◉' },
    { url: '/invention', title: 'へんてこ発明工房', sub: '部品をつないでからくり実験', icon: '⚙' },
    { url: '/character', title: 'CHARACTER FORGE', sub: 'ゲーム用キャラメーカー', icon: '⚄' },
    { url: '/music-stairs', title: '音階階段で音楽を作る', sub: 'ボールが奏でる小さな工房', icon: '♫' },
    { url: '/draw-card', title: 'お絵描きカードバトル', sub: '描いた絵をカードにして対戦', icon: '✎' },
    { url: '/battle', title: 'CHRONICLE ARENA', sub: 'キャラ対戦・魔王討伐と後日談', icon: '⚔' },
    { url: '/hoshizora', title: 'HOSHIZORA', sub: '世界の88星座をめぐる図鑑', icon: '✧' },
    { url: '/planetarium', title: '全天プラネタリウム', sub: 'HOSHIZORA · 118,216個の星を探検', icon: '◌' }
  ];
  if (path !== '/' && pages.some(p => p.url === path)) {
    try {
      const previous = JSON.parse(localStorage.getItem('playground.recent.v1') || '[]');
      const rows = Array.isArray(previous) ? previous.filter(p => p.url !== path && pages.some(page => page.url === p.url)) : [];
      localStorage.setItem('playground.recent.v1', JSON.stringify([{url:path, at:Date.now()}, ...rows].slice(0, 6)));
    } catch {}
  }
  const button = document.createElement('button');
  button.className = 'pg-menu-button';
  button.type = 'button';
  button.setAttribute('aria-label', '遊び場のメニューを開く');
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'pg-drawer');
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span aria-hidden="true">☰</span><span>遊び場メニュー</span>';
  const drawer = document.createElement('dialog');
  drawer.id = 'pg-drawer';
  drawer.className = 'pg-drawer';
  drawer.setAttribute('aria-labelledby', 'pg-drawer-title');
  drawer.innerHTML = `<div class="pg-drawer-top"><span>PLAYGROUND / MENU</span><button type="button" class="pg-close" aria-label="メニューを閉じる">×</button></div><h2 id="pg-drawer-title">ホームページの<br>遊び場</h2><p class="pg-drawer-intro">今日は、どこで遊ぼう。</p><nav class="pg-links" aria-label="遊び場のページ">${pages.map(page => `<a href="${page.url}" ${path === page.url ? 'aria-current="page"' : ''}><span class="pg-link-icon" aria-hidden="true">${page.icon}</span><span><strong>${page.title}</strong><small>${page.sub}</small></span><span aria-hidden="true">${path === page.url ? '●' : '↗'}</span></a>`).join('')}</nav><p class="pg-drawer-bottom">小さな好奇心から、ひろがる世界。</p>`;
  document.body.append(button, drawer);
  button.addEventListener('click', () => {
    drawer.showModal();
    button.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('pg-menu-open');
  });
  const close = () => drawer.close();
  drawer.querySelector('.pg-close').addEventListener('click', close);
  drawer.addEventListener('click', event => {
    const r = drawer.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  drawer.addEventListener('close', () => {
    button.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('pg-menu-open');
    button.focus({ preventScroll: true });
  });
  // Preserve links shared before HOSHIZORA moved to its own page.
  if (path === '/' && ['#explore', '#guide', '#about'].includes(location.hash)) {
    location.replace('/hoshizora' + location.hash);
  }
})();
