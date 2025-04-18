// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs protegidas al contexto de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes agregar funciones para comunicación entre procesos si las necesitas
});