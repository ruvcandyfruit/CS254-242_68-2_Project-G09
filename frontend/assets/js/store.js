const API_BASE = 'http://127.0.0.1:5000';

function loadUser() {
  const id =
    sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
  const username =
    sessionStorage.getItem('username') || localStorage.getItem('username') || 'นักศึกษา';
  const email =
    sessionStorage.getItem('email') || localStorage.getItem('email') || '';
  return { user_id: id ? Number(id) : null, name: username, email };
}

let _state = { user: loadUser(), tasks: [], courses: [] };
const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn(_state));
}

async function loadCourses() {
  try {
    const res = await fetch(`${API_BASE}/api/course`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    _state = { ..._state, courses: Array.isArray(data) ? data : data.courses ?? [] };
  } catch (e) {
    console.warn('store: loadCourses failed', e);
  }
}

async function loadTasks() {
  try {
    const res = await fetch(`${API_BASE}/api/task/prioritized`, { credentials: 'include' });
    if (!res.ok) return;
    const raw = await res.json();
    const tasks = raw.map((t) => ({
      id: t.id,
      name: t.title,
      description: t.description || '',
      deadline: t.deadline ? t.deadline.split('T')[0] : null,
      duration: t.duration ? Math.round(t.duration / 60) : 0,
      emergency: t.emergency,
      scoreWeight: t.score_weight,
      status: t.status || 'pending',
      done: t.status === 'done',
      priority: (t.priority?.label ?? 'LOW').toLowerCase(),
      priorityLabel: t.priority?.label ?? 'LOW',
      course: t.course?.course_code || t.course?.name || 'ทั่วไป',
      courseId: t.course?.id ?? null,
    }));
    _state = { ..._state, tasks };
  } catch (e) {
    console.warn('store: loadTasks failed', e);
  }
}

async function refresh() {
  _state = { ..._state, user: loadUser() };
  await Promise.all([loadCourses(), loadTasks()]);
  notify();
}

refresh();

export const store = {
  getState: () => _state,
  subscribe(fn) {
    _listeners.add(fn);
    fn(_state);
    return () => _listeners.delete(fn);
  },
  refresh,
  logout() {
    sessionStorage.clear();
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  },
};
