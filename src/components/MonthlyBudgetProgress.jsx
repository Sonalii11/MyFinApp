import React from 'react';
import { Card, Tag } from './UI';
import { formatCurrency } from '../utils/finance';

export default function MonthlyBudgetProgress({ monthlyProgress }) {
  const angle = `${Math.min(100, monthlyProgress.progress.clampedPercent) * 3.6}deg`;

  return (
    <Card className="monthly-progress-card">
      <div className="sec-header">
        <span className="sec-title">Monthly Budget Progress</span>
        <Tag variant={monthlyProgress.progress.isOverspent ? 'red' : 'green'}>
          4-week rollup
        </Tag>
      </div>

      <div className="progress-ring-row">
        <div
          className={`progress-ring${monthlyProgress.progress.isOverspent ? ' danger' : ''}`}
          style={{
            background: `conic-gradient(${monthlyProgress.progress.isOverspent ? 'var(--red)' : 'var(--accent)'} ${angle}, rgba(255,255,255,0.08) ${angle})`,
          }}
        >
          <div className="progress-ring-inner">
            <strong>{monthlyProgress.progress.usedPercent.toFixed(0)}%</strong>
            <span>used</span>
          </div>
        </div>

        <div className="monthly-progress-copy">
          <div>
            <span>Spent</span>
            <strong>{formatCurrency(monthlyProgress.spent)}</strong>
          </div>
          <div>
            <span>Monthly limit</span>
            <strong>{formatCurrency(monthlyProgress.limit)}</strong>
          </div>
          <div>
            <span>Window</span>
            <strong>{monthlyProgress.rangeLabel}</strong>
          </div>
        </div>
      </div>

      <div className={`monthly-progress-note${monthlyProgress.progress.isOverspent ? ' danger' : ''}`}>
        {monthlyProgress.weekText}
        {monthlyProgress.progress.isOverspent
          ? ` · Overspend by ${formatCurrency(monthlyProgress.progress.overspendAmount)}`
          : ` · ${formatCurrency(monthlyProgress.progress.remaining)} remaining`}
      </div>
    </Card>
  );
}
