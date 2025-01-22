const cacheName = "d4rk_ltd-MinePixel-0.1.26";

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    self.skipWaiting(); // Принудительно активируем новый Service Worker
    
    // Очищаем все кеши при установке
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function (e) {
    // Всегда получаем свежую версию контента
    e.respondWith(
        fetch(e.request, {
            cache: 'no-store'
        }).catch(error => {
            console.error('Fetch error:', error);
            throw error;
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Принимаем контроль над всеми клиентами сразу
        clients.claim()
    );
});
