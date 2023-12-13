// Add a click event listener to the focused image
focusImg.addEventListener('click', () => {
  // Perform actions when the image is clicked
  // For example, you can send an IPC message to the main process
  focusImg.parentNode.classList.remove('show');
});