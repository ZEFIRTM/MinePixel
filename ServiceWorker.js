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
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim(); // Гарантируем активацию нового Service Worker
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Перехватываем запрос:', event.request.url);

    // Для index.html и основных скриптов всегда загружаем свежую версию
    if (event.request.url.includes('index.html') || 
        event.request.url.includes('WebGL.framework.js') ||
        event.request.url.includes('WebGL.data') ||
        event.request.url.includes('WebGL.wasm')) {
        
        event.respondWith(
            fetch(event.request, { 
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            })
        );
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                return response;
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
