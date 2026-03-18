import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard, Card, SectionHeader, Tag, Btn, TxItem, ProgressBar } from '../components/UI';
import { LineChart, DonutChart } from '../components/Charts';
import ExpenseForm from '../components/ExpenseForm';

export default function Dashboard() {
  const {
    totalSpent, income, savingsRate, budgetLeft, budget,
    expenses, byCategory, weeklySpending, setPage,
  } = useApp();
  const [showForm, setShowForm] = useState(false);

  const wData   = weeklySpending.map(d => d.amount);
  const wLabels = weeklySpending.map(d => new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }));

  const catData   = byCategory.map(c => c.amount);
  const catLabels = byCategory.map(c => c.cat);
  const catColors = byCategory.map(c => c.color);

  const insights = [
    byCategory[0] && {
      icon: '🔥',
      text: <>
        <strong>Top spend:</strong> {byCategory[0].cat} is your biggest category at ₹{byCategory[0].amount.toLocaleString()}{' '}
        ({((byCategory[0].amount / totalSpent) * 100).toFixed(0)}% of total).
      </>,
    },
    budgetLeft < 0 && {
      icon: '⚠️',
      text: <><strong>Over budget!</strong> You've exceeded your ₹{budget.toLocaleString()} budget by ₹{Math.abs(budgetLeft).toLocaleString()}.</>,
    },
    budgetLeft >= 0 && {
      icon: '✅',
      text: <><strong>On track:</strong> ₹{budgetLeft.toLocaleString()} remaining of your ₹{budget.toLocaleString()} monthly budget.</>,
    },
    {
      icon: '💡',
      text: <><strong>Savings:</strong> You're saving {savingsRate}% of your income. {savingsRate >= 20 ? 'Great job!' : 'Aim for 20%+ for financial health.'}</>,
    },
    {
      icon: '🎯',
      text: <><strong>Tip:</strong> Investing ₹5,000/month in NIFTY 50 SIP could grow to ₹9.2L in 10 years at 12% p.a.</>,
    },
  ].filter(Boolean);

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Spent"  value={`₹${totalSpent.toLocaleString()}`}  change="+8.2%" dir="up"   sub="this month" />
        <StatCard label="Total Income" value={`₹${income.toLocaleString()}`}        change="+5%"   dir="up"   sub="Mar 2026"   />
        <StatCard label="Savings Rate" value={`${savingsRate}%`}                    change={savingsRate >= 20 ? '+' : '−'} dir={savingsRate >= 20 ? 'up' : 'down'} sub="of income" />
        <StatCard label="Budget Left"  value={`₹${Math.abs(budgetLeft).toLocaleString()}`} change={budgetLeft < 0 ? 'Over!' : 'Remaining'} dir={budgetLeft < 0 ? 'down' : 'up'} accent={budgetLeft < 0 ? 'var(--red)' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekly Line Chart */}
        <Card>
          <SectionHeader title="Weekly Spending" action={<Tag variant="purple">This Week</Tag>} />
          {wData.some(v => v > 0)
            ? <LineChart data={wData} labels={wLabels} color="#6c5ce7" height={190} />
            : <EmptyChart msg="No spending this week" />
          }
        </Card>

        {/* Category Donut */}
        <Card>
          <SectionHeader title="Spending by Category" />
          {catData.length > 0 ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <DonutChart data={catData} labels={catLabels} colors={catColors} height={200} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 130 }}>
                {byCategory.slice(0, 5).map(c => (
                  <div key={c.cat} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>{c.cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Syne' }}>₹{c.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyChart msg="No expenses yet" />}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Transactions */}
        <Card>
          <SectionHeader
            title="Recent Transactions"
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn size="sm" variant="outline" onClick={() => setPage('expenses')}>View All</Btn>
                <Btn size="sm" variant="primary" onClick={() => setShowForm(true)}>+ Add</Btn>
              </div>
            }
          />
          {expenses.length === 0
            ? <EmptyChart msg="No transactions yet" />
            : expenses.slice(0, 5).map(tx => <TxItem key={tx.id} tx={tx} />)
          }
        </Card>

        {/* AI Insights */}
        <Card>
          <SectionHeader title="✦ AI Insights" action={<Tag variant="purple">Live</Tag>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg,rgba(108,92,231,0.1),rgba(253,121,168,0.06))',
                border: '1px solid rgba(108,92,231,0.15)',
                borderRadius: 12, padding: '12px 14px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
                animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  {ins.text}
                </span>
              </div>
            ))}
          </div>

          {/* Budget progress */}
          <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg3)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Budget Usage</span>
              <span style={{ color: budgetLeft < 0 ? 'var(--red)' : 'var(--orange)' }}>
                ₹{totalSpent.toLocaleString()} / ₹{budget.toLocaleString()}
              </span>
            </div>
            <ProgressBar
              value={totalSpent}
              max={budget}
              color={budgetLeft < 0 ? 'var(--red)' : 'linear-gradient(90deg,var(--accent),var(--pink))'}
            />
          </div>
        </Card>
      </div>

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function EmptyChart({ msg }) {
  return (
    <div style={{
      height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text3)', fontSize: 14, flexDirection: 'column', gap: 8,
    }}>
      <span style={{ fontSize: 32 }}>📭</span>
      <span>{msg}</span>
    </div>
  );
}
