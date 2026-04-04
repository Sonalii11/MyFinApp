import React from 'react';
import { Btn, Card } from '../../components/UI';

export function DashboardHeader({
  greeting,
  user,
  onOpenSearch,
  onOpenProfile,
}) {
  return (
    <Card className="dashboard-header-card">
      <div className="dashboard-header-copy">
        <span className="dashboard-header-label">Dashboard</span>
        <h1 className="dashboard-header-title">{greeting}</h1>
        <p className="dashboard-header-subtitle">
          Current money position, budget health, and quick paths into the rest of FinSphere.
        </p>
      </div>

      <div className="dashboard-header-actions">
        <Btn variant="outline" onClick={onOpenSearch}>Search</Btn>
        <button type="button" className="avatar-button" onClick={onOpenProfile} aria-label="Open profile">
          {user.avatarLabel}
        </button>
      </div>
    </Card>
  );
}

export const dashboardHeaderMockProps = {
  greeting: 'Good afternoon, Sonali',
  user: {
    id: 'dashboard-user',
    firstName: 'Sonali',
    fullName: 'Sonali Singh',
    avatarLabel: 'S',
    membership: 'Premium',
  },
  onOpenSearch: () => {},
  onOpenProfile: () => {},
};
