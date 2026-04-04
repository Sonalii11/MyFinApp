import React from 'react';
import { Card, Select } from '../../components/UI';
import { DonutChart, BarChart } from '../../components/Charts';
import { formatCurrency } from '../../utils/finance';

export function ExpenseAnalysisSection({ analytics, range, customRange, onRangeChange, onCustomRangeChange }) {
  const chartData = analytics.categoryBreakdown.length
    ? analytics.categoryBreakdown
    : [{ label: 'No spend', amount: 0, color: '#555577' }];

  return (
    <section className="expense-section-shell">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Analysis submodule</span>
        <h2 className="sec-title">Spend, income, and behavior analytics</h2>
      </div>

      <Card className="expense-panel-card">
        <div className="expense-analysis-toolbar">
          <Select label="TIME RANGE" value={range} onChange={(event) => onRangeChange(event.target.value)} options={['week', 'month', 'year', 'custom']} />
          {range === 'custom' ? (
            <div className="expense-grid-2">
              <input className="input" type="date" value={customRange.from} onChange={(event) => onCustomRangeChange({ ...customRange, from: event.target.value })} />
              <input className="input" type="date" value={customRange.to} onChange={(event) => onCustomRangeChange({ ...customRange, to: event.target.value })} />
            </div>
          ) : null}
        </div>

        <div className="expense-grid-4">
          <div className="stat-card"><div className="stat-label">Income</div><div className="stat-value syne up">{formatCurrency(analytics.income)}</div></div>
          <div className="stat-card"><div className="stat-label">Spending</div><div className="stat-value syne down">{formatCurrency(analytics.spending)}</div></div>
          <div className="stat-card"><div className="stat-label">Transfers</div><div className="stat-value syne neutral">{formatCurrency(analytics.transfers)}</div></div>
          <div className="stat-card"><div className="stat-label">Net Balance</div><div className={`stat-value syne ${analytics.netBalance >= 0 ? 'up' : 'down'}`}>{formatCurrency(analytics.netBalance)}</div></div>
        </div>

        <div className="expense-grid-2" style={{ marginTop: 16 }}>
          <Card>
            <div className="sec-header"><span className="sec-title">Category donut</span></div>
            <div className="chart-container">
              <DonutChart data={chartData.map((item) => item.amount)} labels={chartData.map((item) => item.label)} colors={chartData.map((item) => item.color)} height={220} />
            </div>
          </Card>
          <Card>
            <div className="sec-header"><span className="sec-title">Payment mode breakdown</span></div>
            <div className="chart-container">
              <BarChart data={analytics.paymentModeBreakdown.map((item) => item.amount)} labels={analytics.paymentModeBreakdown.map((item) => item.mode)} height={220} />
            </div>
          </Card>
        </div>

        <div className="expense-grid-2" style={{ marginTop: 16 }}>
          <Card>
            <div className="sec-title" style={{ marginBottom: 12 }}>Category list</div>
            <div className="expense-panel-stack">
              {analytics.categoryBreakdown.length ? analytics.categoryBreakdown.map((item) => (
                <div key={item.label} className="expense-mini-stat-row">
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                </div>
              )) : <div className="dashboard-empty-inline">No category spend data for this range.</div>}
            </div>
          </Card>
          <Card>
            <div className="sec-title" style={{ marginBottom: 12 }}>Expense stats</div>
            <div className="expense-panel-stack">
              <div className="expense-mini-stat-row"><span>Average spend / day</span><strong>{formatCurrency(analytics.stats.avgSpendingPerDay)}</strong></div>
              <div className="expense-mini-stat-row"><span>Average spend / transaction</span><strong>{formatCurrency(analytics.stats.avgSpendingPerTransaction)}</strong></div>
              <div className="expense-mini-stat-row"><span>Average income / day</span><strong>{formatCurrency(analytics.stats.avgIncomePerDay)}</strong></div>
              <div className="expense-mini-stat-row"><span>Average income / transaction</span><strong>{formatCurrency(analytics.stats.avgIncomePerTransaction)}</strong></div>
            </div>
          </Card>
        </div>
      </Card>
    </section>
  );
}
