const CACHE = "fieldshift-fs-v1";
const ASSETS = ["/", "/app.css", "/app.js", "/manifest.webmanifest", "/manus-routes.json", "/../shared/decision-engine.mjs", "/../shared/device-contract.mjs", "/../shared/simulator.mjs"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(path => path.startsWith("/../") ? path.replace("/../", "/") : path))).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match("/"))));
});
