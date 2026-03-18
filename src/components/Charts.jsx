import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

const TICK  = { color: '#7777aa', font: { size: 11, family: 'DM Sans' } };
const GRID  = { color: 'rgba(255,255,255,0.04)' };
const commonOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

/* ── LINE CHART ─────────────────────────────────────────── */
export function LineChart({ data, labels, color = '#6c5ce7', height = 180 }) {
  const cfg = {
    labels,
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: color + '18',
      borderWidth: 2.5,
      fill: true,
      tension: 0.45,
      pointRadius: 3,
      pointBackgroundColor: color,
      pointBorderColor: 'transparent',
      pointHoverRadius: 6,
    }],
  };
  const opts = {
    ...commonOpts,
    scales: {
      x: { grid: GRID, ticks: TICK },
      y: { grid: GRID, ticks: { ...TICK, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } },
    },
    plugins: {
      ...commonOpts.plugins,
      tooltip: {
        backgroundColor: '#1b1b28',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: { label: c => ` ₹${c.raw.toLocaleString()}` },
      },
    },
  };
  return (
    <div style={{ position: 'relative', height }}>
      <Line data={cfg} options={opts} />
    </div>
  );
}

/* ── BAR CHART ──────────────────────────────────────────── */
export function BarChart({ data, labels, color = '#6c5ce7', height = 180 }) {
  const cfg = {
    labels,
    datasets: [{
      data,
      backgroundColor: data.map((_, i) => {
        const hue = 250 + i * 18;
        return `hsla(${hue},80%,70%,0.75)`;
      }),
      borderRadius: 7,
      borderSkipped: false,
    }],
  };
  const opts = {
    ...commonOpts,
    scales: {
      x: { grid: { display: false }, ticks: TICK },
      y: { grid: GRID, ticks: { ...TICK, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } },
    },
    plugins: {
      ...commonOpts.plugins,
      tooltip: {
        backgroundColor: '#1b1b28',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: { label: c => ` ₹${c.raw.toLocaleString()}` },
      },
    },
  };
  return (
    <div style={{ position: 'relative', height }}>
      <Bar data={cfg} options={opts} />
    </div>
  );
}

/* ── DONUT CHART ────────────────────────────────────────── */
export function DonutChart({ data, labels, colors, height = 200 }) {
  const cfg = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const opts = {
    ...commonOpts,
    cutout: '72%',
    plugins: {
      ...commonOpts.plugins,
      tooltip: {
        backgroundColor: '#1b1b28',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: { label: c => ` ₹${c.raw.toLocaleString()}` },
      },
    },
  };
  return (
    <div style={{ position: 'relative', height }}>
      <Doughnut data={cfg} options={opts} />
    </div>
  );
}

/* ── AREA CHART (multi-series) ──────────────────────────── */
export function AreaChart({ datasets, labels, height = 200 }) {
  const cfg = { labels, datasets };
  const opts = {
    ...commonOpts,
    scales: {
      x: { grid: GRID, ticks: TICK },
      y: { grid: GRID, ticks: { ...TICK, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } },
    },
    plugins: {
      ...commonOpts.plugins,
      legend: { display: true, labels: { color: '#7777aa', font: { size: 11 }, boxWidth: 12 } },
      tooltip: {
        backgroundColor: '#1b1b28',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: { label: c => ` ${c.dataset.label}: ₹${c.raw.toLocaleString()}` },
      },
    },
  };
  return (
    <div style={{ position: 'relative', height }}>
      <Line data={cfg} options={opts} />
    </div>
  );
}
