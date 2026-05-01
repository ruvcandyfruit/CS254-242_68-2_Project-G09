let viewport = null;

function getViewport() {
  if (!viewport) {
    viewport = document.createElement('div');
    viewport.className = 'toast-viewport';
    document.body.appendChild(viewport);
  }
  return viewport;
}

function show(message, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ` toast-${type}` : '');
  el.textContent = message;
  getViewport().appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export const toast = {
  success: (msg) => show(msg, 'success'),
  error:   (msg) => show(msg, 'error'),
  info:    (msg) => show(msg, ''),
};
