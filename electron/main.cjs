// electron/main.cjs
const { app, BrowserWindow, session, Menu, globalShortcut, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
// Importar el módulo de actualización
const updater = require('./updater.cjs');

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
    icon: findIcon(),
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
  
  // Inicializar el actualizador automático
  updater.initUpdater(mainWindow);
}

// Función para buscar un icono válido
function findIcon() {
  console.log("Buscando iconos válidos...");
  
  // Lista de posibles rutas de iconos
  const possibleIconPaths = [
    // Rutas en producción
    path.join(app.getAppPath(), 'dist/favicon.ico'),
    path.join(app.getAppPath(), 'dist/icon.ico'),
    path.join(app.getAppPath(), 'dist/icon.png'),
    // Rutas en desarrollo
    path.join(app.getAppPath(), 'public/favicon.ico'),
    path.join(app.getAppPath(), 'public/icon.ico'),
    path.join(app.getAppPath(), 'public/icon.png'),
    path.join(app.getAppPath(), 'public/icon.svg'),
    // Rutas relativas
    path.join(__dirname, 'public/favicon.ico'),
    path.join(__dirname, 'public/icon.ico'),
    path.join(__dirname, 'public/icon.png'),
    path.join(__dirname, 'public/icon.svg'),
    path.join(__dirname, '../public/favicon.ico'),
    path.join(__dirname, '../public/icon.ico'),
    path.join(__dirname, '../public/icon.png'),
    path.join(__dirname, '../public/icon.svg'),
  ];

  // Buscar el primer icono existente
  for (const iconPath of possibleIconPaths) {
    try {
      if (fs.existsSync(iconPath)) {
        console.log(`Icono encontrado: ${iconPath}`);
        return iconPath;
      }
    } catch (err) {
      console.warn(`Error verificando ruta ${iconPath}: ${err.message}`);
    }
  }

  console.warn("No se encontró ningún icono válido");
  return null;
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
    console.log("Iniciando creación del tray...");
    
    // Si ya existe un tray, no crear uno nuevo
    if (tray !== null) {
      console.log("Tray ya existe, no se creará uno nuevo");
      return;
    }

    // Buscar un icono válido
    const iconPath = findIcon();
    
    // Si no se encuentra icono, intentar crear uno predeterminado
    let trayIcon;
    if (iconPath) {
      console.log(`Creando tray con icono: ${iconPath}`);
      trayIcon = nativeImage.createFromPath(iconPath);
      
      // Verificar que la imagen no esté vacía
      if (trayIcon.isEmpty()) {
        console.warn("El icono cargado está vacío, intentando alternativas...");
        
        // Buscar otros formatos en la misma ubicación
        const dir = path.dirname(iconPath);
        const possibleAlternatives = ['favicon.png', 'icon.png', 'app.png', 'logo.png', 'icon.svg'];
        
        let foundAlternative = false;
        for (const alt of possibleAlternatives) {
          const altPath = path.join(dir, alt);
          if (fs.existsSync(altPath)) {
            console.log(`Intentando con alternativa: ${altPath}`);
            trayIcon = nativeImage.createFromPath(altPath);
            if (!trayIcon.isEmpty()) {
              foundAlternative = true;
              break;
            }
          }
        }
        
        if (!foundAlternative) {
          // Si todas las alternativas fallan, crear un icono vacío
          console.warn("No se pudo cargar un icono válido, usando icono predeterminado");
          trayIcon = nativeImage.createEmpty();
        }
      }
    } else {
      console.warn("No se encontró ningún icono, usando icono predeterminado");
      trayIcon = nativeImage.createEmpty();
    }
    
    // Crear la bandeja del sistema
    tray = new Tray(trayIcon);
    tray.setToolTip('Dogito Music');
    
    // Añadir menú contextual al tray
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Abrir Dogito Music', 
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            if (!mainWindow.isVisible()) mainWindow.show();
            mainWindow.focus();
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
        label: 'Buscar actualizaciones',
        click: () => {
          updater.checkForUpdates();
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
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      } else {
        createWindow();
      }
    });
    
    console.log("Bandeja del sistema creada con éxito");
  } catch (error) {
    console.error("Error al crear la bandeja del sistema:", error);
    // Continuar sin la bandeja del sistema
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

// Este evento se dispara cuando Electron ha terminado la inicialización
app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();
  
  // Retrasar la creación del tray para asegurar que la app esté completamente lista
  setTimeout(() => {
    createTray();
    console.log("Creación del tray programada después de timeout");
  }, 1000);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    // NO llamamos a app.quit() aquí para mantener la app en segundo plano con el tray
    console.log("Todas las ventanas cerradas, pero aplicación sigue en segundo plano");
  }
});

app.on('before-quit', () => {
  console.log("App cerrándose completamente");
  app.isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('quit', () => {
  console.log("App cerrada completamente");
  // Limpiar el tray al salir completamente
  if (tray) {
    tray.destroy();
    tray = null;
  }
});