import { store } from '../../assets/js/store.js';
import { toast } from '../../assets/js/toast.js';
import { initSelects, initSwitches, openDialog, closeDialog } from '../../assets/js/ui.js';

const API_BASE = '';
const TPL_URL = '../components/addTaskDialog/addTaskDialog.html';
let injected = false;

async function ensureTemplate() {
  if (injected) return;
  const res = await fetch(TPL_URL);
  const html = await res.text();
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstElementChild);
  injected = true;
}

export async function mountAddTaskDialog(triggerSelector) {
  await ensureTemplate();

  const trigger = document.querySelector(triggerSelector);
  if (trigger) trigger.addEventListener('click', () => openDialogWithCourses());

  document.addEventListener('dialog:open', (e) => {
    if (e.detail.id !== 'addTask') return;
    bindForm(e.detail.content);
  });
}

function openDialogWithCourses() {
  const tpl = document.querySelector('[data-dialog="addTask"]');
  if (!tpl) return;

  const opts = tpl.querySelector('[data-course-options]');
  const { courses } = store.getState();
  if (opts) {
    opts.innerHTML = courses.map((c) =>
      `<div class="select-item" data-value="${c.id}">${c.course_code || c.name}</div>`
    ).join('');
  }

  const sel = tpl.querySelector('[data-select]');
  if (sel && courses[0]) sel.dataset.value = courses[0].id;

  const d = new Date();
  d.setDate(d.getDate() + 3);
  const deadlineInput = tpl.querySelector('#atd-deadline');
  if (deadlineInput) deadlineInput.value = d.toISOString().slice(0, 10);

  openDialog('addTask');
}

function bindForm(root) {
  initSelects(root);
  initSwitches(root);

  const form = root.querySelector('[data-add-task-form]');
  const select = root.querySelector('[data-select][data-name="courseId"]');
  const swEl   = root.querySelector('[data-switch][data-name="emergency"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = String(fd.get('title') || '').trim();
    const courseId = select?.dataset.value;

    if (!title) { toast.error('กรุณากรอกชื่องาน'); return; }
    if (!courseId) { toast.error('กรุณาเลือกวิชา'); return; }

    const deadlineVal = String(fd.get('deadline') || '');
    const body = {
      title,
      course_id: Number(courseId),
      duration: (Number(fd.get('duration')) || 0) * 60,
      score_weight: Number(fd.get('scoreWeight')) || 0,
      deadline: deadlineVal || null,
      emergency: swEl?.dataset.state === 'checked',
    };

    try {
      const res = await fetch(`${API_BASE}/api/task/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API error');
      toast.success('เพิ่มงานเรียบร้อย');
      closeDialog('addTask');
      store.refresh();
    } catch {
      toast.error('ไม่สามารถเพิ่มงานได้');
    }
  });
}
