import { DASHBOARD_REFRESH_EVENTS } from '../dashboard/types';
import { addWeeks, calculateExpense, calculateIncome, formatDateKey, getTransactionsForWeek, startOfWeek } from '../utils/budgeting';
import { formatCurrency, formatShortDate } from '../utils/finance';

function toDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12);
}

function getMonthKey(value) {
  return formatDateKey(value).slice(0, 7);
}

function getWeekLabel(weekStart) {
  const start = toDate(weekStart);
  const end = addWeeks(start, 1);
  end.setDate(end.getDate() - 1);
  const startLabel = start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }).replace(',', '');
  const endLabel = end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }).replace(',', '');
  return `${startLabel} - ${endLabel}`;
}

export function createEmptyTransactionForm(type = 'expense') {
  return {
    id: '',
    type,
    title: '',
    date: formatDateKey(new Date()),
    time: '09:00',
    amount: '',
    frequency: 'one-time',
    calculatorExpression: '',
    category: type === 'income' ? 'Salary' : type === 'transfer' ? 'Transfer' : 'Food',
    account: '',
    fromAccount: '',
    toAccount: '',
    paymentMode: 'Bank',
    notes: '',
    tags: [],
    tagInput: '',
    attachments: [],
  };
}

export function validateTransactionForm(form) {
  if (!form.title.trim()) return 'Please enter a title.';
  if (!Number(form.amount) || Number(form.amount) <= 0) return 'Please enter a valid amount.';
  if (!form.date) return 'Please select a date.';
  if (!form.time) return 'Please select a time.';
  if (!form.frequency) return 'Please choose a frequency.';
  if (form.type === 'transfer') {
    if (!form.fromAccount || !form.toAccount) return 'Please choose both accounts for a transfer.';
    if (form.fromAccount === form.toAccount) return 'Transfer accounts must be different.';
    return '';
  }
  if (!form.category) return 'Please select a category.';
  if (!form.account) return 'Please choose an account.';
  return '';
}

export function evaluateCalculatorExpression(expression) {
  const safe = String(expression || '').replace(/[^0-9+\-*/().\s]/g, '').trim();
  if (!safe) return null;
  try {
    const value = Function(`"use strict"; return (${safe});`)();
    return Number.isFinite(value) ? Number(value.toFixed(2)) : null;
  } catch {
    return null;
  }
}

export function createAttachmentMeta(file) {
  return {
    id: `attachment-${Date.now()}-${file.name}`,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
  };
}

export function buildAccountsWithBalances(accounts, transactions) {
  const next = accounts.map((account) => ({ ...account, balance: account.baseBalance }));
  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount || 0);
    if (transaction.type === 'expense') {
      const account = next.find((item) => item.name === transaction.account);
      if (account) account.balance -= amount;
    }
    if (transaction.type === 'income') {
      const account = next.find((item) => item.name === transaction.account);
      if (account) account.balance += amount;
    }
    if (transaction.type === 'transfer') {
      const from = next.find((item) => item.name === transaction.fromAccount);
      const to = next.find((item) => item.name === transaction.toAccount);
      if (from) from.balance -= amount;
      if (to) to.balance += amount;
    }
  });
  return next;
}

export function applyHistoryFilters(transactions, filters) {
  return transactions.filter((transaction) => {
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory = filters.category === 'All' || transaction.category === filters.category;
    const matchesAccount = filters.account === 'All' || transaction.account === filters.account || transaction.fromAccount === filters.account || transaction.toAccount === filters.account;
    const matchesTag = filters.tag === 'All' || (transaction.tags || []).includes(filters.tag);
    const matchesPaymentMode = filters.paymentMode === 'All' || transaction.paymentMode === filters.paymentMode;
    const query = filters.search.trim().toLowerCase();
    const haystack = `${transaction.title} ${transaction.category} ${transaction.notes || ''} ${(transaction.tags || []).join(' ')}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesType && matchesCategory && matchesAccount && matchesTag && matchesPaymentMode && matchesSearch;
  });
}

export function groupTransactions(transactions, groupBy) {
  const groups = {};
  transactions.forEach((transaction) => {
    let key = transaction.date;
    let label = formatShortDate(transaction.date);
    if (groupBy === 'week') {
      const weekStart = formatDateKey(startOfWeek(transaction.date));
      key = weekStart;
      label = getWeekLabel(weekStart);
    }
    if (groupBy === 'month') {
      key = getMonthKey(transaction.date);
      label = toDate(`${key}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    if (!groups[key]) groups[key] = { key, label, items: [] };
    groups[key].items.push(transaction);
  });
  return Object.values(groups).sort((left, right) => right.key.localeCompare(left.key));
}

