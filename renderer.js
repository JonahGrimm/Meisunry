// renderer.js
const ipcRend = window.ipcRenderer;

const imageGrid = document.getElementById('imageGrid');

rawData = fs.readFileSync("preferences.json", 'utf8');
preferencesData = JSON.parse(rawData);

function updatePreferencesData() {
  rawData = fs.readFileSync("preferences.json", 'utf8');
  preferencesData = JSON.parse(rawData);
}

currentZoom = 1;
currentPadding = .98;

let grid;
let resortAfterImageLoad;

ipcRend.invoke('readFile', preferencesData.folderLocation).then(files => {
  resortAfterImageLoad = false;

  grid = new Masonry('.grid', {
    itemSelector: '.grid-item',
    gutter: 0,
  });

  files = resort(files);
  handle_resort(files);
  loadImages(files);

  window.electronAPI.onSortUpdate((event, value) => {
    console.log('sort update');
    updatePreferencesData();
    files = resort(files);
    handle_resort(files);
    resortAfterImageLoad = true;
  })

  // Lazy loads images. Does so with a bit of a delays
  async function loadImages(input_files) {
    const delay = 5; // Delay in milliseconds
    const cached_files = [...input_files];

    for (const file of cached_files) {
      // Only generate a new element and append it if it doesn't already exist
      const existingEl = document.getElementById(`${file.name}`);
      if (existingEl != null) continue;

      // Create img element
      const imgPath = `${preferencesData.folderLocation}/${file.name}`;
      const imgElement = document.createElement('img');
      imgElement.src = imgPath;
      imgElement.id = `${file.name}`;
      imgElement.className = "grid-image";

      // Create div element
      const gridItem = document.createElement('div');
      gridItem.className = 'grid-item';
      gridItem.appendChild(imgElement);

      // Add to grid
      imageGrid.appendChild(gridItem);
      grid.appended(gridItem);
      grid.reloadItems();
      grid.layout();
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    // Show done pop up
    const popUp = document.getElementById(`done-pop-up`);
    popUp.classList.add('show');

    
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (const file of cached_files) {
      // Only generate a new element and append it if it doesn't already exist
      const existingEl = document.getElementById(`${file.name}`);
      if (existingEl != null) existingEl.classList.add("shown");
    }

    if (resortAfterImageLoad) handle_resort(files);
    resortAfterImageLoad = false;
  }

  // Listen for the wheel event to adjust the CSS property
  imageGrid.addEventListener('wheel', event => {
    if (event.ctrlKey) {
      event.preventDefault();

      // Determine the direction of the scroll
      const zoomAmount = event.deltaY > 0 ? 0.75 : 1.25;
      currentZoom *= zoomAmount;
      currentZoom = Math.max(currentZoom, 0.1);
      update_images();  
      // Trigger Masonry Layout's layout after changing the CSS property
      grid.layout();    
    }
    else if (event.shiftKey)
    {
      // Determine the direction of the scroll
      const paddingAmount = event.deltaY > 0 ? 0.1 : -0.1;
      currentPadding += paddingAmount;
      currentPadding = Math.max(Math.min(currentPadding, 1), 0.25);
      update_images();
      // Trigger Masonry Layout's layout after changing the CSS property
      grid.layout();
    }
  });

  setTimeout(() => { update_images(); grid.layout(); }, 100);

  window.addEventListener('resize', function(event) {
      update_images();
      // Trigger Masonry Layout's layout after changing the CSS property
      grid.layout();
  }, true);

}).catch(err => {
  console.error('Error reading image folder:', err);
});

function update_images() {
  const gridItems = document.querySelectorAll('.grid-image');
  // Get new width
  width = calc_width();
  gridItems.forEach(item => {
    item.style.maxWidth = `${width}px`;
    item.style.minWidth = `${width}px`;
    item.style.transform = `scale(${currentPadding})`;
    // You can adjust other styling properties as needed
  });
  imageGrid.style.transform = `scale(${get_transform_correction_scale()})`;
  imageGrid.style.marginTop = `${(1-currentPadding)*width}px`;
}

function calc_width() {
  originalWidth = (500 * currentZoom);
  return originalWidth;
}

function get_transform_correction_scale() {
  originalWidth = (500 * currentZoom);
  itemsCount = Math.floor((document.body.clientWidth / originalWidth));
  actualPresentedWidth = originalWidth * itemsCount;
  transformScale = (document.body.clientWidth / actualPresentedWidth);
  return transformScale;
}

function resort(files) {
  switch (preferencesData.sortMode) {
    case 'date':
      console.log(`date`);
      files = files.sort((a, b) => b.date - a.date); break;
      case 'name':
      console.log(`name`);
      files = files.sort((a, b) => a.name.localeCompare(b.name)); break;
  }
  return files;
}

function handle_resort(cached_files) {
  cached_files.reverse().forEach(file => {
    const imgElement = document.getElementById(`${file.name}`);
    if (imgElement == null) return;
    const divElement = imgElement.parentElement;
    const parentElement = divElement.parentElement;
    parentElement.insertBefore(divElement, parentElement.firstChild);
  });
  cached_files.reverse();
  grid.reloadItems();
  grid.layout();
}


