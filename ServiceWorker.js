const cacheName = `d4rk_ltd-MinePixel-v0.1.1`;
const contentToCache = [
    "Build/3062e4bb6c71ccd52396c37d480cc9ee.loader.js",
    "Build/08e27d5d5174cf582e0167480cd86567.framework.js.unityweb",
    "Build/4eaa552aaef3ebfe435c8f7b7e1a6b03.data.unityweb",
    "Build/26b8cb375b8ab1436eec3ba00c9164b6.wasm.unityweb",
    "TemplateData/style.css"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    self.skipWaiting();

    e.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(contentToCache);
    })());
});

self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activate');
    e.waitUntil((async function () {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== currentCacheName) {
                    console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                    return caches.delete(cacheName);
                }
            })
        );
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        const response = await caches.match(e.request);
        if (response) {
            console.log(`[Service Worker] Returning cached resource: ${e.request.url}`);
            return response;
        }

        const networkResponse = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, networkResponse.clone());
        return networkResponse;
    })());
});
