// electron/main.cjs
const { app, BrowserWindow, session, Menu, globalShortcut, Tray, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

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
    icon: path.join(__dirname, 'public/favicon.ico'),
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

  // Manejar evento de cierre para minimizar a tray en lugar de cerrar
  mainWindow.on('close', function (event) {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Ejecutar acciones de control multimedia
function executeMediaAction(selector) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.executeJavaScript(`
      try {
        document.querySelector('.${selector}')?.click();
      } catch (e) {
        console.error('Error executing media action:', e);
      }
    `).catch(err => console.error('Error in executeJavaScript:', err));
  }
}

function createTray() {
  try {
    // Logs para depuración
    console.log('Directorio actual:', __dirname);
    
    // Definir múltiples rutas posibles para el icono
    const iconPaths = [
      path.join(__dirname, 'public', 'favicon.ico'),
      path.join(__dirname, 'public', 'favicon.png'),
      path.join(__dirname, 'public', 'icon.ico'),
      path.join(__dirname, 'public', 'icon.png'),
      path.join(__dirname, 'favicon.ico'),
      path.join(__dirname, 'icon.ico')
    ];
    
    // Comprobar qué archivos existen
    const fs = require('fs');
    console.log('Comprobando archivos de icono:');
    
    // Inicializar el icono como vacío
    let trayIcon = nativeImage.createEmpty();
    let iconFound = false;
    
    // Intentar cargar el primer icono que exista
    for (const iconPath of iconPaths) {
      if (fs.existsSync(iconPath)) {
        console.log(`Archivo encontrado: ${iconPath}`);
        try {
          const icon = nativeImage.createFromPath(iconPath);
          if (!icon.isEmpty()) {
            trayIcon = icon;
            iconFound = true;
            console.log(`Usando icono: ${iconPath}`);
            break;
          } else {
            console.log(`Icono vacío: ${iconPath}`);
          }
        } catch (err) {
          console.error(`Error al cargar el icono ${iconPath}:`, err);
        }
      } else {
        console.log(`Archivo no encontrado: ${iconPath}`);
      }
    }
    
    // Si no se encontró ningún icono, crear uno básico
    if (!iconFound) {
      console.log('Creando icono predeterminado...');
      
      // Crear un icono básico con un dataURL
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Qjg0OTk4QzMyMUE3MTFFQTk2N0JDQzU0OTUzMzlEMzYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Qjg0OTk4QzQyMUE3MTFFQTk2N0JDQzU0OTUzMzlEMzYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCODQ5OThDMTIxQTcxMUVBOTY3QkNDNTQ5NTMzOUQzNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCODQ5OThDMjIxQTcxMUVBOTY3QkNDNTQ5NTMzOUQzNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtZgZTAAAADGSURBVHjaYvz//z8DJYCJgULAYmRk9B9dHF0NLi0Qn9XY2NgAyW8A0gJQ/IAxKCiIgYWVlYGVlVUASP8HYoH///8bsLOzmzMxMRnIycn9FxISEmBmZjZ4+fLlf3l5+f9Pnjz5D1TDANX0H2IGSKGUlNR/QUHB/2xsbP8ZoQYLAA0SYKQULF26FOwSFRWV/7KysmA+yHCQ2KVLl+CGCQsLg1VCaQMWdnZ2cICxsrKCXQKyEWTPt2/fDJiAXgEpBpoLjkYGKgIAAQYA9gZt3uIoQEMAAAAASUVORK5CYII=';
      trayIcon = nativeImage.createFromDataURL(dataUrl);
    }
    
    // Crear la bandeja del sistema con el icono seleccionado
    tray = new Tray(trayIcon);
    tray.setToolTip('Dogito Music');
    
    // Añadir menú contextual al tray
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Abrir Dogito Music', 
        click: () => {
          if (mainWindow) {
            mainWindow.show();
          } else {
            createWindow();
          }
        }
      },
      { type: 'separator' },
      { 
        label: '⏮️ Anterior', 
        click: () => {
          executeMediaAction('previous-button');
        }
      },
      { 
        label: '⏯️ Play/Pausa', 
        click: () => {
          executeMediaAction('play-pause-button');
        }
      },
      { 
        label: '⏭️ Siguiente', 
        click: () => {
          executeMediaAction('next-button');
        }
      },
      { type: 'separator' },
      { 
        label: 'Salir', 
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setContextMenu(contextMenu);
    
    // Mostrar la ventana al hacer clic en el icono de la bandeja
    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      } else {
        createWindow();
      }
    });
    
    console.log('System tray creado exitosamente');
  } catch (err) {
    console.error('Error creating tray:', err);
  }
}

// Registrar los atajos de teclado globales
function registerGlobalShortcuts() {
  try {
    globalShortcut.register('MediaPlayPause', () => {
      executeMediaAction('play-pause-button');
    });

    globalShortcut.register('MediaNextTrack', () => {
      executeMediaAction('next-button');
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      executeMediaAction('previous-button');
    });
  } catch (err) {
    console.error('Error registering shortcuts:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    // No cerramos la app, solo minimizamos a tray
  }
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Limpieza de recursos al salir
app.on('before-quit', () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
});