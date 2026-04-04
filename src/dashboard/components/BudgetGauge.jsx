import React from 'react';

export function BudgetGauge({ percentageUsed, tone = 'safe', label }) {
  const angle = `${Math.min(100, Math.max(0, percentageUsed)) * 3.6}deg`;
  return (
    <div
      className={`dashboard-budget-gauge ${tone}`}
      style={{ background: `conic-gradient(var(--gauge-color) ${angle}, rgba(255,255,255,0.08) ${angle})` }}
    >
      <div className="dashboard-budget-gauge-inner">
        <strong>{percentageUsed.toFixed(0)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
