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

      {summary.weeks?.length ? (
        <div className="dashboard-rollup-weeks">
          <div className="dashboard-rollup-header">
            <span className="dashboard-section-label">Monthly week-by-week spend</span>
          </div>
          <div className="dashboard-rollup-grid">
            {summary.weeks.map((week) => (
              <div key={week.id} className={`dashboard-rollup-week dashboard-rollup-week-${week.tone}`}>
                <div className="dashboard-rollup-week-top">
                  <strong>{week.label}</strong>
                  <span>{week.percentageUsed.toFixed(0)}%</span>
                </div>
                <div className="dashboard-rollup-week-range">{week.rangeLabel}</div>
                <div className="dashboard-rollup-track">
                  <div
                    className={`dashboard-rollup-fill dashboard-rollup-fill-${week.tone}`}
                    style={{ width: `${Math.min(100, Math.max(8, week.percentageUsed || 0))}%` }}
                  />
                </div>
                <div className="dashboard-rollup-meta">
                  <span>{formatCurrency(week.spent)} spent</span>
                  <span>{formatCurrency(week.planned)} plan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="dashboard-inline-actions">
        <Btn variant="outline" size="sm" onClick={onOpenBudgetSetup}>Open budget setup</Btn>
      </div>
    </Card>
  );
}
