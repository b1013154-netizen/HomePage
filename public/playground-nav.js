(() => {
  const path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '').replace(/^\/index$/, '') || '/';
  const pages = [
    { url: '/', title: 'ホームページの遊び場', sub: 'すべての遊び場への入り口', icon: '⌂' },
    { url: '/character', title: 'CHARACTER FORGE', sub: 'ゲーム用キャラメーカー', icon: '⚄' },
    { url: '/draw-card', title: 'お絵描きカードバトル', sub: '描いた絵をカードにして対戦', icon: '✎' },
    { url: '/battle', title: 'CHRONICLE ARENA', sub: 'キャラ対戦・魔王討伐と後日談', icon: '⚔' },
    { url: '/hoshizora', title: 'HOSHIZORA', sub: '世界の88星座をめぐる図鑑', icon: '✧' },
    { url: '/planetarium', title: '全天プラネタリウム', sub: 'HOSHIZORA · 118,216個の星を探検', icon: '◌' }
  ];
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
