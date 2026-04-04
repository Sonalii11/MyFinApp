import React from 'react';
import { Btn, Card } from '../../components/UI';
import { DASHBOARD_PERIOD_OPTIONS } from '../types';
import { formatCurrency } from '../../utils/finance';

export function CashFlowSummaryCard({
  period,
  onChangePeriod,
  summaries,
  onAddIncome,
  onAddExpense,
}) {
  const activeSummary = summaries[period];
  const netBalance = activeSummary.netBalance ?? activeSummary.income - activeSummary.spending;
  const tone = netBalance < 0 ? 'down' : netBalance > 0 ? 'up' : 'neutral';

  return (
    <Card className="dashboard-cashflow-card">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Cash Flow Summary</span>
          <div className="sec-title">Current Money Situation</div>
        </div>
        <div className="dashboard-period-tabs">
          {DASHBOARD_PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`dashboard-period-tab${period === option.id ? ' active' : ''}`}
              onClick={() => onChangePeriod(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-cashflow-grid">
        <div className="dashboard-cashflow-stat spend">
          <span>Total spending</span>
          <strong>{formatCurrency(activeSummary.spending)}</strong>
        </div>
        <div className="dashboard-cashflow-stat income">
          <span>Total income</span>
          <strong>{formatCurrency(activeSummary.income)}</strong>
        </div>
        <div className={`dashboard-cashflow-balance ${tone}`}>
          <span>Net balance</span>
          <strong>{formatCurrency(netBalance)}</strong>
          <p>{tone === 'down' ? 'Spending is ahead of income in this period.' : 'Income is covering this period comfortably.'}</p>
        </div>
      </div>

      <div className="dashboard-inline-actions">
        <Btn variant="success" onClick={onAddIncome}>Add Income</Btn>
        <Btn variant="primary" onClick={onAddExpense}>Add Expense</Btn>
      </div>
    </Card>
  );
}

export const cashFlowSummaryMockData = {
  week: { period: 'week', income: 22000, spending: 5340, netBalance: 16660, currency: 'INR' },
  month: { period: 'month', income: 107000, spending: 15748, netBalance: 91252, currency: 'INR' },
  year: { period: 'year', income: 175700, spending: 15748, netBalance: 159952, currency: 'INR' },
};
