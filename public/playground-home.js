(() => {
  const list = document.getElementById('recent-pages');
  try {
    const rows = JSON.parse(localStorage.getItem('playground.recent.v1') || '[]');
    for (const row of rows.slice(0, 4)) {
      const source = Array.from(document.querySelectorAll('.portal-card')).find(a => a.getAttribute('href') === row.url);
      if (!source) continue;
      const link = document.createElement('a'); link.href = row.url;
      let suffix = ' を開く →';
      const keys = {'/scale-town':'asobiba.scaleTown.v1','/little-planet':'playground.little-planet.v1','/doodle-lab':'asobiba.doodle.lab.1'};
      if (keys[row.url] && localStorage.getItem(keys[row.url])) suffix = ' の続きへ →';
      if (row.url === '/music-stairs') {
        const songs = JSON.parse(localStorage.getItem('playground.chime-ateliers.1') || '[]');
        if (Array.isArray(songs) && songs.length) { link.href = row.url + '#library'; suffix = ' の保存曲へ →'; }
      }
      link.textContent = source.querySelector('strong').textContent + suffix; list.append(link);
    }
    document.getElementById('returning').hidden = !list.children.length;
  } catch {}
})();
