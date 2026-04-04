import React from 'react';
import { Btn, Card } from './UI';
import { formatCurrency } from '../utils/finance';

const PERIOD_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
};

export default function CashFlowCard({
  selectedPeriod,
  onSelectPeriod,
  summary,
  activeWeekLabel,
  onAddIncome,
  onAddExpense,
  onPreviousWeek,
  onNextWeek,
  onResetWeek,
  canGoForward,
}) {
  return (
    <Card className="cashflow-card">
      <div className="cashflow-header">
        <div>
          <div className="cashflow-eyebrow">Budgeting Core</div>
          <h2 className="cashflow-title">Cash Flow</h2>
          <p className="cashflow-subtitle">
            Weekly stays primary. Monthly and annual views roll up from the same transaction stream.
          </p>
        </div>

        <div className="period-switch" aria-label="Select period">
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`period-chip${selectedPeriod === value ? ' active' : ''}`}
              onClick={() => onSelectPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="cashflow-range">
        <div>
          <span className="cashflow-range-label">Active week</span>
          <strong>{activeWeekLabel}</strong>
        </div>
        <div className="cashflow-range-actions">
          <Btn variant="outline" size="sm" onClick={onPreviousWeek}>← Prev</Btn>
          <Btn variant="outline" size="sm" onClick={onResetWeek}>Current</Btn>
          <Btn variant="outline" size="sm" onClick={onNextWeek} disabled={!canGoForward}>Next →</Btn>
        </div>
      </div>

      <div className="cashflow-metrics">
        <div className="cashflow-metric spend">
          <span>Spending</span>
          <strong>{formatCurrency(summary.expense)}</strong>
        </div>
        <div className="cashflow-metric income">
          <span>Income</span>
          <strong>{formatCurrency(summary.income)}</strong>
        </div>
        <div className="cashflow-metric balance">
          <span>Net Balance</span>
          <strong>{formatCurrency(summary.balance)}</strong>
        </div>
      </div>

      <div className="cashflow-progress">
        <div className="cashflow-progress-copy">
          <div>
            <span className="cashflow-progress-label">Budget progress</span>
            <strong>{summary.budgetProgress.usedPercent.toFixed(0)}%</strong>
          </div>
          <span className={`cashflow-progress-state${summary.budgetProgress.isOverspent ? ' danger' : ''}`}>
            {summary.budgetProgress.isOverspent
              ? `${formatCurrency(summary.budgetProgress.overspendAmount)} over limit`
              : `${formatCurrency(summary.budgetProgress.remaining)} remaining`}
          </span>
        </div>
        <div className="cashflow-progress-bar">
          <div
            className={`cashflow-progress-fill${summary.budgetProgress.isOverspent ? ' danger' : ''}`}
            style={{ width: `${Math.max(8, summary.budgetProgress.clampedPercent)}%` }}
          />
        </div>
      </div>

      <div className="cashflow-actions">
        <Btn variant="success" className="cashflow-cta" onClick={onAddIncome}>
          + Add Income
        </Btn>
        <Btn variant="primary" className="cashflow-cta" onClick={onAddExpense}>
          + Add Expense
        </Btn>
      </div>
    </Card>
  );
}
