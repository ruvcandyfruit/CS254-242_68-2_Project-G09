import { store } from '../../assets/js/store.js';
import { toast } from '../../assets/js/toast.js';
import { openDialog, closeDialog } from '../../assets/js/ui.js';

const TPL_URL = '../components/addCourseDialog/addCourseDialog.html';
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

export async function mountAddCourseDialog(triggerSelector) {
  await ensureTemplate();
  const trigger = document.querySelector(triggerSelector);
  if (trigger) trigger.addEventListener('click', () => openDialog('addCourse'));

  document.addEventListener('dialog:open', (e) => {
    if (e.detail.id !== 'addCourse') return;
    const root = e.detail.content;
    const form = root.querySelector('[data-add-course-form]');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const code = String(fd.get('code') || '').trim();
      const name = String(fd.get('name') || '').trim();
      if (!code || !name) { toast.error('กรอกข้อมูลให้ครบ'); return; }
      store.addCourse({ code, name, weight: Number(fd.get('weight')) || 3 });
      toast.success('เพิ่มวิชาเรียบร้อย');
      closeDialog('addCourse');
    });
  });
}
