// renderer.js
const ipcRend = window.ipcRenderer;

const imageGrid = document.getElementById('imageGrid');

const rawData = fs.readFileSync("preferences.json", 'utf8');
const preferencesData = JSON.parse(rawData);

currentZoom = 1;
currentPadding = .98;

let grid;

ipcRend.invoke('readFile', preferencesData.folderLocation).then(files => {

  files.forEach(file => {
    const imgPath = `${preferencesData.folderLocation}/${file.name}`;
    const imgElement = document.createElement('img');
    imgElement.id = `${file.name}`;
    imgElement.className = "grid-image";

    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.appendChild(imgElement);

    imageGrid.appendChild(gridItem);
  });

  loadImages(files);

  grid = new Masonry('.grid', {
    itemSelector: '.grid-item',
  });

  // Listen for the wheel event to adjust the CSS property
  const gridItems = document.querySelectorAll('.grid-image');
  imageGrid.addEventListener('wheel', event => {
    if (event.ctrlKey) {
      event.preventDefault();

      // Determine the direction of the scroll
      const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
      currentZoom += zoomAmount;
      update_images(gridItems);  
      // Trigger Masonry Layout's layout after changing the CSS property
      grid.layout();    
    }
    else if (event.shiftKey)
    {
      // Determine the direction of the scroll
      const paddingAmount = event.deltaY > 0 ? 0.1 : -0.1;
      currentPadding += paddingAmount;
      currentPadding = Math.max(Math.min(currentPadding, 1), 0.25);
      update_images(gridItems);
      // Trigger Masonry Layout's layout after changing the CSS property
      grid.layout();
    }
  });

  setTimeout(() => { update_images(gridItems); grid.layout(); }, 100);

  window.addEventListener('resize', function(event) {
      update_images(gridItems);
      // Trigger Masonry Layout's layout after changing the CSS property
      grid.layout();
  }, true);

}).catch(err => {
  console.error('Error reading image folder:', err);
});

function update_images(gridItems) {
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

// Lazy loads images. Does so with a bit of a delay
async function loadImages(files) {
  const delay = 15; // Delay in milliseconds

  for (const file of files) {
    const imgPath = `${preferencesData.folderLocation}/${file.name}`;
    const imgElement = document.getElementById(`${file.name}`);
    imgElement.src = imgPath;
    imgElement.classList.add('show');
    await new Promise(resolve => setTimeout(resolve, delay));
    grid.layout();
  }

  // Show done pop up
  const popUp = document.getElementById(`done-pop-up`);
  popUp.classList.add('show');
}
