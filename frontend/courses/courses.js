const API_BASE = '';
let courses = [];

async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/api/course/`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    courses = Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('fetchCourses failed', e);
  }
}

async function fetchTaskCount(courseId) {
  try {
    const res = await fetch(`${API_BASE}/api/task/prioritized`, { credentials: 'include' });
    if (!res.ok) return 0;
    const tasks = await res.json();
    return tasks.filter(t => t.course?.id === courseId).length;
  } catch {
    return 0;
  }
}

function courseCardHTML(course, taskCount) {
  const code = course.course_code || '';
  const name = course.name || 'ไม่มีชื่อ';
  const weight = course.course_weight || 0;
  return `
    <div class="course-card" data-id="${course.id}">
      <div class="course-card-top">
        <div class="course-icon"><i data-lucide="book-open"></i></div>
        ${code ? `<span class="course-code-badge">${code}</span>` : ''}
      </div>
      <div>
        <div class="course-name">${name}</div>
        <div class="course-meta">${weight} หน่วยกิต</div>
      </div>
      <div class="course-card-footer">
        <span class="task-count"><strong>${taskCount}</strong> งาน</span>
        <button class="btn btn-ghost btn-icon btn-sm text-destructive" data-delete="${course.id}" aria-label="ลบวิชา">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>`;
}

async function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  const empty = document.getElementById('coursesEmpty');

  if (courses.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(empty);
    empty.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
    return;
  }

  empty.style.display = 'none';

  const res = await fetch(`${API_BASE}/api/task/prioritized`, { credentials: 'include' }).catch(() => null);
  let allTasks = [];
  if (res && res.ok) allTasks = await res.json();

  grid.innerHTML = courses.map(c => {
    const count = allTasks.filter(t => t.course?.id === c.id).length;
    return courseCardHTML(c, count);
  }).join('');
  grid.appendChild(empty);

  if (window.lucide) lucide.createIcons();

  grid.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteCourse(Number(btn.dataset.delete)));
  });
}

async function deleteCourse(id) {
  if (!confirm('ต้องการลบวิชานี้? งานทั้งหมดในวิชาจะถูกลบด้วย')) return;
  try {
    const res = await fetch(`${API_BASE}/api/course/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('delete failed');
    courses = courses.filter(c => c.id !== id);
    renderCourses();
  } catch (e) {
    alert('ไม่สามารถลบวิชาได้');
  }
}

/* Modal */
const modal = document.getElementById('addCourseModal');

function openModal() {
  document.getElementById('inputCode').value = '';
  document.getElementById('inputName').value = '';
  document.getElementById('inputWeight').value = '3';
  modal.classList.add('open');
  document.getElementById('inputName').focus();
}

function closeModal() {
  modal.classList.remove('open');
}

document.getElementById('btnAddCourse').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

modal.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('inputName').value.trim();
  if (!name) { document.getElementById('inputName').focus(); return; }
  const code = document.getElementById('inputCode').value.trim();
  const weight = parseInt(document.getElementById('inputWeight').value) || 3;

  try {
    const res = await fetch(`${API_BASE}/api/course/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, course_code: code, course_weight: weight }),
    });
    if (!res.ok) throw new Error('add failed');
    const newCourse = await res.json();
    courses.push(newCourse);
    closeModal();
    renderCourses();
  } catch (e) {
    alert('ไม่สามารถเพิ่มวิชาได้');
  }
});

fetchCourses().then(renderCourses);
