// Добавить в начало файла
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(contentToCache).then(() => self.skipWaiting());
    })
  );
});

// Изменить обработчик fetch
self.addEventListener('fetch', function(e) {
  // Для критических файлов всегда делаем запрос к серверу
  if (e.request.url.includes('index.html') || 
      e.request.url.includes('WebGL.framework.js') ||
      e.request.url.includes('WebGL.data')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(function() {
          return caches.match(e.request);
        })
    );
    return;
  }
  
  // Для остальных ресурсов - стандартная стратегия cache-first
  e.respondWith(
    caches.match(e.request)
      .then(function(response) {
        return response || fetch(e.request);
      })
  );
});

// Регистрация Service Worker
window.addEventListener("load", function () {
  if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("ServiceWorker.js")
          .then(function (registration) {
              console.log('[Service Worker] Зарегистрирован:', registration);

              // Если уже есть ожидающий обновления Service Worker
              if (registration.waiting) {
                  console.log('[Service Worker] Новая версия ожидает активации. Активируем...');
                  registration.waiting.postMessage('SKIP_WAITING');
              }

              // Отслеживаем установку новой версии Service Worker
              registration.addEventListener('updatefound', function () {
                  const newWorker = registration.installing;
                  console.log('[Service Worker] Найдена новая версия. Устанавливается...');

                  newWorker.addEventListener('statechange', function () {
                      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('[Service Worker] Новая версия установлена. Перезагрузка страницы...');
                          location.reload(); // Перезагружаем страницу для загрузки новой версии
                      }
                  });
              });
          })
          .catch(function (error) {
              console.error('[Service Worker] Ошибка регистрации:', error);
          });

      // Обработка изменения контроллера Service Worker
      navigator.serviceWorker.addEventListener('controllerchange', function () {
          console.log('[Service Worker] Контроллер изменён. Перезагрузка страницы...');
          location.reload(); // Обновляем страницу, когда новая версия Service Worker активируется
      });
  }
});

// Остальная часть кода
var unityInstanceRef;
var unsubscribe;
var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var warningBanner = document.querySelector("#unity-warning");

// Показывает временные или постоянные сообщения
function unityShowBanner(msg, type) {
  function updateBannerVisibility() {
      warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
  }

  var div = document.createElement('div');
  div.innerHTML = msg;
  warningBanner.appendChild(div);

  if (type == 'error') {
      div.style = 'background: red; padding: 10px;';
  } else {
      if (type == 'warning') {
          div.style = 'background: yellow; padding: 10px;';
      }

      setTimeout(function () {
          warningBanner.removeChild(div);
          updateBannerVisibility();
      }, 5000);
  }

  updateBannerVisibility();
}

var buildUrl = "Build";
var loaderUrl = buildUrl + "/ab27b5aca0225add9b5861aa510b55c3.loader.js";
var config = {
  dataUrl: buildUrl + "/c7b0b4aa8477981f7606a0084aceac82.data.unityweb",
  frameworkUrl: buildUrl + "/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
  codeUrl: buildUrl + "/53abba5fa264817db79adaa12f7bfc05.wasm.unityweb",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "d4rk_ltd",
  productName: "MinePixel",
  productVersion: "0.1.6",
  showBanner: unityShowBanner,
};

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

canvas.style.background = "url('" + buildUrl + "/2f271768184e39ba91183604bcb9dd9d.jpg') center / cover";
loadingBar.style.display = "block";

var script = document.createElement("script");
script.src = loaderUrl;

script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
      progressBarFull.style.width = 100 * progress + "%";
  }).then((unityInstance) => {
      unityInstanceRef = unityInstance;
      loadingBar.style.display = "none";
  }).catch((message) => {
      alert(message);
  });
};

document.body.appendChild(script);

// Telegram WebApp настройки
window.addEventListener('load', function () {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  console.log("Telegram Web App has been expanded to full screen");

  var version = Telegram.WebApp.version;
  var versionFloat = parseFloat(version);

  if (versionFloat >= 7.7) {
      Telegram.WebApp.disableVerticalSwipes();
      console.log('Activating vertical swipe disable');
  }

  console.log(`Telegram Web App opened with version: ${version}`);
  console.log(`Telegram Web App checked latest version status with result: ${Telegram.WebApp.isVersionAtLeast(version)}`);
});
