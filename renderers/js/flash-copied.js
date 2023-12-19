const urlEl = document.getElementById('copied-url');

window.electronAPI.onFlashCopied(async (event, value) => {
  urlEl.parentNode.parentNode.classList.remove('show');
  await show();
  async function show() {
    await new Promise(resolve => setTimeout(resolve, 10));
    urlEl.parentNode.parentNode.classList.add('show');
    urlEl.innerText = value;
  }
})