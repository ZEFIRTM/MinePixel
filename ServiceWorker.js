const cacheName = `game-cache-v${Date.now()}`; // Уникальное имя кэша для каждой версии
const contentToCache = [
    "./", // index.html
    "./Build/WebGL.framework.js",
    "./Build/WebGL.data.unityweb",
    "./Build/WebGL.wasm.unityweb",
    "./Build/WebGL.loader.js",
    "./TemplateData/style.css"
];

// Установка Service Worker
self.addEventListener('install', function (e) {
    console.log('[Service Worker] Устанавливаем новую версию...');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[Service Worker] Кэшируем ресурсы:', contentToCache);
            return cache.addAll(contentToCache);
        })
    );
});

// Активация Service Worker
self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Активация новой версии...');
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.map(function (key) {
                    if (key !== cacheName) {
                        console.log('[Service Worker] Удаляем старый кэш:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Гарантируем активацию нового Service Worker
});

// Обработка запросов
self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Перехватываем запрос:', e.request.url);

    // Для index.html и основных скриптов всегда загружаем свежую версию
    if (e.request.mode === 'navigate' || 
        e.request.url.includes('index.html') ||
        e.request.url.includes('index.js') ||
        e.request.url.includes('WebGL.framework.js')) {
        return e.respondWith(
            fetch(e.request, {
                cache: 'no-store'
            })
        );
    }

    // Для остальных ресурсов пытаемся загрузить из кэша
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});

// Принудительное обновление при обновлении Service Worker
self.addEventListener('message', function (event) {
    if (event.data === 'SKIP_WAITING') {
        console.log('[Service Worker] Принудительная активация новой версии');
        self.skipWaiting();
    }
});
