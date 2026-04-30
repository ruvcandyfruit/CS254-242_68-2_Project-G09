import { buildWeeklyWorkload } from '../../assets/js/workload.js';

function hsl(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return `hsl(${v})`;
}

export function renderWorkloadChart(canvas, tasks) {
  const data = buildWeeklyWorkload(tasks, 6);
  const max = Math.max(...data.map((d) => d.hours), 1);

  const colors = data.map((d) => {
    const r = d.hours / max;
    if (r > 0.75) return hsl('--destructive');
    if (r > 0.4)  return hsl('--warning');
    return hsl('--primary');
  });

  if (canvas._chart) canvas._chart.destroy();
  canvas._chart = new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [{
        label: 'ภาระงาน',
        data: data.map((d) => d.hours),
        backgroundColor: colors,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 48,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: hsl('--card'),
          titleColor: hsl('--foreground'),
          bodyColor: hsl('--foreground'),
          borderColor: hsl('--border'),
          borderWidth: 1,
          padding: 10, cornerRadius: 12,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} ชม. (${data[ctx.dataIndex].count} งาน)`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false }, border: { display: false },
          ticks: { color: hsl('--muted-foreground'), font: { size: 12, family: 'IBM Plex Sans Thai' } },
        },
        y: {
          grid: { color: hsl('--border'), drawTicks: false },
          border: { display: false },
          ticks: {
            color: hsl('--muted-foreground'),
            font: { size: 12, family: 'IBM Plex Sans Thai' },
            callback: (v) => `${v} ชม.`,
          },
        },
      },
    },
  });
}
