const MS_PER_DAY = 86400000;

export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / MS_PER_DAY);
}

export function priorityScore(label) {
  const map = { critical: 4, high: 3, medium: 2, low: 1 };
  return map[(label || '').toLowerCase()] ?? 0;
}

// Build weekly workload buckets from task array for the next `weeks` weeks.
// Each task needs: { deadline, duration (hours), done }
export function buildWeeklyWorkload(tasks, weeks = 6) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i * 7);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    return { label, hours: 0, count: 0, weekStart: new Date(d) };
  });

  for (const t of tasks) {
    if (t.done || !t.deadline) continue;
    const due = new Date(t.deadline);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - now) / MS_PER_DAY);
    if (diffDays < 0 || diffDays >= weeks * 7) continue;
    const idx = Math.floor(diffDays / 7);
    buckets[idx].hours += t.duration ?? 0;
    buckets[idx].count += 1;
  }

  return buckets;
}

export const formatDeadline = (iso) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });