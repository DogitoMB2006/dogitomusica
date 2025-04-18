const { app, BrowserWindow, session } = require('electron');

let mainWindow;

async function createWindow() {
  // Configurar las reglas de bloqueo antes de crear la ventana
  const filter = {
    urls: [
      "*://*.doubleclick.net/*",
      "*://partner.googleadservices.com/*",
      "*://*.googlesyndication.com/*",
      "*://*.google-analytics.com/*",
      "*://creative.ak.fbcdn.net/*",
      "*://*.adbrite.com/*",
      "*://*.exponential.com/*",
      "*://*.quantserve.com/*",
      "*://*.scorecardresearch.com/*",
      "*://*.zedo.com/*",
      "*://*.adsrvr.org/*",
      "*://*.adnxs.com/*"
    ]
  };

  // Configurar el filtro de la sesión
  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    callback({ cancel: true });
  });

  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Dogito Music',
    webPreferences: {
      webViewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Cargar YouTube Music directamente
  mainWindow.loadURL('https://music.youtube.com/');

  // Opcional: Abrir DevTools para depuración
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});