import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/expenses', icon: '💸', label: 'Expense Tracker' },
  { to: '/investments', icon: '📈', label: 'Investments' },
  { to: '/wallet', icon: '💳', label: 'Digital Wallet' },
  { to: '/subscriptions', icon: '📦', label: 'Subscriptions' },
  { to: '/ai-chat', icon: '✦', label: 'AI Assistant' },
];

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <NavLink to="/" className="sidebar-logo" aria-label="FinSphere Home">
        F
      </NavLink>

      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          title={item.label}
          aria-label={item.label}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
}
