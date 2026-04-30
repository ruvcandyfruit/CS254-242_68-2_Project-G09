import { store } from '../../assets/js/store.js';
import { daysUntil, formatDeadline } from '../../assets/js/workload.js';
import { priorityBadge } from '../priorityBadge/priorityBadge.js';
import { initCheckboxes } from '../../assets/js/ui.js';
import { renderIcons } from '../../assets/js/layout.js';

function deadlineText(days) {
  if (days < 0) return `เลยกำหนด ${Math.abs(days)} วัน`;
  if (days === 0) return 'วันนี้';
  if (days === 1) return 'พรุ่งนี้';
  return `อีก ${days} วัน`;
}

export function taskItemHTML(task, courses) {
  const course = courses.find((c) => c.id === task.courseId);
  const days = daysUntil(task.deadline);
  const overdue = days < 0 && !task.done;
  const urgent  = days <= 1 && !task.done;
  const deadlineCls = overdue ? 'meta-overdue' : urgent ? 'meta-urgent' : '';

  return `
    <div class="task-item ${task.done ? 'is-done' : ''}" data-task-id="${task.id}">
      <button class="checkbox" data-checkbox data-state="${task.done ? 'checked' : 'unchecked'}" aria-label="ทำเสร็จ"></button>
      <div class="task-body">
        <div class="task-title-row">
          <h3 class="task-title">${escapeHTML(task.title)}</h3>
          ${priorityBadge(task.priority)}
        </div>
        <div class="task-meta">
          ${course ? `<span><span style="display:inline-block;width:.5rem;height:.5rem;border-radius:9999px;background:hsl(${course.color})"></span>${course.code}</span>` : ''}
          <span><i data-lucide="clock"></i>${task.duration} ชม.</span>
          <span class="${deadlineCls}">${deadlineText(days)} · ${formatDeadline(task.deadline)}</span>
          ${task.scoreWeight > 0 ? `<span>${task.scoreWeight}% คะแนน</span>` : ''}
          ${task.emergency ? `<span style="color:hsl(var(--destructive))"><i data-lucide="alert-circle"></i>ด่วน</span>` : ''}
        </div>
      </div>
      <button class="btn btn-ghost btn-icon btn-sm task-delete" data-delete aria-label="ลบ">
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  `;
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// Wires every .task-item inside `root` to the store.
export function bindTaskItems(root) {
  root.querySelectorAll('.task-item').forEach((el) => {
    const id = el.dataset.taskId;
    const cb = el.querySelector('[data-checkbox]');
    cb.addEventListener('checkbox:change', () => store.toggleTaskDone(id));
    el.querySelector('[data-delete]').addEventListener('click', () => store.deleteTask(id));
  });
  initCheckboxes(root);
  renderIcons();
}
