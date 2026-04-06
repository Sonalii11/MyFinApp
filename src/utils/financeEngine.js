import { ENTRY_KINDS } from '../data/schemaNotes';
import {
  addDays,
  addWeeks,
  calculateExpense,
  calculateIncome,
  endOfWeek,
  formatDateKey,
  parseISODate,
  startOfWeek,
} from './budgeting';

const WEEKLY_DIVISORS = {
  weekly: 1,
  monthly: 52 / 12,
  annual: 52,
};

function roundCurrency(value) {
  return Number((Number(value || 0)).toFixed(2));
}

function isDateWithinRange(dateKey, fromKey, toKey) {
  return dateKey >= fromKey && dateKey <= toKey;
}

export function normalizeFinanceEntry(entry, fallbackKind) {
  const kind = entry.kind || fallbackKind || ENTRY_KINDS.expense;
  return {
    ...entry,
    kind,
    amount: roundCurrency(entry.amount),
    currency: entry.currency || 'INR',
    frequency: entry.frequency || 'one-time',
    startDate: formatDateKey(entry.startDate || entry.date || entry.effectiveDate || new Date()),
    effectiveDate: entry.effectiveDate ? formatDateKey(entry.effectiveDate) : undefined,
    endDate: entry.endDate ? formatDateKey(entry.endDate) : undefined,
  };
}

export function convertEntryAmountToWeekly(entry) {
  const normalized = normalizeFinanceEntry(entry);
  if (normalized.frequency === 'one-time') return 0;
  const divisor = WEEKLY_DIVISORS[normalized.frequency];
  return divisor ? roundCurrency(normalized.amount / divisor) : 0;
}

export function doesEntryApplyToWeek(entry, weekStartKey) {
  const normalized = normalizeFinanceEntry(entry);
  const weekStart = formatDateKey(startOfWeek(weekStartKey));
  const weekEnd = formatDateKey(endOfWeek(weekStartKey));

  if (normalized.endDate && normalized.endDate < weekStart) return false;
  if (normalized.startDate > weekEnd) return false;

  if (normalized.frequency === 'one-time') {
    const effectiveDate = normalized.effectiveDate || normalized.startDate;
    return isDateWithinRange(effectiveDate, weekStart, weekEnd);
  }

  return normalized.startDate <= weekEnd;
}

export function getWeekEntryAmount(entry, weekStartKey) {
  const normalized = normalizeFinanceEntry(entry);
  if (!doesEntryApplyToWeek(normalized, weekStartKey)) return 0;

  if (normalized.frequency === 'one-time') {
    return roundCurrency(normalized.amount);
  }

  return convertEntryAmountToWeekly(normalized);
}

export function buildWeekSummary({ weekStart, incomeEntries, expenseEntries, budgetEntries, transactions }) {
  const startKey = formatDateKey(startOfWeek(weekStart));
  const endKey = formatDateKey(endOfWeek(weekStart));
  const planned = budgetEntries.reduce((sum, entry) => sum + getWeekEntryAmount(entry, startKey), 0);
  const recurringIncome = incomeEntries.reduce((sum, entry) => sum + getWeekEntryAmount(entry, startKey), 0);
  const recurringExpenses = expenseEntries.reduce((sum, entry) => sum + getWeekEntryAmount(entry, startKey), 0);
  const weekTransactions = transactions.filter((transaction) => transaction.date >= startKey && transaction.date <= endKey);
  const actualIncome = calculateIncome(weekTransactions);
  const actualSpent = calculateExpense(weekTransactions);
  const income = Math.max(recurringIncome, actualIncome);
  const spent = Math.max(recurringExpenses, actualSpent);
  const remaining = income + planned - spent;
  const overflow = Math.max(0, spent - planned);

  return {
    weekStart: startKey,
    weekEnd: endKey,
    planned: roundCurrency(planned),
    income: roundCurrency(income),
    spent: roundCurrency(spent),
    remaining: roundCurrency(remaining),
    overflow: roundCurrency(overflow),
    transactions: weekTransactions,
  };
}

export function buildWeeklySeries({ incomeEntries, expenseEntries, budgetEntries, transactions, activeWeekStart, count = 4 }) {
  const current = startOfWeek(activeWeekStart || new Date());
  return Array.from({ length: count }, (_, index) => {
    const weekStart = addWeeks(current, index - (count - 1));
    return buildWeekSummary({
      weekStart,
      incomeEntries,
      expenseEntries,
      budgetEntries,
      transactions,
    });
  });
}

