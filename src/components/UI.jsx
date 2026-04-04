import React from 'react';

function joinClasses(...names) {
  return names.filter(Boolean).join(' ');
}

export function Page({ children, className = '', style = {} }) {
  return (
    <div className={joinClasses('page', className)} style={style}>
      {children}
    </div>
  );
}

export function Grid({ cols = 2, gap = 16, className = '', style = {}, children }) {
  return (
    <div
      className={joinClasses(`grid-${cols}`, `gap-${gap}`, className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, change, dir, sub, accent, style = {}, className = '' }) {
  return (
    <div className={joinClasses('stat-card', className)} style={style}>
      <div className="stat-label">{label}</div>
      <div className="stat-value syne" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {change ? (
        <div className={joinClasses('stat-change', dir)}>
          <span>{dir === 'up' ? '↑' : dir === 'down' ? '↓' : '·'} {change}</span>
          {sub ? <span className="text2" style={{ fontWeight: 400 }}>{sub}</span> : null}
        </div>
      ) : sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  );
}

export function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div className={joinClasses('card', className)} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, action, className = '', titleClassName = '' }) {
  return (
    <div className={joinClasses('sec-header', className)}>
      <span className={joinClasses('sec-title', titleClassName)}>{title}</span>
      {action}
    </div>
  );
}

export function Tag({ children, variant = 'purple', className = '', style = {} }) {
  return (
    <span className={joinClasses('tag', `tag-${variant}`, className)} style={style}>
      {children}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  size,
  style = {},
  disabled = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={joinClasses(
        'btn',
        variant ? `btn-${variant}` : '',
        size ? `btn-${size}` : '',
        disabled ? 'btn-disabled' : '',
        className
      )}
      style={style}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  className = '',
  inputClassName = '',
  style = {},
}) {
  return (
    <div className={joinClasses('input-group', className)} style={style}>
      {label ? <label className="input-label">{label}</label> : null}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={joinClasses('input', inputClassName)}
      />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  className = '',
  selectClassName = '',
  style = {},
}) {
  return (
    <div className={joinClasses('input-group', className)} style={style}>
      {label ? <label className="input-label">{label}</label> : null}
      <select
        value={value}
        onChange={onChange}
        className={joinClasses('select', selectClassName)}
      >
        {options.map((option) => {
          const valueProp = option?.value ?? option;
          const labelProp = option?.label ?? option;
          return (
            <option key={valueProp} value={valueProp}>
              {labelProp}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function ProgressBar({ value, max, color, className = '', fillClassName = '', style = {} }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={joinClasses('progress-bar', className)} style={style}>
      <div
        className={joinClasses('progress-fill', fillClassName)}
        style={{ width: `${pct}%`, background: color || 'linear-gradient(90deg,var(--accent),var(--pink))' }}
      />
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--card2)',
          border: '1px solid var(--border2)',
          borderRadius: 20,
          padding: '28px',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'scaleIn 0.2s ease',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div className="sec-title">{title}</div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bg3)',
              color: 'var(--text2)',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ msg, type }) {
  if (!msg) return null;
  const isError = type === 'error';
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: isError ? 'rgba(240,92,122,0.15)' : 'rgba(34,212,160,0.12)',
        border: `1px solid ${isError ? 'rgba(240,92,122,0.3)' : 'rgba(34,212,160,0.25)'}`,
        color: isError ? 'var(--red)' : 'var(--green)',
        padding: '12px 20px',
        borderRadius: 12,
        fontWeight: 600,
        fontSize: 14,
        animation: 'slideIn 0.25s ease',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {isError ? '✕ ' : '✓ '}
      {msg}
    </div>
  );
}

export function TxItem({ tx, onEdit, onDelete, amountPrefix = '-', amountClassName = 'down' }) {
  const formattedDate = (() => {
    if (!tx.date) return '';
    if (typeof tx.date === 'string' && /^[A-Z][a-z]{2}\s\d{1,2}$/.test(tx.date)) return tx.date;
    const [year, month, day] = String(tx.date).split('-').map(Number);
    const parsed = new Date(year, (month || 1) - 1, day || 1);
    return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  })();

  const title = tx.title || tx.name;
  const category = tx.category || tx.cat;

  return (
    <div className="tx-item">
      <div className="tx-icon" style={{ background: `${tx.color || '#888'}20` }}>
        {tx.icon || '💸'}
      </div>
      <div className="tx-info">
        <div className="tx-name">{title}</div>
        <div className="tx-meta">
          {category}
          {formattedDate ? ` · ${formattedDate}` : ''}
          {tx.account ? ` · ${tx.account}` : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className={joinClasses('tx-amount', amountClassName)}>
          {amountPrefix}₹{Number(tx.amount).toLocaleString('en-IN')}
        </div>
        {(onEdit || onDelete) ? (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
            {onEdit ? (
              <button
                onClick={() => onEdit(tx)}
                style={{
                  background: 'rgba(124,109,250,0.1)',
                  color: 'var(--accent2)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '3px 9px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                onClick={() => onDelete(tx.id)}
                style={{
                  background: 'rgba(240,92,122,0.1)',
                  color: 'var(--red)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '3px 9px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Del
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
