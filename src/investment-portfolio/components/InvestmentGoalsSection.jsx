import React from 'react';
import { Card, SectionHeader, Btn, Input, ProgressBar } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

function GoalCard({ goal }) {
  return (
    <Card className="portfolio-goal-card">
      <div className="portfolio-goal-top">
        <div>
          <div className="portfolio-metric-label">Goal</div>
          <div className="sec-title">{goal.name}</div>
        </div>
        <div className="portfolio-metric-sub">{goal.progressPercent.toFixed(1)}%</div>
      </div>
      <div className="portfolio-goal-metrics">
        <div>
          <span className="text2">Target</span>
          <strong>{formatCurrency(goal.targetAmount)}</strong>
        </div>
        <div>
          <span className="text2">Progress</span>
          <strong>{formatCurrency(goal.currentValue)}</strong>
        </div>
      </div>
      <ProgressBar value={goal.progressPercent} max={100} className="portfolio-goal-progress" />
    </Card>
  );
}

export function InvestmentGoalsSection({ goals, draft, actions }) {
  return (
    <section className="portfolio-two-column">
      <Card className="portfolio-goal-form">
        <SectionHeader title="Goals" />
        <div className="portfolio-form-grid portfolio-form-grid-simple">
          <Input
            label="Goal name"
            value={draft.name}
            onChange={(event) => actions.setGoalDraft((current) => ({ ...current, name: event.target.value }))}
            className="portfolio-form-field"
          />
          <Input
            label="Target amount"
            value={draft.targetAmount}
            onChange={(event) => actions.setGoalDraft((current) => ({ ...current, targetAmount: event.target.value }))}
            className="portfolio-form-field"
          />
          <Input
            label="Current progress"
            value={draft.currentProgress}
            onChange={(event) => actions.setGoalDraft((current) => ({ ...current, currentProgress: event.target.value }))}
            className="portfolio-form-field"
          />
          <div className="portfolio-form-actions">
            <Btn variant="primary" onClick={actions.saveGoal}>Add goal</Btn>
          </div>
        </div>
      </Card>

      <div className="portfolio-goals-stack">
        {goals.length ? goals.map((goal) => <GoalCard key={goal.id} goal={goal} />) : (
          <Card className="portfolio-goal-card">
            <div className="dashboard-empty-copy">No goals yet. Add a simple target to start tracking progress.</div>
          </Card>
        )}
      </div>
    </section>
  );
}
