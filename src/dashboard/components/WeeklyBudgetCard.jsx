import React from 'react';
import { Btn, Card, Tag } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';
import { getBudgetTone } from '../selectors';

const WEEKLY_STATUS_LABELS = {
  'on-track': 'On track',
  'near-limit': 'Near limit',
  exceeded: 'Exceeded',
};

export function WeeklyBudgetCard({ summary, onViewWeeklyBudget, onAdjustBudget }) {
  const tone = getBudgetTone(summary.status);
  const usedWidth = `${Math.min(100, Math.max(6, summary.percentageUsed))}%`;

  return (
    <Card className="dashboard-module-card dashboard-weekly-budget-card">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Weekly Budget Highlight</span>
          <div className="sec-title">This Week</div>
        </div>
        <Tag variant={tone === 'danger' ? 'red' : tone === 'warning' ? 'orange' : 'green'}>
          {WEEKLY_STATUS_LABELS[summary.status]}
        </Tag>
      </div>

      <div className="budget-highlight-grid">
        <div>
          <span className="dashboard-kpi-label">Current week budget</span>
          <strong className="dashboard-kpi-value">{formatCurrency(summary.budget)}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">Week spent</span>
          <strong className="dashboard-kpi-value">{formatCurrency(summary.spent)}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">{summary.remaining >= 0 ? 'Week remaining' : 'Over by'}</span>
          <strong className={`dashboard-kpi-value ${summary.remaining < 0 ? 'down' : 'up'}`}>
            {formatCurrency(Math.abs(summary.remaining))}
          </strong>
        </div>
      </div>

      <div className="dashboard-budget-meter">
        <div className="dashboard-budget-meter-track">
          <div className={`dashboard-budget-meter-fill ${tone}`} style={{ width: usedWidth }} />
        </div>
        <div className="dashboard-budget-meta">
          <span>{summary.percentageUsed.toFixed(0)}% used</span>
          <span>{summary.carryForwardAmount ? `${formatCurrency(summary.carryForwardAmount)} carry-forward applied` : 'No carry-forward applied'}</span>
        </div>
      </div>

      <div className="dashboard-inline-actions">
        <Btn variant="outline" size="sm" onClick={onViewWeeklyBudget}>View weekly budget</Btn>
        <Btn variant="primary" size="sm" onClick={onAdjustBudget}>Adjust budget</Btn>
      </div>
    </Card>
  );
}