function getWeeklyStatus(percentageUsed) {
  if (percentageUsed > 100) return 'exceeded';
  if (percentageUsed >= 75) return 'near-limit';
  return 'on-track';
}

export function buildWeeklyBudgetView(transactions, weeklyBudget, activeWeekStart) {
  const currentStart = formatDateKey(startOfWeek(activeWeekStart || new Date()));
  const history = Array.from({ length: 6 }, (_, index) => {
    const weekStart = formatDateKey(addWeeks(currentStart, index - 5));
    const weekTransactions = getTransactionsForWeek(transactions, weekStart).filter((item) => item.type === 'expense');
    const spent = calculateExpense(weekTransactions);
    const baseBudget = weeklyBudget.autoGenerateFromMonthly
      ? Math.round((weeklyBudget.monthlyBudgetSource || 0) / 4)
      : weeklyBudget.baseWeeklyBudget;
    const override = weeklyBudget.weeklyOverrides[weekStart];
    return {
      weekStart,
      label: getWeekLabel(weekStart),
      budget: override ?? baseBudget,
      spent,
    };
  }).map((item, index, all) => {
    let budget = item.budget;
    if (index > 0) {
      const prev = all[index - 1];
      if (weeklyBudget.carryForwardMode === 'carry-unused-forward') {
        budget += Math.max(0, prev.budget - prev.spent);
      }
      if (weeklyBudget.carryForwardMode === 'roll-deficit-forward') {
        budget -= Math.max(0, prev.spent - prev.budget);
      }
      if (weeklyBudget.overspendDeduction) {
        budget -= Math.max(0, prev.spent - prev.budget);
      }
    }
    const remaining = budget - item.spent;
    const percentageUsed = budget > 0 ? (item.spent / budget) * 100 : 0;
    return {
      weekStart: item.weekStart,
      label: item.label,
      budget: Math.max(0, Math.round(budget)),
      spent: item.spent,
      remaining,
      percentageUsed,
      status: getWeeklyStatus(percentageUsed),
    };
  });

  const current = history[history.length - 1];
  const previous = history[history.length - 2] || current;

  return {
    current,
    previous,
    history,
    rules: {
      strictReset: weeklyBudget.carryForwardMode === 'strict-reset',
      carryUnusedForward: weeklyBudget.carryForwardMode === 'carry-unused-forward',
      rollDeficitForward: weeklyBudget.carryForwardMode === 'roll-deficit-forward',
      overspendDeduction: weeklyBudget.overspendDeduction,
    },
  };
}

export function buildMonthlyBudgetView(transactions, monthlyBudget) {
  const spent = transactions
    .filter((item) => item.type === 'expense' && getMonthKey(item.date) === monthlyBudget.monthKey)
    .filter((item) => !monthlyBudget.includedCategories.length || monthlyBudget.includedCategories.includes(item.category))
    .reduce((sum, item) => sum + item.amount, 0);
  const remaining = monthlyBudget.limit - spent;
  const percentageUsed = monthlyBudget.limit > 0 ? (spent / monthlyBudget.limit) * 100 : 0;
  const status = percentageUsed > 100 ? 'exceeded' : percentageUsed >= 80 ? 'near-limit' : 'healthy';
  return {
    ...monthlyBudget,
    spent,
    remaining,
    percentageUsed,
    status,
  };
}

