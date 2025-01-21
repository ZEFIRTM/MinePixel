//#if USE_DATA_CACHING
// const cacheName = "d4rk_ltd-MinePixel-0.1.21";
// const contentToCache = [
//     "Build/2f23d236c53c89a67de904edede8f038.loader.js",
//     "Build/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
//#if USE_THREADS
//     "Build/",
//#endif
//     "Build/2be24f842076c69ee157ec39a92695fe.data.unityweb",
//     "Build/6855db44b718b9a28b71daa841c4e016.wasm.unityweb",
//     "TemplateData/style.css"
// ];
//#endif

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
//#if USE_DATA_CACHING
    e.waitUntil((async function () {
      // const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      // await cache.addAll(contentToCache);
    })());
//#endif
});

//#if USE_DATA_CACHING
self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      // const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      // cache.put(e.request, response.clone());
      return response;
    })());
});
//#endif
