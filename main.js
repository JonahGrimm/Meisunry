const { shell, app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const contextMenu = require('electron-context-menu');

function saveAppData() {
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'appdata.json');
  const serializedData = JSON.stringify(preferencesData, null, 2);
  fs.writeFileSync(dataFilePath, serializedData);
}

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
      sortMode: "date"
    }
    const serializedData = JSON.stringify(baseData, null, 2);
    fs.writeFileSync(dataFilePath, serializedData);
    console.log(`${error}`);
    return baseData;
  }
}

const preferencesData = loadData();

contextMenu({
    prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: 'Sort By',
      type: 'submenu',
      submenu: [
      {
        click: () => { 
          preferencesData.sortMode = 'date';
          saveAppData();
          browserWindow.webContents.send('sort-update'); 
        },
        label: 'Date'
      },
      {
        click: () =>  { 
          preferencesData.sortMode = 'name';
          saveAppData();
          browserWindow.webContents.send('sort-update'); 
        },
        label: 'Name'
      },
      ]
    },

    {
      label: `Choose Folder...`,
      // Only show it when right-clicking text
      type: 'checkbox',
      click: () => {
        const options = {
          title: 'Select a Folder',
          properties: ['openDirectory'],
          defaultPath: preferencesData.folderLocation, // Format must be... `C:\\Grimm Tales\\`
        };
        dialog.showOpenDialog(browserWindow, options)
          .then(result => {
            if (!result.canceled && result.filePaths.length > 0) {
              // Perform actions with the selected folder path
              loadFolder(browserWindow, result.filePaths[0]);
            }
          })
          .catch(err => {
            console.error('Error opening folder dialog:', err);
          });

      }
    },
		/*{
			label: `Search Google for ${parameters.srcURL.replace("file:///", "")}`,
			// Only show it when right-clicking text
			visible: parameters.hasImageContents,
			click: () => {
        url = parameters.srcURL;
				shell.openExternal(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`);
			}
		}*/
	],
  showSelectAll: false,
	showSaveImageAs: false,
  showInspectElement: false,
});

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

  mainWindow.loadFile('index.html');

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

  /* Handler for when folder is dropped */
  ipcMain.on('folderDropped', (event, folder) => {
    loadFolder(mainWindow, folder);
  });
}

app.whenReady().then(() => {
  
  // Access command-line arguments using process.argv
  const args = process.argv.slice(2); // The first two arguments are node and the script file
  if (args[0] != null) 
  {
    // Check if the path exists
    fs.access(args[0], fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`The path ${args[0]} does not exist.`);
      } else {
        // Convert to the desired format for json serialization
        const convertedPath = args[0].replace(/\//g, '\\');
        preferencesData.folderLocation = convertedPath;
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

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('readFile', async (event, filePath) => {
  // Assuming fileList is an array of file names without dates
  const updatedFileList = [];
  try {
    files = await fs.promises.readdir(filePath);
    files = files.filter(file => file.match(/\.(jpg|jpeg|png|gif|jfif|webp)$/i));
    for (const filename of files) {
      const fullFilePath = path.join(filePath, filename);
  
      try {
        const stats = await fs.promises.stat(fullFilePath);
        const fileDate = stats.mtime; // Modification date of the file
  
        updatedFileList.push({ name: filename, date: fileDate });
      } catch (error) {
        console.error(`Error reading file: ${filename}`);
      }
    }
    // Sorting the fileList array by date
    updatedFileList.sort((a, b) => b.date - a.date);
    return updatedFileList;
  } catch (error) {
    throw error;
  }
});
  
function loadFolder (browserWindow, selectedFolderPath) {
  console.log('Selected folder:', selectedFolderPath);
  preferencesData.folderLocation = selectedFolderPath;
  saveAppData();
  browserWindow.loadFile('index.html');
}
