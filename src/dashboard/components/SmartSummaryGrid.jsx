import React from 'react';
import { Btn, Card } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';
import { getDeltaLabel } from '../selectors';

function SmartCard({ title, children, action }) {
  return (
    <Card className="dashboard-smart-card">
      <div className="sec-header">
        <span className="sec-title">{title}</span>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function WeeklyComparisonCard({ data }) {
  return (
    <SmartCard title="This week vs last week">
      <div className="dashboard-smart-stat">{formatCurrency(data.currentWeekSpend)}</div>
      <div className="dashboard-smart-sub">Last week: {formatCurrency(data.lastWeekSpend)}</div>
      <div className={`dashboard-smart-trend ${data.trendDirection === 'up' ? 'down' : data.trendDirection === 'down' ? 'up' : 'neutral'}`}>
        {getDeltaLabel(data.differenceAmount)}
      </div>
    </SmartCard>
  );
}

export function HighestSpendCategoryCard({ data }) {
  return (
    <SmartCard title="Highest spend category">
      {data ? (
        <>
          <div className="dashboard-smart-icon-row">
            <span className="dashboard-inline-icon">{data.icon}</span>
            <strong>{data.categoryName}</strong>
          </div>
          <div className="dashboard-smart-stat">{formatCurrency(data.amountSpent)}</div>
          <div className="dashboard-smart-sub">{data.percentageOfWeeklySpending.toFixed(0)}% of weekly spending</div>
        </>
      ) : (
        <div className="dashboard-empty-inline">No weekly spend data yet.</div>
      )}
    </SmartCard>
  );
}

export function UpcomingSubscriptionsCard({ items, onOpen }) {
  return (
    <SmartCard title="Upcoming subscriptions" action={<Btn variant="outline" size="sm" onClick={onOpen}>Open</Btn>}>
      {items.length ? items.map((item) => (
        <div key={item.id} className="dashboard-mini-row">
          <div>
            <strong>{item.name}</strong>
            <div className="tx-meta">{item.dueLabel}</div>
          </div>
          <div className="tx-amount down">{formatCurrency(item.cost)}</div>
        </div>
      )) : <div className="dashboard-empty-inline">No upcoming subscription items.</div>}
    </SmartCard>
  );
}

export function WalletBalancePreviewCard({ data, onOpen }) {
  return (
    <SmartCard title="Wallet balance" action={<Btn variant="outline" size="sm" onClick={onOpen}>Open</Btn>}>
      {data ? (
        <>
          <div className="dashboard-smart-stat">{formatCurrency(data.totalBalance)}</div>
          <div className="dashboard-smart-sub">This week {data.netCashFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(data.netCashFlow || 0))}</div>
          <div className="tx-meta">Income {formatCurrency(data.weeklyIncome || 0)} · Expense {formatCurrency(data.weeklyExpense || 0)}</div>
        </>
      ) : <div className="dashboard-empty-inline">Wallet connection placeholder.</div>}
    </SmartCard>
  );
}

export function InvestmentSnapshotPreviewCard({ data, onOpen }) {
  return (
    <SmartCard title="Investment snapshot" action={<Btn variant="outline" size="sm" onClick={onOpen}>Open</Btn>}>
      {data ? (
        <>
          <div className="dashboard-smart-stat">{formatCurrency(data.portfolioValue)}</div>
          <div className={`dashboard-smart-sub ${data.gainLossAmount >= 0 ? 'up' : 'down'}`}>
            {data.gainLossAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(data.gainLossAmount))} ({data.gainLossPercent}%)
          </div>
        </>
      ) : <div className="dashboard-empty-inline">Investment preview unavailable.</div>}
    </SmartCard>
  );
}

export function SmartSummaryGrid({
  weeklyComparison,
  categoryHighlight,
  upcomingSubscriptions,
  walletPreview,
  investmentPreview,
  onOpenSubscriptions,
  onOpenWallet,
  onOpenInvestments,
}) {
  return (
    <section className="dashboard-grid-section">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Smart summary cards</span>
        <h2 className="sec-title">Quick previews across the app</h2>
      </div>
      <div className="dashboard-smart-grid">
        <WeeklyComparisonCard data={weeklyComparison} />
        <HighestSpendCategoryCard data={categoryHighlight} />
        <UpcomingSubscriptionsCard items={upcomingSubscriptions} onOpen={onOpenSubscriptions} />
        <WalletBalancePreviewCard data={walletPreview} onOpen={onOpenWallet} />
        <InvestmentSnapshotPreviewCard data={investmentPreview} onOpen={onOpenInvestments} />
      </div>
    </section>
  );
}
