// Cambia esta versión en cada deploy (v3, v4, v5...)
const CACHE = "brigida365-v3";

// Archivos mínimos para que cargue offline.
// (Puedes añadir más si luego separas CSS/JS en ficheros.)
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => (key !== CACHE ? caches.delete(key) : null)));
    await self.clients.claim();
  })());
});

/**
 * Estrategia:
 * - Navegación (HTML): NETWORK FIRST (para que se actualice)
 * - Resto: STALE-WHILE-REVALIDATE (rápido + se refresca en segundo plano)
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo controlar mismo origen (tu github.io)
  if (url.origin !== self.location.origin) return;

  // 1) Para navegación (clicks, recargas): intenta red primero
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put("./index.html", fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match("./index.html");
        return cached || caches.match("./");
      }
    })());
    return;
  }

  // 2) Para el resto: cache primero pero revalidando
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);

    const fetchPromise = fetch(req)
      .then((fresh) => {
        // guarda solo respuestas OK (evita cachear errores)
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      })
      .catch(() => null);

    // Devuelve caché si existe, y actualiza en background
    return cached || (await fetchPromise) || cached;
  })());
});
