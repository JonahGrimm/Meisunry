// Listen for the wheel event to adjust the CSS property
imageGrid.addEventListener('wheel', event => {
  processWheel(event);
});
gridWrapper.addEventListener('wheel', event => {
  processWheel(event);
});

// Track shift for multi-select UX
window.addEventListener('keydown', (e) => { if (e.key === 'Shift') isShiftDown = true; });
window.addEventListener('keyup', (e) => { if (e.key === 'Shift') { isShiftDown = false; if (selectedFullPaths.size > 0) showMultiFocus(); } });

function processWheel(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  
    // Determine the direction of the scroll
    const zoomAmount = event.deltaY > 0 ? 0.75 : 1.25;
    currentZoom *= zoomAmount;
    currentZoom = Math.max(currentZoom, 0.1);
    updateGridAndSpacing();  
    // Trigger Masonry Layout's layout after changing the CSS property
    grid.layout();    
  }
  else if (event.shiftKey)
  {
    // Determine the direction of the scroll
    const paddingAmount = event.deltaY > 0 ? 0.1 : -0.1;
    currentPadding += paddingAmount;
    currentPadding = Math.max(Math.min(currentPadding, 1), 0.25);
    updateGridAndSpacing();
    // Trigger Masonry Layout's layout after changing the CSS property
    grid.layout();
  }
}

function showMultiFocus() {
  // Build responsive flex of selected images, full height without stretching
  multiFlex.innerHTML = '';
  const sorted = Array.from(selectedFullPaths);
  for (const fullPath of sorted) {
    const isImage = /\.(jpg|jpeg|png|gif|jfif|webp)$/i.test(fullPath);
    if (isImage) {
      const img = document.createElement('img');
      img.src = fullPath;
      img.className = 'multi-image';
      multiFlex.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.className = 'multi-video';
      const src = document.createElement('source');
      src.src = fullPath;
      video.appendChild(src);
      multiFlex.appendChild(video);
    }
  }
  if (sorted.length > 0) {
    multiFocusWrapper.classList.add('show');
    // Hide single-focus controls if visible
    focusImgVideoWrapper.classList.remove('show');
    backButton.classList.remove('hide');
    resetFocusImgButton.classList.add('hide');
    muteButtonFocus.classList.add('hide');
  }
}