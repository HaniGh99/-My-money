import { json, internalSecret, store, bump } from "../lib/shared.mjs";
// طلب تحديث فوري بلا رمز: يفصل بين الطلبات 10 دقائق ويحدّ عددها يوميًا (REFRESH_DAILY_LIMIT، الافتراضي 8)
export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!internalSecret()) return json({ error: "ai not configured" }, 503);
  const st = await store(), last = (await st.get("lastRefreshReq", { type: "json" })) || 0;
  if (Date.now() - last < 600000) return json({ error: "too soon", retryAfter: Math.ceil((600000 - (Date.now() - last)) / 1000) }, 429);
  if (!(await bump("ref:" + new Date().toISOString().slice(0, 10), +process.env.REFRESH_DAILY_LIMIT || 8))) return json({ error: "daily limit" }, 429);
  await st.setJSON("lastRefreshReq", Date.now());
  await fetch(new URL(req.url).origin + "/.netlify/functions/refresh-market-background", { method: "POST", headers: { "x-internal": internalSecret() } });
  return json({ started: true }, 202);
};
export const config = { path: "/api/refresh" };
