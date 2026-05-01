import { store } from '../../assets/js/store.js';
import { toast } from '../../assets/js/toast.js';
import { initSelects, initSwitches, openDialog, closeDialog } from '../../assets/js/ui.js';

const TPL_URL = '../components/addTaskDialog/addTaskDialog.html';

let injected = false;

async function ensureTemplate() {
  if (injected) return;

  const res = await fetch(TPL_URL);
  const html = await res.text();

  const wrap = document.createElement('div');
  wrap.innerHTML = html;

  const dialog = wrap.querySelector('[data-dialog="addTask"]');

  if (!dialog) {
    throw new Error('addTask dialog template not found');
  }

  document.body.appendChild(dialog);

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
  // refresh course options inside the template before cloning
  const tpl = document.querySelector('[data-dialog="addTask"]');
  const opts = tpl.querySelector('[data-course-options]');
  const { courses } = store.getState();
  opts.innerHTML = courses.map((c) => `<div class="select-item" data-value="${c.id}">${c.code} — ${c.name}</div>`).join('');
  // pre-select first course on the source template
  const sel = tpl.querySelector('[data-select]');
  if (courses[0]) sel.dataset.value = courses[0].id;

  // default deadline = today + 3 days
  const d = new Date(); d.setDate(d.getDate() + 3);
  tpl.querySelector('#atd-deadline').value = d.toISOString().slice(0, 10);

  openDialog('addTask');
}

function bindForm(root) {
  initSelects(root);
  initSwitches(root);

  const form = root.querySelector('[data-add-task-form]');
  const select = root.querySelector('[data-select][data-name="courseId"]');
  const swEl   = root.querySelector('[data-switch][data-name="emergency"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = String(fd.get('title') || '').trim();
    const courseId = select.dataset.value;
    if (!title || !courseId) { toast.error('กรอกข้อมูลให้ครบ'); return; }

    store.addTask({
      title,
      courseId,
      duration: Number(fd.get('duration')) || 0,
      scoreWeight: Number(fd.get('scoreWeight')) || 0,
      deadline: new Date(String(fd.get('deadline'))).toISOString(),
      emergency: swEl.dataset.state === 'checked',
      done: false,
    });
    toast.success('เพิ่มงานเรียบร้อย');
    closeDialog('addTask');
  });
}
