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
var loaderUrl = buildUrl + "/3a339192507e4f39952a4709b5eeb102.loader.js";
var config = {
  dataUrl: buildUrl + "/1034f16076c1afc0ccbc6510cfa4f6df.data.unityweb",
  frameworkUrl: buildUrl + "/dae07fd2dbd70b5f834ae5a34bec5677.framework.js.unityweb",
  codeUrl: buildUrl + "/77721c8295b2a637078541e9370d69fa.wasm.unityweb",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "d4rk_ltd",
  productName: "MinePixel",
  productVersion: "0.1.35",
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

  // Простая проверка версии без Service Worker
  fetch('Build/77721c8295b2a637078541e9370d69fa.wasm.unityweb', { 
    method: 'HEAD',
    cache: 'no-store'
  }).then(response => {
    const lastModified = response.headers.get('last-modified');
    const cachedLastModified = localStorage.getItem('lastModified');
    
    if (lastModified && lastModified !== cachedLastModified) {
      localStorage.setItem('lastModified', lastModified);
      if (cachedLastModified) { // Не перезагружаем при первом запуске
        window.location.reload(true);
      }
    }
  }).catch(console.error);
});
