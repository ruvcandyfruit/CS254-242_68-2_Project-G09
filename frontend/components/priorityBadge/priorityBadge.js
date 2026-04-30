const labels = { HIGH: 'สำคัญมาก', MEDIUM: 'ปานกลาง', LOW: 'ทั่วไป' };

export function priorityBadge(priority) {
  return `<span class="priority-badge priority-${priority}">${labels[priority] || priority}</span>`;
}
