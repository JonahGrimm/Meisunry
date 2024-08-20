// Set up preferences data
let preferencesData;
window.electronAPI.onPreferenceUpdate(() => {
  ipcRend.invoke('loadAppData').then(data => { preferencesData = data; });
});
function updatePreferencesData(callback) {
  ipcRend.invoke('loadAppData').then(data => { preferencesData = data; callback(); });
}
updatePreferencesData(setupImagesInGrid);

// Refreshing controls
window.electronAPI.onRefreshGrid(() => {
  /* Refresh grid */
  console.log('Refreshing grid');
});


window.electronAPI.onSortUpdate((event, value) => {
  console.log('sort update');
  updatePreferencesData(() => { 
    allFiles = resort(allFiles);
    handle_resort(allFiles);
    resortAfterImageLoad = true;
  });
})

window.electronAPI.onFileDeleted((event, deletedFilePath) => {
  /* Fix file path */
  deletedFilePath = deletedFilePath.replace(/\//g, '\\');
  /* Reduce files list */
  allFiles = allFiles.filter(file => file.fullPath !== deletedFilePath);
  /* Update image count on topbar */
  imgCountEl = document.getElementById(`header-image-count`);
  imgCountEl.innerHTML = `${allFiles.length} Images`;
  /* Play image deletion animation and remove it from grid */
  let deletedFile = document.getElementById(deletedFilePath);
  if (deletedFile.tagName === "SOURCE") deletedFile = deletedFile.parentNode
  deletedFile.classList.add(`hide`);
  new Promise((resolve) => setTimeout(() => { 
    imageGrid.removeChild(deletedFile.parentNode); 
    grid.reloadItems();
    grid.layout();
  }, 500));
})

window.electronAPI.onFileAdded((event, newFile) => {
  /* Add to files list */
  allFiles.push(newFile);
  /* Update image count on topbar */
  imgCountEl = document.getElementById(`header-image-count`);
  imgCountEl.innerHTML = `${allFiles.length} Images`;
  /* Append */
  addImage(newFile);
  /* Resort */
  allFiles = resort(allFiles);
  handle_resort(allFiles);
})

window.addEventListener('resize', function(event) {
  updateGridAndSpacing();
  if (is_an_image_focused()) resetPanZoom(focusImg.naturalWidth, focusImg.naturalHeight);
  // Trigger Masonry Layout's layout after changing the CSS property
  grid.layout();
}, true);