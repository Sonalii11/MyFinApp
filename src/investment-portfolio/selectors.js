import { DASHBOARD_REFRESH_EVENTS } from '../dashboard/types';
import { formatCurrency, formatShortDate } from '../utils/finance';
import { formatDateKey } from '../utils/budgeting';

const TYPE_LABELS = {
  stock: 'Stocks',
  'mutual-fund': 'Mutual Funds',
  etf: 'ETFs',
  crypto: 'Crypto',
  'fixed-deposit': 'Fixed Deposits',
};

const TRANSACTION_IMPACT_LABELS = {
  buy: 'Debits selected funding account',
  sell: 'Credits selected funding account',
  dividend: 'Credits selected funding account as income',
  sip: 'Debits selected funding account on contribution date',
  'transfer-in': 'Moves money into portfolio funding',
  'transfer-out': 'Moves money back to the selected account',
};

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function byDateAsc(left, right) {
  return `${left.date} ${left.time || ''}`.localeCompare(`${right.date} ${right.time || ''}`);
}

function byDateDesc(left, right) {
  return `${right.date} ${right.time || ''}`.localeCompare(`${left.date} ${left.time || ''}`);
}

function getTypeColor(type) {
  if (type === 'crypto') return '#f7931a';
  if (type === 'mutual-fund') return '#f5a623';
  if (type === 'etf') return '#7c6dfa';
  if (type === 'fixed-deposit') return '#f05c7a';
  return '#4fc3f7';
}

export function createEmptyInvestmentTransactionForm(type = 'buy', defaults = {}) {
  return {
    id: defaults.id || '',
    type,
    assetId: defaults.assetId || '',
    accountId: defaults.accountId || '',
    date: defaults.date || formatDateKey(new Date()),
    time: defaults.time || '09:30',
    amount: defaults.amount ? String(defaults.amount) : '',
    quantity: defaults.quantity ? String(defaults.quantity) : '',
    pricePerUnit: defaults.pricePerUnit ? String(defaults.pricePerUnit) : '',
    fees: defaults.fees ? String(defaults.fees) : '0',
    notes: defaults.notes || '',
    linkedGoalId: defaults.linkedGoalId || '',
    schedule: defaults.schedule || (type === 'sip' ? 'monthly' : ''),
  };
}

export function validateInvestmentTransactionForm(form) {
  if (!form.type) return 'Please choose a transaction type.';
  if (!form.accountId) return 'Please choose a linked account.';
  if (!form.date) return 'Please choose a date.';
  if (['buy', 'sell', 'dividend'].includes(form.type) && !form.assetId) {
    return 'Please choose an asset.';
  }
  if (safeNumber(form.amount) <= 0) return 'Please enter a valid amount.';
  return '';
}

export function buildInvestmentHoldings(assets, transactions, priceMap) {
  const transactionMap = [...transactions].sort(byDateAsc);

  return assets.map((asset) => {
    let quantity = 0;
    let costBasis = 0;

    transactionMap.forEach((transaction) => {
      if (transaction.assetId !== asset.id) return;
      const amount = safeNumber(transaction.amount);
      const qty = safeNumber(transaction.quantity);
      const fees = safeNumber(transaction.fees);

      if (transaction.type === 'buy' || transaction.type === 'sip') {
        quantity += qty;
        costBasis += amount + fees;
      }

      if (transaction.type === 'sell' && qty > 0) {
        const averageBeforeSell = quantity > 0 ? costBasis / quantity : 0;
        quantity = Math.max(0, quantity - qty);
        costBasis = Math.max(0, costBasis - averageBeforeSell * qty);
      }
    });

    const currentPrice = safeNumber(priceMap[asset.id] || 0);
    const currentValue = asset.assetType === 'fixed-deposit' ? costBasis : quantity * currentPrice;
    const investedAmount = costBasis;
    const averageBuyPrice = quantity > 0 ? investedAmount / quantity : 0;
    const gainLoss = currentValue - investedAmount;
    const gainLossPercent = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;

    return {
      assetId: asset.id,
      quantity,
      investedAmount,
      currentPrice,
      currentValue,
      averageBuyPrice,
      gainLoss,
      gainLossPercent,
      allocationPercent: 0,
      assetType: asset.assetType,
      assetName: asset.name,
      ticker: asset.ticker,
      sector: asset.sector,
      color: asset.color || getTypeColor(asset.assetType),
    };
  }).filter((holding) => holding.investedAmount > 0 || holding.quantity > 0);
}

export function buildPortfolioOverview(holdings) {
  const totalValue = holdings.reduce((sum, item) => sum + item.currentValue, 0);
  const totalInvested = holdings.reduce((sum, item) => sum + item.investedAmount, 0);
  const gainLoss = totalValue - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  const allocation = Object.values(
    holdings.reduce((acc, item) => {
      if (!acc[item.assetType]) {
        acc[item.assetType] = {
          label: TYPE_LABELS[item.assetType] || item.assetType,
          value: 0,
          percentage: 0,
          color: item.color || getTypeColor(item.assetType),
        };
      }
      acc[item.assetType].value += item.currentValue;
      return acc;
    }, {})
  )
    .map((item) => ({
      ...item,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }))
    .sort((left, right) => right.value - left.value);

  return {
    totalValue,
    totalInvested,
    gainLoss,
    gainLossPercent,
    allocation,
    state: gainLoss > 0 ? 'positive' : gainLoss < 0 ? 'negative' : 'neutral',
  };
}

