document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('grid-wrapper');
  const gridOverlay = document.getElementById('grid-overlay');

  dropZone.addEventListener('dragover', (event) => {
    gridOverlay.classList.add('draghover');
    event.preventDefault();
  });

  dropZone.addEventListener('dragenter', (event) => {
    gridOverlay.classList.add('draghover');
    event.preventDefault();
  });
  
  dropZone.addEventListener('dragleave', (event) => {
    gridOverlay.classList.remove('draghover');
    event.preventDefault();
  });

  dropZone.addEventListener('drop', (event) => {
    console.log(`drop`); 
    gridOverlay.classList.remove('draghover');

    // Check if drop is from the web, and if it's an image, download it
    const items = event.dataTransfer.items;    
    for (const item of items) {
      if (item.kind === 'string' && item.type === 'text/uri-list') {
        item.getAsString((url) => { 
          console.log(`${url}`); 
          
        });
      }
    }

    // Check if drop is a local folder, and set our path to this folder if so
    const files = event.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (!currentFile.type && currentFile.size % 4096 == 0) {
        ipcRenderer.send('folderDropped', currentFile.path);
        break;
      }
      if (endsWithValidFile(currentFile.path)) {
        ipcRenderer.send('imageDropped', currentFile.path);
        break;
      }
    }
  });
});

function endsWithValidFile(filename) {
  return filename.match(/\.(jpg|jpeg|png|gif|jfif|webp|mp4|webm|mkv|avi|mov|wmv|flv|mts)$/i)
}