import { store } from '../../assets/js/store.js';
import { loadFragment, renderIcons } from '../../assets/js/layout.js';

export async function mountSidebar(target, activeRoute) {
  await loadFragment('../components/sidebar/sidebar.html', target);

  const root = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!root) return;

  // active link
  root.querySelectorAll('[data-route]').forEach((a) => {
    if (a.dataset.route === activeRoute) {
      a.classList.add('active');
    }
  });

  // user info
  const { user } = store.getState();

  const name = user?.name || 'นักศึกษา';
  const email = user?.email || '';

  const nameEl = root.querySelector('[data-sidebar-name]');
  const emailEl = root.querySelector('[data-sidebar-email]');
  const avatarEl = root.querySelector('[data-sidebar-avatar]');

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = (name[0] || 'S').toUpperCase();

  // logout
  const logoutBtn = root.querySelector('[data-logout]');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logout();
      window.location.href = '../login/login.html';
    });
  }

  renderIcons();
}