export function buildAssetRows(holdings, filters) {
  const filtered = holdings.filter((item) => filters.assetType === 'all' || item.assetType === filters.assetType);
  const sorted = [...filtered];

  if (filters.sortBy === 'value') sorted.sort((left, right) => right.currentValue - left.currentValue);
  if (filters.sortBy === 'gain-loss') sorted.sort((left, right) => right.gainLoss - left.gainLoss);
  if (filters.sortBy === 'alphabetical') sorted.sort((left, right) => left.assetName.localeCompare(right.assetName));
  if (filters.sortBy === 'allocation') sorted.sort((left, right) => right.allocationPercent - left.allocationPercent);

  return sorted;
}

export function addAllocationShare(holdings) {
  const totalValue = holdings.reduce((sum, item) => sum + item.currentValue, 0);
  return holdings.map((item) => ({
    ...item,
    allocationPercent: totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0,
  }));
}

export function buildSectorDistribution(holdings) {
  const totalValue = holdings.reduce((sum, item) => sum + item.currentValue, 0);
  return Object.values(
    holdings.reduce((acc, item) => {
      if (!acc[item.sector]) {
        acc[item.sector] = {
          label: item.sector,
          value: 0,
          color: item.color,
        };
      }
      acc[item.sector].value += item.currentValue;
      return acc;
    }, {})
  )
    .map((item) => ({
      ...item,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }))
    .sort((left, right) => right.value - left.value);
}

export function buildProfitLossRows(holdings) {
  return [...holdings]
    .map((item) => ({
      assetId: item.assetId,
      assetName: item.assetName,
      ticker: item.ticker,
      gainLoss: item.gainLoss,
      gainLossPercent: item.gainLossPercent,
      currentValue: item.currentValue,
    }))
    .sort((left, right) => right.gainLoss - left.gainLoss);
}

export function buildInvestmentCashFlowSummary(transactions) {
  return transactions.reduce(
    (summary, transaction) => {
      const amount = safeNumber(transaction.amount);
      if (transaction.type === 'buy' || transaction.type === 'sip' || transaction.type === 'transfer-in') summary.investedIn += amount;
      if (transaction.type === 'sell' || transaction.type === 'transfer-out') summary.withdrawn += amount;
      if (transaction.type === 'dividend') summary.dividends += amount;
      summary.netCashFlow = summary.investedIn - summary.withdrawn - summary.dividends;
      return summary;
    },
    { investedIn: 0, withdrawn: 0, dividends: 0, netCashFlow: 0 }
  );
}

export function getTransactionsForRange(transactions, range) {
  if (range === 'all') return [...transactions];
  const countMap = { '1w': 7, '1m': 31, '3m': 92, '6m': 183, '1y': 365 };
  const windowDays = countMap[range] || 365;
  const latestDate = transactions.reduce((latest, item) => (item.date > latest ? item.date : latest), '0000-00-00');
  const latest = new Date(`${latestDate}T12:00:00`);
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - windowDays);
  return transactions.filter((item) => new Date(`${item.date}T12:00:00`) >= cutoff);
}

export function buildPortfolioAnalytics({ holdings, transactions, performanceFeed, timeRange }) {
  const sectorDistribution = buildSectorDistribution(holdings);
  const profitLossRows = buildProfitLossRows(holdings);
  const cashFlow = buildInvestmentCashFlowSummary(getTransactionsForRange(transactions, timeRange));
  const performance = performanceFeed[timeRange] || performanceFeed.all || [];

  return {
    performance,
    assetAllocation: holdings.map((item) => ({
      label: item.ticker || item.assetName,
      value: item.currentValue,
      color: item.color,
    })),
    sectorDistribution,
    profitLossRows,
    cashFlow,
    bestPerformer: profitLossRows[0] || null,
    worstPerformer: [...profitLossRows].reverse()[0] || null,
  };
}

export function buildGoalRows(goals, holdings) {
  return goals.map((goal) => {
    const linkedValue = holdings
      .filter((item) => goal.linkedAssetIds.includes(item.assetId))
      .reduce((sum, item) => sum + item.currentValue, 0);
    const currentValue = linkedValue || safeNumber(goal.currentValue);
    const progressPercent = goal.targetAmount > 0 ? (currentValue / goal.targetAmount) * 100 : 0;
    return {
      ...goal,
      currentValue,
      progressPercent,
      remainingAmount: Math.max(0, goal.targetAmount - currentValue),
      projectionLabel:
        goal.projectedMonthsRemaining > 0
          ? `${goal.projectedMonthsRemaining} months at current pace`
          : 'Target reached',
    };
  });
}

