document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('grid-wrapper');

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    // Iterate through the items to find folders
    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (!currentFile.type && currentFile.size % 4096 == 0) {
        ipcRenderer.send('folderDropped', currentFile.path);
        break;
      }
    }
  });
});