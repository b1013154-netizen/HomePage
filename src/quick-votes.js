const limits = { vote: [115, 1], price: [123, 1000000], exhibit: [121, 125], color: [124, 125] };

export async function recordChoice(request, storage) {
  const sql = storage.sql;
  sql.exec('CREATE TABLE IF NOT EXISTS choices (game TEXT, question INTEGER, id TEXT, value INTEGER, PRIMARY KEY(game,question,id))');
  sql.exec('CREATE INDEX IF NOT EXISTS choices_values ON choices(game,question,value)');
  if (request.method === 'GET') {
    const polls=sql.exec("SELECT question, COUNT(*) AS n, SUM(CASE WHEN value=0 THEN 1 ELSE 0 END) AS leftVotes FROM choices WHERE game='vote' GROUP BY question").toArray();
    return Response.json({polls});
  }
  if (request.method !== 'POST') return new Response(null, {status:405});
  const raw = await request.text();
  let input;
  try { input = raw.length <= 512 && JSON.parse(raw); } catch {}
  const { game, question, value, id } = input || {};
  const range = Object.hasOwn(limits, game) && limits[game];
  if (!range || !Number.isInteger(question) || question < 0 || question >= range[0] ||
      !Number.isInteger(value) || value < 0 || value > range[1] || !/^[a-f0-9-]{36}$/.test(id))
    return new Response(null, {status:400});
  return storage.transactionSync(() => {
    sql.exec('INSERT INTO choices VALUES (?,?,?,?) ON CONFLICT(game,question,id) DO UPDATE SET value=excluded.value', game, question, id, value);
    const args=[game,question];
    const {n}=sql.exec('SELECT COUNT(*) AS n FROM choices WHERE game=? AND question=?',...args).one();
    if (game==='price') {
      const middle=sql.exec('SELECT value FROM choices WHERE game=? AND question=? ORDER BY value LIMIT ? OFFSET ?',...args,n%2?1:2,Math.floor((n-1)/2)).toArray();
      return Response.json({n,median:middle.reduce((s,r)=>s+r.value,0)/middle.length});
    }
    const counts=Array(range[1]+1).fill(0);
    for(const row of sql.exec('SELECT value,COUNT(*) AS n FROM choices WHERE game=? AND question=? GROUP BY value',...args)) counts[row.value]=row.n;
    return Response.json({n,counts});
  });
}
