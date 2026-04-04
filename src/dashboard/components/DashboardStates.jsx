import React from 'react';
import { Btn, Card, Page } from '../../components/UI';

export function DashboardLoadingState() {
  return (
    <Page className="z1">
      <div className="dashboard-page-shell">
        <Card className="dashboard-page-skeleton dashboard-page-skeleton-hero" />
        <div className="dashboard-two-column">
          <Card className="dashboard-page-skeleton dashboard-page-skeleton-panel" />
          <Card className="dashboard-page-skeleton dashboard-page-skeleton-panel" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="dashboard-page-skeleton" />
        ))}
      </div>
    </Page>
  );
}

export function DashboardErrorState({ message, onRetry }) {
  return (
    <Page className="z1">
      <Card className="dashboard-feedback-card">
        <h2>Dashboard unavailable</h2>
        <p>{message}</p>
        <Btn variant="primary" onClick={onRetry}>Retry load</Btn>
      </Card>
    </Page>
  );
}

export function DashboardEmptyState() {
  return (
    <Card className="dashboard-feedback-card">
      <h2>Nothing to show yet</h2>
      <p>The dashboard modules are wired and waiting for activity from expenses, wallet, subscriptions, investments, or AI insights.</p>
    </Card>
  );
}
