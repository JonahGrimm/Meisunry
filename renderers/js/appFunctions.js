
closeBtn.addEventListener('click', () => { 
  ipcRenderer.send('closeApp');
});
minimizeBtn.addEventListener('click', () => { 
  ipcRenderer.send('minimizeApp');
});
maxResBtn.addEventListener('click', () => { 
  ipcRenderer.send('maximizeApp');
});

function updateHeaderCounter() {
  /* Update image count on topbar */
  imgCountEl = document.getElementById(`header-image-count`);
  imgCountEl.innerHTML = `${allFiles.length} Items`;
}