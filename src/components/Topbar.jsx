import React from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Dashboard',
  '/expenses': 'Expense Tracker',
  '/charts': 'Analytics & Charts',
  '/wallet': 'Digital Wallet',
  '/investments': 'Investment Portfolio',
  '/subscriptions': 'Subscription Manager',
  '/ai-chat': 'AI Financial Assistant',
};

export default function Topbar() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Dashboard';
  const subtitle = location.pathname === '/'
    ? 'Weekly-first budgeting'
    : location.pathname === '/expenses'
      ? 'Track spend with live rollups'
      : location.pathname === '/ai-chat'
        ? 'Ask about your money patterns'
        : 'FinSphere';

  return (
    <header className="topbar">
      <div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {title}
        </div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span aria-hidden="true">🔔</span>
        <span
          aria-label="Profile"
          style={{ background: 'var(--accent)', padding: '6px 10px', borderRadius: '50%' }}
        >
          S
        </span>
      </div>
    </header>
  );
}
