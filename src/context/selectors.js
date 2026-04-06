import { addAllocationShare, buildInvestmentHoldings, buildPortfolioOverview } from '../investment-portfolio/selectors';
import { formatDateKey, getWeekRange, startOfWeek } from '../utils/budgeting';
import { buildMonthlyReflection, buildWeeklySeries } from '../utils/financeEngine';

export function getActiveWallet(state) {
  const wallets = Array.isArray(state.wallets) ? state.wallets : [];
  return wallets.find((wallet) => wallet.id === state.activeWalletId) || wallets.find((wallet) => wallet.isPrimary) || wallets[0] || null;
}

export function getAllAccounts(state) {
  return Array.isArray(state.wallets) ? state.wallets : [];
}

export function getWalletById(state, walletId) {
  const wallets = Array.isArray(state.wallets) ? state.wallets : [];
  return wallets.find((wallet) => wallet.id === walletId) || null;
}

export function getAccountById(state, accountId) {
  return getWalletById(state, accountId);
}

export function getWalletBalance(state, walletId) {
  const wallet = walletId ? getWalletById(state, walletId) : getActiveWallet(state);
  return Number(wallet?.balance ?? state.wallet?.balance ?? state.walletBalance ?? 0);
}

export function getAccountBalance(state, accountId) {
  return getWalletBalance(state, accountId);
}

export function getTotalBalance(state) {
  return getAllAccounts(state).reduce((sum, account) => sum + Number(account.balance || 0), 0);
}

export function getWalletTransactions(state, walletId) {
  const targetWalletId = walletId || getActiveWallet(state)?.id;
  const ledger = Array.isArray(state.walletTransactions) ? state.walletTransactions : [];
  return targetWalletId ? ledger.filter((transaction) => transaction.walletId === targetWalletId) : ledger;
}

export function getTransactionsByAccount(state, accountId) {
  return getWalletTransactions(state, accountId);
}

export function getRecentWalletTransactions(state, walletId, limit = 8) {
  return [...getWalletTransactions(state, walletId)]
    .sort((left, right) => right.date.localeCompare(left.date) || String(right.id).localeCompare(String(left.id)))
    .slice(0, limit);
}

export function getRecentTransactions(state, limit = 8) {
  return getRecentWalletTransactions(state, undefined, limit);
}

export function getPortfolioValue(state) {
  const holdings = addAllocationShare(
    buildInvestmentHoldings(state.investmentAssets || [], state.investmentTransactions || [], state.investmentPrices || {})
  );
  return buildPortfolioOverview(holdings).totalValue;
}

export function getAssetSnapshots(state) {
  return addAllocationShare(
    buildInvestmentHoldings(state.investmentAssets || [], state.investmentTransactions || [], state.investmentPrices || {})
  ).map((holding) => ({
    id: holding.assetId,
    name: holding.assetName,
    symbol: holding.ticker || '',
    type: holding.assetType,
    quantity: holding.quantity,
    averageBuyPrice: holding.averageBuyPrice,
    investedAmount: holding.investedAmount,
    currentValue: holding.currentValue,
  }));
}

export function getWeeklySummary(state) {
  const series = buildWeeklySeries({
    incomeEntries: state.incomeEntries || [],
    expenseEntries: state.expenseEntries || [],
    budgetEntries: state.budgetEntries || [],
    transactions: state.transactions || [],
    activeWeekStart: state.activeWeekStart,
    count: 1,
  });
  return series[0] || null;
}

export function getMonthlySummary(state) {
  const series = buildWeeklySeries({
    incomeEntries: state.incomeEntries || [],
    expenseEntries: state.expenseEntries || [],
    budgetEntries: state.budgetEntries || [],
    transactions: state.transactions || [],
    activeWeekStart: state.activeWeekStart,
    count: 4,
  });
  return buildMonthlyReflection(series);
}

function resolveWeekRange(weekRange) {
  return weekRange || getWeekRange(formatDateKey(startOfWeek(new Date())));
}

function getTransactionsInWeek(state, walletId, weekRange) {
  const { startKey, endKey } = resolveWeekRange(weekRange);
  return getWalletTransactions(state, walletId).filter((transaction) => transaction.date >= startKey && transaction.date <= endKey);
}

export function getWeeklyWalletIncome(state, walletId, weekRange) {
  return getTransactionsInWeek(state, walletId, weekRange)
    .filter((transaction) => transaction.direction === 'in')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

export function getIncomeByAccount(state, accountId, period = 'weekly') {
  if (period === 'weekly') return getWeeklyWalletIncome(state, accountId);
  const target = getWalletTransactions(state, accountId);
  const currentMonth = formatDateKey(new Date()).slice(0, 7);
  return target
    .filter((transaction) => transaction.direction === 'in' && transaction.date.slice(0, 7) === currentMonth)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

export function getWeeklyWalletExpense(state, walletId, weekRange) {
  return getTransactionsInWeek(state, walletId, weekRange)
    .filter((transaction) => transaction.direction === 'out')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

export function getExpenseByAccount(state, accountId, period = 'weekly') {
  if (period === 'weekly') return getWeeklyWalletExpense(state, accountId);
  const target = getWalletTransactions(state, accountId);
  const currentMonth = formatDateKey(new Date()).slice(0, 7);
  return target
    .filter((transaction) => transaction.direction === 'out' && transaction.date.slice(0, 7) === currentMonth)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

export function getNetCashFlow(state, walletId, weekRange) {
  return getWeeklyWalletIncome(state, walletId, weekRange) - getWeeklyWalletExpense(state, walletId, weekRange);
}

export function getWalletTrendData(state, walletId) {
  const transactions = [...getWalletTransactions(state, walletId)].sort((left, right) => left.date.localeCompare(right.date));
  let running = 0;
  return transactions.map((transaction) => {
    running += transaction.direction === 'in' ? Number(transaction.amount || 0) : -Number(transaction.amount || 0);
    return {
      label: transaction.date,
      value: running,
    };
  });
}
