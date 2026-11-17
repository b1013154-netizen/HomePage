import { DurableObject } from "cloudflare:workers";

const origins = new Set([
  "https://homepage.b1013154.workers.dev",
  "https://asobiba-lab-bsa.pages.dev",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/visits") return env.ASSETS.fetch(request);
    const origin = request.headers.get("Origin");
    const headers = { "Cache-Control": "no-store", "Vary": "Origin" };
    if (origin && !origins.has(origin)) return new Response("Forbidden", { status: 403, headers });
    if (origin) headers["Access-Control-Allow-Origin"] = origin;
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { ...headers,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }});
    }
    if (!["GET", "POST"].includes(request.method)) {
      return new Response("Method not allowed", { status: 405, headers });
    }
    try {
      const counter = env.VISITS.get(env.VISITS.idFromName("playground-total"));
      const response = await counter.fetch(request);
      return new Response(response.body, { status: response.status,
        headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
    } catch {
      return Response.json({ error: "unavailable" }, { status: 503, headers });
    }
  },
};

export class VisitCounter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS counter (id INTEGER PRIMARY KEY, total INTEGER NOT NULL)");
    this.sql.exec("INSERT OR IGNORE INTO counter VALUES (1, 0)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, created INTEGER NOT NULL)");
  }

  async fetch(request) {
    if (request.method === "POST") {
      if (Number(request.headers.get("Content-Length")) > 256) return new Response(null, { status: 413 });
      const { id } = await request.json();
      if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 400 });
      this.ctx.storage.transactionSync(() => {
        this.sql.exec("DELETE FROM requests WHERE created < ?", Date.now() - 86400000);
        const seen = this.sql.exec("SELECT id FROM requests WHERE id = ?", id).toArray();
        if (!seen.length) {
          this.sql.exec("INSERT INTO requests VALUES (?, ?)", id, Date.now());
          this.sql.exec("UPDATE counter SET total = total + 1 WHERE id = 1");
        }
      });
    }
    const { total } = this.sql.exec("SELECT total FROM counter WHERE id = 1").one();
    return Response.json({ total });
  }
}
