const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

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
module.exports = { saveAppData, truncateFilePathToNearestFolder, loadFolder, loadData, loadIndex };
