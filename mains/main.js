const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { loadFolder, saveAppData, truncateFilePathToNearestFolder, loadData, loadIndex } = require('./main-functions');

global.preferencesData = loadData();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'app-icons/logo.png',
    webPreferences: {
      nodeIntegration: true,
      audio: true,
      zoomFactor: 0.01,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(.01); 
  });

  loadIndex(mainWindow);

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
          const newImageFile = { name: path.basename(destinationFilePath), date: fileDate, fullPath: destinationFilePath, isImage: isFileAnImage(destinationFilePath), };
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

  return mainWindow;
}

app.whenReady().then(() => {
  
  // Access command-line arguments using process.argv
  const args = process.argv;
  arg = truncateFilePathToNearestFolder(args[args.length - 1]);
  if (arg != null) 
  {
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

  var browserWindow = createWindow();

  globalShortcut.register('Escape', () => {
    browserWindow.webContents.send('hide-focus-img');
  });


  ipcMain.handle('loadAppData', () => {
    return loadData();
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
      targetFiles = targetFiles.filter(file => file.match(/\.(jpg|jpeg|png|gif|jfif|webp|avif|mp4|webm|mkv|avi|mov|wmv|flv|mts)$/i));
      for (const filename of targetFiles) {
        const fullFilePath = path.join(targetFilePath, filename);
    
        try {
          const stats = await fs.promises.stat(fullFilePath);
          const fileDate = stats.mtime; // Modification date of the file
          isImage = isFileAnImage(filename);
          if ((isImage && !preferencesData.DisableImages) || (!isImage && !preferencesData.DisableVideos)) updatedFileList.push({ name: filename, date: fileDate, fullPath: fullFilePath, isImage: isImage });
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

/* Close when window-all-closed */
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// When the app is about to quit, unregister all shortcuts
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function isFileAnImage(fileName) {
  const isImagePattern = /\.(jpg|jpeg|png|gif|jfif|webp|avif)$/i;
  return isImagePattern.test(fileName);
}

const contextMenuJS = require('./context-menu');
