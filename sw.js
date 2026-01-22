const CACHE_NAME = "2km-mins-30-final-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.json"
];

// Install: cache everything
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, network fallback
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(res => {
          if (e.request.method === "GET" && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
