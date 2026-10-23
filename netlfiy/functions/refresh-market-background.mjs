import { internalOk, refreshMarket } from "../lib/shared.mjs";
// دالة خلفية (حتى 15 دقيقة): تبحث بالذكاء الاصطناعي وتحدّث الأسعار والأخبار. تُستدعى من الخادم فقط.
export default async (req) => {
  if (!internalOk(req)) return new Response("unauthorized", { status: 401 });
  try { const d = await refreshMarket(); console.log("market updated", d.ts, d.notes); }
  catch (e) { console.error("refresh failed:", e.message); }
  return new Response("done", { status: 202 });
};
