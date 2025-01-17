const cacheName = "d4rk_ltd-MinePixel-0.1.16";
const contentToCache = [
    "Build/0c8a27f901310870bb94836c33fdbdf3.loader.js",
    "Build/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
    "Build/8b60f8fca3489a151bc4daba32f214b8.data.unityweb",
    "Build/ae1b18ef78fc3b76b3a88b8e7c798bd1.wasm.unityweb",
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
