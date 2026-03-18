import React from 'react';

/* ── STAT CARD ─────────────────────────────────────────── */
export function StatCard({ label, value, change, dir, sub, accent }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 8,
      animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: accent || 'var(--text)' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: dir === 'up' ? 'var(--green2)' : dir === 'down' ? 'var(--red)' : 'var(--text2)' }}>
          <span>{dir === 'up' ? '↑' : dir === 'down' ? '↓' : '·'} {change}</span>
          {sub && <span style={{ color: 'var(--text2)', fontWeight: 400 }}> {sub}</span>}
        </div>
      )}
    </div>
  );
}

/* ── CARD ──────────────────────────────────────────────── */
export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px',
      transition: 'border-color 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = 'var(--border2)'; else e.currentTarget.style.borderColor = 'var(--border2)'; }}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {children}
    </div>
  );
}

/* ── SECTION HEADER ─────────────────────────────────────── */
export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>{title}</div>
      {action}
    </div>
  );
}

/* ── TAG ────────────────────────────────────────────────── */
export function Tag({ children, variant = 'purple' }) {
  const colors = {
    purple: { bg: 'rgba(108,92,231,0.12)', color: 'var(--accent2)' },
    green:  { bg: 'rgba(85,239,196,0.12)', color: 'var(--green2)' },
    red:    { bg: 'rgba(232,67,147,0.12)', color: 'var(--red)' },
    blue:   { bg: 'rgba(116,185,255,0.12)', color: 'var(--blue)' },
    orange: { bg: 'rgba(253,203,110,0.12)', color: 'var(--orange)' },
  };
  const c = colors[variant] || colors.purple;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, padding: '3px 9px',
      borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: c.bg, color: c.color,
    }}>
      {children}
    </span>
  );
}

/* ── BUTTON ─────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false, type = 'button' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    border: 'none', borderRadius: 'var(--radius-sm)',
    fontFamily: 'DM Sans', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s', opacity: disabled ? 0.5 : 1,
  };
  const sizes = {
    sm: { padding: '6px 13px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 14 },
    lg: { padding: '13px 24px', fontSize: 15 },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)' },
    ghost:   { background: 'transparent', color: 'var(--text2)' },
    danger:  { background: 'rgba(232,67,147,0.15)', color: 'var(--red)', border: '1px solid rgba(232,67,147,0.2)' },
    success: { background: 'rgba(85,239,196,0.15)', color: 'var(--green2)', border: '1px solid rgba(85,239,196,0.2)' },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent2)';
        if (variant === 'outline') e.currentTarget.style.background = 'var(--bg3)';
        if (variant === 'ghost') e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent)';
        if (variant === 'outline') e.currentTarget.style.background = 'transparent';
        if (variant === 'ghost') e.currentTarget.style.color = 'var(--text2)';
      }}
    >
      {children}
    </button>
  );
}

/* ── INPUT ──────────────────────────────────────────────── */
export function Input({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
          color: 'var(--text)', fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s', width: '100%',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

/* ── SELECT ─────────────────────────────────────────────── */
export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
          color: 'var(--text)', fontSize: 14, outline: 'none',
          width: '100%', cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      >
        {options.map(o => (
          <option key={o.value || o} value={o.value || o} style={{ background: 'var(--bg3)' }}>
            {o.label || o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── PROGRESS BAR ───────────────────────────────────────── */
export function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: color || 'linear-gradient(90deg, var(--accent), var(--pink))',
        borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  );
}

/* ── MODAL ──────────────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--card2)', border: '1px solid var(--border2)',
        borderRadius: 20, padding: '28px', width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'scaleIn 0.2s ease',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── TOAST ──────────────────────────────────────────────── */
export function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: type === 'error' ? 'rgba(232,67,147,0.15)' : 'rgba(85,239,196,0.12)',
      border: `1px solid ${type === 'error' ? 'rgba(232,67,147,0.3)' : 'rgba(85,239,196,0.25)'}`,
      color: type === 'error' ? 'var(--red)' : 'var(--green2)',
      padding: '12px 20px', borderRadius: 12,
      fontWeight: 600, fontSize: 14,
      animation: 'slideIn 0.25s ease',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      {type === 'error' ? '✕ ' : '✓ '}{msg}
    </div>
  );
}

/* ── TX ITEM ────────────────────────────────────────────── */
export function TxItem({ tx, onEdit, onDelete }) {
  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '11px 0', borderBottom: '1px solid var(--border)',
      animation: 'fadeUp 0.3s ease both',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: (tx.color || '#888') + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {tx.icon || '💸'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{tx.cat} · {fmt(tx.date)}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>
          −₹{tx.amount.toLocaleString()}
        </div>
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
            {onEdit && (
              <button onClick={() => onEdit(tx)} style={{
                background: 'rgba(162,155,254,0.1)', color: 'var(--accent2)',
                border: 'none', borderRadius: 6, padding: '3px 9px',
                fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}>Edit</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(tx.id)} style={{
                background: 'rgba(232,67,147,0.1)', color: 'var(--red)',
                border: 'none', borderRadius: 6, padding: '3px 9px',
                fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}>Del</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
