const cacheName = "d4rk_ltd-MinePixel-0.1.18";
const contentToCache = [
    "Build/de57e39f890eee0469a5180ecbc77a57.loader.js",
    "Build/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
    "Build/48a0a56af00067e770b9960e4807c2c8.data.unityweb",
    "Build/e2b508f0b0df8872f606a75a51c5018a.wasm.unityweb",
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