export function buildMonthlyReflection(weeklySeries) {
  const window = weeklySeries.slice(-4);
  return {
    weeks: window,
    planned: roundCurrency(window.reduce((sum, week) => sum + week.planned, 0)),
    income: roundCurrency(window.reduce((sum, week) => sum + week.income, 0)),
    spent: roundCurrency(window.reduce((sum, week) => sum + week.spent, 0)),
    remaining: roundCurrency(window.reduce((sum, week) => sum + week.remaining, 0)),
    overflow: roundCurrency(window.reduce((sum, week) => sum + week.overflow, 0)),
  };
}

export function buildCategoryWeeklySplit(transactions, weekStart) {
  const startKey = formatDateKey(startOfWeek(weekStart));
  const endKey = formatDateKey(endOfWeek(weekStart));
  return Object.entries(
    transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.date >= startKey && transaction.date <= endKey)
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
        return accumulator;
      }, {})
  )
    .map(([category, amount]) => ({ category, amount: roundCurrency(amount) }))
    .sort((left, right) => right.amount - left.amount);
}

export function buildWalletBalanceTrend(walletTransactions, walletBalance) {
  const sorted = [...walletTransactions].sort((left, right) => `${left.date} ${left.time || ''}`.localeCompare(`${right.date} ${right.time || ''}`));
  let rolling = 0;
  const points = sorted.map((transaction) => {
    const amount = Number(transaction.amount || 0);
    rolling += transaction.direction === 'credit' ? amount : -amount;
    return {
      label: transaction.date,
      value: roundCurrency(rolling),
    };
  });

  if (!points.length) {
    return [{ label: formatDateKey(new Date()), value: roundCurrency(walletBalance) }];
  }

  const latestValue = points[points.length - 1]?.value || 0;
  const adjustment = roundCurrency(walletBalance - latestValue);
  return points.map((point) => ({
    ...point,
    value: roundCurrency(point.value + adjustment),
  }));
}

export function createEntryFromTransaction(transaction) {
  const kind = transaction.type === 'income' ? ENTRY_KINDS.income : ENTRY_KINDS.expense;
  return normalizeFinanceEntry({
    id: `entry-${transaction.id}`,
    kind,
    title: transaction.title,
    category: transaction.category,
    amount: transaction.amount,
    currency: transaction.currency || 'INR',
    frequency: 'one-time',
    startDate: transaction.date,
    effectiveDate: transaction.date,
    accountId: transaction.accountId || '',
    accountName: transaction.account || '',
    notes: transaction.notes || '',
    source: transaction.source || 'transaction',
    linkedTransactionId: transaction.id,
    createdAt: transaction.createdAt || new Date().toISOString(),
    updatedAt: transaction.updatedAt || new Date().toISOString(),
  }, kind);
}

export function createBudgetEntriesFromLimit(limit, startDate) {
  return [
    normalizeFinanceEntry({
      id: 'budget-entry-primary',
      kind: ENTRY_KINDS.budget,
      title: 'Weekly Core Budget',
      category: 'General',
      amount: Number(limit || 0),
      currency: 'INR',
      frequency: 'weekly',
      startDate: formatDateKey(startDate || new Date()),
      notes: 'Default weekly budget allocation',
      source: 'system',
    }, ENTRY_KINDS.budget),
  ];
}

export function buildSearchIndex({ transactions, walletTransactions, assets, budgetEntries }) {
  return [
    ...transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      kind: 'transaction',
      title: transaction.title,
      subtitle: `${transaction.category} · ${transaction.date}`,
      refId: transaction.id,
    })),
    ...walletTransactions.map((transaction) => ({
      id: `wallet-${transaction.id}`,
      kind: 'wallet',
      title: transaction.note || transaction.assetName || transaction.type,
      subtitle: `${transaction.source} · ${transaction.date}`,
      refId: transaction.id,
    })),
    ...assets.map((asset) => ({
      id: `asset-${asset.id}`,
      kind: 'asset',
      title: asset.name,
      subtitle: `${asset.ticker || asset.assetType}`,
      refId: asset.id,
    })),
    ...budgetEntries.map((entry) => ({
      id: `budget-${entry.id}`,
      kind: 'budget',
      title: entry.title,
      subtitle: `${entry.category} · ${entry.frequency}`,
      refId: entry.id,
    })),
  ];
}
