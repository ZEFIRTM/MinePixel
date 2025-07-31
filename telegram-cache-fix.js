// Telegram Mini Apps Cache Fix
// Этот скрипт решает проблемы с кэшированием в Telegram Mini Apps

(function() {
    'use strict';
    
    const VERSION = '{{{ PRODUCT_VERSION }}}';
    const CACHE_PREFIX = 'MinePixel-Cache';
    
    // Функция для принудительной очистки всех кэшей
    window.forceCacheUpdate = function() {
        if ('caches' in window) {
            return caches.keys().then(function(cacheNames) {
                const promises = cacheNames.map(function(cacheName) {
                    if (cacheName.includes(CACHE_PREFIX)) {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                });
                return Promise.all(promises);
            });
        }
        return Promise.resolve();
    };
    
    // Функция для проверки и обновления версии
    window.checkVersionAndUpdate = function() {
        const currentVersion = VERSION;
        const storedVersion = localStorage.getItem('gameVersion');
        
        if (storedVersion !== currentVersion) {
            console.log('New version detected:', currentVersion, 'Previous:', storedVersion);
            localStorage.setItem('gameVersion', currentVersion);
            
            // Очищаем кэш и перезагружаем страницу
            forceCacheUpdate().then(() => {
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            });
            
            return true;
        }
        
        return false;
    };
    
    // Функция для принудительного обновления Telegram Mini App
    window.forceTelegramUpdate = function() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            // Пытаемся обновить Telegram Mini App
            try {
                Telegram.WebApp.close();
                setTimeout(() => {
                    window.location.reload(true);
                }, 500);
            } catch (e) {
                console.log('Telegram WebApp close failed, using regular reload');
                window.location.reload(true);
            }
        } else {
            window.location.reload(true);
        }
    };
    
    // Функция для очистки всех данных кэша
    window.clearAllCache = function() {
        // Очищаем localStorage
        const keysToKeep = ['gameVersion', 'lastModified'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        // Очищаем sessionStorage
        sessionStorage.clear();
        
        // Очищаем кэши
        return forceCacheUpdate();
    };
    
    // Автоматическая проверка при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Telegram Cache Fix loaded, version:', VERSION);
        
        // Проверяем версию
        if (!checkVersionAndUpdate()) {
            console.log('Version is up to date');
        }
        
        // Добавляем обработчик для принудительного обновления
        window.addEventListener('focus', function() {
            // При возвращении в приложение проверяем версию
            setTimeout(() => {
                checkVersionAndUpdate();
            }, 1000);
        });
    });
    
    // Обработчик для Service Worker сообщений
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'NEW_VERSION') {
                console.log('New version notification from Service Worker:', event.data.version);
                checkVersionAndUpdate();
            }
        });
    }
    
    // Экспортируем функции для использования в Unity
    window.TelegramCacheFix = {
        forceCacheUpdate: window.forceCacheUpdate,
        checkVersionAndUpdate: window.checkVersionAndUpdate,
        forceTelegramUpdate: window.forceTelegramUpdate,
        clearAllCache: window.clearAllCache,
        version: VERSION
    };
    
})(); 