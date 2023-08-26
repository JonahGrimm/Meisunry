// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
contextBridge.exposeInMainWorld('fs', fs);
contextBridge.exposeInMainWorld('electronAPI', {
  onSortUpdate: (callback) => ipcRenderer.on('sort-update', callback),
})
//contextBridge.exposeInMainWorld('contextMenu', contextMenu);