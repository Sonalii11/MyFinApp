import React, { useState } from 'react';
import { Btn, Card, Tag } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

function IncludedCategoriesSelector({ categories, value, onChange }) {
  return (
    <div className="transaction-category-chips">
      {categories.map((category) => {
        const active = value.includes(category);
        return (
          <button key={category} type="button" className={`expense-rule-chip${active ? ' active' : ''}`} onClick={() => onChange(active ? value.filter((item) => item !== category) : [...value, category])}>
            {category}
          </button>
        );
      })}
    </div>
  );
}

function MonthlyBudgetForm({ budget, categories, onSave, onDelete }) {
  const [draft, setDraft] = useState(budget || { monthKey: '2026-04', limit: 0, includedCategories: [] });
  return (
    <Card className="expense-panel-card">
      <div className="sec-header">
        <span className="sec-title">Monthly budget form</span>
        <Tag variant="blue">Secondary to weekly</Tag>
      </div>
      <div className="expense-panel-stack">
        <div className="expense-grid-2">
          <div className="input-group">
            <label className="input-label">MONTH</label>
            <input className="input" type="month" value={draft.monthKey} onChange={(event) => setDraft((current) => ({ ...current, monthKey: event.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">LIMIT</label>
            <input className="input" type="number" value={draft.limit} onChange={(event) => setDraft((current) => ({ ...current, limit: Number(event.target.value) || 0 }))} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">INCLUDED CATEGORIES</label>
          <IncludedCategoriesSelector categories={categories} value={draft.includedCategories} onChange={(value) => setDraft((current) => ({ ...current, includedCategories: value }))} />
        </div>
        <div className="transaction-form-actions">
          <Btn variant="danger" onClick={onDelete} style={{ flex: 1, justifyContent: 'center' }}>Delete budget</Btn>
          <Btn variant="primary" onClick={() => onSave(draft)} style={{ flex: 1, justifyContent: 'center' }}>Save budget</Btn>
        </div>
      </div>
    </Card>
  );
}

function MonthlyBudgetSummaryCard({ budget }) {
  return (
    <Card className="expense-panel-card">
      <div className="sec-header">
        <span className="sec-title">Monthly budget summary</span>
        <Tag variant={budget.status === 'exceeded' ? 'red' : budget.status === 'near-limit' ? 'orange' : 'green'}>
          {budget.status}
        </Tag>
      </div>
      <div className="expense-grid-3">
        <div>
          <span className="dashboard-kpi-label">Limit</span>
          <strong className="dashboard-kpi-value">{formatCurrency(budget.limit)}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">Spent</span>
          <strong className="dashboard-kpi-value">{formatCurrency(budget.spent)}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">{budget.remaining >= 0 ? 'Remaining' : 'Exceeded'}</span>
          <strong className={`dashboard-kpi-value ${budget.remaining < 0 ? 'down' : 'up'}`}>{formatCurrency(Math.abs(budget.remaining))}</strong>
        </div>
      </div>
    </Card>
  );
}

export function MonthlyBudgetSection({ budget, categories, actions }) {
  return (
    <section className="expense-section-shell">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Monthly budgeting module</span>
        <h2 className="sec-title">Monthly budget management</h2>
      </div>
      <div className="expense-grid-2">
        <MonthlyBudgetForm budget={budget} categories={categories} onSave={actions.updateMonthlyBudget} onDelete={actions.deleteMonthlyBudget} />
        {budget ? <MonthlyBudgetSummaryCard budget={budget} /> : <Card className="dashboard-empty-state"><strong>No monthly budget</strong><span>Create one to feed weekly auto-generation logic.</span><Btn variant="primary" onClick={actions.restoreMonthlyBudget}>Create monthly budget</Btn></Card>}
      </div>
    </section>
  );
}