export function buildCategoryLimitRows(transactions, categoryLimits, activeWeekStart) {
  const currentWeekStart = formatDateKey(startOfWeek(activeWeekStart || new Date()));
  const previousWeekStart = formatDateKey(addWeeks(currentWeekStart, -1));
  const currentMonthKey = getMonthKey(currentWeekStart);
  const previousMonthKey = getMonthKey(addWeeks(currentWeekStart, -4));

  return categoryLimits.map((limit) => {
    const weeklySpent = transactions
      .filter((item) => item.type === 'expense' && item.category === limit.category)
      .filter((item) => getTransactionsForWeek([item], currentWeekStart).length)
      .reduce((sum, item) => sum + item.amount, 0);
    const monthlySpent = transactions
      .filter((item) => item.type === 'expense' && item.category === limit.category && getMonthKey(item.date) === currentMonthKey)
      .reduce((sum, item) => sum + item.amount, 0);
    const lastPeriodSpending = transactions
      .filter((item) => item.type === 'expense' && item.category === limit.category)
      .filter((item) => {
        const inPreviousWeek = getTransactionsForWeek([item], previousWeekStart).length > 0;
        const inPreviousMonth = getMonthKey(item.date) === previousMonthKey;
        return inPreviousWeek || inPreviousMonth;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      ...limit,
      weeklySpent,
      monthlySpent,
      weeklyRemaining: typeof limit.weeklyLimit === 'number' ? limit.weeklyLimit - weeklySpent : null,
      monthlyRemaining: typeof limit.monthlyLimit === 'number' ? limit.monthlyLimit - monthlySpent : null,
      lastPeriodSpending,
    };
  });
}

export function sortCategoryLimitRows(rows, sortBy) {
  const sorted = [...rows];
  if (sortBy === 'alphabetical') return sorted.sort((left, right) => left.category.localeCompare(right.category));
  if (sortBy === 'highest-spent') return sorted.sort((left, right) => right.weeklySpent - left.weeklySpent);
  if (sortBy === 'closest-to-limit') {
    return sorted.sort((left, right) => {
      const leftRatio = left.weeklyLimit ? left.weeklySpent / left.weeklyLimit : 0;
      const rightRatio = right.weeklyLimit ? right.weeklySpent / right.weeklyLimit : 0;
      return rightRatio - leftRatio;
    });
  }
  if (sortBy === 'exceeded-first') {
    return sorted.sort((left, right) => {
      const leftExceeded = (left.weeklyRemaining ?? 0) < 0 || (left.monthlyRemaining ?? 0) < 0 ? 1 : 0;
      const rightExceeded = (right.weeklyRemaining ?? 0) < 0 || (right.monthlyRemaining ?? 0) < 0 ? 1 : 0;
      return rightExceeded - leftExceeded;
    });
  }
  return sorted;
}

export function buildAnalyticsSnapshot(transactions, range, categoryMeta, customRange = null) {
  const now = new Date();
  const from = range === 'week'
    ? formatDateKey(startOfWeek(now))
    : range === 'month'
      ? `${formatDateKey(now).slice(0, 7)}-01`
      : range === 'year'
        ? `${now.getFullYear()}-01-01`
        : customRange?.from || '0000-01-01';
  const to = range === 'custom' ? customRange?.to || formatDateKey(now) : formatDateKey(now);
  const scoped = transactions.filter((item) => item.date >= from && item.date <= to);
  const income = calculateIncome(scoped);
  const spending = calculateExpense(scoped);
  const transfers = scoped.filter((item) => item.type === 'transfer').reduce((sum, item) => sum + item.amount, 0);
  const netBalance = income - spending;

  const categoryBreakdown = Object.entries(
    scoped.filter((item) => item.type === 'expense').reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {})
  ).map(([label, amount]) => ({
    label,
    amount,
    color: categoryMeta[label]?.color || '#888',
  })).sort((left, right) => right.amount - left.amount);

  const paymentModeBreakdown = Object.entries(
    scoped.reduce((acc, item) => {
      const key = item.paymentMode || 'Unknown';
      acc[key] = (acc[key] || 0) + item.amount;
      return acc;
    }, {})
  ).map(([mode, amount]) => ({ mode, amount }));

  const days = Math.max(1, Math.ceil((toDate(to).getTime() - toDate(from).getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const expenseTransactions = scoped.filter((item) => item.type === 'expense');
  const incomeTransactions = scoped.filter((item) => item.type === 'income');

  return {
    range,
    income,
    spending,
    transfers,
    netBalance,
    budgetStatus: spending > income ? 'Spending is ahead of income for this range.' : 'Cash flow is within control for this range.',
    categoryBreakdown,
    paymentModeBreakdown,
    stats: {
      avgSpendingPerDay: spending / days,
      avgSpendingPerTransaction: expenseTransactions.length ? spending / expenseTransactions.length : 0,
      avgIncomePerDay: income / days,
      avgIncomePerTransaction: incomeTransactions.length ? income / incomeTransactions.length : 0,
    },
    changeSummary: {
      income: 0,
      spending: 0,
      balance: 0,
    },
  };
}

export function evaluateExpenseAlerts({ weeklyBudget, monthlyBudget, categoryRows, transactions, activeWeekStart }) {
  const alerts = [];
  [50, 80, 100].forEach((threshold) => {
    if (weeklyBudget.current.percentageUsed >= threshold) {
      alerts.push({
        id: `weekly-threshold-${threshold}`,
        kind: 'budget',
        severity: threshold >= 100 ? 'critical' : threshold >= 80 ? 'warning' : 'info',
        title: `Weekly budget crossed ${threshold}%`,
        description: `${formatCurrency(weeklyBudget.current.spent)} spent out of ${formatCurrency(weeklyBudget.current.budget)} this week.`,
      });
    }
  });

  categoryRows.forEach((row) => {
    if (typeof row.weeklyLimit === 'number' && row.weeklyRemaining !== null && row.weeklyRemaining <= row.weeklyLimit * 0.2 && row.weeklyRemaining >= 0) {
      alerts.push({
        id: `category-warning-${row.category}`,
        kind: 'category',
        severity: 'warning',
        title: `${row.category} is nearing its limit`,
        description: `${formatCurrency(Math.max(0, row.weeklyRemaining))} left in the weekly limit.`,
      });
    }
    if ((row.weeklyRemaining ?? 0) < 0 || (row.monthlyRemaining ?? 0) < 0) {
      alerts.push({
        id: `category-critical-${row.category}`,
        kind: 'category',
        severity: 'critical',
        title: `${row.category} limit exceeded`,
        description: `This category has crossed one of its configured limits.`,
      });
    }
  });

  if (weeklyBudget.current.remaining < 0) {
    alerts.push({
      id: 'weekly-overspend',
      kind: 'budget',
      severity: 'critical',
      title: 'Weekly overspend alert',
      description: `${formatCurrency(Math.abs(weeklyBudget.current.remaining))} over the current weekly budget.`,
    });
  }

  if (monthlyBudget.remaining < 0) {
    alerts.push({
      id: 'monthly-overspend',
      kind: 'budget',
      severity: 'critical',
      title: 'Monthly overspend alert',
      description: `${formatCurrency(Math.abs(monthlyBudget.remaining))} over the monthly budget.`,
    });
  }

  const currentWeekTransactions = getTransactionsForWeek(transactions, activeWeekStart).filter((item) => item.type === 'expense');
  const topCategory = Object.entries(
    currentWeekTransactions.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {})
  ).sort((left, right) => right[1] - left[1])[0];

  alerts.push({
    id: 'end-of-week-summary',
    kind: 'summary',
    severity: 'info',
    title: 'End-of-week summary',
    description: `${formatCurrency(weeklyBudget.current.spent)} spent. ${weeklyBudget.current.remaining >= 0 ? `${formatCurrency(weeklyBudget.current.remaining)} remaining.` : `${formatCurrency(Math.abs(weeklyBudget.current.remaining))} overspent.`}${topCategory ? ` Top category: ${topCategory[0]}.` : ''}`,
  });

  return alerts;
}

export function getExpenseTrackerEventMap() {
  return {
    addExpense: DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED,
    addIncome: DASHBOARD_REFRESH_EVENTS.INCOME_CREATED,
    addTransfer: DASHBOARD_REFRESH_EVENTS.TRANSFER_CREATED,
    updateTransaction: 'expense-tracker.transaction.updated',
    deleteTransaction: 'expense-tracker.transaction.deleted',
  };
}
