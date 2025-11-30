// Регистрируем Service Worker с версией
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('ServiceWorker.js?v=0.1.82')
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
    if (!window.Telegram || !Telegram.WebApp || !Telegram.WebApp.initDataUnsafe) return;
    const init = Telegram.WebApp.initDataUnsafe;
    const tgUser = init.user || {};
    const userId = tgUser.id ? String(tgUser.id) : '';
    const username = tgUser.username || '';
    const name = [tgUser.first_name || '', tgUser.last_name || ''].filter(Boolean).join(' ');

    const url = new URL(window.location.href);
    if (userId && !url.searchParams.get('telegram_id')) url.searchParams.set('telegram_id', userId);
    if (username && !url.searchParams.get('username')) url.searchParams.set('username', username);
    if (name && !url.searchParams.get('name')) url.searchParams.set('name', name);

    const newHref = url.toString();
    if (newHref !== window.location.href) {
      window.history.replaceState({}, document.title, newHref);
    }
  } catch (e) {
    console.warn('attachTelegramParamsToUrl error', e);
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
      name: [tgUser.first_name || '', tgUser.last_name || ''].filter(Boolean).join(' ')
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
var loaderUrl = buildUrl + "/a027e133f5658251309b58fbad4843dc.loader.js?v=0.1.82";
var config = {
  dataUrl: buildUrl + "/1a05b5ca4e2f65de2f2193ff6b033003.data.unityweb?v=0.1.82",
  frameworkUrl: buildUrl + "/e8bfb7f0c284b4cf78c5dc68eaf39ff2.framework.js.unityweb?v=0.1.82",
  codeUrl: buildUrl + "/67d89e6a432416b3af32a31cd7d7d128.wasm.unityweb?v=0.1.82",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "d4rk_ltd",
  productName: "MinePixel",
  productVersion: "0.1.82",
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

canvas.style.background = "url('" + buildUrl + "/bcabcc8a777dfc26c6c98dbdb4fc2755.jpg?v=0.1.82') center / cover";
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
    const currentVersion = '0.1.82';
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
  console.log("Game Version: 0.1.82");

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
