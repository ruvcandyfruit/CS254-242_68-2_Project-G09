export function requireAuth() {
  const id =
    sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
  if (!id) {
    // all protected pages sit one level deep (dashboard/, allTasks/ etc.)
    window.location.href = '/login/login.html';
    return false;
  }
  return true;
}

export async function loadFragment(url, target) {
  const res = await fetch(url);
  if (!res.ok) return;
  const html = await res.text();
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) el.innerHTML = html;
}

export function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}
