const cacheName = 'MinePixel-Cache-v0.1.43';

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install - Version 0.1.43');
    self.skipWaiting(); // Принудительно активируем новый Service Worker
    
    // Очищаем все старые кеши при установке
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((oldCacheName) => {
                    if (oldCacheName !== cacheName) {
                        console.log('[Service Worker] Deleting old cache:', oldCacheName);
                        return caches.delete(oldCacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (e) {
    // Для файлов билда всегда получаем свежую версию
    if (e.request.url.includes('Build/') || e.request.url.includes('0.1.43')) {
        e.respondWith(
            fetch(e.request, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }).catch(error => {
                console.error('Fetch error:', error);
                throw error;
            })
        );
    } else {
        // Для остальных файлов используем кэш с fallback
        e.respondWith(
            caches.match(e.request).then((response) => {
                return response || fetch(e.request);
            })
        );
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Принимаем контроль над всеми клиентами сразу
        clients.claim().then(() => {
            // Уведомляем все клиенты о новой версии
            return clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'NEW_VERSION',
                        version: '0.1.43'
                    });
                });
            });
        })
    );
});
