import React from 'react';
import { useApp } from '../context/AppContext';

const NAV = [
  { id: 'dashboard',    icon: '⊞', label: 'Dashboard'    },
  { id: 'expenses',     icon: '☰', label: 'Expenses'     },
  { id: 'charts',       icon: '📊', label: 'Charts'       },
  { id: 'wallet',       icon: '◈', label: 'Wallet'       },
  { id: 'investments',  icon: '📈', label: 'Investments'  },
  { id: 'subscriptions',icon: '⊙', label: 'Subscriptions'},
  { id: 'ai',           icon: '✦', label: 'AI Assistant' },
];

export default function Sidebar() {
  const { page, setPage } = useApp();

  return (
    <nav style={{
      width: 68,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: 4,
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        width: 38, height: 38,
        background: 'linear-gradient(135deg, var(--accent), var(--pink))',
        borderRadius: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne', fontSize: 17, fontWeight: 800, color: '#fff',
        marginBottom: 20, flexShrink: 0, cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
      }} onClick={() => setPage('dashboard')}>
        F
      </div>

      {NAV.map(n => (
        <NavBtn key={n.id} {...n} active={page === n.id} onClick={() => setPage(n.id)} />
      ))}

      <div style={{ flex: 1 }} />

      <NavBtn icon="⚙" label="Settings" active={false} onClick={() => {}} />
    </nav>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 42, height: 42,
        borderRadius: 11, border: 'none',
        background: active ? 'rgba(108,92,231,0.15)' : 'transparent',
        color: active ? 'var(--accent2)' : 'var(--text2)',
        cursor: 'pointer', fontSize: 17,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: -1, top: '50%',
          transform: 'translateY(-50%)',
          width: 3, height: 18, background: 'var(--accent)',
          borderRadius: '0 3px 3px 0',
        }} />
      )}
      {icon}
    </button>
  );
}
