// Telegram Stars API Support
(function() {
    'use strict';

    // Глобальные переменные для Unity
    window.telegramStarsSupport = {
        isAvailable: false,
        balance: 0,
        callbacks: {}
    };

    // Проверка доступности Telegram Stars API
    function checkStarsAPIAvailability() {
        try {
            if (window.Telegram && window.Telegram.WebApp) {
                const webApp = window.Telegram.WebApp;
                
                // Проверяем наличие Stars API
                if (typeof webApp.sendStars === 'function') {
                    console.log('[Telegram Stars] API доступен');
                    window.telegramStarsSupport.isAvailable = true;
                    return true;
                } else {
                    console.log('[Telegram Stars] API недоступен (sendStars не найден)');
                    return false;
                }
            } else {
                console.log('[Telegram Stars] Telegram WebApp не найден');
                return false;
            }
        } catch (error) {
            console.error('[Telegram Stars] Ошибка проверки API:', error);
            return false;
        }
    }

    // Получение баланса звезд
    function getStarsBalance() {
        return new Promise((resolve, reject) => {
            try {
                if (!window.telegramStarsSupport.isAvailable) {
                    reject(new Error('Stars API недоступен'));
                    return;
                }

                const webApp = window.Telegram.WebApp;
                
                if (typeof webApp.getStarsBalance === 'function') {
                    webApp.getStarsBalance()
                        .then(balance => {
                            console.log('[Telegram Stars] Баланс:', balance);
                            window.telegramStarsSupport.balance = balance;
                            resolve(balance);
                        })
                        .catch(error => {
                            console.error('[Telegram Stars] Ошибка получения баланса:', error);
                            reject(error);
                        });
                } else {
                    console.log('[Telegram Stars] getStarsBalance API недоступен');
                    resolve(0); // Возвращаем 0 если API недоступен
                }
            } catch (error) {
                console.error('[Telegram Stars] Ошибка getStarsBalance:', error);
                reject(error);
            }
        });
    }

    // Отправка транзакции звезд
    function sendStarsTransaction(amount, productName) {
        return new Promise((resolve, reject) => {
            try {
                if (!window.telegramStarsSupport.isAvailable) {
                    reject(new Error('Stars API недоступен'));
                    return;
                }

                const webApp = window.Telegram.WebApp;
                
                console.log('[Telegram Stars] Отправка транзакции:', amount, 'звезд за', productName);
                
                webApp.sendStars({
                    amount: parseInt(amount),
                    product_name: productName
                })
                .then(result => {
                    console.log('[Telegram Stars] Результат транзакции:', result);
                    if (result && result.success) {
                        resolve(result);
                    } else {
                        reject(new Error('Транзакция не удалась'));
                    }
                })
                .catch(error => {
                    console.error('[Telegram Stars] Ошибка транзакции:', error);
                    reject(error);
                });
            } catch (error) {
                console.error('[Telegram Stars] Ошибка sendStarsTransaction:', error);
                reject(error);
            }
        });
    }

    // Симуляция для отладки в браузере
    function simulateStarsTransaction(amount, productName) {
        return new Promise((resolve) => {
            console.log('[Telegram Stars] Симуляция транзакции:', amount, 'звезд за', productName);
            
            // Имитируем задержку
            setTimeout(() => {
                const result = {
                    success: true,
                    transaction_id: 'sim_' + Date.now(),
                    amount: amount,
                    product_name: productName
                };
                
                console.log('[Telegram Stars] Симуляция завершена:', result);
                resolve(result);
            }, 1000);
        });
    }

    // Инициализация при загрузке страницы
    function initializeStarsSupport() {
        console.log('[Telegram Stars] Инициализация поддержки Stars API...');
        
        // Проверяем доступность API
        const isAvailable = checkStarsAPIAvailability();
        
        if (isAvailable) {
            // Получаем баланс
            getStarsBalance().catch(error => {
                console.warn('[Telegram Stars] Не удалось получить баланс:', error);
            });
        }
        
        // Добавляем функции в глобальный объект
        window.telegramStarsSupport.getBalance = getStarsBalance;
        window.telegramStarsSupport.sendTransaction = sendStarsTransaction;
        window.telegramStarsSupport.simulateTransaction = simulateStarsTransaction;
        
        console.log('[Telegram Stars] Поддержка инициализирована');
    }

    // Ожидание загрузки Telegram WebApp
    function waitForTelegramWebApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            initializeStarsSupport();
        } else {
            // Проверяем каждые 100мс
            setTimeout(waitForTelegramWebApp, 100);
        }
    }

    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForTelegramWebApp);
    } else {
        waitForTelegramWebApp();
    }

    // Экспортируем функции для Unity
    window.IsTelegramStarsAPIAvailable = function() {
        return window.telegramStarsSupport.isAvailable ? 1 : 0;
    };

    window.SendTelegramStarsTransaction = function(amount, productName) {
        const amountStr = UTF8ToString(amount);
        const nameStr = UTF8ToString(productName);
        
        console.log('[Telegram Stars] Unity запрос:', amountStr, 'звезд за', nameStr);
        
        // В браузере симулируем, в Telegram используем реальный API
        const isDebugMode = window.Telegram && window.Telegram.WebApp && 
                           window.Telegram.WebApp.platform === "unknown";
        
        const transactionPromise = isDebugMode ? 
            window.telegramStarsSupport.simulateTransaction(parseInt(amountStr), nameStr) :
            window.telegramStarsSupport.sendTransaction(parseInt(amountStr), nameStr);
        
        transactionPromise
            .then(result => {
                console.log('[Telegram Stars] Успешная транзакция:', result);
                // Вызываем Unity callback
                if (window.unityInstance) {
                    window.unityInstance.SendMessage('DynamiteStarsPurchaseManager', 'OnStarsPurchaseSuccess');
                }
            })
            .catch(error => {
                console.error('[Telegram Stars] Ошибка транзакции:', error);
                // Вызываем Unity callback с ошибкой
                if (window.unityInstance) {
                    window.unityInstance.SendMessage('DynamiteStarsPurchaseManager', 'OnStarsPurchaseError', error.toString());
                }
            });
    };

})();

// Telegram Stars support helper for invoice links
(function(){
  'use strict';

  // Ожидаем, что вы замените этот провайдер реальным запросом к вашему боту
  // Бот должен создать invoice link через Bot API createInvoiceLink и вернуть URL
  // См.: https://core.telegram.org/bots/api#createinvoicelink
  window.telegramStarsGetInvoiceLink = function(payload){
    // payload = { amount: number, productName: string }
    console.log('[Stars] Requesting invoice link for', payload);

    // ПРИМЕР: замените fetch URL на ваш endpoint бота
    // На сервере вы валидируете пользователя (initData), создаёте invoice через Bot API и отдаёте ссылку
    var apiUrl = (window.STARS_INVOICE_ENDPOINT || '/stars/create-invoice');

    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity: payload.amount,
        productName: payload.productName
      })
    })
    .then(function(r){
      if (!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    })
    .then(function(data){
      if (!data || !data.invoiceLink) throw new Error('No invoiceLink');
      console.log('[Stars] Received invoice link');
      return data.invoiceLink;
    });
  };
})();
