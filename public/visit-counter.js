"use strict";
(async () => {
  const output = document.getElementById("visit-total");
  const endpoint = "https://homepage.b1013154.workers.dev/api/visits";
  const id = crypto.randomUUID();
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), cache: "no-store", signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("unavailable");
      const { total } = await response.json();
      if (!Number.isSafeInteger(total) || total < 0) throw new Error("invalid count");
      output.textContent = total.toLocaleString("ja-JP") + " 回";
      return;
    } catch {
      if (!attempt) await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  output.textContent = "ただいま集計できません";
})();
