import React from 'react';
import { Card, Btn, Input, Tag } from './UI';

export default function BudgetSettingsCard({
  weeklyBudgetLimit,
  monthlyBudgetLimit,
  monthlyBudgetOverride,
  onWeeklyBudgetChange,
  onMonthlyBudgetChange,
  onResetMonthlyBudget,
}) {
  return (
    <Card className="budget-settings-card">
      <div className="sec-header">
        <span className="sec-title">Budget Settings</span>
        <Tag variant={monthlyBudgetOverride ? 'orange' : 'green'}>
          {monthlyBudgetOverride ? 'Custom monthly limit' : 'Auto synced'}
        </Tag>
      </div>

      <div className="budget-settings-grid">
        <Input
          label="WEEKLY LIMIT"
          type="number"
          value={weeklyBudgetLimit}
          onChange={(event) => onWeeklyBudgetChange(event.target.value)}
        />
        <Input
          label="MONTHLY LIMIT"
          type="number"
          value={monthlyBudgetLimit}
          onChange={(event) => onMonthlyBudgetChange(event.target.value)}
        />
      </div>

      <div className="budget-settings-note">
        Monthly view always shows actual spending from the latest 4 weeks. The monthly limit defaults to 4x the weekly limit unless you override it.
      </div>

      <div className="budget-settings-actions">
        <Btn variant="outline" size="sm" onClick={onResetMonthlyBudget}>
          Reset Monthly To 4x Weekly
        </Btn>
      </div>
    </Card>
  );
}
