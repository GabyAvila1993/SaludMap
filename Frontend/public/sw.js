// public/sw.js
const CACHE_NAME = "saludmap-cache-v1";

// Install básico
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando...");
  self.skipWaiting();
});

// Activar
self.addEventListener("activate", (event) => {
  console.log("[SW] Activado");
  self.clients.claim();
});

// Interceptar requests
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 🔹 Tiles de OpenStreetMap (network-first)
  if (url.includes("tile.openstreetmap.org")) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          // Guardar en cache
          return caches.open("osm-tiles").then((cache) => {
            cache.put(event.request, resp.clone());
            return resp;
          });
        })
        .catch((err) => {
          console.warn("[SW] Tiles offline, usando cache:", url);
          return caches.match(event.request);
        })
    );
    return;
  }

  // 🔹 API places (network-first con fallback a cache)
  if (url.includes("/places")) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          return caches.open("places-data").then((cache) => {
            cache.put(event.request, resp.clone());
            return resp;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 🔹 Default: cache-first para assets locales
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return (
        resp ||
        fetch(event.request).then((networkResp) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResp.clone());
            return networkResp;
          });
        })
      );
    })
  );
});
