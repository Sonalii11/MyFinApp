import React from 'react';
import { Btn, Card, Tag } from '../../components/UI';

function severityVariant(severity) {
  if (severity === 'critical') return 'red';
  if (severity === 'warning') return 'orange';
  return 'blue';
}

export function ExpenseAlertsSection({ alerts, onDismiss }) {
  return (
    <section className="expense-section-shell">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Alerts and rules module</span>
        <h2 className="sec-title">Budget alerts and weekly summary</h2>
      </div>
      <div className="expense-grid-2">
        {alerts.length ? alerts.map((alert) => (
          <Card key={alert.id} className="expense-panel-card">
            <div className="sec-header">
              <span className="sec-title">{alert.title}</span>
              <Tag variant={severityVariant(alert.severity)}>{alert.severity}</Tag>
            </div>
            <p className="text-sm text2" style={{ marginBottom: 16 }}>{alert.description}</p>
            <Btn variant="outline" size="sm" onClick={() => onDismiss(alert.id)}>Dismiss</Btn>
          </Card>
        )) : (
          <Card className="dashboard-empty-state">
            <strong>No active alerts</strong>
            <span>Spending rules are quiet right now. This section updates as budgets and category limits change.</span>
          </Card>
        )}
      </div>
    </section>
  );
}
