import React from 'react';
import { Card, SectionHeader, Tag } from './UI';
import { LineChart } from './Charts';
import { formatCurrency } from '../utils/finance';

export default function WeeklySpendingChart({ heroChart, weeklySummary, activeWeekLabel, weeklyBudgetLimit }) {
  return (
    <Card className="dashboard-chart-card">
      <SectionHeader
        title={heroChart.title}
        action={<Tag variant="purple">{activeWeekLabel}</Tag>}
      />
      <div className="chart-container chart-tall">
        <LineChart data={heroChart.data} labels={heroChart.labels} color="#8f7dff" height={280} />
      </div>
      <div className="chart-footer">
        <div>
          <span>Weekly budget</span>
          <strong>{formatCurrency(weeklyBudgetLimit)}</strong>
        </div>
        <div>
          <span>Current week spent</span>
          <strong>{formatCurrency(weeklySummary.expense)}</strong>
        </div>
        <div>
          <span>Budget used</span>
          <strong>{weeklySummary.budgetProgress.usedPercent.toFixed(0)}%</strong>
        </div>
      </div>
      <div className="chart-helper">{heroChart.helper}</div>
    </Card>
  );
}
