import React from 'react';
import { Btn, Card, Tag } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';
import { BudgetGauge } from './BudgetGauge';
import { getBudgetTone } from '../selectors';

const MONTHLY_STATUS_LABELS = {
  healthy: 'Healthy',
  'near-limit': 'Near limit',
  exceeded: 'Exceeded',
};

export function MonthlyBudgetPreviewCard({ summary, onOpenBudgetSetup }) {
  const tone = getBudgetTone(summary.status);
  return (
    <Card className="dashboard-module-card">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Monthly Budget Preview</span>
          <div className="sec-title">4-week rollup health</div>
        </div>
        <Tag variant={tone === 'danger' ? 'red' : tone === 'warning' ? 'orange' : 'green'}>
          {MONTHLY_STATUS_LABELS[summary.status]}
        </Tag>
      </div>

      <div className="dashboard-monthly-layout">
        <BudgetGauge percentageUsed={summary.percentageUsed} tone={tone} label="used" />
        <div className="dashboard-monthly-copy">
          <div>
            <span className="dashboard-kpi-label">Monthly limit</span>
            <strong className="dashboard-kpi-value">{formatCurrency(summary.limit)}</strong>
          </div>
          <div>
            <span className="dashboard-kpi-label">Monthly spent</span>
            <strong className="dashboard-kpi-value">{formatCurrency(summary.spent)}</strong>
          </div>
          <div>
            <span className="dashboard-kpi-label">{summary.remaining >= 0 ? 'Remaining amount' : 'Exceeded amount'}</span>
            <strong className={`dashboard-kpi-value ${summary.remaining < 0 ? 'down' : 'up'}`}>
              {formatCurrency(Math.abs(summary.remaining))}
            </strong>
          </div>
        </div>
      </div>

      <div className={`dashboard-inline-note ${tone}`}>
        {summary.remaining >= 0 ? 'Monthly budget is still within limit.' : 'Monthly budget limit has been crossed.'}
      </div>

      <div className="dashboard-inline-actions">
        <Btn variant="outline" size="sm" onClick={onOpenBudgetSetup}>Open budget setup</Btn>
      </div>
    </Card>
  );
}
