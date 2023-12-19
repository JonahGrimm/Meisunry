// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
contextBridge.exposeInMainWorld('fs', fs);
contextBridge.exposeInMainWorld('electronAPI', {
  onSortUpdate: (callback) => ipcRenderer.on('sort-update', callback), // Forwards 'sort-update' event from main.js to renderer.js onSortUpdate
  onFlashCopied: (callback) => ipcRenderer.on('flash-copied', callback), // Forwards 'flash-copied' event from main.js to renderer.js onFlashCopied
  onFileAdded: (callback) => ipcRenderer.on('added-file', callback), // Forwards 'added-file' event from main.js to renderer.js onFileAdded
  onFileDeleted: (callback) => ipcRenderer.on('deleted-file', callback), // Forwards 'deleted-file' event from main.js to renderer.js onFileDeleted
  onDataLoaded: (callback) => ipcRenderer.on('on-data-loaded', callback), // Forwards 'on-data-loaded' event from main.js to renderer.js onDataLoaded
  onEnterFullscreen: (callback) => ipcRenderer.on('enter-full-screen', callback), // Forwards 'enter-full-screen' event from main.js to renderer.js onEnterFullscreen
  onLeaveFullscreen: (callback) => ipcRenderer.on('leave-full-screen', callback), // Forwards 'leave-full-screen' event from main.js to renderer.js onLeaveFullscreen
})
//contextBridge.exposeInMainWorld('contextMenu', contextMenu);