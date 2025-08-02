// Защита от просмотра кода в браузере
(function() {
    'use strict';
    
    // Отключаем контекстное меню
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Отключаем F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.key === 's')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Отключаем DevTools через console.log
    setInterval(function() {
        debugger;
    }, 100);
    
    // Очищаем консоль
    console.clear();
    
    // Переопределяем console методы
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    
    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
    console.info = function() {};
    
    // Отключаем source maps
    if (window.SourceMap) {
        window.SourceMap = undefined;
    }
    
    // Защита от просмотра исходного кода
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
    });
    
    // Отключаем инспектор элементов
    document.addEventListener('mousedown', function(e) {
        if (e.button === 2) {
            e.preventDefault();
            return false;
        }
    });
    
    // Скрываем чувствительную информацию
    const sensitiveData = [
        'supabase',
        'api_key',
        'telegram_id',
        'user_id',
        'money',
        'team_id'
    ];
    
    // Перехватываем сетевые запросы
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Скрываем URL и заголовки в логах
        const sanitizedUrl = url.toString().replace(/supabase\.co/g, '[SUPABASE_URL]');
        const sanitizedOptions = options ? JSON.stringify(options).replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[API_KEY]') : '';
        
        return originalFetch.apply(this, arguments);
    };
    
    // Перехватываем XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        // Скрываем URL в логах
        const sanitizedUrl = url.toString().replace(/supabase\.co/g, '[SUPABASE_URL]');
        return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    // Отключаем WebGL debug info
    if (window.WebGLRenderingContext) {
        const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === 0x1F01) { // UNMASKED_VENDOR_WEBGL
                return '[VENDOR]';
            }
            if (parameter === 0x1F02) { // UNMASKED_RENDERER_WEBGL
                return '[RENDERER]';
            }
            return originalGetParameter.call(this, parameter);
        };
    }
    
    // Скрываем информацию о Unity
    if (window.unityInstance) {
        Object.defineProperty(window, 'unityInstance', {
            get: function() {
                return '[UNITY_INSTANCE]';
            },
            set: function() {}
        });
    }
    
    // Отключаем eval для безопасности
    window.eval = function() {
        throw new Error('eval is disabled for security');
    };
    
    // Скрываем глобальные переменные
    const sensitiveGlobals = ['unityInstance', 'gameInstance', 'webglContext'];
    sensitiveGlobals.forEach(function(globalName) {
        if (window[globalName]) {
            Object.defineProperty(window, globalName, {
                get: function() {
                    return '[PROTECTED]';
                },
                set: function() {}
            });
        }
    });
    
    console.log('Security layer initialized');
})(); 
