import React, { useState } from 'react';
import { Card, SectionHeader, Tag, Btn, ProgressBar, Modal, Input, Select } from '../components/UI';
import { v4 as uuid } from 'uuid';

const INIT_SUBS = [
  { id: uuid(), name: 'Netflix',       icon: '🎬', price: 649,  date: '2026-03-22', color: '#e50914', tag: 'Entertainment' },
  { id: uuid(), name: 'Spotify',       icon: '🎵', price: 119,  date: '2026-03-19', color: '#1db954', tag: 'Music'         },
  { id: uuid(), name: 'Amazon Prime',  icon: '📦', price: 299,  date: '2026-04-01', color: '#ff9900', tag: 'Shopping'      },
  { id: uuid(), name: 'Hotstar',       icon: '⭐', price: 899,  date: '2026-04-05', color: '#1c44b9', tag: 'OTT'          },
  { id: uuid(), name: 'Notion',        icon: '📝', price: 160,  date: '2026-03-28', color: '#eeeeee', tag: 'Productivity'  },
  { id: uuid(), name: 'Canva Pro',     icon: '🎨', price: 399,  date: '2026-04-10', color: '#00c4cc', tag: 'Design'        },
];

const TAGS = ['Entertainment', 'Music', 'Shopping', 'OTT', 'Productivity', 'Design', 'Health', 'Education', 'Other'];
const ICONS = ['🎬', '🎵', '📦', '⭐', '📝', '🎨', '💪', '📚', '🎮', '☁️', '🔒', '📧'];

const EMPTY_SUB = { name: '', icon: '📱', price: '', date: new Date().toISOString().slice(0,10), color: '#6c5ce7', tag: 'Other' };

export default function Subscriptions() {
  const [subs,     setSubs]     = useState(INIT_SUBS);
  const [showForm, setShowForm] = useState(false);
  const [editSub,  setEditSub]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_SUB);

  const total  = subs.reduce((s, x) => s + x.price, 0);
  const annual = total * 12;
  const budget = 3000;

  const today = new Date('2026-03-18');
  const daysLeft = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const openAdd  = ()    => { setForm(EMPTY_SUB); setEditSub(null); setShowForm(true); };
  const openEdit = (sub) => { setForm({ ...sub, price: String(sub.price) }); setEditSub(sub); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.price) return;
    const payload = { ...form, price: +form.price };
    if (editSub) {
      setSubs(p => p.map(s => s.id === editSub.id ? { ...payload, id: editSub.id } : s));
    } else {
      setSubs(p => [...p, { ...payload, id: uuid() }]);
    }
    setShowForm(false);
  };

  const del = (id) => setSubs(p => p.filter(s => s.id !== id));

  const sorted = [...subs].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Monthly Cost', value: `₹${total.toLocaleString()}`, color: 'var(--accent2)' },
          { label: 'Annual Cost',  value: `₹${annual.toLocaleString()}`, color: 'var(--red)' },
          { label: 'Active Plans', value: subs.length, color: 'var(--green2)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', animation: `fadeUp 0.4s ease ${i*0.08}s both` }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Budget */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Budget Usage</span>
          <span style={{ color: total > budget ? 'var(--red)' : 'var(--orange)', fontSize: 14 }}>
            ₹{total} / ₹{budget}
          </span>
        </div>
        <ProgressBar value={total} max={budget} color={total > budget ? 'var(--red)' : 'linear-gradient(90deg,var(--accent),var(--pink))'} />
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
          {total > budget
            ? `⚠️ ₹${total - budget} over budget — consider pausing some subscriptions`
            : `✓ ₹${budget - total} remaining in your subscription budget`
          }
        </div>
      </Card>

      {/* Grid + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700 }}>All Subscriptions</div>
        <Btn variant="primary" size="sm" onClick={openAdd}>+ Add Subscription</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {subs.map((s, i) => {
          const dl = daysLeft(s.date);
          const urgent = dl <= 5;
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
              background: 'var(--card2)', border: '1px solid var(--border)',
              borderRadius: 12, transition: 'all 0.2s',
              animation: `fadeUp 0.35s ease ${i * 0.05}s both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>{s.name}</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>₹{s.price}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <Tag variant="blue">{s.tag}</Tag>
                  <span style={{ fontSize: 11, fontWeight: 700, color: urgent ? 'var(--red)' : 'var(--green2)' }}>
                    {dl <= 0 ? '🔴 Due today' : urgent ? `⚠️ ${dl}d` : `✓ ${dl}d`}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={() => openEdit(s)} style={{ background: 'rgba(162,155,254,0.1)', color: 'var(--accent2)', border: 'none', borderRadius: 6, padding: '4px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                <button onClick={() => del(s.id)} style={{ background: 'rgba(232,67,147,0.1)', color: 'var(--red)', border: 'none', borderRadius: 6, padding: '4px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Del</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Renewals */}
      <Card>
        <SectionHeader title="📅 Renewal Timeline" />
        {sorted.map((s, i) => {
          const dl = daysLeft(s.date);
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)',
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 8 }}>{s.date}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>₹{s.price}</div>
                <div style={{ fontSize: 11, color: dl <= 5 ? 'var(--red)' : 'var(--text2)' }}>
                  {dl <= 0 ? 'Due today!' : `in ${dl} days`}
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal title={editSub ? '✏️ Edit Subscription' : '+ Add Subscription'} onClose={() => setShowForm(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Icon picker */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 8 }}>ICON</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{
                    width: 36, height: 36, borderRadius: 9, border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: form.icon === ic ? 'rgba(108,92,231,0.15)' : 'var(--bg3)',
                    fontSize: 18, cursor: 'pointer',
                  }}>{ic}</button>
                ))}
              </div>
            </div>
            <Input label="NAME" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Netflix" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="PRICE / MONTH (₹)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" />
              <Input label="NEXT BILLING DATE" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <Select label="TAG" value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} options={TAGS} />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Btn variant="outline" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn variant="primary" onClick={save} style={{ flex: 1, justifyContent: 'center' }}>{editSub ? 'Save' : 'Add'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
