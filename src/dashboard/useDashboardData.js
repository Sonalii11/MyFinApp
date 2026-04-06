import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAIFinancialAssistantPreview } from './services/aiFinancialAssistantService';
import { getDigitalWalletPreview } from './services/digitalWalletService';
import { getExpenseTrackerDashboardData } from './services/expenseTrackerService';
import { getInvestmentPortfolioPreview } from './services/investmentPortfolioService';
import { getSubscriptionManagerPreview } from './services/subscriptionManagerService';
import { buildDashboardSnapshot, getDashboardGreeting } from './selectors';

const EMPTY_FALLBACK = {
  user: {
    id: 'dashboard-user',
    firstName: 'Guest',
    fullName: 'Guest User',
    avatarLabel: 'G',
    membership: 'Premium',
  },
  greeting: 'Good afternoon, Guest',
  cashFlowByPeriod: {
    week: { period: 'week', income: 0, spending: 0, netBalance: 0, currency: 'INR' },
    month: { period: 'month', income: 0, spending: 0, netBalance: 0, currency: 'INR' },
    year: { period: 'year', income: 0, spending: 0, netBalance: 0, currency: 'INR' },
  },
  recentTransactions: [],
  weeklyBudget: { budget: 0, spent: 0, remaining: 0, percentageUsed: 0, status: 'on-track' },
  monthlyBudget: { limit: 0, spent: 0, remaining: 0, percentageUsed: 0, status: 'healthy' },
  weeklyComparison: { currentWeekSpend: 0, lastWeekSpend: 0, differenceAmount: 0, trendDirection: 'flat' },
  categoryHighlight: null,
  upcomingSubscriptions: [],
  walletPreview: null,
  investmentPreview: null,
  aiInsights: [],
  contentCards: [],
  isEmpty: true,
};

export function useDashboardData() {
  const app = useApp();
  const [reloadTick, setReloadTick] = useState(0);
  const [state, setState] = useState({
    data: EMPTY_FALLBACK,
    loading: true,
    error: null,
  });

  const snapshot = useMemo(
    () => ({
      transactions: app.transactions,
      wallets: app.wallets,
      activeWalletId: app.activeWalletId,
      activeWeekStart: app.activeWeekStart,
      weeklyBudgetLimit: app.weeklyBudgetLimit,
      monthlyBudgetLimit: app.monthlyBudgetLimit,
      walletBalance: app.walletBalance,
      walletTransactions: app.walletTransactions,
      subscriptions: app.subscriptions,
      investmentAssets: app.investmentAssets,
      investmentTransactions: app.investmentTransactions,
      investmentPrices: app.investmentPrices,
      weeklySummaries: app.weeklySummaries,
      monthlyReflection: app.monthlyReflection,
      uiData: app.uiData,
      CAT_META: app.CAT_META,
    }),
    [
      app.transactions,
      app.wallets,
      app.activeWalletId,
      app.activeWeekStart,
      app.weeklyBudgetLimit,
      app.monthlyBudgetLimit,
      app.walletBalance,
      app.walletTransactions,
      app.subscriptions,
      app.investmentAssets,
      app.investmentTransactions,
      app.investmentPrices,
      app.weeklySummaries,
      app.monthlyReflection,
      app.uiData,
      app.CAT_META,
    ]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const [expenseData, walletPreview, investmentPreview, upcomingSubscriptions, aiPreview] = await Promise.all([
          getExpenseTrackerDashboardData(snapshot),
          getDigitalWalletPreview(snapshot),
          getInvestmentPortfolioPreview(snapshot),
          getSubscriptionManagerPreview(snapshot),
          getAIFinancialAssistantPreview(snapshot),
        ]);

        if (cancelled) return;

        const base = buildDashboardSnapshot(snapshot);
        const data = {
          ...base,
          ...expenseData,
          walletPreview,
          investmentPreview,
          upcomingSubscriptions,
          aiInsights: aiPreview.aiInsights,
          contentCards: aiPreview.contentCards,
          greeting: getDashboardGreeting(base.user.firstName),
        };

        setState({
          data,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          data: EMPTY_FALLBACK,
          loading: false,
          error: error instanceof Error ? error : new Error('Unable to load dashboard data.'),
        });
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [snapshot, app.dashboardRefreshVersion, reloadTick]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh: {
      version: app.dashboardRefreshVersion,
      lastEvent: app.lastDashboardRefreshEvent,
      reloadStrategy: app.dashboardReloadStrategy,
    },
    reload: () => setReloadTick((current) => current + 1),
  };
}
