import { store } from '../../assets/js/store.js';
import { daysUntil } from '../../assets/js/workload.js';
import { renderIcons } from '../../assets/js/layout.js';

export function renderUrgentBanner(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const { tasks } = store.getState();
  const active = tasks.filter((t) => !t.done);
  const overdue = active.filter((t) => daysUntil(t.deadline) < 0);
  const dueSoon = active.filter((t) => { const d = daysUntil(t.deadline); return d >= 0 && d <= 1; });
  const total = overdue.length + dueSoon.length;

  if (total === 0) { el.innerHTML = ''; return; }
  const critical = overdue.length > 0;
  const tone = critical ? 'tone-critical' : 'tone-warn';
  const message = critical
    ? `คุณมีงานเลยกำหนด ${overdue.length} งาน${dueSoon.length > 0 ? ` และอีก ${dueSoon.length} งานครบกำหนดเร็วๆ นี้` : ''}`
    : `คุณมีงานครบกำหนดภายใน 24 ชม. จำนวน ${dueSoon.length} งาน`;

  el.innerHTML = `
    <div role="alert" class="urgent-banner ${tone} animate-fade-in">
      <i data-lucide="alert-triangle"></i>
      <div class="ub-body">
        <div class="ub-title">${critical ? 'ต้องทำด่วน!' : 'เตือนล่วงหน้า'}</div>
        <div class="ub-msg">${message}</div>
      </div>
      <div class="ub-actions">
        <a class="btn btn-ghost btn-sm" href="../allTasks/allTasks.html">ดูงาน <i data-lucide="arrow-right"></i></a>
        <button class="btn btn-ghost btn-icon btn-sm" data-dismiss aria-label="ปิดการแจ้งเตือน">
          <i data-lucide="x"></i>
        </button>
      </div>
    </div>`;
  el.querySelector('[data-dismiss]').addEventListener('click', () => { el.innerHTML = ''; });
  renderIcons();
}
