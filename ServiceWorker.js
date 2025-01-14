const CACHE_NAME = 'game-cache-v' + Date.now();
const CRITICAL_FILES = [
    'index.html',
    'WebGL.framework.js',
    'WebGL.data',
    'WebGL.wasm'
];

const contentToCache = [
    "./", // index.html
    "./Build/WebGL.framework.js",
    "./Build/WebGL.data.unityweb",
    "./Build/WebGL.wasm.unityweb",
    "./Build/WebGL.loader.js",
    "./TemplateData/style.css"
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(keys => Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            ))
        ])
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Перехватываем запрос:', event.request.url);

    const isCriticalFile = CRITICAL_FILES.some(file => 
        event.request.url.includes(file)
    );

    if (isCriticalFile) {
        event.respondWith(
            fetch(event.request, {
                cache: 'no-store',
                headers: new Headers({
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                })
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => 
            caches.match(event.request)
        )
    );
});

// Принудительное обновление при обновлении Service Worker
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
