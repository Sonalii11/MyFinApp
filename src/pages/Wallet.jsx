import React, { useState } from 'react';
import { Card, SectionHeader, Btn, Input, Tag } from '../components/UI';
import { v4 as uuid } from 'uuid';

const INIT_TXS = [
  { id: uuid(), name: 'Rahul Sharma',   type: 'sent',     amount: 500,   time: '2h ago',  icon: '👤' },
  { id: uuid(), name: 'Salary Credit',  type: 'received', amount: 68000, time: 'Mar 1',   icon: '💼' },
  { id: uuid(), name: 'Priya M.',       type: 'sent',     amount: 1200,  time: 'Mar 15',  icon: '👤' },
  { id: uuid(), name: 'Cashback',       type: 'received', amount: 84,    time: 'Mar 14',  icon: '🎁' },
  { id: uuid(), name: 'Suresh K.',      type: 'sent',     amount: 350,   time: 'Mar 10',  icon: '👤' },
];

export default function Wallet() {
  const [txs,      setTxs]      = useState(INIT_TXS);
  const [to,       setTo]       = useState('');
  const [amt,      setAmt]      = useState('');
  const [note,     setNote]     = useState('');
  const [sent,     setSent]     = useState(false);

  const balance = txs.reduce((s, t) => s + (t.type === 'received' ? t.amount : -t.amount), 0);

  const send = () => {
    if (!to || !amt || +amt <= 0) return;
    setTxs(p => [{
      id: uuid(), name: to, type: 'sent',
      amount: +amt, time: 'just now', icon: '👤',
      note,
    }, ...p]);
    setTo(''); setAmt(''); setNote('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  const QUICK = [100, 200, 500, 1000, 2000];

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      {/* Wallet Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4a3fcb, #7c3fa0, #c2185b)',
        borderRadius: 22, padding: '28px 28px 24px', color: '#fff',
        position: 'relative', overflow: 'hidden', marginBottom: 20,
        boxShadow: '0 16px 48px rgba(74,63,203,0.35)',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 30, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, letterSpacing: '0.06em', fontWeight: 600 }}>TOTAL BALANCE</div>
          <div style={{ fontFamily: 'Syne', fontSize: 38, fontWeight: 800, letterSpacing: '-1.5px' }}>
            ₹{Math.abs(balance).toLocaleString()}
          </div>
          <div style={{ marginTop: 14, opacity: 0.65, fontSize: 14, letterSpacing: 2 }}>•••• •••• •••• 4821</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.06em' }}>CARDHOLDER</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>Aryan Mehta</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.06em' }}>EXPIRES</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>09/29</div>
            </div>
            <div style={{ fontSize: 32, opacity: 0.5 }}>◎◎</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Send',     icon: '↗', color: 'var(--accent)' },
          { label: 'Receive',  icon: '↙', color: 'var(--green)' },
          { label: 'Scan QR',  icon: '▦', color: 'var(--orange)' },
          { label: 'Add Card', icon: '＋', color: 'var(--pink)' },
        ].map((a, i) => (
          <div key={i} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.2s',
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: a.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 9px', fontSize: 20, color: a.color }}>{a.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Send money */}
        <Card>
          <SectionHeader title="Send Money" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="TO (UPI ID / NAME)" value={to} onChange={e => setTo(e.target.value)} placeholder="name@upi or phone" />
            <Input label="AMOUNT (₹)" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
            <Input label="NOTE (OPTIONAL)" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." />
            {/* Quick amounts */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 6 }}>QUICK AMOUNTS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {QUICK.map(v => (
                  <button key={v} onClick={() => setAmt(String(v))} style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border2)',
                    background: amt === String(v) ? 'var(--accent)' : 'transparent',
                    color: amt === String(v) ? '#fff' : 'var(--text2)',
                    fontSize: 12, cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s',
                  }}>₹{v}</button>
                ))}
              </div>
            </div>
            {sent ? (
              <div style={{ background: 'rgba(85,239,196,0.12)', border: '1px solid rgba(85,239,196,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center', color: 'var(--green2)', fontWeight: 600 }}>
                ✓ Money sent successfully!
              </div>
            ) : (
              <Btn variant="primary" onClick={send} style={{ justifyContent: 'center', marginTop: 4 }}>
                Send {amt ? `₹${(+amt).toLocaleString()}` : 'Money'}
              </Btn>
            )}
          </div>
        </Card>

        {/* Transactions */}
        <Card>
          <SectionHeader title="Recent Transactions" action={<Tag variant="blue">Live</Tag>} />
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {txs.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 0', borderBottom: '1px solid var(--border)',
                animation: 'fadeUp 0.3s ease both',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {tx.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{tx.time}</div>
                </div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, color: tx.type === 'received' ? 'var(--green2)' : 'var(--red)', fontSize: 14 }}>
                  {tx.type === 'received' ? '+' : '−'}₹{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
