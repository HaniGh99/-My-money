/* طبقة ربط: تُحاكي واجهة claude.* التي تستخدمها الصفحة، وتتصل بدوال Netlify والأسعار الحية */
(function () {
  function J(u, o) { return fetch(u, o).then(function (r) { if (!r.ok) { var e = new Error("http " + r.status); e.status = r.status; throw e; } return r.json(); }); }
  function local() { try { return JSON.parse(localStorage.getItem("mm_local_market") || "null"); } catch (e) { return null; } }
  
  // دالة لجلب أسعار الصرف الحية تلقائياً من الإنترنت
  async function fetchLiveRates() {
    try {
      var res = await fetch('https://open.er-api.com/v6/latest/USD');
      var data = await res.json();
      if (data && data.rates) {
        return data.rates;
      }
    } catch (e) {
      console.warn("تعذر جلب أسعار الصرف الحية، يتم الاعتماد على البيانات المحلية:", e);
    }
    return null;
  }

  var db = { doc: function (path) {
    var self = { get: async function () {
      if (path === "market/latest") {
        var d = {}; try { d = await J("/api/market"); } catch (e) {}
        var l = local(); if (l && (!d.ts || (l.ts && l.ts > d.ts))) d = Object.assign({}, d, l);
        
        // دمج الأسعار الحية المحدثة
        var liveRates = await fetchLiveRates();
        if (liveRates) {
          if (!d.usd) d.usd = {};
          d.usd.b = liveRates.SYP || d.usd.b || 1; 
          d.usd.s = d.usd.b;
          d.ts = new Date().toISOString();
        }

        return d && d.ts ? { exists: true, data: function () { return d; } } : { exists: false, data: function () { return null; } };
      }
      throw new Error("unsupported path"); },
      set: async function () { throw new Error("read-only"); },
      onSnapshot: function (cb, err) { var run = function () { self.get().then(cb, function (e) { if (err) err(e); }); }; run(); var t = setInterval(function () { if (!document.hidden) run(); }, 300000); return function () { clearInterval(t); }; } };
    return self; } };
  var user = { id: async function () { return null; } };
  var sample = async function (prompt, opt) {
    var r = await fetch("/api/advisor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: prompt }) });
    if (r.status === 429) { var e = new Error("limit"); e.code = "not_granted"; throw e; }
    if (!r.ok) throw new Error("http " + r.status);
    var d = await r.json(); if (opt && opt.onText) opt.onText({ text: d.text }); return d.text; };
  var downloads = { save: async function (o) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([o.data], { type: "text/csv;charset=utf-8" })); a.download = o.filename || "download.csv"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); } };
  window.claude = { use: async function (n) { return ({ db: db, user: user, sample: sample, downloads: downloads })[n] || null; } };
})();
