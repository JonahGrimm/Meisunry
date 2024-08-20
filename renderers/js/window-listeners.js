// Set up preferences data
let preferencesData;
window.electronAPI.onPreferenceUpdate(() => {
  ipcRend.invoke('loadAppData').then(data => { preferencesData = data; });
});
function updatePreferencesData(callback) {
  ipcRend.invoke('loadAppData').then(data => { preferencesData = data; callback(); });
}
updatePreferencesData(setupImagesInGrid);


window.electronAPI.onRefreshGrid(() => {
  /* Refresh grid */
  console.log('Refreshing grid');
  ipcRend.invoke('readFilesFromDisk', preferencesData.folderLocation).then(b => {

    // Add newly added items
    let itemsNotInAllFiles = b.filter(itemB => 
      !allFiles.some(itemA => itemA.fullPath === itemB.fullPath)
    );
    allFiles = allFiles.concat(itemsNotInAllFiles);


    // Remove deleted items
    let itemsMissingFromFiles = allFiles.filter(itemA => 
      !b.some(itemB => itemB.fullPath === itemA.fullPath)
    );
    itemsMissingFromFiles.forEach (item => {
      removeFromGrid(item.fullPath, true);
    });

    let time = 100;
    if (itemsMissingFromFiles.length > 0) time = 510;
    // We want to update the grid all at once rather then queue it a million times
    new Promise((resolve) => setTimeout(() => { 
      allFiles = resort(allFiles);
      handle_resort(allFiles);
      refreshGridLayout();
    }, time));

    updateHeaderCounter();
    // Trigger load images call
    loadImages(itemsNotInAllFiles);
    resortAfterImageLoad = true;
  });
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
  /* Update image count on topbar */
  updateHeaderCounter();
  // Rm from grid
  /* Play image deletion animation and remove it from grid */
  removeFromGrid(deletedFilePath)
})

function removeFromGrid(deletedFilePath, dontRefreshGrid)
{
  /* Reduce files list */
  allFiles = allFiles.filter(file => file.fullPath !== deletedFilePath);
  let deletedFile = document.getElementById(deletedFilePath);
  if (deletedFile.tagName === "SOURCE") deletedFile = deletedFile.parentNode
  deletedFile.classList.add(`hide`);

  new Promise((resolve) => setTimeout(() => { 
    imageGrid.removeChild(deletedFile.parentNode); 
    if (!dontRefreshGrid) refreshGridLayout();
  }, 500));
}

window.electronAPI.onFileAdded((event, newFile) => {
  /* Add to files list */
  allFiles.push(newFile);
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