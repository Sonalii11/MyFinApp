import React, { useState } from 'react';
import { Card, SectionHeader, Tag, Btn } from '../components/UI';
import { LineChart, DonutChart } from '../components/Charts';

const STOCKS = [
  { tick: 'RELIANCE', name: 'Reliance Industries', price: 2847.50, change: +1.34, invested: 142375, color: '#74b9ff' },
  { tick: 'TCS',      name: 'Tata Consultancy',    price: 3912.00, change: -0.72, invested: 195600, color: '#00cec9' },
  { tick: 'INFY',     name: 'Infosys Ltd',          price: 1450.25, change: +2.18, invested: 72512,  color: '#a29bfe' },
  { tick: 'BTC',      name: 'Bitcoin',              price: 6847320, change: +3.45, invested: 342366, color: '#fdcb6e' },
  { tick: 'ETH',      name: 'Ethereum',             price: 283450,  change: -1.22, invested: 56690,  color: '#627EEA' },
];

const PORTFOLIO = [420000,435000,410000,455000,448000,472000,490000,505000,498000,520000,515000,531455];
const P_LABELS  = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

const ALLOC = { labels: ['Stocks','Crypto','Mutual Funds','Cash'], data: [42,28,18,12], colors: ['#6c5ce7','#fdcb6e','#00cec9','#74b9ff'] };

export default function Investments() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalInvested = STOCKS.reduce((s, st) => s + st.invested, 0);
  const currentVal    = totalInvested * 1.265;
  const pnl           = currentVal - totalInvested;

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 2, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portfolio Value</div>
          <div style={{ fontFamily: 'Syne', fontSize: 34, fontWeight: 800, marginTop: 6 }}>₹{Math.round(currentVal).toLocaleString()}</div>
          <div style={{ color: 'var(--green2)', fontSize: 14, marginTop: 6 }}>↑ +₹23,890 (+4.71%) this month</div>
        </div>
        {[
          { label: 'Invested', value: `₹${totalInvested.toLocaleString()}`, color: 'var(--text2)' },
          { label: 'Total P&L', value: `+₹${Math.round(pnl).toLocaleString()}`, color: 'var(--green2)' },
          { label: 'Returns',   value: '+26.5%', color: 'var(--green2)' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <SectionHeader title="Portfolio Growth" action={<Tag variant="green">1 Year</Tag>} />
          <LineChart data={PORTFOLIO} labels={P_LABELS} color="#00cec9" height={200} />
        </Card>
        <Card>
          <SectionHeader title="Asset Allocation" />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <DonutChart data={ALLOC.data} labels={ALLOC.labels} colors={ALLOC.colors} height={200} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALLOC.labels.map((l, i) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 3, background: ALLOC.colors[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)', width: 90 }}>{l}</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{ALLOC.data[i]}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Holdings table */}
      <Card>
        <SectionHeader title="Holdings" action={<Btn size="sm" variant="primary">+ Buy / Sell</Btn>} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Asset', 'Price', '24h', 'Invested', 'Current Value', 'P&L'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STOCKS.map((s, i) => {
                const curr = s.invested * 1.265;
                const gain = curr - s.invested;
                return (
                  <tr key={s.tick} style={{ borderBottom: '1px solid var(--border)', animation: `fadeUp 0.3s ease ${i*0.06}s both` }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontWeight: 800, fontSize: 11 }}>
                          {s.tick.slice(0, 3)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.tick}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: 'Syne', fontWeight: 700 }}>₹{s.price.toLocaleString()}</td>
                    <td style={{ padding: '14px 12px', color: s.change > 0 ? 'var(--green2)' : 'var(--red)', fontWeight: 700 }}>
                      {s.change > 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                    </td>
                    <td style={{ padding: '14px 12px' }}>₹{s.invested.toLocaleString()}</td>
                    <td style={{ padding: '14px 12px', fontFamily: 'Syne', fontWeight: 700 }}>₹{Math.round(curr).toLocaleString()}</td>
                    <td style={{ padding: '14px 12px', color: 'var(--green2)', fontWeight: 700 }}>+₹{Math.round(gain).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
