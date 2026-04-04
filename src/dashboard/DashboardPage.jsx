import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useDashboardData } from './useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { CashFlowSummaryCard } from './components/CashFlowSummaryCard';
import { RecentTransactionsPreview } from './components/RecentTransactionsPreview';
import { WeeklyBudgetCard } from './components/WeeklyBudgetCard';
import { MonthlyBudgetPreviewCard } from './components/MonthlyBudgetPreviewCard';
import { SmartSummaryGrid } from './components/SmartSummaryGrid';
import { DashboardInsightsSection } from './components/DashboardInsightsSection';
import { DashboardEmptyState, DashboardErrorState, DashboardLoadingState } from './components/DashboardStates';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { openTransactionModal } = useApp();
  const { data, loading, error, actions, reload } = useDashboardData();
  const [period, setPeriod] = useState('week');

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

  if (loading) return <DashboardLoadingState />;
  if (error) return <DashboardErrorState message={error.message} onRetry={reload} />;

  return (
    <Page className="z1">
      <div className="dashboard-page-shell">
        <DashboardHeader
          greeting={data.greeting}
          user={data.user}
          onOpenSearch={actions.onOpenSearch}
          onOpenProfile={actions.onOpenProfile}
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
            onOpenTransaction={actions.onOpenTransactionDetails}
          />
          <WeeklyBudgetCard
            summary={data.weeklyBudget}
            onViewWeeklyBudget={actions.onOpenWeeklyBudget}
            onAdjustBudget={actions.onAdjustWeeklyBudget}
          />
        </div>

        <MonthlyBudgetPreviewCard
          summary={data.monthlyBudget}
          onOpenBudgetSetup={actions.onOpenBudgetSetup}
        />

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

        <DashboardInsightsSection
          contentCards={data.contentCards}
          aiInsights={data.aiInsights}
          onOpenContentCard={actions.onOpenContentCard}
          onOpenAI={navigation.onOpenAI}
        />

        {data.isEmpty ? <DashboardEmptyState /> : null}
      </div>
    </Page>
  );
}
