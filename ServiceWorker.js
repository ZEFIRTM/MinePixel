const cacheName = "d4rk_ltd-MinePixel-0.1.3";
const contentToCache = [
    "Build/ab27b5aca0225add9b5861aa510b55c3.loader.js",
    "Build/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
    "Build/6dbadf8a13163ecf7fcdde5dea056366.data.unityweb",
    "Build/53abba5fa264817db79adaa12f7bfc05.wasm.unityweb",
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
