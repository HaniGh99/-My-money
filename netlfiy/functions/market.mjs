import { json, store } from "../lib/shared.mjs";
// قراءة آخر بيانات السوق (عامة للقراءة فقط)
export default async () => {
  const d = await (await store()).get("market", { type: "json" });
  return json(d || {}, 200, { "cache-control": "public, max-age=60" });
};
export const config = { path: "/api/market" };
