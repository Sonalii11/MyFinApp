import React from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar  from './components/Topbar';
import { Toast } from './components/UI';
import Dashboard     from './pages/Dashboard';
import Expenses      from './pages/Expenses';
import ChartsPage    from './pages/ChartsPage';
import Wallet        from './pages/Wallet';
import Investments   from './pages/Investments';
import Subscriptions from './pages/Subscriptions';
import AIChat        from './pages/AIChat';

function GlowBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.07, top: -120, left: 40 }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'var(--pink)', filter: 'blur(100px)', opacity: 0.06, bottom: 60, right: 80 }} />
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'var(--green)', filter: 'blur(90px)', opacity: 0.05, top: '45%', left: '35%' }} />
    </div>
  );
}

function Pages() {
  const { page, toast } = useApp();
  const map = {
    dashboard:     <Dashboard />,
    expenses:      <Expenses />,
    charts:        <ChartsPage />,
    wallet:        <Wallet />,
    investments:   <Investments />,
    subscriptions: <Subscriptions />,
    ai:            <AIChat />,
  };
  return (
    <>
      {map[page] || <Dashboard />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <GlowBg />
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <div style={{ marginLeft: 68, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <Pages />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
