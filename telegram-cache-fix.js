// Telegram Mini Apps Cache Fix
// Этот скрипт решает проблемы с кэшированием в Telegram Mini Apps

(function() {
    'use strict';
    
    const VERSION = '0.2.27';
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
    
    // Улучшенная функция для очистки всех данных кэша
    window.clearAllCache = function() {
        console.log('Clearing all cache data...');
        
        // Очищаем localStorage (кроме критических данных)
        const keysToKeep = ['gameVersion', 'lastModified'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
                console.log('Removed localStorage key:', key);
            }
        });
        
        // Очищаем sessionStorage
        sessionStorage.clear();
        console.log('Cleared sessionStorage');
        
        // Очищаем кэши
        return forceCacheUpdate().then(() => {
            console.log('Cache clearing completed');
        });
    };
    
    // Функция для принудительного обновления без перезагрузки
    window.forceDataRefresh = function() {
        console.log('Forcing data refresh...');
        
        // Очищаем кэш
        clearAllCache();
        
        // Отправляем событие для Unity
        if (window.unityInstanceRef) {
            try {
                window.unityInstanceRef.SendMessage('SupabaseManager', 'ForceRefreshUserDataFromJS');
                console.log('Sent refresh message to Unity');
            } catch (e) {
                console.log('Failed to send message to Unity:', e);
            }
        }
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
    
    // Функция для периодической проверки данных
    window.startPeriodicDataCheck = function(interval = 30000) { // 30 секунд по умолчанию
        console.log('Starting periodic data check every', interval, 'ms');
        
        setInterval(() => {
            if (window.unityInstanceRef) {
                try {
                    window.unityInstanceRef.SendMessage('SupabaseManager', 'QuickDataCheckFromJS');
                    console.log('Periodic data check sent to Unity');
                } catch (e) {
                    console.log('Periodic data check failed:', e);
                }
            }
        }, interval);
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
            // При возвращении в приложение проверяем версию и данные
            setTimeout(() => {
                checkVersionAndUpdate();
                forceDataRefresh();
            }, 1000);
        });
        
        // Запускаем периодическую проверку данных
        startPeriodicDataCheck();
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
    
    // Обработчик для видимости страницы
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('Page became visible, refreshing data...');
            setTimeout(() => {
                forceDataRefresh();
            }, 500);
        }
    });
    
    // Экспортируем функции для использования в Unity
    window.TelegramCacheFix = {
        forceCacheUpdate: window.forceCacheUpdate,
        clearAllCache: window.clearAllCache,
        forceDataRefresh: window.forceDataRefresh,
        checkVersionAndUpdate: window.checkVersionAndUpdate,
        forceTelegramUpdate: window.forceTelegramUpdate,
        startPeriodicDataCheck: window.startPeriodicDataCheck,
        version: VERSION
    };
    
})(); 
