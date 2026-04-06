import {
  addDays,
  calculateBudgetProgress,
  calculateExpense,
  calculateIncome,
  formatDateKey,
  formatRangeLabel,
  getTransactionsForLast4Weeks,
  getTransactionsForMonthRollup,
  getTransactionsForWeek,
  getTransactionsForYear,
  parseISODate,
  sortTransactionsNewestFirst,
  startOfWeek,
} from '../utils/budgeting';
import { formatCurrency, formatShortDate, getRenewalDaysLeft } from '../utils/finance';
import { addAllocationShare, buildInvestmentHoldings, buildPortfolioOverview } from '../investment-portfolio/selectors';
import { getNetCashFlow, getRecentWalletTransactions, getTotalBalance, getWeeklyWalletExpense, getWeeklyWalletIncome } from '../context/selectors';

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
  weeklySummaries = [],
}) {
  const latestDerived = weeklySummaries[weeklySummaries.length - 1];
  if (latestDerived) {
    const effectiveBudget = latestDerived.planned + carryForwardAmount;
    const progress = calculateBudgetProgress(latestDerived.spent, effectiveBudget);
    return {
      budget: effectiveBudget,
      spent: latestDerived.spent,
      carryForwardAmount,
      remaining: progress.isOverspent ? -progress.overspendAmount : progress.remaining,
      percentageUsed: progress.usedPercent,
      status: getWeeklyBudgetStatus(progress.usedPercent),
    };
  }
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
  weeklyBudgetLimit,
  monthlyBudgetLimit,
}) {
  const baseDate = parseISODate(activeWeekStart || new Date());
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 12);
  const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 12);
  const monthStartKey = formatDateKey(monthStart);
  const monthEndKey = formatDateKey(monthEnd);
  const monthTransactions = transactions.filter((transaction) => transaction.date >= monthStartKey && transaction.date <= monthEndKey);
  const weeks = [];
  let currentStart = new Date(monthStart);

  while (currentStart <= monthEnd) {
    const endOffset = 6 - currentStart.getDay();
    const currentEnd = addDays(currentStart, Math.max(0, endOffset));
    const visibleEnd = currentEnd > monthEnd ? monthEnd : currentEnd;
    const startKey = formatDateKey(currentStart);
    const endKey = formatDateKey(visibleEnd);
    const weekTransactions = monthTransactions.filter(
      (transaction) => transaction.date >= startKey && transaction.date <= endKey
    );
    weeks.push({
      start: new Date(currentStart),
      end: new Date(visibleEnd),
      transactions: weekTransactions,
    });
    currentStart = addDays(visibleEnd, 1);
  }

  const weekCount = weeks.length;
  const weeklyLimit = Number(weeklyBudgetLimit || monthlyBudgetLimit / Math.max(1, weekCount) || 0);
  const weekSummaries = weeks.map((week, index) => {
    const spent = calculateExpense(week.transactions);
    const progress = calculateBudgetProgress(spent, weeklyLimit);
    const status = getMonthlyBudgetStatus(progress.usedPercent);
    return {
      id: formatDateKey(week.start),
      label: `Week ${index + 1}`,
      rangeLabel: formatRangeLabel(week.start, week.end),
      planned: weeklyLimit,
      spent,
      percentageUsed: progress.usedPercent,
      status,
      tone: getBudgetTone(status),
    };
  });
  const spent = calculateExpense(monthTransactions);
  const progress = calculateBudgetProgress(spent, monthlyBudgetLimit);
  return {
    limit: monthlyBudgetLimit,
    spent,
    remaining: progress.isOverspent ? -progress.overspendAmount : progress.remaining,
    percentageUsed: progress.usedPercent,
    status: getMonthlyBudgetStatus(progress.usedPercent),
    weeks: weekSummaries,
  };
}

export function getTransactionPreviewList(transactions, categoryMeta, limit = 5) {
  return sortTransactionsNewestFirst(transactions).slice(0, limit).map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    title: transaction.title,
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

export function getWalletPreview(appState) {
  return {
    totalBalance: getTotalBalance(appState),
    availableCredit: 18000,
    currency: 'INR',
    weeklyIncome: getWeeklyWalletIncome(appState),
    weeklyExpense: getWeeklyWalletExpense(appState),
    netCashFlow: getNetCashFlow(appState),
    recentTransactions: getRecentWalletTransactions(appState, undefined, 4),
  };
}

export function getInvestmentPreview({ investmentAssets = [], investmentTransactions = [], investmentPrices = {} }) {
  const holdings = addAllocationShare(buildInvestmentHoldings(investmentAssets, investmentTransactions, investmentPrices));
  const overview = buildPortfolioOverview(holdings);
  const portfolioValue = overview.totalValue;
  const gainLossAmount = overview.gainLoss;
  return {
    portfolioValue,
    gainLossAmount,
    gainLossPercent: overview.gainLossPercent,
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
  const transactions = appState.transactions || [];
  const activeWeekStart = appState.activeWeekStart || formatDateKey(startOfWeek(new Date()));
  const weekTransactions = getTransactionsForWeek(transactions, activeWeekStart);
  const monthTransactions = getTransactionsForMonthRollup(transactions, activeWeekStart);
  const yearTransactions = getTransactionsForYear(transactions, activeWeekStart);
  const zeroUpcomingSubscriptions = getUpcomingSubscriptions(appState.subscriptions || []).map((item) => ({
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
      week: getCashFlowSummaryFromTransactions('week', weekTransactions),
      month: getCashFlowSummaryFromTransactions('month', monthTransactions),
      year: getCashFlowSummaryFromTransactions('year', yearTransactions),
    },
    recentTransactions: getTransactionPreviewList(transactions, appState.CAT_META || {}),
    weeklyBudget: getWeeklyBudgetSummary({
      transactions,
      activeWeekStart,
      weeklyBudgetLimit: appState.weeklyBudgetLimit,
      weeklySummaries: appState.weeklySummaries,
    }),
    monthlyBudget: getMonthlyBudgetSummary({
      transactions,
      activeWeekStart,
      weeklyBudgetLimit: appState.weeklyBudgetLimit,
      monthlyBudgetLimit: appState.monthlyBudgetLimit,
    }),
    weeklyComparison: getWeeklyComparison(transactions, activeWeekStart),
    categoryHighlight: getHighestSpendCategory(transactions, activeWeekStart, appState.CAT_META || {}),
    upcomingSubscriptions: zeroUpcomingSubscriptions,
    walletPreview: getWalletPreview(appState),
    investmentPreview: getInvestmentPreview(appState),
    aiInsights: getAIInsightPreviews(appState.uiData?.aiInsights || []),
    contentCards: getDashboardContentCards(),
    isEmpty: !transactions.length,
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
