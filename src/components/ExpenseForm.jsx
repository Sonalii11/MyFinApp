import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Btn } from './UI';
import { useApp, CAT_META } from '../context/AppContext';

const CATS = Object.keys(CAT_META);

const EMPTY = { name: '', amount: '', cat: 'Food', date: new Date().toISOString().slice(0, 10) };

export default function ExpenseForm({ onClose, editItem = null }) {
  const { addExpense, updateExpense } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editItem) {
      setForm({
        name:   editItem.name,
        amount: String(editItem.amount),
        cat:    editItem.cat,
        date:   editItem.date,
      });
    }
  }, [editItem]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim())       return setErr('Please enter a description.');
    if (!form.amount || +form.amount <= 0) return setErr('Enter a valid amount.');
    if (!form.date)              return setErr('Please pick a date.');
    setErr('');
    const payload = { ...form, amount: +form.amount };
    if (editItem) updateExpense(editItem.id, payload);
    else          addExpense(payload);
    onClose();
  };

  return (
    <Modal title={editItem ? '✏️ Edit Expense' : '+ Add Expense'} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Category quick-pick */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => set('cat', c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 10, border: 'none',
                  background: form.cat === c ? 'var(--accent)' : 'var(--bg3)',
                  color: form.cat === c ? '#fff' : 'var(--text2)',
                  fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {CAT_META[c].icon} {c}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="DESCRIPTION"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Zomato dinner"
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="AMOUNT (₹)"
            type="number"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0"
            required
          />
          <Input
            label="DATE"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            required
          />
        </div>

        {err && (
          <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(232,67,147,0.08)', padding: '10px 14px', borderRadius: 8 }}>
            ⚠ {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Btn type="button" variant="outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn type="submit" variant="primary" style={{ flex: 1, justifyContent: 'center' }}>
            {editItem ? 'Save Changes' : 'Add Expense'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
