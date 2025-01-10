window.addEventListener("load", function () 
{
    if ("serviceWorker" in navigator)
    {
      navigator.serviceWorker.register("ServiceWorker.js");
    }
  });

  var unityInstanceRef;
  var unsubscribe;
  var container = document.querySelector("#unity-container");
  var canvas = document.querySelector("#unity-canvas");
  var loadingBar = document.querySelector("#unity-loading-bar");
  var progressBarFull = document.querySelector("#unity-progress-bar-full");
  var warningBanner = document.querySelector("#unity-warning");

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
  var loaderUrl = buildUrl + "/3062e4bb6c71ccd52396c37d480cc9ee.loader.js";
  var config = {
    dataUrl: buildUrl + "/5899fd7e56594e97e4a0b0142c281115.data.unityweb",
    frameworkUrl: buildUrl + "/08e27d5d5174cf582e0167480cd86567.framework.js.unityweb",
    codeUrl: buildUrl + "/26b8cb375b8ab1436eec3ba00c9164b6.wasm.unityweb",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "d4rk_ltd",
    productName: "MinePixel",
    productVersion: "0.1.2",
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

  canvas.style.background = "url('" + buildUrl + "/2f271768184e39ba91183604bcb9dd9d.jpg') center / cover";
  loadingBar.style.display = "block";

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
    }
    ).catch((message) => 
    {
      alert(message);
    });
  };

  document.body.appendChild(script);

  window.addEventListener('load', function ()
  {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    console.log("Telegram Web App has been expanded to full screen");

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
  });

  // Принудительное обновление Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/ServiceWorker.js').then(function(registration) {
        console.log('[Service Worker] Registered');

        // Проверяем наличие обновлений
        registration.update();

        // Обработчик события обновления
        registration.onupdatefound = function() {
            const installingWorker = registration.installing;
            console.log('[Service Worker] Update found');

            installingWorker.onstatechange = function() {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // Новая версия доступна, уведомляем пользователя
                        console.log('[Service Worker] New version available');
                        // Здесь вы можете добавить логику для уведомления пользователя
                        alert('Новое обновление доступно! Пожалуйста, перезагрузите страницу.');
                    } else {
                        console.log('[Service Worker] Content is cached for offline use.');
                    }
                }
            };
        };
    }).catch(function(error) {
        console.error('[Service Worker] Registration failed:', error);
    });
  }
