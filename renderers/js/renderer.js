/**
 * Escapes special characters in file paths
 * @param {string} filePath
 * @returns {string} filePath with special characters escaped
*/
function encodeFilePath(filePath) {
  let escapedPath = "file:///" + filePath.replace(/^file:\/\//, '') // Ensure prefix 'file:///'
    .replace(/\\/g, '/') // Replace backslashes with forward slashes
    .split('/').map(encodeURIComponent).join('/') // Encode each part of the path
    .replace(
      /[!~*'()]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    ) // Encode characters that are not encoded by encodeURIComponent
  return escapedPath;
}


function addImage(file) {
  const gridItem = createImage(file);
  gridItem.style.visibility = "visible";
  if (gridItem == undefined) return;
  grid.appended(gridItem);
  refreshGridLayout();
}

function createImage(file) {
  updateHeaderCounter();

  // Only generate a new element and append it if it doesn't already exist
  const existingEl = document.getElementById(`${file.fullPath}`);
  if (existingEl != null) return;

  // Create div element
  const gridItem = document.createElement('div');
  gridItem.className = 'grid-item';

  let imgElement;
  const imgPath = encodeFilePath(file.fullPath);
  //console.log(file.isImage);
  if (file.isImage === true)
  {
    // Create img element
    imgElement = document.createElement('img');
    //imgElement.loading = "lazy";
    imgElement.src = imgPath;
    imgElement.id = imgPath;
    imgElement.className = "grid-image";

    // Add full screen click event
    imgElement.addEventListener('click', () => {
      if (focusImgVideoWrapper.classList.contains('show')) 
      {
        focusImgVideoWrapper.classList.remove('show');
        return;
      }
      // You can perform operations on the clickedImage here
      focusImgVideoWrapper.classList.add('show');
      focusImg.src = imgPath;
      focusImg.classList.add('show')
      backButton.classList.remove('hide');
      resetFocusImgButton.classList.remove('hide');

      panZoomInstance = panzoom(zoomPanHolder);
      resetPanZoom(focusImg.naturalWidth, focusImg.naturalHeight);
    });
  }
  else
  {
    imgElement = document.createElement('video');
    imgElement.autoplay = true;
    imgElement.muted = true;
    imgElement.loop = true;
    imgElement.className = "grid-image";
    const sourceElement = document.createElement(`source`);
    sourceElement.src = imgPath;
    sourceElement.id = imgPath;
    imgElement.appendChild(sourceElement);
    const audioA = document.createElement(`a`);
    audioA.classList.add(`audio-button`);
    audioA.classList.add(`overlay-circle-button`);
    gridItem.appendChild(audioA);
    
    // Mute function
    audioA.addEventListener('click', () => {
      if (focusImgVideoWrapper.classList.contains('show')) return;
      imgElement.muted = !imgElement.muted;
      if (imgElement.muted) audioA.classList.remove(`unmute`);
      else audioA.classList.add(`unmute`);
    });

    // Add full screen click event
    imgElement.addEventListener('click', () => {
      if (focusImgVideoWrapper.classList.contains('show')) 
      {
        focusImgVideoWrapper.classList.remove('show');
        return;
      }
      // Clear all img settings
      focusImg.src = '';
      zoomPanHolder.style.transformOrigin = `0px 0px 0px`;
      zoomPanHolder.style.transform = `inherit`;

      let zooming = document.body.style.zoom = 1;

      // You can perform operations on the clickedImage here
      focusImgVideoWrapper.classList.add('show');
      focusVideo.querySelector('source').src = imgPath;
      focusVideo.load();
      muteButtonFocus.classList.remove(`hide`);
      backButton.classList.remove('hide');
      // Sync settings
      focusVideo.currentTime = imgElement.currentTime;
      focusVideo.muted = imgElement.muted;
      if (focusVideo.muted) muteButtonFocus.classList.remove(`unmute`);
      else muteButtonFocus.classList.add(`unmute`);
      // Pause original because focus is playing
      imgElement.muted = true;
      imgElement.pause();
      audioA.classList.remove(`unmute`);
    });
  }

  // Nest within div
  gridItem.appendChild(imgElement);

  // Add to grid
  imageGrid.appendChild(gridItem);

  return gridItem;
}

// Initialization
function setupImagesInGrid() {
  ipcRend.invoke('readFilesFromDisk', preferencesData.folderLocation).then(files => {
    console.log(`${preferencesData.folderLocation}`);
  
    resortAfterImageLoad = false;
  
    grid = new Masonry('.grid', {
      itemSelector: '.grid-item',
      gutter: 0,
    });
    
    allFiles = files;
    allFiles = resort(allFiles);
    handle_resort(allFiles);
    loadImages(allFiles);
  
    setTimeout(() => { updateGridAndSpacing(); grid.layout(); }, 100);
  }).catch(err => {
    console.error('Error reading image folder:', err);
  });
}

// Lazy loads images. Does so with a bit of a delays
let loadCallStack = 0;
async function loadImages(input_files) {
  const cached_files = [...input_files];

  updateHeaderCounter();
  noItemsEl = document.getElementById(`no-items-text`);
  headerPathEl = document.getElementById(`header-folder-path`);
  headerPathEl.innerHTML = preferencesData.folderLocation;
  if (cached_files.length == 0)
  {
    if (allFiles.length == 0)
    {
      noItemsEl.classList.add("show");
      pathEl = document.getElementById(`folder-path`);
      pathEl.innerHTML = preferencesData.folderLocation;
    }
    return;
  }
  noItemsEl.classList.remove("show");

  loadCallStack++;
  updateLoadingIcon();

  function waitForResourcesToLoad(elements) {
    const promises = [];
    for (const element of elements) {
      if (!element || element.complete) continue;
      promises.push(new Promise(resolve => {
        element.onload = resolve;
        element.onerror = resolve;
        if (element.complete) resolve();
        setTimeout(resolve, 200);
      }));
    }
    return Promise.all(promises);
  }

  let iter = 0;
  let lastProcessTime = Date.now();
  let batchItems = [];

  const processBatch = async (animate = false) => {
    console.debug('Processing batch of', batchItems.length, 'items (animate:', animate, ')');
    
    let currentBatch = batchItems;
    batchItems = [];

    // Wait for all images in the batch to load
    await waitForResourcesToLoad(currentBatch.map(gridItem => gridItem.querySelector('img, video')));

    // Wait for the batch to be processed (with a timeout)
    await new Promise(resolve => {
      grid.once('layoutComplete', resolve);

      // Add the batch to the grid
      if (animate) {
        for (const gridItem of currentBatch)
          gridItem.style.visibility = 'visible';
        grid.appended(currentBatch);
      } else {
        grid.addItems(currentBatch);
        grid.layout();
      }

      setTimeout(resolve, 100);
    });

    if (!animate)
      for (const gridItem of currentBatch)
        gridItem.style.visibility = 'visible';
  };

  const initialBatchSize = 50;
  const fastBatchSizeLimit = 20;
  const processUpdateDelay = 1000 / 60;
  let batchSize = initialBatchSize;

  console.time('loadImages');

  for (const file of cached_files) {
    const gridItem = createImage(file);
    if (gridItem == undefined) continue;

    const loadSpeed = preferencesData.loadSpeed || 'fast';
    const loadDelay = {
      'medium': 0,
      'slow': 100,
    }[loadSpeed];

    if (loadSpeed.startsWith('fast')) { // Fastest / Fast
      gridItem.style.visibility = 'hidden';
      batchItems.push(gridItem);

      iter++;
      if (batchItems.length >= batchSize || Date.now() - lastProcessTime > processUpdateDelay) {
        batchSize = Math.min(Math.max(batchItems.length * 4, initialBatchSize), 2000);
        await processBatch(loadSpeed !== 'fastest');
        lastProcessTime = Date.now();
      }

      if (loadSpeed === 'fast') batchSize = Math.min(batchSize, fastBatchSizeLimit);

    } else {
      if (batchItems.length > 0) await processBatch();

      grid.appended(gridItem);
      if (loadDelay !== 0 || iter % 10 === 0 || Date.now() - lastProcessTime > processUpdateDelay) {
        grid.layout();
        await new Promise(resolve => setTimeout(resolve, loadDelay));
        lastProcessTime = Date.now();
      }
    }
  }
  if (batchItems.length > 0) await processBatch();
  
  // Wait for all images to load before triggering Masonry Layout
  await waitForResourcesToLoad(imageGrid.querySelectorAll('img, video'));
  grid.layout();

  console.timeEnd('loadImages');

  // Show done pop up
  loadCallStack--;
  updateLoadingIcon();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  for (const file of cached_files) {
    // Only generate a new element and append it if it doesn't already exist
    const existingEl = document.getElementById(`${file.name}`);
    if (existingEl != null) existingEl.classList.add("shown");
  }

  if (resortAfterImageLoad) handle_resort(allFiles);
  resortAfterImageLoad = false;
}

function is_an_image_focused() {
  return focusImg.classList.contains('show');
}

