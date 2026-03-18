import React from 'react';
import { useApp } from '../context/AppContext';

const TITLES = {
  dashboard:     'Dashboard',
  expenses:      'Expense Tracker',
  charts:        'Analytics & Charts',
  wallet:        'Digital Wallet',
  investments:   'Investments',
  subscriptions: 'Subscriptions',
  ai:            'AI Financial Assistant',
};

export default function Topbar() {
  const { page } = useApp();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 28px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(9,9,16,0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div>
        <div style={{ fontFamily: 'Syne', fontSize: 19, fontWeight: 700 }}>{TITLES[page]}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} · Mumbai, IN
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{
          position: 'relative', background: 'transparent', border: 'none',
          color: 'var(--text2)', fontSize: 18, cursor: 'pointer',
          width: 36, height: 36, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--red)', border: '1.5px solid var(--bg)',
          }} />
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--green))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>AM</div>
      </div>
    </header>
  );
}
