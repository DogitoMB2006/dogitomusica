// electron/main.js
import { app, BrowserWindow, Menu, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Dogito Music',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true // Habilitar el tag webview
    }
  });

  // Cargar la aplicación
  if (isDev) {
    // En desarrollo, carga desde el servidor de desarrollo de Vite
    mainWindow.loadURL('http://localhost:5173');
    // Abre las herramientas de desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, carga desde los archivos construidos
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Ocultar la barra de menú por defecto
  mainWindow.setMenuBarVisibility(false);

  // Crear menú personalizado
  const menu = Menu.buildFromTemplate([
    {
      label: 'Archivo',
      submenu: [
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'toggledevtools', label: 'Herramientas de desarrollo' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  // Registrar atajos de teclado globales para controlar la reproducción
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.executeJavaScript(`
      document.querySelector('webview').executeJavaScript(
        "document.querySelector('.play-pause-button')?.click()"
      );
    `);
  });

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.executeJavaScript(`
      document.querySelector('webview').executeJavaScript(
        "document.querySelector('.next-button')?.click()"
      );
    `);
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.executeJavaScript(`
      document.querySelector('webview').executeJavaScript(
        "document.querySelector('.previous-button')?.click()"
      );
    `);
  });

  // Evento cuando la ventana se cierra
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Este método se llamará cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // En macOS es común volver a crear una ventana en la aplicación cuando
    // se hace clic en el icono del dock y no hay otras ventanas abiertas.
    if (mainWindow === null) createWindow();
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});