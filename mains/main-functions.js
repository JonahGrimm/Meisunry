const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let folderWatcher = null;
let refreshDebounceTimer = null;

/* Save data to preferencesData */
function saveAppData() {
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'appdata.json');
  const serializedData = JSON.stringify(global.preferencesData, null, 2);
  fs.writeFileSync(dataFilePath, serializedData);
}

/* Load preferencesData on disk */
function loadData() {
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'appdata.json');

  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
    const loadedData = JSON.parse(fileContents);
    return loadedData;
  } catch (error) {
    /* Default json */
    const baseData = {
      folderLocation: "C:\\",
      sortMode: "date",
      recursion: 0,
      loadSpeed: 'medium',
    }
    const serializedData = JSON.stringify(baseData, null, 2);
    fs.writeFileSync(dataFilePath, serializedData);
    console.log(`${error}`);
    return baseData;
  }
}

/* Load a folder from a path, save to preferencesData on disk, and refresh browser window */
function loadFolder (browserWindow, selectedFolderPath) {
  console.log('Selected folder:', selectedFolderPath);
  global.preferencesData.folderLocation = selectedFolderPath;
  saveAppData();
  loadIndex(browserWindow);
  startFolderWatcher(browserWindow, selectedFolderPath);
}

function truncateFilePathToNearestFolder(filePath) {
  const lastDotIndex = filePath.lastIndexOf('.');
  
  if (filePath === `./mains/main.js` || filePath.toLowerCase().includes("meisunry")) return global.preferencesData.folderLocation;
  
  if (lastDotIndex !== -1) {
    // If a dot (.) is found (indicating a file extension),
    // find the last directory separator (slash or backslash)
    const lastSeparatorIndex = filePath.lastIndexOf('/');
    if (lastSeparatorIndex === -1) {
      const lastBackslashIndex = filePath.lastIndexOf('\\');
      if (lastBackslashIndex !== -1) {
        return filePath.substring(0, lastBackslashIndex + 1);
      }
    } else {
      return filePath.substring(0, lastSeparatorIndex + 1);
    }
  }
  
  // If no file extension or directory separators are found, return the original path
  return filePath;
}

function loadIndex(browserWindow) {
  const parentDir = path.join(__dirname, '..');
  browserWindow.loadURL(`file://${parentDir}/renderers/index.html`);
}

function refreshGrid (browserWindow) {
  browserWindow.webContents.send('refresh-grid-update'); 
}

function startFolderWatcher(browserWindow, folderPath) {
  stopFolderWatcher();
  if (!folderPath) return;

  const triggerRefresh = () => {
    if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
    refreshDebounceTimer = setTimeout(() => {
      refreshGrid(browserWindow);
    }, 300);
  };

  const shouldWatchRecursively = (global.preferencesData && typeof global.preferencesData.recursion === 'number' && global.preferencesData.recursion > 0);

  try {
    folderWatcher = fs.watch(folderPath, { recursive: shouldWatchRecursively }, (eventType, filename) => {
      if (!filename) return;
      const lower = filename.toLowerCase();
      if (!lower.match(/\.(jpg|jpeg|png|gif|jfif|webp|mp4|webm|mkv|avi|mov|wmv|flv|mts)$/i)) return;
      triggerRefresh();
    });
  } catch (err) {
    try {
      folderWatcher = fs.watch(folderPath, {}, () => {
        triggerRefresh();
      });
    } catch (err2) {
      folderWatcher = null;
    }
  }
}

function stopFolderWatcher() {
  if (folderWatcher) {
    try { folderWatcher.close(); } catch (e) {}
    folderWatcher = null;
  }
  if (refreshDebounceTimer) {
    clearTimeout(refreshDebounceTimer);
    refreshDebounceTimer = null;
  }
}

module.exports = { saveAppData, truncateFilePathToNearestFolder, loadFolder, loadData, loadIndex, refreshGrid, startFolderWatcher, stopFolderWatcher };
