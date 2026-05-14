// Регистрируем Service Worker с версией
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('ServiceWorker.js?v=0.3.15')
        .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
}

var unityInstanceRef;
var unsubscribe;
var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var warningBanner = document.querySelector("#unity-warning");

function attachTelegramParamsToUrl() {
  try {
    const tg = window.Telegram ? window.Telegram.WebApp : null;
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        console.log('[Telegram] No user data available yet');
        return;
    }

    const user = tg.initDataUnsafe.user;
    const userId = String(user.id);
    const username = user.username || '';
    const name = [user.first_name || '', user.last_name || ''].filter(Boolean).join(' ');
    
    // Пытаемся получить фото. Если photo_url пустой, используем fallback сервис Telegram
    let photoUrl = user.photo_url || '';
    if (!photoUrl && user.username) {
        photoUrl = `https://t.me/i/userpic/320/${user.username}.jpg`;
        console.log(`[Telegram] photo_url was empty, using fallback: ${photoUrl}`);
    }

    console.log(`[Telegram] SUCCESS: Found User ${userId}, Photo: ${photoUrl}`);

    // Используем URLSearchParams для чистоты
    const url = new URL(window.location.href);
    url.searchParams.set('telegram_id', userId);
    if (username) url.searchParams.set('username', username);
    if (name) url.searchParams.set('name', name);
    if (photoUrl) url.searchParams.set('photo_url', photoUrl);

    // Обновляем хэш (Unity часто читает именно его)
    const hashParams = new URLSearchParams();
    hashParams.set('telegram_id', userId);
    if (username) hashParams.set('username', username);
    if (name) hashParams.set('name', name);
    if (photoUrl) hashParams.set('photo_url', photoUrl);
    
    window.location.hash = hashParams.toString();
    
    const newHref = url.toString();
    if (newHref !== window.location.href) {
      window.history.replaceState({}, document.title, newHref);
    }
  } catch (e) {
    console.error('[Telegram] Critical error in attachTelegramParamsToUrl:', e);
  }
}

function sendTelegramParamsToUnity() {
  try {
    if (!unityInstanceRef || !unityInstanceRef.SendMessage) return;
    if (!window.Telegram || !Telegram.WebApp || !Telegram.WebApp.initDataUnsafe) return;
    const init = Telegram.WebApp.initDataUnsafe;
    const tgUser = init.user || {};
    const payload = {
      telegram_id: tgUser.id ? String(tgUser.id) : '',
      username: tgUser.username || '',
      name: [tgUser.first_name || '', tgUser.last_name || ''].filter(Boolean).join(' '),
      photo_url: tgUser.photo_url || ''
    };
    try {
      unityInstanceRef.SendMessage('SupabaseManager', 'OnTelegramData', JSON.stringify(payload));
    } catch (e) {
      try { unityInstanceRef.SendMessage('SupabaseBridge', 'OnTelegramData', JSON.stringify(payload)); } catch(_) {}
    }
  } catch (e) {
    console.warn('sendTelegramParamsToUnity error', e);
  }
}

// Shows a temporary message banner/ribbon for a few seconds, or
// a permanent error message on top of the canvas if type=='error'.
// If type=='warning', a yellow highlight color is used.
// Modify or remove this function to customize the visually presented
// way that non-critical warnings and error messages are presented to the
// user.
function unityShowBanner(msg, type) 
{
  function updateBannerVisibility()
  {
    warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
  }

  var div = document.createElement('div');
  div.innerHTML = msg;
  warningBanner.appendChild(div);

  if (type == 'error')
  {
    div.style = 'background: red; padding: 10px;';
  }
  else
  {
    if (type == 'warning')
    {
      div.style = 'background: yellow; padding: 10px;';
    }

    setTimeout(function()
    {
      warningBanner.removeChild(div);
      updateBannerVisibility();
    }, 5000);
  }

  updateBannerVisibility();
}

var buildUrl = "Build";
var loaderUrl = buildUrl + "/f79605ff3ae353d519b7cf670f1e5d90.loader.js?v=0.3.15";
var config = {
  dataUrl: buildUrl + "/dd3695783e9cac3ad00609d45858aaf4.data.unityweb?v=0.3.15",
  frameworkUrl: buildUrl + "/af7abffe9c91232473c1db30d48234b2.framework.js.unityweb?v=0.3.15",
  codeUrl: buildUrl + "/890fd4d68510ab58757cad991b4b4881.wasm.unityweb?v=0.3.15",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "d4rk_ltd",
  productName: "MinePixel",
  productVersion: "0.3.15",
  showBanner: unityShowBanner,
};

// By default Unity keeps WebGL canvas render target size matched with
// the DOM size of the canvas element (scaled by window.devicePixelRatio)
// Set this to false if you want to decouple this synchronization from
// happening inside the engine, and you would instead like to size up
// the canvas DOM size and WebGL render target sizes yourself.
// config.matchWebGLToCanvasSize = false;

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
{
  // Mobile device style: fill the whole browser client area with the game canvas:
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

canvas.style.background = "url('" + buildUrl + "/bcabcc8a777dfc26c6c98dbdb4fc2755.jpg?v=0.3.15') center / cover";
loadingBar.style.display = "block";

// Функция для принудительного обновления кэша
function forceCacheUpdate() {
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName.includes('MinePixel-Cache')) {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }
}

// Проверяем версию и обновляем кэш при необходимости
function checkVersionAndUpdate() {
    const currentVersion = '0.3.15';
    const storedVersion = localStorage.getItem('gameVersion');
    
    if (storedVersion !== currentVersion) {
        console.log('New version detected:', currentVersion, 'Previous:', storedVersion);
        localStorage.setItem('gameVersion', currentVersion);
        
        // Очищаем кэш и перезагружаем страницу
        forceCacheUpdate();
        
        // Небольшая задержка перед перезагрузкой
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
        
        return true;
    }
    
    return false;
}

// Проверяем версию перед загрузкой Unity
if (!checkVersionAndUpdate()) {
    var script = document.createElement("script");
    script.src = loaderUrl;

    script.onload = () => 
    {
      createUnityInstance(canvas, config, (progress) => 
      {
        progressBarFull.style.width = 100 * progress + "%";
      }
      ).then((unityInstance) => 
      {
        unityInstanceRef = unityInstance;
        loadingBar.style.display = "none";
        // Also push TG params after Unity is ready
        sendTelegramParamsToUnity();
      }
      ).catch((message) => 
      {
        alert(message);
      });
    };

    document.body.appendChild(script);
}

window.addEventListener('load', function ()
{
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  attachTelegramParamsToUrl();

  console.log("Telegram Web App has been expanded to full screen");
  console.log("Game Version: 0.3.15");

  var version = Telegram.WebApp.version;
  var versionFloat = parseFloat(version);

  if (versionFloat >= 7.7)
  {
      Telegram.WebApp.disableVerticalSwipes();
      console.log('Activating vertical swipe disable');
  }

  console.log(`Telegram Web App opened with version: ${version}`);
  console.log(`Telegram Web App checked` +
      `latest version status with result: ${Telegram.WebApp.isVersionAtLeast(version)}`);

  // Слушаем сообщения от Service Worker
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'NEW_VERSION') {
              console.log('New version notification from Service Worker:', event.data.version);
              // Можно показать уведомление пользователю
          }
      });
  }
});
