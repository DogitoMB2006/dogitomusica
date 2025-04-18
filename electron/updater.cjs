// electron/updater.cjs
const { app, dialog, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

// GitHub repository info
const GITHUB_OWNER = 'DogitoMB2006';
const GITHUB_REPO = 'dogitomusica';

let updaterWindow = null;

/**
 * Initialize the updater
 * @param {BrowserWindow} mainWindow - Reference to the main application window
 */
function initUpdater(mainWindow) {
  log.info('Initializing auto-updater');

  // Set the GitHub repo for updates
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    releaseType: 'release'
  });

  // Check for updates immediately on startup (after a short delay)
  setTimeout(() => {
    checkForUpdates();
  }, 5000); // 5 seconds delay

  // Check for updates every 2 hours
  setInterval(() => {
    checkForUpdates();
  }, 2 * 60 * 60 * 1000);

  // Handle update events
  autoUpdater.on('error', (error) => {
    log.error('Auto-updater error:', error);
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    showUpdateDialog(mainWindow, info);
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download progress: ${progressObj.percent}%`);
    
    if (updaterWindow) {
      updaterWindow.webContents.send('download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    showUpdateInstalledDialog(info);
  });
}

/**
 * Check for updates
 */
function checkForUpdates() {
  log.info('Checking for updates...');
  autoUpdater.checkForUpdates().catch(err => {
    log.error('Error checking for updates:', err);
  });
}

/**
 * Show dialog when update is available
 * @param {BrowserWindow} mainWindow - Main application window
 * @param {Object} info - Update information
 */
function showUpdateDialog(mainWindow, info) {
  const dialogOpts = {
    type: 'info',
    buttons: ['Descargar', 'Más tarde'],
    title: 'Actualización disponible',
    message: `¡Hay una nueva versión disponible! (${info.version})`,
    detail: 'Una nueva versión de Dogito Music está disponible. ¿Deseas descargarla ahora?'
  };

  dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      // User clicked "Download"
      autoUpdater.downloadUpdate();
      
      // Show progress window
      showProgressWindow(mainWindow);
    }
  });
}

/**
 * Show progress window during download
 * @param {BrowserWindow} mainWindow - Main application window
 */
function showProgressWindow(mainWindow) {
  // Create a simple window to show download progress
  updaterWindow = new BrowserWindow({
    width: 400,
    height: 150,
    parent: mainWindow,
    modal: true,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load a simple HTML file for the progress
  updaterWindow.loadURL(`data:text/html,
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          .progress-bar { width: 100%; height: 20px; background-color: #f0f0f0; border-radius: 10px; margin: 20px 0; }
          .progress { height: 100%; width: 0%; background-color: #ff6600; border-radius: 10px; transition: width 0.3s; }
          .status { margin-top: 10px; }
        </style>
      </head>
      <body>
        <h3>Descargando actualización...</h3>
        <div class="progress-bar">
          <div class="progress" id="progress"></div>
        </div>
        <div class="status">0%</div>
        <script>
          const { ipcRenderer } = require('electron');
          const progressBar = document.getElementById('progress');
          const statusText = document.querySelector('.status');
          
          ipcRenderer.on('download-progress', (event, progressObj) => {
            progressBar.style.width = progressObj.percent + '%';
            statusText.textContent = \`\${Math.round(progressObj.percent)}% (\${Math.round(progressObj.transferred / 1024)} KB / \${Math.round(progressObj.total / 1024)} KB)\`;
          });
        </script>
      </body>
    </html>
  `);

  updaterWindow.once('ready-to-show', () => {
    updaterWindow.show();
  });
}

/**
 * Show dialog when update is downloaded and ready to install
 * @param {Object} info - Update information
 */
function showUpdateInstalledDialog(info) {
  // Close the progress window if it exists
  if (updaterWindow) {
    updaterWindow.close();
    updaterWindow = null;
  }

  const dialogOpts = {
    type: 'info',
    buttons: ['Reiniciar ahora', 'Más tarde'],
    title: 'Actualización lista para instalar',
    message: `Versión ${info.version} lista para instalar`,
    detail: 'Se ha descargado la actualización. Reinicia la aplicación para aplicar los cambios.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      // User clicked "Restart Now"
      autoUpdater.quitAndInstall(false, true);
    }
  });
}

module.exports = {
  initUpdater,
  checkForUpdates
};