import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Btn, Modal, Page, Tag } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useDashboardData } from './useDashboardData';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { DashboardHeader } from './components/DashboardHeader';
import { CashFlowSummaryCard } from './components/CashFlowSummaryCard';
import { RecentTransactionsPreview } from './components/RecentTransactionsPreview';
import { WeeklyBudgetCard } from './components/WeeklyBudgetCard';
import { MonthlyBudgetPreviewCard } from './components/MonthlyBudgetPreviewCard';
import { SmartSummaryGrid } from './components/SmartSummaryGrid';
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState } from './components/DashboardStates';
import BudgetSettingsCard from '../components/BudgetSettingsCard';
import WeeklySpendingChart from '../components/WeeklySpendingChart';
import MonthlyBudgetProgress from '../components/MonthlyBudgetProgress';
import { formatCurrency } from '../utils/finance';
import { getBudgetTone } from './selectors';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    openTransactionModal,
    weeklyBudgetLimit,
    monthlyBudgetLimit,
    monthlyBudgetOverride,
    setWeeklyBudgetLimit,
    setMonthlyBudgetLimit,
    resetMonthlyBudgetToDefault,
    transactions,
    activeWeekStart,
    CAT_META,
    walletTransactions,
  } = useApp();
  const { data, loading, error, reload } = useDashboardData();
  const [period, setPeriod] = useState('week');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isWeeklyDetailsOpen, setIsWeeklyDetailsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const metrics = useDashboardMetrics({
    transactions,
    weeklyBudgetLimit,
    monthlyBudgetLimit,
    selectedPeriod: period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'annual',
    activeWeekStart,
    categoryMeta: CAT_META,
  });

  const navigation = useMemo(
    () => ({
      onOpenExpenseTracker: () => navigate('/expenses'),
      onOpenSubscriptions: () => navigate('/subscriptions'),
      onOpenWallet: () => navigate('/wallet'),
      onOpenInvestments: () => navigate('/investments'),
      onOpenAI: () => navigate('/ai-chat'),
    }),
    [navigate]
  );

  const selectedTransaction = transactions.find((item) => item.id === selectedTransactionId) || null;
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const pageResults = [
      { id: 'page-expenses', type: 'page', title: 'Expense Tracker', subtitle: 'Transactions, budgets, and alerts', onOpen: () => navigate('/expenses') },
      { id: 'page-wallet', type: 'page', title: 'Wallet', subtitle: 'Balance, quick actions, and transfers', onOpen: () => navigate('/wallet') },
      { id: 'page-investments', type: 'page', title: 'Investment Portfolio', subtitle: 'Assets, analytics, and goals', onOpen: () => navigate('/investments') },
      { id: 'page-subscriptions', type: 'page', title: 'Subscriptions', subtitle: 'Recurring payments and renewals', onOpen: () => navigate('/subscriptions') },
    ].filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query));

    const transactionResults = transactions
      .filter((item) => `${item.title} ${item.category} ${item.account || ''} ${item.notes || ''}`.toLowerCase().includes(query))
      .slice(0, 6)
      .map((item) => ({
        id: `tx-${item.id}`,
        type: 'transaction',
        title: item.title,
        subtitle: `${item.category} · ${item.date}`,
        onOpen: () => {
          setSelectedTransactionId(item.id);
          setIsSearchOpen(false);
        },
      }));

    const walletResults = walletTransactions
      .filter((item) => `${item.note || ''} ${item.assetName || ''} ${item.source || ''} ${item.category || ''}`.toLowerCase().includes(query))
      .slice(0, 4)
      .map((item) => ({
        id: `wallet-${item.id}`,
        type: 'wallet',
        title: item.note || item.assetName || item.type,
        subtitle: `${item.date} · ₹${Number(item.amount || 0).toLocaleString('en-IN')}`,
        onOpen: () => {
          setIsSearchOpen(false);
          navigate('/wallet');
        },
      }));

    return [...transactionResults, ...walletResults, ...pageResults];
  }, [navigate, searchQuery, transactions, walletTransactions]);

  if (loading) return <DashboardLoadingState />;
  if (error) return <DashboardErrorState message={error.message} onRetry={reload} />;

  const weeklyTone = getBudgetTone(data.weeklyBudget.status);

  return (
    <Page className="z1">
      <div className="dashboard-page-shell">
        <DashboardHeader
          greeting={data.greeting}
          user={data.user}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        <CashFlowSummaryCard
          period={period}
          onChangePeriod={setPeriod}
          summaries={data.cashFlowByPeriod}
          onAddIncome={() => openTransactionModal('income')}
          onAddExpense={() => openTransactionModal('expense')}
        />

        <div className="dashboard-two-column">
          <RecentTransactionsPreview
            transactions={data.recentTransactions}
            loading={loading}
            onSeeAll={navigation.onOpenExpenseTracker}
            onOpenTransaction={(transaction) => setSelectedTransactionId(transaction.id)}
          />
          <WeeklyBudgetCard
            summary={data.weeklyBudget}
            onViewWeeklyBudget={() => setIsWeeklyDetailsOpen(true)}
            onAdjustBudget={() => setIsBudgetModalOpen(true)}
          />
        </div>

        <MonthlyBudgetPreviewCard
          summary={data.monthlyBudget}
          onOpenBudgetSetup={() => setIsBudgetModalOpen(true)}
        />

        <div className="dashboard-two-column">
          <WeeklySpendingChart
            heroChart={metrics.heroChart}
            weeklySummary={metrics.weeklySummary}
            activeWeekLabel={metrics.activeWeek.label}
            weeklyBudgetLimit={weeklyBudgetLimit}
          />
          <MonthlyBudgetProgress monthlyProgress={metrics.monthlyProgress} />
        </div>

        <SmartSummaryGrid
          weeklyComparison={data.weeklyComparison}
          categoryHighlight={data.categoryHighlight}
          upcomingSubscriptions={data.upcomingSubscriptions}
          walletPreview={data.walletPreview}
          investmentPreview={data.investmentPreview}
          onOpenSubscriptions={navigation.onOpenSubscriptions}
          onOpenWallet={navigation.onOpenWallet}
          onOpenInvestments={navigation.onOpenInvestments}
        />

        {data.isEmpty ? <DashboardEmptyState /> : null}
      </div>

      {isBudgetModalOpen ? (
        <Modal title="Adjust Budget" onClose={() => setIsBudgetModalOpen(false)}>
          <BudgetSettingsCard
            weeklyBudgetLimit={weeklyBudgetLimit}
            monthlyBudgetLimit={monthlyBudgetLimit}
            monthlyBudgetOverride={monthlyBudgetOverride}
            onWeeklyBudgetChange={setWeeklyBudgetLimit}
            onMonthlyBudgetChange={setMonthlyBudgetLimit}
            onResetMonthlyBudget={resetMonthlyBudgetToDefault}
          />
        </Modal>
      ) : null}

      {isWeeklyDetailsOpen ? (
        <Modal title="Weekly Budget Details" onClose={() => setIsWeeklyDetailsOpen(false)}>
          <div className="dashboard-weekly-detail-stack">
            <div className="sec-header">
              <div>
                <span className="dashboard-section-label">This week</span>
                <div className="sec-title">Weekly budget health</div>
              </div>
              <Tag variant={weeklyTone === 'danger' ? 'red' : weeklyTone === 'warning' ? 'orange' : 'green'}>
                {data.weeklyBudget.status === 'on-track' ? 'On track' : data.weeklyBudget.status === 'near-limit' ? 'Near limit' : 'Exceeded'}
              </Tag>
            </div>

            <div className="budget-highlight-grid">
              <div>
                <span className="dashboard-kpi-label">Budget</span>
                <strong className="dashboard-kpi-value">{formatCurrency(data.weeklyBudget.budget)}</strong>
              </div>
              <div>
                <span className="dashboard-kpi-label">Spent</span>
                <strong className="dashboard-kpi-value">{formatCurrency(data.weeklyBudget.spent)}</strong>
              </div>
              <div>
                <span className="dashboard-kpi-label">{data.weeklyBudget.remaining >= 0 ? 'Remaining' : 'Over by'}</span>
                <strong className={`dashboard-kpi-value ${data.weeklyBudget.remaining < 0 ? 'down' : 'up'}`}>
                  {formatCurrency(Math.abs(data.weeklyBudget.remaining))}
                </strong>
              </div>
            </div>

            <div className="dashboard-budget-meter">
              <div className="dashboard-budget-meter-track">
                <div
                  className={`dashboard-budget-meter-fill ${weeklyTone}`}
                  style={{ width: `${Math.min(100, Math.max(6, data.weeklyBudget.percentageUsed))}%` }}
                />
              </div>
              <div className="dashboard-budget-meta">
                <span>{data.weeklyBudget.percentageUsed.toFixed(0)}% used</span>
                <span>{data.weeklyBudget.carryForwardAmount ? `${formatCurrency(data.weeklyBudget.carryForwardAmount)} carry-forward applied` : 'No carry-forward applied'}</span>
              </div>
            </div>

            <div className="dashboard-smart-grid">
              <div className="dashboard-smart-card">
                <div className="sec-header">
                  <span className="sec-title">This week vs last week</span>
                </div>
                <div className="dashboard-smart-stat">{formatCurrency(data.weeklyComparison.currentWeekSpend)}</div>
                <div className="dashboard-smart-sub">Last week: {formatCurrency(data.weeklyComparison.lastWeekSpend)}</div>
              </div>

              <div className="dashboard-smart-card">
                <div className="sec-header">
                  <span className="sec-title">Top spend category</span>
                </div>
                {data.categoryHighlight ? (
                  <>
                    <div className="dashboard-smart-icon-row">
                      <span className="dashboard-inline-icon">{data.categoryHighlight.icon}</span>
                      <strong>{data.categoryHighlight.categoryName}</strong>
                    </div>
                    <div className="dashboard-smart-stat">{formatCurrency(data.categoryHighlight.amountSpent)}</div>
                    <div className="dashboard-smart-sub">{data.categoryHighlight.percentageOfWeeklySpending.toFixed(0)}% of weekly spending</div>
                  </>
                ) : (
                  <div className="dashboard-empty-inline">No weekly spend data yet.</div>
                )}
              </div>
            </div>

            <div className="dashboard-inline-actions">
              <Btn variant="outline" onClick={() => {
                setIsWeeklyDetailsOpen(false);
                navigate('/expenses');
              }}>
                Open Expense Tracker
              </Btn>
              <Btn variant="primary" onClick={() => {
                setIsWeeklyDetailsOpen(false);
                setIsBudgetModalOpen(true);
              }}>
                Adjust budget
              </Btn>
            </div>
          </div>
        </Modal>
      ) : null}

      {isSearchOpen ? (
        <Modal title="Search Dashboard" onClose={() => setIsSearchOpen(false)}>
          <div className="portfolio-goal-card">
            <input
              className="input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search transactions, wallet activity, or pages"
            />
            <div className="portfolio-table">
              {searchQuery.trim() ? searchResults.length ? searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="transaction-preview-item"
                  onClick={item.onOpen}
                >
                  <div>
                    <div className="tx-name">{item.title}</div>
                    <div className="tx-meta">{item.subtitle}</div>
                  </div>
                  <div className="text2">{item.type}</div>
                </button>
              )) : <div className="dashboard-empty-inline">No results found.</div> : <div className="dashboard-empty-inline">Start typing to search the dashboard.</div>}
            </div>
          </div>
        </Modal>
      ) : null}

      {isProfileOpen ? (
        <Modal title="Profile & Preferences" onClose={() => setIsProfileOpen(false)}>
          <div className="portfolio-goal-card">
            <div className="portfolio-goal-top">
              <div>
                <div className="portfolio-metric-label">Account</div>
                <div className="sec-title">{data.user.fullName}</div>
                <div className="text2">Weekly-first budgeting member</div>
              </div>
              <Tag variant="green">Active</Tag>
            </div>
            <div className="portfolio-goal-metrics">
              <div>
                <span className="text2">Weekly budget</span>
                <strong>{formatCurrency(weeklyBudgetLimit)}</strong>
              </div>
              <div>
                <span className="text2">4-week budget</span>
                <strong>{formatCurrency(monthlyBudgetLimit)}</strong>
              </div>
            </div>
            <div className="dashboard-inline-actions">
              <Btn variant="outline" onClick={() => {
                setIsProfileOpen(false);
                setIsBudgetModalOpen(true);
              }}>
                Budget settings
              </Btn>
              <Btn variant="primary" onClick={() => {
                setIsProfileOpen(false);
                navigate('/ai-chat');
              }}>
                Open AI Assistant
              </Btn>
            </div>
          </div>
        </Modal>
      ) : null}

      {selectedTransaction ? (
        <Modal title="Transaction Details" onClose={() => setSelectedTransactionId('')}>
          <div className="portfolio-goal-card">
            <div className="portfolio-goal-top">
              <div>
                <div className="portfolio-metric-label">Transaction</div>
                <div className="sec-title">{selectedTransaction.title}</div>
                <div className="text2">{selectedTransaction.type} · {selectedTransaction.category}</div>
              </div>
              <Tag variant={selectedTransaction.type === 'income' ? 'green' : selectedTransaction.type === 'expense' ? 'red' : 'blue'}>
                {selectedTransaction.type}
              </Tag>
            </div>
            <div className="portfolio-goal-metrics">
              <div>
                <span className="text2">Amount</span>
                <strong>{formatCurrency(selectedTransaction.amount)}</strong>
              </div>
              <div>
                <span className="text2">Date</span>
                <strong>{selectedTransaction.date}</strong>
              </div>
              <div>
                <span className="text2">Account</span>
                <strong>{selectedTransaction.account || selectedTransaction.fromAccount || 'Primary account'}</strong>
              </div>
              <div>
                <span className="text2">Source</span>
                <strong>{selectedTransaction.type === 'transfer' ? 'Wallet transfer' : 'Expense tracker'}</strong>
              </div>
            </div>
            {selectedTransaction.notes ? (
              <div className="dashboard-inline-note safe">{selectedTransaction.notes}</div>
            ) : null}
            <div className="dashboard-inline-actions">
              <Btn variant="outline" onClick={() => {
                setSelectedTransactionId('');
                navigate('/expenses');
              }}>
                Open Expense Tracker
              </Btn>
            </div>
          </div>
        </Modal>
      ) : null}
    </Page>
  );
}
