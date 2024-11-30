// Timeout to prevent repeat scroll events
let isScrolling = false;
let scrollTimeout = null;
// Auto scroll handler
const defaultAutoScrollSpeed = 2;
let isAutoScrolling = false;
let scrollPosition = 0;
let autoScrollSpeed = 0; // px per animation key
let autoScrollDirection = 1; // 1 = down, -1 = up

// Listen for the wheel event to adjust the CSS property
imageGrid.addEventListener('wheel', event => {
  processWheel(event);
});
gridWrapper.addEventListener('wheel', event => {
  processWheel(event);
});

function processWheel(event) {
  if( isScrolling ){
    return;
  }
  isScrolling = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout( () => {
    isScrolling = false;
  }, 50 );
  if (event.ctrlKey) {
    event.preventDefault();
  
    // Determine the direction of the scroll
    const zoomAmount = event.deltaY > 0 ? 0.8 : 1.2;
    currentZoom *= zoomAmount;
    currentZoom = Math.max(currentZoom, 0.1);
    updateGridAndSpacing();
    // Trigger Masonry Layout's layout after changing the CSS property
    grid.layout();
    // Stop any active auto-scroll
    stopAutoScroll();
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
    // Stop any active auto-scroll
    stopAutoScroll();
  }
  else if (event.altKey)
  {
    event.preventDefault();
    // Determine the direction of the scroll
    const scrollDirection = event.deltaY > 0 ? 1 : -1;
    if( isAutoScrolling ){
      // Already running
      const speedAdjust = autoScrollDirection != scrollDirection ? 0.8 : 1.2;
      autoScrollSpeed *= speedAdjust;
      autoScrollSpeed = Math.max(autoScrollSpeed, 1);
    }
    else
    {
      // Start a new auto-scroll event
      autoScrollSpeed = defaultAutoScrollSpeed;
      autoScrollDirection = scrollDirection;
      scrollPosition = window.scrollY;
      isAutoScrolling = true;
      requestAnimationFrame(autoScrollKeyframe);
    }
  }
  else
  { // Just a plain-old scroll
    stopAutoScroll();
  }
}

function autoScrollKeyframe() {
  if( !isAutoScrolling ){
      return;
  }

  const scrollAmount = autoScrollSpeed * autoScrollDirection;
  scrollPosition += scrollAmount;
  
  window.scrollTo({ top: scrollPosition, behavior: 'instant' });

  requestAnimationFrame(autoScrollKeyframe);
}

function stopAutoScroll(){
    if( isAutoScrolling ){
        isAutoScrolling = false;
    }
}
