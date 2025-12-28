const CACHE = "brigida365-v2"; // 👈 cambia a v3, v4... cada vez que actualices
const ASSETS = ["./", "./index.html", "./manifest.json", "./sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // ✅ borra cachés antiguas
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (key !== CACHE ? caches.delete(key) : null)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
