import { internalSecret } from "../lib/shared.mjs";
// تحديث مجدول كل 6 ساعات (توقيت UTC). يُنفَّذ على نسخة الإنتاج فقط.
export default async () => {
  if (!internalSecret()) return;
  const origin = process.env.URL || process.env.DEPLOY_PRIME_URL;
  await fetch(origin + "/.netlify/functions/refresh-market-background", { method: "POST", headers: { "x-internal": internalSecret() } });
};
export const config = { schedule: "0 */6 * * *" };
