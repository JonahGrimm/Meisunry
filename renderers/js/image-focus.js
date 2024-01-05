// Add a click event listener to the focused image
focusImg.addEventListener('click', () => {
  hideFocusImg();
});

// Add a click event listener to the focused video
focusVideo.addEventListener('click', () => {
  hideFocusImg();
});

muteButtonFocus.addEventListener('click', () => {
  focusVideo.muted = !focusVideo.muted;
  if (focusVideo.muted) muteButtonFocus.classList.remove(`unmute`);
  else muteButtonFocus.classList.add(`unmute`);
});

function hideFocusImg() {
  // Hide
  focusImg.parentNode.classList.remove('show');
  source = focusVideo.querySelector('source').src;
  if (source !== null && source !== "") {
    source = source.replace("file:///", "").replace(/%20/g, ' ').replace(/\//g, "\\");
    gridVideo = document.getElementById(source).parentNode;
    gridVideo.play();
    gridVideo.currentTime = focusVideo.currentTime;
    gridVideo.muted = focusVideo.muted;
    aEl = gridVideo.parentNode.querySelector('a')
    if (gridVideo.muted) aEl.classList.remove(`unmute`);
    else aEl.classList.add(`unmute`);
  }
  muteButtonFocus.classList.add(`hide`);
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