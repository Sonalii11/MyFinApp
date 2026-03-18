import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, SectionHeader, Tag, Btn, ProgressBar } from '../components/UI';
import { LineChart, BarChart, DonutChart } from '../components/Charts';
import ExpenseForm from '../components/ExpenseForm';

export default function ChartsPage() {
  const {
    expenses, byCategory, weeklySpending, monthlySpending, dailySpending,
    totalSpent, income, budget, budgetLeft, CAT_META,
  } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [range, setRange]       = useState(7); // days for line chart

  // Daily line chart
  const dailySlice  = dailySpending.slice(-range);
  const dailyData   = dailySlice.map(d => d.amount);
  const dailyLabels = dailySlice.map(d => {
    const dt = new Date(d.date);
    return range <= 7
      ? dt.toLocaleDateString('en-IN', { weekday: 'short' })
      : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  });

  // Monthly bar
  const mData   = monthlySpending.map(m => m.amount);
  const mLabels = monthlySpending.map(m => m.label);

  // Category donut
  const catData   = byCategory.map(c => c.amount);
  const catLabels = byCategory.map(c => c.cat);
  const catColors = byCategory.map(c => c.color);

  const ranges = [7, 14, 30];

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Expenses', value: expenses.length, sub: 'transactions', color: 'var(--accent2)' },
          { label: 'Total Spent',    value: `₹${totalSpent.toLocaleString()}`, sub: 'this period', color: 'var(--red)' },
          { label: 'Avg per Day',    value: `₹${dailySpending.length ? Math.round(totalSpent / dailySpending.filter(d=>d.amount>0).length || 1).toLocaleString() : 0}`, sub: 'on spending days', color: 'var(--orange)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '18px',
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Daily spending line chart */}
      <Card style={{ marginBottom: 16 }}>
        <SectionHeader
          title="Daily Spending Trend"
          action={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {ranges.map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: range === r ? 'var(--accent)' : 'var(--bg3)',
                  color: range === r ? '#fff' : 'var(--text2)',
                  fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                }}>{r}d</button>
              ))}
              <Btn size="sm" variant="primary" onClick={() => setShowForm(true)}>+ Add</Btn>
            </div>
          }
        />
        {dailyData.some(v => v > 0)
          ? <LineChart data={dailyData} labels={dailyLabels} color="#6c5ce7" height={220} />
          : <EmptyState />
        }
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Monthly Bar */}
        <Card>
          <SectionHeader title="Monthly Spending" action={<Tag variant="green">Bar Chart</Tag>} />
          {mData.length > 0
            ? <BarChart data={mData} labels={mLabels} height={220} />
            : <EmptyState />
          }
        </Card>

        {/* Category Donut */}
        <Card>
          <SectionHeader title="Category Breakdown" action={<Tag variant="orange">Donut</Tag>} />
          {catData.length > 0 ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <DonutChart data={catData} labels={catLabels} colors={catColors} height={220} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 130 }}>
                {byCategory.map((c, i) => (
                  <div key={c.cat}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, flex: 1, color: 'var(--text2)' }}>{c.cat}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Syne' }}>
                        {((c.amount / totalSpent) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar value={c.amount} max={totalSpent} color={c.color} />
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState />}
        </Card>
      </div>

      {/* Category table */}
      <Card>
        <SectionHeader title="Category Analysis" />
        {byCategory.length === 0 ? <EmptyState /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Category', 'Transactions', 'Total Spent', '% of Total', 'vs Budget', 'Trend'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byCategory.map((c, i) => {
                  const txCount = expenses.filter(e => e.cat === c.cat).length;
                  const catBudget = Math.round(budget * (i === 0 ? 0.3 : i === 1 ? 0.2 : 0.15));
                  const over = c.amount > catBudget;
                  return (
                    <tr key={c.cat} style={{ borderBottom: '1px solid var(--border)', animation: `fadeUp 0.3s ease ${i*0.05}s both` }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                            {c.icon}
                          </div>
                          <span style={{ fontWeight: 600 }}>{c.cat}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--text2)' }}>{txCount}</td>
                      <td style={{ padding: '14px 12px', fontFamily: 'Syne', fontWeight: 700, color: 'var(--red)' }}>₹{c.amount.toLocaleString()}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${(c.amount / totalSpent) * 100}%`, background: c.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>
                            {((c.amount / totalSpent) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: over ? 'rgba(232,67,147,0.1)' : 'rgba(85,239,196,0.1)',
                          color: over ? 'var(--red)' : 'var(--green2)',
                        }}>
                          {over ? '↑ Over' : '✓ OK'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: i % 2 === 0 ? 'var(--green2)' : 'var(--red)', fontWeight: 600, fontSize: 13 }}>
                        {i % 2 === 0 ? '↑ +5%' : '↓ -3%'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      height: 180, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'var(--text2)', gap: 8,
    }}>
      <span style={{ fontSize: 32 }}>📊</span>
      <span style={{ fontSize: 14 }}>Add expenses to see charts update live</span>
    </div>
  );
}
