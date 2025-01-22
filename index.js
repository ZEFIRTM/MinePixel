// navigator.serviceWorker.register("ServiceWorker.js");

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
var loaderUrl = buildUrl + "/2f23d236c53c89a67de904edede8f038.loader.js";
var config = {
  dataUrl: buildUrl + "/fe52ce621a3daf0a7b1264992bca21d6.data.unityweb",
  frameworkUrl: buildUrl + "/ddcc48b07ea5017a31867f1ae0bc3a11.framework.js.unityweb",
  codeUrl: buildUrl + "/6855db44b718b9a28b71daa841c4e016.wasm.unityweb",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "d4rk_ltd",
  productName: "MinePixel",
  productVersion: "0.1.22",
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

canvas.style.background = "url('" + buildUrl + "/bcabcc8a777dfc26c6c98dbdb4fc2755.jpg') center / cover";
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

  // Регистрируем Service Worker для управления кешированием
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('ServiceWorker.js').then(registration => {
        // Если есть ожидающий Service Worker, активируем его немедленно
        if (registration.waiting) {
            registration.waiting.postMessage({type: 'SKIP_WAITING'});
        }
        
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Новый Service Worker готов, перезагружаем страницу
                    window.location.reload();
                }
            });
        });
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
  }
});
