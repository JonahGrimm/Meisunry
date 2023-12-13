const header = document.getElementById(`header`);
const wrapper = document.getElementById(`grid-wrapper`);
const overlay = document.getElementById(`grid-overlay`);

function enterFullscreen() {
  header.classList.add(`full-screen`);
  wrapper.classList.add(`full-screen`);
  overlay.classList.add(`full-screen`);
  focusImg.parentNode.classList.add(`full-screen`);
}

function leaveFullscreen() {
  header.classList.remove(`full-screen`);
  wrapper.classList.remove(`full-screen`);
  overlay.classList.remove(`full-screen`);
  focusImg.parentNode.classList.remove(`full-screen`);
}

ipcRend.invoke('getIsFullscreen').then(data => { if (data) enterFullscreen(); });

window.electronAPI.onEnterFullscreen((event, value) => { enterFullscreen(); });
window.electronAPI.onLeaveFullscreen((event, value) => { leaveFullscreen(); });