import React, { useState, useMemo } from 'react';
import { useApp, CAT_META } from '../context/AppContext';
import { Card, SectionHeader, Tag, Btn, TxItem, Input, Select } from '../components/UI';
import ExpenseForm from '../components/ExpenseForm';

const CATS = ['All', ...Object.keys(CAT_META)];
const SORT_OPTS = [
  { value: 'date-desc',   label: 'Newest First' },
  { value: 'date-asc',    label: 'Oldest First' },
  { value: 'amount-desc', label: 'Highest Amount' },
  { value: 'amount-asc',  label: 'Lowest Amount' },
];

export default function Expenses() {
  const { expenses, deleteExpense } = useApp();
  const [showForm,  setShowForm]  = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [filter,    setFilter]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('date-desc');
  const [confirm,   setConfirm]   = useState(null); // id to delete

  const filtered = useMemo(() => {
    let list = expenses;
    if (filter !== 'All') list = list.filter(e => e.cat === filter);
    if (search.trim())    list = list.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    const [key, dir] = sort.split('-');
    list = [...list].sort((a, b) => {
      const aVal = key === 'date' ? a.date : a.amount;
      const bVal = key === 'date' ? b.date : b.amount;
      return dir === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
    return list;
  }, [expenses, filter, search, sort]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleEdit = (tx) => { setEditItem(tx); setShowForm(true); };
  const handleDelete = (id) => setConfirm(id);
  const confirmDelete = () => { deleteExpense(confirm); setConfirm(null); };

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      {/* Header actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            <span style={{ color: 'var(--accent2)', marginLeft: 8 }}>₹{total.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Manage all your expenses</div>
        </div>
        <Btn variant="primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
          + Add Expense
        </Btn>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16, padding: '16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 2, minWidth: 180 }}>
            <Input
              label="SEARCH"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search expenses..."
            />
          </div>
          {/* Sort */}
          <div style={{ flex: 1, minWidth: 150 }}>
            <Select
              label="SORT BY"
              value={sort}
              onChange={e => setSort(e.target.value)}
              options={SORT_OPTS}
            />
          </div>
          {/* Clear */}
          {(search || sort !== 'date-desc' || filter !== 'All') && (
            <Btn variant="ghost" size="sm" onClick={() => { setSearch(''); setSort('date-desc'); setFilter('All'); }}>
              Clear
            </Btn>
          )}
        </div>

        {/* Category filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 20, border: 'none',
                background: filter === c ? 'var(--accent)' : 'var(--bg3)',
                color: filter === c ? '#fff' : 'var(--text2)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {c !== 'All' && CAT_META[c]?.icon} {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Expense List */}
      <Card>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
          }}>
            <span style={{ fontSize: 40 }}>🔍</span>
            <div style={{ fontWeight: 600 }}>No expenses found</div>
            <div style={{ fontSize: 13 }}>Try changing your filters or adding a new expense.</div>
            <Btn variant="primary" size="sm" onClick={() => setShowForm(true)}>+ Add Expense</Btn>
          </div>
        ) : (
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {filtered.map(tx => (
              <TxItem
                key={tx.id}
                tx={tx}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Delete confirm */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'var(--card2)', border: '1px solid rgba(232,67,147,0.2)',
            borderRadius: 16, padding: '28px', width: 360, textAlign: 'center',
            animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Delete Expense?</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              "{expenses.find(e => e.id === confirm)?.name}" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Btn variant="outline" onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={confirmDelete}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ExpenseForm
          onClose={() => { setShowForm(false); setEditItem(null); }}
          editItem={editItem}
        />
      )}
    </div>
  );
}
