// Version hors ligne du registre des canards gras.
// Remplace le stockage partagé de claude.ai par un stockage sur l'appareil (IndexedDB) :
// les lots, mouvements, fiches ICA, photos et PDF restent dans ce navigateur, même sans connexion.
window.HORS_LIGNE = true;
(function () {
  const DB_NAME = "registre-canards-gras", V = 1;
  let dbp = null;
  const idb = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, V);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains("docs")) d.createObjectStore("docs"); if (!d.objectStoreNames.contains("blobs")) d.createObjectStore("blobs"); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (store, mode, fn) => { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction(store, mode), s = t.objectStore(store); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };
  const newId = () => { const a = "abcdefghijklmnopqrstuvwxyz0123456789"; let s = ""; const r = crypto.getRandomValues(new Uint8Array(20)); for (const x of r) s += a[x % 36]; return s; };

  // Collections gardées en mémoire, rechargées depuis IndexedDB au démarrage.
  const cols = {}, subs = {};
  let loaded = null;
  const load = () => loaded || (loaded = (async () => {
    const all = await tx("docs", "readonly", s => { const out = []; const c = s.openCursor(); c.onsuccess = () => { const k = c.result; if (k) { out.push([k.key, k.value]); k.continue(); } }; return out; });
    for (const [k, v] of all) { const i = k.indexOf("/"); const c = k.slice(0, i), id = k.slice(i + 1); (cols[c] || (cols[c] = {}))[id] = v; }
  })());
  const emit = c => { const m = cols[c] || {}; const snap = { docs: Object.entries(m).map(([id, d]) => ({ id, data: () => JSON.parse(JSON.stringify(d)) })), metadata: { fromCache: false } }; (subs[c] || []).forEach(cb => { try { cb(snap); } catch (e) { console.error(e); } }); };
  const db = {
    collection(c) {
      return {
        onSnapshot(cb) { (subs[c] || (subs[c] = [])).push(cb); load().then(() => emit(c)); return () => { subs[c] = subs[c].filter(x => x !== cb); }; },
        doc(id) {
          id = id ? String(id) : newId();
          return {
            id,
            async get() { await load(); const d = cols[c]?.[id]; return { id, exists: !!d, data: () => d && JSON.parse(JSON.stringify(d)) }; },
            async set(data) { await load(); const v = JSON.parse(JSON.stringify(data)); await tx("docs", "readwrite", s => s.put(v, c + "/" + id)); (cols[c] || (cols[c] = {}))[id] = v; emit(c); },
            async update(data) { await load(); const v = Object.assign({}, cols[c]?.[id] || {}, JSON.parse(JSON.stringify(data))); await tx("docs", "readwrite", s => s.put(v, c + "/" + id)); (cols[c] || (cols[c] = {}))[id] = v; emit(c); },
            async delete() { await load(); await tx("docs", "readwrite", s => s.delete(c + "/" + id)); if (cols[c]) delete cols[c][id]; emit(c); },
          };
        },
      };
    },
  };
  // Photos et PDF : rangés sur l'appareil, servis à l'adresse _blob/<id> par le service worker.
  const assets = {
    async upload(blob, opts = {}) {
      const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, "0")).join("");
      const buf = await blob.arrayBuffer();
      await tx("blobs", "readwrite", s => s.put({ type: opts.type || blob.type || "application/octet-stream", data: buf }, id));
      return { id, url: "_blob/" + id };
    },
  };
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: /\.pdf$/i.test(filename) ? "application/pdf" : /\.csv$/i.test(filename) ? "text/csv" : /\.json$/i.test(filename) ? "application/json" : "application/octet-stream" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000);
    },
  };
  const user = { id: async () => "appareil", can: async () => true, profiles: async () => ({}) };
  window.claude = { use: async n => ({ db, assets, downloads, user })[n] || null };

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(e => console.warn("Service worker", e));
})();
