function updateLoadingIcon() {
  if (loadCallStack > 0) {
    // Loading
    donePopUp.classList.remove('show');
    loadIcon.classList.add('show');
  }
  if (loadCallStack == 0)  {
    // Not loading
    donePopUp.classList.add('show');
    loadIcon.classList.remove('show');
  }
}