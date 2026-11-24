// Garde l'appli dans le téléphone pour l'ouvrir sans connexion, et sert les photos / PDF rangés sur l'appareil.
const CACHE = "canards-v1";
const FILES = ["./", "index.html", "local.js", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "pdf-lib.min.js", "fontkit.umd.min.js", "ica-gras.pdf", "ica-maigre.pdf", "comicneue.ttf"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

function blobFromDb(id) {
  return new Promise((res, rej) => {
    const r = indexedDB.open("registre-canards-gras", 1);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains("docs")) d.createObjectStore("docs"); if (!d.objectStoreNames.contains("blobs")) d.createObjectStore("blobs"); };
    r.onerror = () => rej(r.error);
    r.onsuccess = () => { const q = r.result.transaction("blobs").objectStore("blobs").get(id); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); };
  });
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const m = url.origin === location.origin && url.pathname.match(/\/_blob\/([0-9a-f]+)$/);
  if (m) {
    e.respondWith(blobFromDb(m[1]).then(b => b ? new Response(b.data, { headers: { "Content-Type": b.type } }) : new Response("Fichier introuvable sur cet appareil", { status: 404 })));
    return;
  }
  if (e.request.method !== "GET") return;
  // Fichiers de l'appli : d'abord le cache (marche sans réseau), mise à jour en arrière-plan quand le réseau répond.
  // Polices Google : gardées en cache après la première ouverture avec connexion.
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || (e.request.mode === "navigate" ? c.match("index.html") : new Response("", { status: 504 }));
  }));
});
