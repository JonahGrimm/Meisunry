const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { loadFolder, saveAppData, truncateFilePathToNearestFolder, loadData } = require('./main-functions');

global.preferencesData = loadData();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'app-icons/logo.png',
    webPreferences: {
      nodeIntegration: true,
      zoomFactor: 0.01,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
  });

  mainWindow.loadFile('../renderers/index.html');

  /* Functions for handling window min/max/close */
  ipcMain.on('closeApp', () => {
    app.quit();
  });
  ipcMain.on('minimizeApp', () => {
    mainWindow.minimize();
  });
  ipcMain.on('maximizeApp', () => {
    if (mainWindow.isMaximized())
      mainWindow.restore();
    else
      mainWindow.maximize();
  });
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('enter-full-screen'); 
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('leave-full-screen'); 
  });

  /* Handler for when folder is dropped */
  ipcMain.on('folderDropped', (event, folder) => {
    loadFolder(mainWindow, folder);
  });

  /* Handler for when image is dropped. Relocates file from one folder to another. */
  ipcMain.on('imageDropped', async (event, imagePath) => {
    const destinationFilePath = path.join(global.preferencesData.folderLocation, path.basename(imagePath));

    if (fs.existsSync(destinationFilePath)) return;

    fs.rename(imagePath, destinationFilePath, async (err) => {
      if (!err) {
        console.log(`Moved file to ${destinationFilePath}`);
        try {
          const stats = await fs.promises.stat(destinationFilePath);
          const fileDate = stats.mtime; // Modification date of the file
          const newImageFile = { name: path.basename(destinationFilePath), date: fileDate, fullPath: destinationFilePath };
          mainWindow.webContents.send('added-file', newImageFile); 
        } catch (error) {
          console.error(`Error reading file: ${filename}`);
        }
      } else {
        console.log(`Move file error ${err}`);
      }
    });
  });

  ipcMain.handle('getIsFullscreen', () => {
    return mainWindow.isFullScreen();
  });
}

app.whenReady().then(() => {
  
  // Access command-line arguments using process.argv
  const args = process.argv;
  arg = truncateFilePathToNearestFolder(args[args.length - 1]);
  if (arg != null) 
  {
    console.log(arg);
    // Check if the path exists
    fs.access(arg, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`The path ${arg} does not exist.`);
      } else {
        // Convert to the desired format for json serialization
        const convertedPath = arg.replace(/\//g, '\\');
        global.preferencesData.folderLocation = convertedPath;
        saveAppData();
      }
    });
  }

  createWindow();

  ipcMain.handle('loadAppData', () => {
    return loadData();
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

/* Close when window-all-closed */
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('readFilesFromDisk', async (event, filePath) => {
  // Assuming fileList is an array of file names without dates
  const updatedFileList = [];
  try {

    await addFolderToList(filePath, 0);
    
    async function addFolderToList(targetFolderPath, depth) {
        // Add contents of current folder to final list
        files = await fs.promises.readdir(targetFolderPath);
        await pushFilteredFilesToList(files, targetFolderPath);
        // If our depth allows it, scan the current folder and recurse
        depth++;
        if (depth <= global.preferencesData.recursion)
        {
            // Find directories
            const folders = files.filter(item => {
                const itemPath = path.join(targetFolderPath, item);
                return fs.statSync(itemPath).isDirectory();
            });

            for (const index in folders) {
                var nestedFolder = path.join(targetFolderPath, folders[index]);
                console.log(nestedFolder);
                await addFolderToList(nestedFolder, depth);
            }
        }
    }

    // Push filtered file group to final list 
    async function pushFilteredFilesToList(targetFiles, targetFilePath) {
      targetFiles = targetFiles.filter(file => file.match(/\.(jpg|jpeg|png|gif|jfif|webp)$/i));
      for (const filename of targetFiles) {
        const fullFilePath = path.join(targetFilePath, filename);
    
        try {
          const stats = await fs.promises.stat(fullFilePath);
          const fileDate = stats.mtime; // Modification date of the file
    
          updatedFileList.push({ name: filename, date: fileDate, fullPath: fullFilePath });
        } catch (error) {
          console.error(`Error reading file: ${filename}`);
        }
      }
    }

    // Sorting the fileList array by date
    updatedFileList.sort((a, b) => b.date - a.date);
    return updatedFileList;
  } catch (error) {
    throw error;
  }
});

const contextMenuJS = require('./context-menu');
