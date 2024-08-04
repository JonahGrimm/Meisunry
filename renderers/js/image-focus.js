// When you click down and release quick enough, exit full screen focus
let downTime;
focusImgVideoWrapper.onmousedown = (e) => {
  downTime = performance.now();
};
focusImgVideoWrapper.onmouseup = (e) => {
  if (performance.now() - downTime < 150) hideFocusImg();
};

// Exit full screen button
backButton.addEventListener('click', () => {
  hideFocusImg();
});


// Reset image pan/size button
resetFocusImgButton.addEventListener('click', () => {
  resetPanZoom(focusImg.naturalWidth, focusImg.naturalHeight);
});

// Pause/resume
focusVideo.addEventListener('click', () => {
  //focusVideo.resume
});

function resetPanZoom(elemWid, elemHei) {
  extraTopPadding = header.classList.contains('full-screen') ? 0 : 100;
  const screenSize = {
    "w": Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    "h": Math.max(document.documentElement.clientHeight, window.innerHeight || 0)-extraTopPadding
  };
  let initalZoom = Math.min(screenSize.w / elemWid, screenSize.h / elemHei);
  //console.log(`img: ${elemWid} x ${elemHei} screenSize: ${screenSize.w} x ${screenSize.h} zoom: ${initalZoom}` );
  panZoomInstance.zoomAbs(0, 0, initalZoom);
  panZoomInstance.moveTo((screenSize.w - elemWid * initalZoom) / 2, (screenSize.h - elemHei * initalZoom) / 2);
}

muteButtonFocus.addEventListener('click', () => {
  focusVideo.muted = !focusVideo.muted;
  if (focusVideo.muted) muteButtonFocus.classList.remove(`unmute`);
  else muteButtonFocus.classList.add(`unmute`);
});

function hideFocusImg() {
  // Hide
  panZoomInstance.dispose();
  focusImg.classList.remove('show');
  focusImgVideoWrapper.classList.remove('show');
  source = focusVideo.querySelector('source').src;
  if (source !== null && source !== "") {
    source = source.replace("file:///", "").replace(/%20/g, ' ').replace(/\//g, "\\");
    gridVideo = document.getElementById(source);
    if (gridVideo !== null) {
      gridVideo = gridVideo.parentNode;
      gridVideo.play();
      gridVideo.currentTime = focusVideo.currentTime;
      gridVideo.muted = focusVideo.muted;
      aEl = gridVideo.parentNode.querySelector('a')
      if (gridVideo.muted) aEl.classList.remove(`unmute`);
      else aEl.classList.add(`unmute`);
    }
  }
  // Hide full screen buttons
  backButton.classList.add(`hide`);
  muteButtonFocus.classList.add(`hide`);
  resetFocusImgButton.classList.add(`hide`);

  focusVideo.querySelector('source').src = ``;
  focusVideo.muted = true;
  focusVideo.load();
  // Clear text selection
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) { // For older versions of IE
    document.selection.empty();
  }
}

window.electronAPI.onHideFocusImg((event, value) => { hideFocusImg(); });