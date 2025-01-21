const cacheName = "d4rk_ltd-MinePixel-0.1.19";
const contentToCache = [
    "Build/2f23d236c53c89a67de904edede8f038.loader.js",
    "Build/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
    "Build/b7c884a6807f2abca849ec6dae239844.data.unityweb",
    "Build/6855db44b718b9a28b71daa841c4e016.wasm.unityweb",
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
