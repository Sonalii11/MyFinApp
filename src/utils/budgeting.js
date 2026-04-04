export const PERIODS = ['weekly', 'monthly', 'annual'];

export function parseISODate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12);
}

export function formatDateKey(value) {
  const date = parseISODate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value, amount) {
  const date = parseISODate(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function addWeeks(value, amount) {
  return addDays(value, amount * 7);
}

export function startOfWeek(value) {
  const date = parseISODate(value);
  const dayIndex = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayIndex);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function endOfWeek(value) {
  return addDays(startOfWeek(value), 6);
}

export function isSameDay(left, right) {
  return formatDateKey(left) === formatDateKey(right);
}

export function formatRangeLabel(start, end, options = { month: 'short', day: 'numeric' }) {
  const startLabel = parseISODate(start).toLocaleDateString('en-IN', options).replace(',', '');
  const endLabel = parseISODate(end).toLocaleDateString('en-IN', options).replace(',', '');
  return `${startLabel} - ${endLabel}`;
}

export function getWeekRange(value = new Date()) {
  const start = startOfWeek(value);
  const end = endOfWeek(value);
  return {
    start,
    end,
    startKey: formatDateKey(start),
    endKey: formatDateKey(end),
    label: formatRangeLabel(start, end),
  };
}

export function normalizeTransaction(transaction) {
  return {
    ...transaction,
    amount: Number(transaction.amount || 0),
    date: formatDateKey(transaction.date),
  };
}

export function getTransactionsForWeek(transactions, activeWeekStart) {
  const { startKey, endKey } = getWeekRange(activeWeekStart);
  return transactions.filter((transaction) => transaction.date >= startKey && transaction.date <= endKey);
}

export function getTransactionsForLast4Weeks(transactions, activeWeekStart) {
  const latestStart = startOfWeek(activeWeekStart);
  return Array.from({ length: 4 }, (_, index) => {
    const start = addWeeks(latestStart, index - 3);
    const end = endOfWeek(start);
    const startKey = formatDateKey(start);
    const endKey = formatDateKey(end);
    return {
      index,
      label: `Week ${index + 1}`,
      rangeLabel: formatRangeLabel(start, end),
      start,
      end,
      startKey,
      endKey,
      transactions: transactions.filter((transaction) => transaction.date >= startKey && transaction.date <= endKey),
    };
  });
}

export function getTransactionsForMonthRollup(transactions, activeWeekStart) {
  const weeks = getTransactionsForLast4Weeks(transactions, activeWeekStart);
  return weeks.flatMap((week) => week.transactions);
}

export function getTransactionsForYear(transactions, value = new Date()) {
  const date = parseISODate(value);
  const year = date.getFullYear();
  return transactions.filter((transaction) => parseISODate(transaction.date).getFullYear() === year);
}

export function calculateIncome(transactions) {
  return transactions.reduce((sum, transaction) => sum + (transaction.type === 'income' ? Number(transaction.amount) : 0), 0);
}

export function calculateExpense(transactions) {
  return transactions.reduce((sum, transaction) => sum + (transaction.type === 'expense' ? Number(transaction.amount) : 0), 0);
}

export function calculateBalance(transactions) {
  return calculateIncome(transactions) - calculateExpense(transactions);
}

export function calculateBudgetProgress(spent, limit) {
  const safeLimit = Number(limit) || 0;
  const used = Number(spent) || 0;
  const usedPercent = safeLimit > 0 ? (used / safeLimit) * 100 : 0;
  const overspendAmount = Math.max(0, used - safeLimit);
  return {
    spent: used,
    limit: safeLimit,
    usedPercent,
    clampedPercent: Math.min(100, Math.max(0, usedPercent)),
    remaining: Math.max(0, safeLimit - used),
    overspendAmount,
    isOverspent: overspendAmount > 0,
  };
}

export function getMonthlyRollupsForYear(transactions, value = new Date()) {
  const yearTransactions = getTransactionsForYear(transactions, value);
  const year = parseISODate(value).getFullYear();
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString('en-IN', { month: 'short' });
    const monthTransactions = yearTransactions.filter((transaction) => {
      const transactionDate = parseISODate(transaction.date);
      return transactionDate.getMonth() === monthIndex;
    });
    return {
      monthIndex,
      label: monthLabel,
      transactions: monthTransactions,
      income: calculateIncome(monthTransactions),
      expense: calculateExpense(monthTransactions),
      balance: calculateBalance(monthTransactions),
    };
  });
}

export function sortTransactionsNewestFirst(transactions) {
  return [...transactions].sort((left, right) => {
    if (left.date === right.date) return String(right.id).localeCompare(String(left.id));
    return right.date.localeCompare(left.date);
  });
}
