const CACHE = "brigida365-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((res) => res || fetch(event.request)));
});
