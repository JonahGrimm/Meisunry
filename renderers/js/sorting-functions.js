// Functions for updating the width, scale, and spacing
function updateGridAndSpacing() {
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
    case 'newest':
      console.log(`sorting by newest`);
      files = files.sort((a, b) => b.date - a.date); break;
    case 'oldest':
      console.log(`sorting by oldest`);
      files = files.sort((a, b) => b.date - a.date); 
      files = files.reverse(); break;
    case 'name-a':
      console.log(`sorting by name a to z`);
      files = files.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-z':
      console.log(`sorting by name z to a`);
      files = files.sort((a, b) => a.name.localeCompare(b.name));
      files = files.reverse(); break;
    case 'type-a':
      console.log(`sorting by type a to z`);
      files = files.sort(sortByExtension); break;
    case 'type-z':
      console.log(`sorting by type z to a`);
      files = files.sort(sortByExtension);
      files = files.reverse(); break;
    case 'random':
      console.log(`sorting randomly`);
      for (let i = files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [files[i], files[j]] = [files[j], files[i]];
      }
      break;
  }
  return files;
}

// Custom sorting function to sort by file extension
function sortByExtension(a, b) {
  const extA = a.name.split('.').pop().toLowerCase(); // Get the extension of file A
  const extB = b.name.split('.').pop().toLowerCase(); // Get the extension of file B

  if (extA < extB) {
    return -1; // A should come before B
  }
  if (extA > extB) {
    return 1; // A should come after B
  }
  return 0; // A and B are of the same type
}

function handle_resort(cached_files) {
  cached_files.reverse().forEach(file => {
    const imgElement = document.getElementById(`${file.fullPath}`);
    if (imgElement == null) return;
    const divElement = imgElement.parentElement;
    const parentElement = divElement.parentElement;
    parentElement.insertBefore(divElement, parentElement.firstChild);
  });
  cached_files.reverse();
  grid.reloadItems();
  grid.layout();
}