import { requireAuth, loadFragment } from '../../assets/js/layout.js';
import { mountSidebar } from '../sidebar/sidebar.js';

// Wraps a protected page. pageHTML = string of inner content for <div data-page-slot>.
// activeRoute: 'dashboard' | 'tasks' | 'courses'
export async function mountAppShell({ activeRoute, container = document.getElementById('app') }) {
  if (!requireAuth()) return null;
  await loadFragment('../components/appShell/appShell.html', container);
  await mountSidebar(container.querySelector('[data-sidebar-slot]'), activeRoute);
  return container.querySelector('[data-page-slot]');
}
