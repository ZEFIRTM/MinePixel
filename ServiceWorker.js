const cacheName = "d4rk_ltd-MinePixel-0.1.1";
const contentToCache = [
    "Build/5ccf0e822b904d60666260a7c57c7b10.loader.js",
    "Build/08e27d5d5174cf582e0167480cd86567.framework.js.unityweb",
    "Build/33e442238a39c78ead11fbffbe8c4671.data.unityweb",
    "Build/7d459bc2081b7c8ca4c6ed1963059877.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
