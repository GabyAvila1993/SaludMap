// public/sw.js
const CACHE_NAME = "saludmap-cache-v1";

// Install básico
self.addEventListener("install", () => {
  console.log("[SW] Instalando...");
  self.skipWaiting();
});

// Activar
self.addEventListener("activate", () => {
  console.log("[SW] Activado");
  self.clients.claim();
});

// Interceptar requests
self.addEventListener("fetch", (_event) => {
  const url = _event.request.url;

  // 🔹 Tiles de OpenStreetMap (network-first)
  if (url.includes("tile.openstreetmap.org")) {
    _event.respondWith(
      fetch(_event.request)
        .then((resp) => {
          // Guardar en cache
          return caches.open("osm-tiles").then((cache) => {
            cache.put(_event.request, resp.clone());
            return resp;
          });
        })
        .catch(() => {
          console.warn("[SW] Tiles offline, usando cache:", url);
          return caches.match(_event.request);
        })
    );
    return;
  }

  // 🔹 API places (network-first con fallback a cache)
  if (url.includes("/places")) {
    _event.respondWith(
      fetch(_event.request)
        .then((resp) => {
          return caches.open("places-data").then((cache) => {
            cache.put(_event.request, resp.clone());
            return resp;
          });
        })
        .catch(() => caches.match(_event.request))
    );
    return;
  }

  // 🔹 Default: cache-first para assets locales
  _event.respondWith(
    caches.match(_event.request).then((resp) => {
      return (
        resp ||
        fetch(_event.request).then((networkResp) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(_event.request, networkResp.clone());
            return networkResp;
          });
        })
      );
    })
  );
});
