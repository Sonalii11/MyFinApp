import React from 'react';
import { Btn, Card, Select } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

function CategoryLimitRow({ row, onUpdate }) {
  return (
    <div className="expense-category-row">
      <div>
        <div className="tx-name">{row.category}</div>
        <div className="tx-meta">Last period {formatCurrency(row.lastPeriodSpending)}</div>
      </div>
      <div className="expense-category-metrics">
        <div className="expense-inline-editor">
          <span className="dashboard-kpi-label">Weekly</span>
          <input className="input expense-inline-input" type="number" value={row.weeklyLimit || 0} onChange={(event) => onUpdate(row.category, { weeklyLimit: Number(event.target.value) || 0 })} />
          <span className={`tx-meta ${(row.weeklyRemaining ?? 0) < 0 ? 'down' : 'up'}`}>{formatCurrency(Math.abs(row.weeklyRemaining || 0))}</span>
        </div>
        <div className="expense-inline-editor">
          <span className="dashboard-kpi-label">Monthly</span>
          <input className="input expense-inline-input" type="number" value={row.monthlyLimit || 0} onChange={(event) => onUpdate(row.category, { monthlyLimit: Number(event.target.value) || 0 })} />
          <span className={`tx-meta ${(row.monthlyRemaining ?? 0) < 0 ? 'down' : 'up'}`}>{formatCurrency(Math.abs(row.monthlyRemaining || 0))}</span>
        </div>
      </div>
    </div>
  );
}

export function CategoryLimitsSection({ rows, sortBy, onSort, onUpdate, onReset }) {
  return (
    <section className="expense-section-shell">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Category-wise limit module</span>
        <h2 className="sec-title">Per-category controls</h2>
      </div>
      <Card className="expense-panel-card">
        <div className="sec-header">
          <Select label="SORT" value={sortBy} onChange={(event) => onSort(event.target.value)} options={['exceeded-first', 'highest-spent', 'closest-to-limit', 'alphabetical']} />
          <Btn variant="outline" onClick={onReset}>Reset all limits</Btn>
        </div>
        <div className="expense-panel-stack">
          {rows.map((row) => (
            <CategoryLimitRow key={row.category} row={row} onUpdate={onUpdate} />
          ))}
        </div>
      </Card>
    </section>
  );
}
