import { store } from '../assets/js/store.js';
import { renderIcons } from '../assets/js/layout.js';
import { mountAppShell } from '../components/appShell/appShell.js';
import { renderUrgentBanner } from '../components/urgentBanner/urgentBanner.js';
import { taskItemHTML, bindTaskItems } from '../components/taskItem/taskItem.js';
import { mountAddTaskDialog } from '../components/addTaskDialog/addTaskDialog.js';
import { renderWorkloadChart } from '../components/workloadChart/workloadChart.js';
import { priorityScore, daysUntil } from '../assets/js/workload.js';

(async () => {
  const slot = await mountAppShell({ activeRoute: 'dashboard' });
  if (!slot) return;

  // inject page template
  const tpl = document.getElementById('dashboard-tpl');
  slot.appendChild(tpl.content.cloneNode(true));

  // chart placeholder
  const chartHost = slot.querySelector('[data-chart-slot]');
  chartHost.innerHTML = '<div class="workload-chart-wrap"><canvas data-workload-canvas></canvas></div>';
  const canvas = chartHost.querySelector('[data-workload-canvas]');

  await mountAddTaskDialog('#open-add-task');

  function update() {
    const { tasks, user } = store.getState();
    const active = tasks.filter((t) => !t.done);
    const totalHours = active.reduce((s, t) => s + t.duration, 0);
    const urgent = active.filter((t) => daysUntil(t.deadline) <= 2).length;
    const doneCount = tasks.filter((t) => t.done).length;

    slot.querySelector('[data-greeting]').textContent =
      `สวัสดี, ${user?.name?.split(' ')[0] ?? 'นักศึกษา'} 👋`;
    slot.querySelector('[data-stat-active]').textContent = active.length;
    slot.querySelector('[data-stat-hours]').textContent  = `${totalHours} ชม.`;
    slot.querySelector('[data-stat-urgent]').textContent = urgent;
    slot.querySelector('[data-stat-done]').textContent   = doneCount;

    renderUrgentBanner(slot.querySelector('[data-urgent-slot]'));

    const top = [...active].sort((a, b) => {
      const ps = priorityScore(b.priority) - priorityScore(a.priority);
      if (ps !== 0) return ps;
      return daysUntil(a.deadline) - daysUntil(b.deadline);
    }).slice(0, 5);

    const list = slot.querySelector('[data-priority-list]');
    if (top.length === 0) {
      list.innerHTML = '<p class="text-sm text-muted-foreground text-center" style="padding:2rem 0;">ไม่มีงานค้าง 🎉</p>';
    } else {
      list.innerHTML = top.map((t) => taskItemHTML(t, store.getState().courses)).join('');
      bindTaskItems(list);
    }

    renderWorkloadChart(canvas, tasks);
    renderIcons();
  }

  store.subscribe(update);
})();
