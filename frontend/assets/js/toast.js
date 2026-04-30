// Minimal toast notification.
function ensureViewport() {
  let v = document.querySelector('.toast-viewport');
  if (!v) {
    v = document.createElement('div');
    v.className = 'toast-viewport';
    document.body.appendChild(v);
  }
  return v;
}

function show(message, kind = '') {
  const v = ensureViewport();
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ` toast-${kind}` : '');
  el.textContent = message;
  v.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

export const toast = {
  success: (m) => show(m, 'success'),
  error:   (m) => show(m, 'error'),
  info:    (m) => show(m),
};
