import React from 'react';
import { Btn, Card, ProgressBar, Tag } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

function WeeklyBudgetSetupCard({ weeklyBudget, onUpdate, onSetOverride }) {
  const current = weeklyBudget.current;
  return (
    <Card className="expense-weekly-card expense-weekly-card-primary">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Weekly budgeting module</span>
          <div className="sec-title">Weekly setup</div>
        </div>
        <Tag variant="purple">Primary budgeting mode</Tag>
      </div>
      <div className="expense-grid-3">
        <div className="input-group">
          <label className="input-label">BASE WEEKLY BUDGET</label>
          <input className="input" type="number" value={weeklyBudget.current.budget} onChange={(event) => onSetOverride(current.weekStart, event.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">MONTHLY SOURCE</label>
          <input className="input" type="number" value={weeklyBudget.history[weeklyBudget.history.length - 1].budget * 4} onChange={(event) => onUpdate({ monthlyBudgetSource: Number(event.target.value) || 0 })} />
        </div>
        <div className="input-group">
          <label className="input-label">AUTO GENERATE FROM MONTHLY</label>
          <select className="select" value={weeklyBudget.rules.strictReset ? 'strict-reset' : weeklyBudget.rules.carryUnusedForward ? 'carry-unused-forward' : 'roll-deficit-forward'} onChange={(event) => onUpdate({ carryForwardMode: event.target.value })}>
            <option value="strict-reset">Strict reset every week</option>
            <option value="carry-unused-forward">Carry unused forward</option>
            <option value="roll-deficit-forward">Roll deficit forward</option>
          </select>
        </div>
      </div>
      <div className="expense-inline-toggle-row">
        <button type="button" className={`expense-rule-chip${weeklyBudget.rules.overspendDeduction ? ' active' : ''}`} onClick={() => onUpdate({ overspendDeduction: !weeklyBudget.rules.overspendDeduction })}>
          Overspend deduction {weeklyBudget.rules.overspendDeduction ? 'On' : 'Off'}
        </button>
        <button type="button" className={`expense-rule-chip${weeklyBudget.rules.carryUnusedForward ? ' active' : ''}`} onClick={() => onUpdate({ carryForwardMode: 'carry-unused-forward' })}>
          Carry forward unused
        </button>
        <button type="button" className={`expense-rule-chip${weeklyBudget.rules.strictReset ? ' active' : ''}`} onClick={() => onUpdate({ carryForwardMode: 'strict-reset' })}>
          Strict reset
        </button>
      </div>
    </Card>
  );
}

function WeeklyBudgetStatusCard({ current }) {
  return (
    <Card className="expense-weekly-card">
      <div className="sec-header">
        <span className="sec-title">Current week status</span>
        <Tag variant={current.status === 'exceeded' ? 'red' : current.status === 'near-limit' ? 'orange' : 'green'}>
          {current.status.replace('-', ' ')}
        </Tag>
      </div>
      <div className="expense-grid-3">
        <div>
          <span className="dashboard-kpi-label">Spent</span>
          <strong className="dashboard-kpi-value">{formatCurrency(current.spent)}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">Remaining</span>
          <strong className={`dashboard-kpi-value ${current.remaining < 0 ? 'down' : 'up'}`}>{formatCurrency(Math.abs(current.remaining))}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">Used</span>
          <strong className="dashboard-kpi-value">{current.percentageUsed.toFixed(0)}%</strong>
        </div>
      </div>
      <ProgressBar value={current.percentageUsed} max={100} color={current.status === 'exceeded' ? 'linear-gradient(90deg,var(--red),#ffb4c6)' : current.status === 'near-limit' ? 'linear-gradient(90deg,var(--orange),#ffd699)' : 'linear-gradient(90deg,var(--green),#9debd0)'} />
    </Card>
  );
}

function WeeklyComparisonCard({ current, previous }) {
  const diff = current.spent - previous.spent;
  return (
    <Card className="expense-weekly-card">
      <div className="sec-title" style={{ marginBottom: 14 }}>Previous week comparison</div>
      <div className="expense-grid-2">
        <div>
          <span className="dashboard-kpi-label">Current week spend</span>
          <strong className="dashboard-kpi-value">{formatCurrency(current.spent)}</strong>
        </div>
        <div>
          <span className="dashboard-kpi-label">Previous week spend</span>
          <strong className="dashboard-kpi-value">{formatCurrency(previous.spent)}</strong>
        </div>
      </div>
      <div className={`dashboard-inline-note ${diff > 0 ? 'warning' : diff < 0 ? 'safe' : 'neutral'}`}>
        Difference {diff > 0 ? '+' : ''}{formatCurrency(diff)}
      </div>
    </Card>
  );
}

function WeeklyHistoryList({ history, onSetOverride }) {
  return (
    <Card className="expense-weekly-card">
      <div className="sec-title" style={{ marginBottom: 14 }}>Week-by-week history</div>
      <div className="expense-history-groups">
        {history.map((item) => (
          <div key={item.weekStart} className="expense-history-item">
            <div>
              <div className="tx-name">{item.label}</div>
              <div className="tx-meta">{formatCurrency(item.spent)} spent of {formatCurrency(item.budget)}</div>
            </div>
            <div className="expense-history-actions">
              <div className={`tx-amount ${item.remaining < 0 ? 'down' : 'up'}`}>{item.percentageUsed.toFixed(0)}%</div>
              <div className="expense-inline-mini">
                <input className="input expense-inline-input" type="number" value={item.budget} onChange={(event) => onSetOverride(item.weekStart, event.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WeeklyBudgetSection({ weeklyBudget, actions }) {
  if (!weeklyBudget) return null;
  return (
    <section className="expense-section-shell">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Weekly budgeting module</span>
        <h2 className="sec-title">Weekly-first budget engine</h2>
      </div>
      <div className="expense-grid-2">
        <WeeklyBudgetSetupCard weeklyBudget={weeklyBudget} onUpdate={actions.updateWeeklyBudgetConfig} onSetOverride={actions.setWeeklyOverride} />
        <WeeklyBudgetStatusCard current={weeklyBudget.current} />
      </div>
      <div className="expense-grid-2">
        <WeeklyComparisonCard current={weeklyBudget.current} previous={weeklyBudget.previous} />
        <WeeklyHistoryList history={weeklyBudget.history} onSetOverride={actions.setWeeklyOverride} />
      </div>
    </section>
  );
}
