const cacheName = `d4rk_ltd-MinePixel-v0.1.1`;
const contentToCache = [
    "Build/ab27b5aca0225add9b5861aa510b55c3.loader.js",
    "Build/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
    "Build/24c956302ee7fda9c1437c59f539febc.data.unityweb",
    "Build/53abba5fa264817db79adaa12f7bfc05.wasm.unityweb",
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
