import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Btn, Input } from './UI';
import { useApp } from '../context/AppContext';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { searchIndex } = useApp();
  const title = TITLES[location.pathname] || 'Dashboard';
  const subtitle = location.pathname === '/'
    ? 'Weekly-first budgeting'
    : location.pathname === '/expenses'
      ? 'Track spend with live rollups'
      : location.pathname === '/ai-chat'
        ? 'Ask about your money patterns'
        : 'FinSphere';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return searchIndex
      .filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [query, searchIndex]);

  function openResult(item) {
    setIsSearchOpen(false);
    setQuery('');
    if (item.kind === 'asset') navigate('/investments');
    else if (item.kind === 'wallet') navigate('/wallet');
    else if (item.kind === 'budget') navigate('/expenses');
    else navigate('/expenses');
  }

  return (
    <>
    <header className="topbar">
      <div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {title}
        </div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="button" className="btn btn-outline" onClick={() => setIsSearchOpen(true)}>Search</button>
        <button type="button" className="avatar-button" onClick={() => setIsProfileOpen(true)} aria-label="Profile">
          S
        </button>
      </div>
    </header>

    {isSearchOpen ? (
      <Modal title="Search" onClose={() => setIsSearchOpen(false)}>
        <div className="expense-panel-stack">
          <Input label="SEARCH" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions, assets, or budgets" />
          {results.length ? results.map((item) => (
            <button key={item.id} type="button" className="portfolio-table-row" onClick={() => openResult(item)}>
              <div>
                <strong>{item.title}</strong>
                <div className="text2">{item.subtitle}</div>
              </div>
              <span className="text2">{item.kind}</span>
            </button>
          )) : <div className="dashboard-empty-inline">No matching results yet.</div>}
        </div>
      </Modal>
    ) : null}

    {isProfileOpen ? (
      <Modal title="Profile" onClose={() => setIsProfileOpen(false)}>
        <div className="expense-panel-stack">
          <div className="portfolio-goal-card">
            <div className="sec-title">Sonali Singh</div>
            <div className="text2">Premium member · Weekly budgeting mode</div>
          </div>
          <Btn variant="outline" onClick={() => navigate('/')}>Profile overview</Btn>
          <Btn variant="outline" onClick={() => navigate('/expenses')}>Preferences</Btn>
          <Btn variant="outline" onClick={() => navigate('/ai-chat')}>Settings & assistant</Btn>
        </div>
      </Modal>
    ) : null}
    </>
  );
}
