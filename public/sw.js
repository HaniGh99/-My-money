const C="mm-web-v1",A=["/","/index.html","/shim.js","/manifest.webmanifest","/icon-192.png","/icon-512.png","/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// شبكة أولًا (لتصل التحديثات تلقائيًا) ثم الذاكرة عند انقطاع الاتصال؛ ولا تُخزَّن طلبات /api
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method!=="GET"||u.pathname.startsWith("/api/")||u.pathname.startsWith("/.netlify/"))return;
 e.respondWith(fetch(r).then(res=>{if(res.ok&&u.origin===location.origin){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(x=>x||caches.match("/index.html"))))});