export function buildFundingAccounts(baseAccounts, transactions) {
  const next = baseAccounts.map((account) => ({ ...account }));

  transactions.forEach((transaction) => {
    const account = next.find((item) => item.id === transaction.accountId);
    if (!account) return;
    const amount = safeNumber(transaction.amount);

    if (transaction.type === 'buy' || transaction.type === 'sip' || transaction.type === 'transfer-in') {
      account.balance -= amount;
    }
    if (transaction.type === 'sell' || transaction.type === 'dividend' || transaction.type === 'transfer-out') {
      account.balance += amount;
    }
  });

  return next;
}

export function buildAccountImpactPreview(accounts, form) {
  const account = accounts.find((item) => item.id === form.accountId);
  if (!account) {
    return {
      accountId: '',
      accountName: 'Choose an account',
      direction: 'none',
      amount: 0,
      balanceBefore: 0,
      balanceAfter: 0,
      label: 'Select a funding account to preview the balance impact.',
    };
  }

  const amount = safeNumber(form.amount);
  const isDebit = ['buy', 'sip', 'transfer-in'].includes(form.type);
  const isCredit = ['sell', 'dividend', 'transfer-out'].includes(form.type);
  const balanceAfter = isDebit ? account.balance - amount : isCredit ? account.balance + amount : account.balance;

  return {
    accountId: account.id,
    accountName: account.name,
    direction: isDebit ? 'debit' : isCredit ? 'credit' : 'none',
    amount,
    balanceBefore: account.balance,
    balanceAfter,
    label: TRANSACTION_IMPACT_LABELS[form.type] || 'No account impact.',
  };
}

export function buildTransactionLedger(transactions, assets, accounts) {
  return [...transactions]
    .sort(byDateDesc)
    .map((transaction) => {
      const asset = assets.find((item) => item.id === transaction.assetId);
      const account = accounts.find((item) => item.id === transaction.accountId);
      return {
        ...transaction,
        assetName: asset?.name || transaction.assetName || 'Portfolio funding',
        ticker: asset?.ticker || '',
        accountName: account?.name || 'Linked account',
        displayDateLabel: formatShortDate(transaction.date),
      };
    });
}

export function buildDashboardSnapshot(overview, holdings, goals) {
  return {
    totalValue: overview.totalValue,
    gainLoss: overview.gainLoss,
    topAsset: holdings[0]?.assetName || 'No holdings yet',
    allocationLeader: overview.allocation[0]?.label || 'Unallocated',
    activeGoals: goals.length,
  };
}

export function getInvestmentEventMap() {
  return {
    transactionSaved: DASHBOARD_REFRESH_EVENTS.INVESTMENT_TRANSACTION_CREATED,
    walletLinkageUpdated: 'investment.wallet_linkage.updated',
    holdingsChanged: 'investment.holdings.changed',
    goalsChanged: 'investment.goals.changed',
    analyticsChanged: 'investment.analytics.changed',
  };
}

export function normalizeInvestmentTransactionPayload(form, assets, priceMap = {}) {
  const asset = assets.find((item) => item.id === form.assetId);
  const amount = safeNumber(form.amount);
  const marketPrice = safeNumber(priceMap[form.assetId]) || safeNumber(form.pricePerUnit) || 1;
  const quantity = ['buy', 'sell'].includes(form.type)
    ? amount / marketPrice
    : safeNumber(form.quantity);

  return {
    id: form.id || `investment-${Date.now()}`,
    type: form.type,
    assetId: form.assetId || '',
    assetName: asset?.name || '',
    accountId: form.accountId,
    amount,
    quantity,
    pricePerUnit: marketPrice,
    fees: safeNumber(form.fees),
    notes: form.notes.trim(),
    linkedGoalId: form.linkedGoalId || '',
    schedule: form.schedule || '',
    date: form.date,
    time: form.time,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function formatAssetTypeLabel(value) {
  return TYPE_LABELS[value] || value;
}

export function getTransactionTypeOptions() {
  return [
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'dividend', label: 'Dividend income' },
    { value: 'sip', label: 'SIP contribution' },
    { value: 'transfer-in', label: 'Transfer into investments' },
    { value: 'transfer-out', label: 'Transfer out of investments' },
  ];
}

export function getAssetTypeOptions() {
  return [
    { value: 'all', label: 'All assets' },
    { value: 'stock', label: 'Stocks' },
    { value: 'mutual-fund', label: 'Mutual funds' },
    { value: 'etf', label: 'ETFs' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'fixed-deposit', label: 'Fixed deposits' },
  ];
}

export function getAssetSortOptions() {
  return [
    { value: 'value', label: 'Value' },
    { value: 'gain-loss', label: 'Gain/Loss' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'allocation', label: 'Allocation' },
  ];
}

export function getPortfolioTimeRanges() {
  return [
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'All' },
  ];
}

export function getGoalFrequencyOptions() {
  return [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
  ];
}

export function formatHoldingMetric(value) {
  return formatCurrency(value);
}
