import {
  calculateBudgetProgress,
  calculateExpense,
  calculateIncome,
  formatDateKey,
  getTransactionsForLast4Weeks,
  getTransactionsForMonthRollup,
  getTransactionsForWeek,
  getTransactionsForYear,
  sortTransactionsNewestFirst,
  startOfWeek,
} from '../utils/budgeting';
import { formatCurrency, formatShortDate, getRenewalDaysLeft } from '../utils/finance';

export function getDashboardGreeting(userName, date = new Date()) {
  const hour = date.getHours();
  const prefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${prefix}, ${userName}`;
}

export function getCashFlowSummaryFromTransactions(period, transactions) {
  const income = calculateIncome(transactions);
  const spending = calculateExpense(transactions);
  return {
    period,
    income,
    spending,
    netBalance: income - spending,
    currency: 'INR',
  };
}

export function getWeeklyBudgetStatus(percentageUsed) {
  if (percentageUsed > 100) return 'exceeded';
  if (percentageUsed >= 75) return 'near-limit';
  return 'on-track';
}

export function getMonthlyBudgetStatus(percentageUsed) {
  if (percentageUsed > 100) return 'exceeded';
  if (percentageUsed >= 80) return 'near-limit';
  return 'healthy';
}

export function getWeeklyBudgetSummary({
  transactions,
  activeWeekStart,
  weeklyBudgetLimit,
  carryForwardAmount = 0,
}) {
  const weekTransactions = getTransactionsForWeek(transactions, activeWeekStart);
  const spent = calculateExpense(weekTransactions);
  const effectiveBudget = weeklyBudgetLimit + carryForwardAmount;
  const progress = calculateBudgetProgress(spent, effectiveBudget);
  return {
    budget: effectiveBudget,
    spent,
    carryForwardAmount,
    remaining: progress.isOverspent ? -progress.overspendAmount : progress.remaining,
    percentageUsed: progress.usedPercent,
    status: getWeeklyBudgetStatus(progress.usedPercent),
  };
}

export function getMonthlyBudgetSummary({
  transactions,
  activeWeekStart,
  monthlyBudgetLimit,
}) {
  const monthlyTransactions = getTransactionsForMonthRollup(transactions, activeWeekStart);
  const spent = calculateExpense(monthlyTransactions);
  const progress = calculateBudgetProgress(spent, monthlyBudgetLimit);
  return {
    limit: monthlyBudgetLimit,
    spent,
    remaining: progress.isOverspent ? -progress.overspendAmount : progress.remaining,
    percentageUsed: progress.usedPercent,
    status: getMonthlyBudgetStatus(progress.usedPercent),
  };
}

export function getTransactionPreviewList(transactions, categoryMeta, limit = 5) {
  return sortTransactionsNewestFirst(transactions).slice(0, limit).map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    category: transaction.category,
    categoryIcon: categoryMeta[transaction.category]?.icon || '•',
    linkedAccount: transaction.account || 'Primary account',
    amount: transaction.amount,
    currency: 'INR',
    date: transaction.date,
    displayDateLabel: formatShortDate(transaction.date),
  }));
}

export function getWeeklyComparison(transactions, activeWeekStart) {
  const weeks = getTransactionsForLast4Weeks(transactions, activeWeekStart);
  const currentWeek = weeks[3] || weeks[weeks.length - 1];
  const previousWeek = weeks[2] || weeks[weeks.length - 2];
  const currentWeekSpend = currentWeek ? calculateExpense(currentWeek.transactions) : 0;
  const lastWeekSpend = previousWeek ? calculateExpense(previousWeek.transactions) : 0;
  const differenceAmount = currentWeekSpend - lastWeekSpend;
  return {
    currentWeekSpend,
    lastWeekSpend,
    differenceAmount,
    trendDirection: differenceAmount === 0 ? 'flat' : differenceAmount > 0 ? 'up' : 'down',
  };
}

export function getHighestSpendCategory(transactions, activeWeekStart, categoryMeta) {
  const weekTransactions = getTransactionsForWeek(transactions, activeWeekStart).filter((item) => item.type === 'expense');
  const totalSpent = calculateExpense(weekTransactions);
  if (!weekTransactions.length || totalSpent <= 0) return null;

  const ranked = Object.entries(
    weekTransactions.reduce((accumulator, transaction) => {
      accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1]);

  const [categoryName, amountSpent] = ranked[0];
  return {
    categoryName,
    amountSpent,
    percentageOfWeeklySpending: (amountSpent / totalSpent) * 100,
    icon: categoryMeta[categoryName]?.icon || '•',
  };
}

export function getUpcomingSubscriptions(subscriptions, limit = 3) {
  return [...subscriptions]
    .sort((left, right) => getRenewalDaysLeft(left.date) - getRenewalDaysLeft(right.date))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      dueDate: item.date,
      dueLabel: getRenewalDaysLeft(item.date) <= 0 ? 'Due now' : `in ${getRenewalDaysLeft(item.date)} days`,
      cost: item.price,
    }));
}

export function getWalletPreview(walletBalance) {
  return {
    totalBalance: walletBalance,
    availableCredit: 18000,
    currency: 'INR',
  };
}

export function getInvestmentPreview(investments) {
  const portfolioValue = investments.stocks.reduce((sum, stock) => sum + stock.val, 0);
  const gainLossAmount = Math.round(portfolioValue * 0.084);
  return {
    portfolioValue,
    gainLossAmount,
    gainLossPercent: 8.4,
    currency: 'INR',
  };
}

export function getAIInsightPreviews(aiInsights) {
  return aiInsights.map((item, index) => ({
    id: `ai-insight-${index + 1}`,
    title: item.title,
    description: item.body,
    tone: item.title.toLowerCase().includes('alert') ? 'warning' : item.title.toLowerCase().includes('tip') ? 'positive' : 'neutral',
  }));
}

export function getDashboardContentCards() {
  return [
    {
      id: 'content-1',
      title: 'Build a stronger weekly reset',
      description: 'Review spending, expected bills, and wallet balances in one 10-minute session every Monday.',
      thumbnail: 'Weekly ritual',
      ctaLabel: 'Read more',
    },
    {
      id: 'content-2',
      title: 'Keep subscriptions lean',
      description: 'If a plan has not earned attention in the last two weeks, it is a candidate to pause.',
      thumbnail: 'Subscriptions',
      ctaLabel: 'Explore tips',
    },
  ];
}

export function buildDashboardSnapshot(appState) {
  const activeWeekStart = appState.activeWeekStart || formatDateKey(startOfWeek(new Date()));
  const weekTransactions = getTransactionsForWeek(appState.transactions, activeWeekStart);
  const monthTransactions = getTransactionsForMonthRollup(appState.transactions, activeWeekStart);
  const yearTransactions = getTransactionsForYear(appState.transactions, activeWeekStart);
  const zeroUpcomingSubscriptions = getUpcomingSubscriptions(appState.subscriptions).map((item) => ({
    ...item,
    cost: 0,
  }));

  return {
    user: {
      id: 'dashboard-user',
      firstName: 'Sonali',
      fullName: 'Sonali Singh',
      avatarLabel: 'S',
      membership: 'Premium',
    },
    cashFlowByPeriod: {
      week: {
        period: 'week',
        income: 0,
        spending: 0,
        netBalance: 0,
        currency: 'INR',
      },
      month: {
        period: 'month',
        income: 0,
        spending: 0,
        netBalance: 0,
        currency: 'INR',
      },
      year: {
        period: 'year',
        income: 0,
        spending: 0,
        netBalance: 0,
        currency: 'INR',
      },
    },
    recentTransactions: getTransactionPreviewList(appState.transactions, appState.CAT_META),
    weeklyBudget: {
      budget: 0,
      spent: 0,
      carryForwardAmount: 0,
      remaining: 0,
      percentageUsed: 0,
      status: 'on-track',
    },
    monthlyBudget: {
      limit: 0,
      spent: 0,
      remaining: 0,
      percentageUsed: 0,
      status: 'healthy',
    },
    weeklyComparison: {
      currentWeekSpend: 0,
      lastWeekSpend: 0,
      differenceAmount: 0,
      trendDirection: 'flat',
    },
    categoryHighlight: null,
    upcomingSubscriptions: zeroUpcomingSubscriptions,
    walletPreview: {
      totalBalance: 0,
      availableCredit: 0,
      currency: 'INR',
    },
    investmentPreview: {
      portfolioValue: 0,
      gainLossAmount: 0,
      gainLossPercent: 0,
      currency: 'INR',
    },
    aiInsights: getAIInsightPreviews(appState.uiData.aiInsights),
    contentCards: getDashboardContentCards(),
    isEmpty: !appState.transactions.length,
  };
}

export function getBudgetTone(status) {
  if (status === 'exceeded') return 'danger';
  if (status === 'near-limit') return 'warning';
  return 'safe';
}

export function getDeltaLabel(value) {
  if (value === 0) return 'No change';
  return `${value > 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`;
}
