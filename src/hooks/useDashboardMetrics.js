import { useMemo } from 'react';
import {
  calculateBalance,
  calculateBudgetProgress,
  calculateExpense,
  calculateIncome,
  endOfWeek,
  formatDateKey,
  formatRangeLabel,
  getMonthlyRollupsForYear,
  getTransactionsForLast4Weeks,
  getTransactionsForMonthRollup,
  getTransactionsForWeek,
  getTransactionsForYear,
  getWeekRange,
  sortTransactionsNewestFirst,
  startOfWeek,
} from '../utils/budgeting';

function buildPeriodSummary(period, transactions, weeklyBudgetLimit, monthlyBudgetLimit) {
  const income = calculateIncome(transactions);
  const expense = calculateExpense(transactions);
  const balance = calculateBalance(transactions);
  const budgetLimit = period === 'weekly' ? weeklyBudgetLimit : period === 'monthly' ? monthlyBudgetLimit : monthlyBudgetLimit * 12;
  const budgetProgress = calculateBudgetProgress(expense, budgetLimit);

  return {
    period,
    income,
    expense,
    balance,
    budgetLimit,
    budgetProgress,
  };
}

export function useDashboardMetrics({
  transactions,
  weeklyBudgetLimit,
  monthlyBudgetLimit,
  selectedPeriod,
  activeWeekStart,
  categoryMeta,
}) {
  return useMemo(() => {
    const normalizedWeekStart = formatDateKey(startOfWeek(activeWeekStart || new Date()));
    const activeWeek = getWeekRange(normalizedWeekStart);
    const currentWeekTransactions = getTransactionsForWeek(transactions, normalizedWeekStart);
    const last4Weeks = getTransactionsForLast4Weeks(transactions, normalizedWeekStart).map((week) => ({
      ...week,
      income: calculateIncome(week.transactions),
      expense: calculateExpense(week.transactions),
      balance: calculateBalance(week.transactions),
    }));
    const monthlyRollupTransactions = getTransactionsForMonthRollup(transactions, normalizedWeekStart);
    const yearTransactions = getTransactionsForYear(transactions, normalizedWeekStart);
    const monthRollupsForYear = getMonthlyRollupsForYear(transactions, normalizedWeekStart);

    const weeklySummary = buildPeriodSummary('weekly', currentWeekTransactions, weeklyBudgetLimit, monthlyBudgetLimit);
    const monthlySummary = buildPeriodSummary('monthly', monthlyRollupTransactions, weeklyBudgetLimit, monthlyBudgetLimit);
    const annualSummary = buildPeriodSummary('annual', yearTransactions, weeklyBudgetLimit, monthlyBudgetLimit);

    const currentPeriodSummary = selectedPeriod === 'weekly'
      ? weeklySummary
      : selectedPeriod === 'monthly'
        ? monthlySummary
        : annualSummary;

    const recentTransactions = sortTransactionsNewestFirst(transactions).slice(0, 8).map((transaction) => ({
      ...transaction,
      icon: categoryMeta[transaction.category]?.icon || categoryMeta.Other.icon,
      color: categoryMeta[transaction.category]?.color || categoryMeta.Other.color,
    }));

    const periodTransactions = selectedPeriod === 'weekly'
      ? currentWeekTransactions
      : selectedPeriod === 'monthly'
        ? monthlyRollupTransactions
        : yearTransactions;

    const categoryBreakdown = Object.entries(
      periodTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((accumulator, transaction) => {
          accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
          return accumulator;
        }, {})
    )
      .map(([category, amount]) => ({
        category,
        amount,
        icon: categoryMeta[category]?.icon || categoryMeta.Other.icon,
        color: categoryMeta[category]?.color || categoryMeta.Other.color,
      }))
      .sort((left, right) => right.amount - left.amount);

    const heroChart = selectedPeriod === 'annual'
      ? {
          title: 'Annual Spending Trend',
          labels: monthRollupsForYear.map((month) => month.label),
          data: monthRollupsForYear.map((month) => month.expense),
          helper: 'Monthly expense totals for the current year',
        }
      : {
          title: 'Weekly Spending Overview',
          labels: last4Weeks.map((week) => week.label),
          data: last4Weeks.map((week) => week.expense),
          helper: selectedPeriod === 'monthly' ? '4-week rollup trend ending this week' : 'Latest 4 calendar weeks of spending',
        };

    const monthlyProgress = {
      progress: monthlySummary.budgetProgress,
      spent: monthlySummary.expense,
      limit: monthlyBudgetLimit,
      weekText: `Latest of 4 weeks · Rollup ending ${formatRangeLabel(activeWeek.start, activeWeek.end, { month: 'short', day: 'numeric' })}`,
      rangeLabel: formatRangeLabel(startOfWeek(last4Weeks[0]?.start || normalizedWeekStart), endOfWeek(normalizedWeekStart)),
    };

    const summaryCards = selectedPeriod === 'weekly'
      ? [
          { label: 'Weekly Spent', value: weeklySummary.expense, sub: activeWeek.label, accent: 'var(--red)' },
          { label: 'Weekly Income', value: weeklySummary.income, sub: 'this week', accent: 'var(--green)' },
          { label: 'Weekly Balance', value: weeklySummary.balance, sub: 'income minus expense', accent: weeklySummary.balance >= 0 ? 'var(--accent2)' : 'var(--red)' },
          { label: 'Monthly Progress', value: monthlySummary.budgetProgress.usedPercent, sub: '4-week rollup', accent: monthlySummary.budgetProgress.isOverspent ? 'var(--red)' : 'var(--accent2)', isPercent: true },
        ]
      : selectedPeriod === 'monthly'
        ? [
            { label: 'Monthly Spent', value: monthlySummary.expense, sub: 'latest 4 weeks', accent: 'var(--red)' },
            { label: 'Monthly Income', value: monthlySummary.income, sub: 'latest 4 weeks', accent: 'var(--green)' },
            { label: 'Monthly Balance', value: monthlySummary.balance, sub: 'rollup balance', accent: monthlySummary.balance >= 0 ? 'var(--accent2)' : 'var(--red)' },
            { label: 'Annual Progress', value: annualSummary.budgetProgress.usedPercent, sub: 'year to date', accent: annualSummary.budgetProgress.isOverspent ? 'var(--red)' : 'var(--accent2)', isPercent: true },
          ]
        : [
            { label: 'Annual Spent', value: annualSummary.expense, sub: 'year to date', accent: 'var(--red)' },
            { label: 'Annual Income', value: annualSummary.income, sub: 'year to date', accent: 'var(--green)' },
            { label: 'Annual Balance', value: annualSummary.balance, sub: 'income minus expense', accent: annualSummary.balance >= 0 ? 'var(--accent2)' : 'var(--red)' },
            { label: 'Monthly Rollup', value: monthlySummary.expense, sub: 'latest 4 weeks', accent: monthlySummary.budgetProgress.isOverspent ? 'var(--red)' : 'var(--accent2)' },
          ];

    return {
      activeWeek,
      currentWeekTransactions,
      last4Weeks,
      monthlyRollupTransactions,
      yearTransactions,
      monthRollupsForYear,
      weeklySummary,
      monthlySummary,
      annualSummary,
      currentPeriodSummary,
      heroChart,
      monthlyProgress,
      categoryBreakdown,
      recentTransactions,
      summaryCards,
    };
  }, [activeWeekStart, categoryMeta, monthlyBudgetLimit, selectedPeriod, transactions, weeklyBudgetLimit]);
}
