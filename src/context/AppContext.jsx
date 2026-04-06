import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  AI_CHAT,
  AI_INSIGHTS,
  CAT_META,
  EXPENSE_CATEGORIES,
  EXPENSE_FILTERS,
  INCOME_CATEGORIES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_WALLET,
  INVESTMENT_DATA,
  SUBSCRIPTION_BUDGET,
} from '../data/appData';
import { APP_STATE_VERSION, ENTRY_KINDS, WALLET_TRANSACTION_SOURCES } from '../data/schemaNotes';
import { INITIAL_MONTHLY_BUDGET_LIMIT, INITIAL_WEEKLY_BUDGET_LIMIT, SEED_TRANSACTIONS } from '../data/seedTransactions';
import {
  INVESTMENT_ASSETS_SEED,
  INVESTMENT_GOALS_SEED,
  INVESTMENT_TRANSACTIONS_SEED,
  PORTFOLIO_PERFORMANCE_SEED,
  PORTFOLIO_PRICE_MAP,
} from '../investment-portfolio/mockData';
import {
  addWeeks,
  formatDateKey,
  getMonthlyRollupsForYear,
  normalizeTransaction,
  sortTransactionsNewestFirst,
  startOfWeek,
} from '../utils/budgeting';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { createDashboardReloadStrategy, DASHBOARD_REFRESH_EVENTS } from '../dashboard/refresh';
import { getAIReply, getRenewalDaysLeft, parseRenewalDate } from '../utils/finance';
import { buildInvestmentHoldings } from '../investment-portfolio/selectors';
import {
  buildMonthlyReflection,
  buildSearchIndex,
  buildWalletBalanceTrend,
  buildWeeklySeries,
  createBudgetEntriesFromLimit,
  createEntryFromTransaction,
  normalizeFinanceEntry,
} from '../utils/financeEngine';
import {
  getAllAccounts,
  getActiveWallet,
  getAccountBalance,
  getAccountById,
  getAssetSnapshots,
  getExpenseByAccount,
  getMonthlySummary,
  getPortfolioValue,
  getRecentTransactions,
  getRecentWalletTransactions,
  getNetCashFlow,
  getTotalBalance,
  getTransactionsByAccount,
  getWalletBalance,
  getWalletById,
  getWalletTransactions,
  getWalletTrendData,
  getIncomeByAccount,
  getWeeklyWalletExpense,
  getWeeklyWalletIncome,
  getWeeklySummary,
} from './selectors';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEYS = {
  transactions: 'finsphere.transactions.zero-seed',
  customExpenseCategories: 'finsphere.categories.expense',
  customIncomeCategories: 'finsphere.categories.income',
  selectedPeriod: 'finsphere.dashboard.period',
  activeWeekStart: 'finsphere.dashboard.activeWeekStart',
  weeklyBudgetLimit: 'finsphere.dashboard.weeklyBudgetLimit',
  monthlyBudgetLimit: 'finsphere.dashboard.monthlyBudgetLimit',
  monthlyBudgetOverride: 'finsphere.dashboard.monthlyBudgetOverride',
  wallets: 'finsphere.wallet.wallets',
  activeWalletId: 'finsphere.wallet.activeWalletId',
  walletTransactions: 'finsphere.wallet.transactions',
  walletCards: 'finsphere.wallet.cards',
  subscriptions: 'finsphere.subscriptions',
  appStateVersion: 'finsphere.app.version',
  incomeEntries: 'finsphere.entries.income',
  expenseEntries: 'finsphere.entries.expense',
  budgetEntries: 'finsphere.entries.budget',
  investmentAssets: 'finsphere.investments.assets',
  investmentTransactions: 'finsphere.investments.transactions',
  investmentGoals: 'finsphere.investments.goals',
  investmentPrices: 'finsphere.investments.prices',
};

const AppContext = createContext(null);

function createInitialTransactions() {
  return sortTransactionsNewestFirst(SEED_TRANSACTIONS.map(normalizeTransaction));
}

function createInitialWalletTransactions() {
  return INITIAL_WALLET.transactions.map((transaction) => ({
    id: String(transaction.id || Date.now() + Math.random()),
    walletId: 'wallet-primary',
    type: transaction.type === 'received' ? 'income' : 'transfer-out',
    direction: transaction.type === 'received' ? 'in' : 'out',
    amount: Number(transaction.amount || 0),
    date: formatDateKey(new Date()),
    category: null,
    source: WALLET_TRANSACTION_SOURCES.wallet,
    referenceId: '',
    note: transaction.name,
    createdAt: new Date().toISOString(),
    linkedTransactionId: null,
    assetId: null,
    assetName: null,
  }));
}

function createInitialWallets() {
  const now = new Date().toISOString();
  return [
    {
      id: 'wallet-primary',
      name: 'FinSphere Wallet',
      type: 'wallet',
      balance: Number(INITIAL_WALLET.balance || 0),
      currency: 'INR',
      details: {},
      createdAt: now,
      updatedAt: now,
      isPrimary: true,
    },
  ];
}

function createInitialWalletCards() {
  return [
    {
      id: 'wallet-card-primary',
      label: 'Primary Debit',
      holder: 'Aryan Mehta',
      last4: '4821',
      expires: '09/29',
    },
  ];
}

function createInitialEntryState(transactions, kind) {
  return transactions
    .filter((transaction) => transaction.type === kind)
    .map((transaction) => createEntryFromTransaction(transaction));
}

function createInitialBudgetEntries() {
  return createBudgetEntriesFromLimit(INITIAL_WEEKLY_BUDGET_LIMIT, new Date());
}

function getTransactionMeta(category) {
  return CAT_META[category] || CAT_META.Other;
}

function toLegacyExpense(transaction) {
  const meta = getTransactionMeta(transaction.category);
  return {
    id: transaction.id,
    name: transaction.title,
    cat: transaction.category,
    amount: transaction.amount,
    date: transaction.date,
    account: transaction.account,
    notes: transaction.notes,
    icon: meta.icon,
    color: meta.color,
  };
}

function normalizeTransactionPayload(payload, explicitType) {
  const type = explicitType || payload.type;
  return normalizeTransaction({
    id: payload.id || uuid(),
    type,
    title: payload.title,
    category: payload.category || (type === 'income' ? 'Other' : type === 'transfer' ? 'Transfer' : 'Food'),
    amount: payload.amount,
    date: payload.date || formatDateKey(new Date()),
    time: payload.time || '',
    account: payload.account || payload.fromAccount || '',
    fromAccount: payload.fromAccount || payload.account || '',
    toAccount: payload.toAccount || '',
    notes: payload.notes || '',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
    paymentMode: payload.paymentMode || 'Bank',
  });
}

function validateAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function validateDate(value) {
  return value ? formatDateKey(value) : formatDateKey(new Date());
}

function getTransactionWalletDelta(transaction) {
  if (!transaction) return 0;
  if (transaction.type === 'income') return Number(transaction.amount || 0);
  if (transaction.type === 'expense') return -Number(transaction.amount || 0);
  return 0;
}

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.transactions, null);
    return Array.isArray(stored) ? sortTransactionsNewestFirst(stored.map(normalizeTransaction)) : createInitialTransactions();
  });
  const [incomeEntries, setIncomeEntries] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.incomeEntries, null);
    return Array.isArray(stored) ? stored.map((entry) => normalizeFinanceEntry(entry, ENTRY_KINDS.income)) : createInitialEntryState(createInitialTransactions(), 'income');
  });
  const [expenseEntries, setExpenseEntries] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.expenseEntries, null);
    return Array.isArray(stored) ? stored.map((entry) => normalizeFinanceEntry(entry, ENTRY_KINDS.expense)) : createInitialEntryState(createInitialTransactions(), 'expense');
  });
  const [budgetEntries, setBudgetEntries] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.budgetEntries, null);
    return Array.isArray(stored) ? stored.map((entry) => normalizeFinanceEntry(entry, ENTRY_KINDS.budget)) : createInitialBudgetEntries();
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.selectedPeriod, 'weekly');
    return stored || 'weekly';
  });
  const [customExpenseCategories, setCustomExpenseCategories] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.customExpenseCategories, []);
    return Array.isArray(stored) ? stored : [];
  });
  const [customIncomeCategories, setCustomIncomeCategories] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.customIncomeCategories, []);
    return Array.isArray(stored) ? stored : [];
  });
  const [activeWeekStart, setActiveWeekStart] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.activeWeekStart, null);
    return formatDateKey(startOfWeek(stored || new Date()));
  });
  const [weeklyBudgetLimit, setWeeklyBudgetLimitState] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.weeklyBudgetLimit, INITIAL_WEEKLY_BUDGET_LIMIT);
    return typeof stored === 'number' ? stored : INITIAL_WEEKLY_BUDGET_LIMIT;
  });
  const [monthlyBudgetLimit, setMonthlyBudgetLimitState] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.monthlyBudgetLimit, INITIAL_MONTHLY_BUDGET_LIMIT);
    return typeof stored === 'number' ? stored : INITIAL_MONTHLY_BUDGET_LIMIT;
  });
  const [monthlyBudgetOverride, setMonthlyBudgetOverride] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.monthlyBudgetOverride, false);
    return Boolean(stored);
  });
  const [transactionModal, setTransactionModal] = useState({ isOpen: false, type: 'expense' });
  const [toast, setToast] = useState(null);
  const [dashboardRefreshVersion, setDashboardRefreshVersion] = useState(0);
  const [lastDashboardRefreshEvent, setLastDashboardRefreshEvent] = useState(null);
  const [wallets, setWallets] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.wallets, null);
    return Array.isArray(stored) && stored.length ? stored : createInitialWallets();
  });
  const [activeWalletId, setActiveWalletId] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.activeWalletId, 'wallet-primary');
    return stored || 'wallet-primary';
  });
  const [walletTransactions, setWalletTransactions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.walletTransactions, null);
    return Array.isArray(stored) ? stored : createInitialWalletTransactions();
  });
  const [walletCards, setWalletCards] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.walletCards, null);
    return Array.isArray(stored) ? stored : createInitialWalletCards();
  });
  const [subscriptions, setSubscriptions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.subscriptions, null);
    return Array.isArray(stored) ? stored : INITIAL_SUBSCRIPTIONS;
  });
  const [investmentAssets, setInvestmentAssets] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.investmentAssets, null);
    return Array.isArray(stored) && stored.length ? stored : INVESTMENT_ASSETS_SEED;
  });
  const [investmentTransactions, setInvestmentTransactions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.investmentTransactions, null);
    return Array.isArray(stored) ? stored : INVESTMENT_TRANSACTIONS_SEED;
  });
  const [investmentGoals, setInvestmentGoals] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.investmentGoals, null);
    return Array.isArray(stored) ? stored : INVESTMENT_GOALS_SEED;
  });
  const [investmentPrices, setInvestmentPrices] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.investmentPrices, null);
    return stored && typeof stored === 'object' ? stored : PORTFOLIO_PRICE_MAP;
  });
  const wallet = useMemo(
    () => wallets.find((item) => item.id === activeWalletId) || wallets.find((item) => item.isPrimary) || wallets[0] || createInitialWallets()[0],
    [activeWalletId, wallets]
  );
  const walletBalance = Number(wallet?.balance || 0);

  const dashboardMetrics = useDashboardMetrics({
    transactions,
    weeklyBudgetLimit,
    monthlyBudgetLimit,
    selectedPeriod,
    activeWeekStart,
    categoryMeta: CAT_META,
  });

  useEffect(() => {
    saveJSON(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.incomeEntries, incomeEntries);
  }, [incomeEntries]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.expenseEntries, expenseEntries);
  }, [expenseEntries]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.budgetEntries, budgetEntries);
  }, [budgetEntries]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.selectedPeriod, selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.customExpenseCategories, customExpenseCategories);
  }, [customExpenseCategories]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.customIncomeCategories, customIncomeCategories);
  }, [customIncomeCategories]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.activeWeekStart, activeWeekStart);
  }, [activeWeekStart]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.weeklyBudgetLimit, weeklyBudgetLimit);
  }, [weeklyBudgetLimit]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.monthlyBudgetLimit, monthlyBudgetLimit);
  }, [monthlyBudgetLimit]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.monthlyBudgetOverride, monthlyBudgetOverride);
  }, [monthlyBudgetOverride]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.wallets, wallets);
  }, [wallets]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.activeWalletId, activeWalletId);
  }, [activeWalletId]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.walletTransactions, walletTransactions);
  }, [walletTransactions]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.walletCards, walletCards);
  }, [walletCards]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.subscriptions, subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.investmentAssets, investmentAssets);
  }, [investmentAssets]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.investmentTransactions, investmentTransactions);
  }, [investmentTransactions]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.investmentGoals, investmentGoals);
  }, [investmentGoals]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.investmentPrices, investmentPrices);
  }, [investmentPrices]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.appStateVersion, APP_STATE_VERSION);
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const emitDashboardRefresh = useCallback((eventType, meta = {}) => {
    setDashboardRefreshVersion((current) => current + 1);
    setLastDashboardRefreshEvent({
      type: eventType,
      meta,
      at: Date.now(),
    });
  }, []);

  const setWeeklyBudgetLimit = useCallback((value) => {
    const nextValue = Math.max(0, Number(value) || 0);
    setWeeklyBudgetLimitState(nextValue);
    setBudgetEntries((current) => current.map((entry, index) => (
      index === 0 ? normalizeFinanceEntry({ ...entry, amount: nextValue }, ENTRY_KINDS.budget) : entry
    )));
    if (!monthlyBudgetOverride) {
      setMonthlyBudgetLimitState(nextValue * 4);
    }
  }, [monthlyBudgetOverride]);

  const setMonthlyBudgetLimit = useCallback((value) => {
    const nextValue = Math.max(0, Number(value) || 0);
    setMonthlyBudgetOverride(true);
    setMonthlyBudgetLimitState(nextValue);
  }, []);

  const resetMonthlyBudgetToDefault = useCallback(() => {
    setMonthlyBudgetOverride(false);
    setMonthlyBudgetLimitState(weeklyBudgetLimit * 4);
  }, [weeklyBudgetLimit]);

  const openTransactionModal = useCallback((type) => {
    setTransactionModal({ isOpen: true, type });
  }, []);

  const closeTransactionModal = useCallback(() => {
    setTransactionModal((current) => ({ ...current, isOpen: false }));
  }, []);

  const createWallet = useCallback((payload) => {
    const name = String(payload?.name || '').trim();
    if (!name) {
      showToast('Wallet name is required', 'error');
      return null;
    }
    const now = new Date().toISOString();
    const nextWallet = {
      id: payload.id || `wallet-${Date.now()}`,
      name,
      type: payload.type || 'wallet',
      balance: Number(payload.balance || 0),
      currency: payload.currency || 'INR',
      details: {
        accountHolderName: payload.details?.accountHolderName || '',
        bankName: payload.details?.bankName || '',
        accountNumber: payload.details?.accountNumber || '',
        upiId: payload.details?.upiId || '',
        cardLast4: payload.details?.cardLast4 || '',
        note: payload.details?.note || '',
      },
      createdAt: now,
      updatedAt: now,
      isPrimary: wallets.length === 0 || Boolean(payload.isPrimary),
    };
    setWallets((current) => {
      const normalized = nextWallet.isPrimary
        ? current.map((walletItem) => ({ ...walletItem, isPrimary: false }))
        : current;
      return [nextWallet, ...normalized];
    });
    if (nextWallet.isPrimary || !activeWalletId) {
      setActiveWalletId(nextWallet.id);
    }
    return nextWallet;
  }, [activeWalletId, showToast, wallets.length]);

  const updateWallet = useCallback((walletId, updates) => {
    let nextWallet = null;
    setWallets((current) => current.map((walletItem) => {
      if (walletItem.id !== walletId) {
        return updates?.isPrimary ? { ...walletItem, isPrimary: false } : walletItem;
      }
      nextWallet = {
        ...walletItem,
        ...updates,
        details: {
          ...walletItem.details,
          ...(updates?.details || {}),
        },
        updatedAt: new Date().toISOString(),
      };
      return nextWallet;
    }));
    return nextWallet;
  }, []);

  const setActiveWallet = useCallback((walletId) => {
    const exists = wallets.some((walletItem) => walletItem.id === walletId);
    if (!exists) return false;
    setActiveWalletId(walletId);
    return true;
  }, [wallets]);

  const deleteWallet = useCallback((walletId) => {
    const hasLinkedWalletTransactions = walletTransactions.some((transaction) => transaction.walletId === walletId);
    const hasLinkedLedgerTransactions = transactions.some((transaction) =>
      transaction.walletId === walletId || transaction.sourceAccountId === walletId || transaction.destinationAccountId === walletId
    );
    const hasLinkedInvestmentTransactions = investmentTransactions.some((transaction) => transaction.accountId === walletId);

    if (hasLinkedWalletTransactions || hasLinkedLedgerTransactions || hasLinkedInvestmentTransactions) {
      showToast('Cannot delete this account because transactions are linked to it.', 'error');
      return { ok: false, reason: 'linked_transactions' };
    }

    const nextWallets = wallets.filter((walletItem) => walletItem.id !== walletId);
    if (!nextWallets.length) {
      showToast('At least one account is required.', 'error');
      return { ok: false, reason: 'minimum_one_account' };
    }

    setWallets(nextWallets.map((walletItem, index) => ({
      ...walletItem,
      isPrimary: index === 0 ? true : walletItem.isPrimary,
    })));
    if (activeWalletId === walletId) {
      setActiveWalletId(nextWallets[0].id);
    }
    showToast('Account deleted', 'error');
    return { ok: true };
  }, [activeWalletId, investmentTransactions, showToast, transactions, walletTransactions, wallets]);

  const recordWalletTransaction = useCallback((entry) => {
    const amount = validateAmount(entry.amount);
    if (!amount || amount <= 0) return null;
    const nextEntry = {
      id: entry.id || `wallet-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      walletId: entry.walletId || activeWalletId || wallet.id,
      type: entry.type || 'adjustment',
      direction: entry.direction || (['income', 'sell', 'dividend', 'transfer-in'].includes(entry.type) ? 'in' : 'out'),
      amount,
      date: validateDate(entry.date),
      category: entry.category ?? null,
      source: entry.source || WALLET_TRANSACTION_SOURCES.wallet,
      referenceId: entry.referenceId || '',
      note: entry.note || entry.notes || '',
      assetId: entry.assetId || null,
      assetName: entry.assetName || null,
      createdAt: entry.createdAt || new Date().toISOString(),
      linkedTransactionId: entry.linkedTransactionId ?? null,
    };
    setWalletTransactions((current) => [nextEntry, ...current]);
    return nextEntry;
  }, [activeWalletId, wallet.id]);

  const removeWalletTransactionByReference = useCallback((referenceId) => {
    if (!referenceId) return;
    setWalletTransactions((current) => current.filter((transaction) => transaction.referenceId !== referenceId));
  }, []);

  const applyWalletBalanceChange = useCallback((deltaAmount, walletId = activeWalletId || wallet.id) => {
    const amount = Number(deltaAmount || 0);
    if (!amount) return null;
    let nextBalance = 0;
    setWallets((current) => current.map((walletItem) => {
      if (walletItem.id !== walletId) return walletItem;
      nextBalance = walletItem.balance + amount;
      return {
        ...walletItem,
        balance: nextBalance,
        updatedAt: new Date().toISOString(),
      };
    }));
    return nextBalance;
  }, [activeWalletId, wallet.id]);

  const receiveMoney = useCallback((from, amount, meta = {}) => {
    const value = validateAmount(amount);
    if (!String(from || '').trim() || !value || value <= 0) return false;
    applyWalletBalanceChange(value, meta.walletId || activeWalletId || wallet.id);
    recordWalletTransaction({
      walletId: meta.walletId || activeWalletId || wallet.id,
      type: 'income',
      direction: 'in',
      amount: value,
      source: meta.source || WALLET_TRANSACTION_SOURCES.wallet,
      date: meta.date || formatDateKey(new Date()),
      category: meta.category || null,
      note: meta.notes || '',
      assetName: meta.assetName || null,
      referenceId: meta.referenceId || null,
    });
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.INCOME_CREATED, { amount: value, source: meta.source || 'wallet' });
    showToast(`Received ₹${value.toLocaleString('en-IN')} from ${String(from).trim()}`);
    return true;
  }, [activeWalletId, applyWalletBalanceChange, emitDashboardRefresh, recordWalletTransaction, showToast, wallet.id]);

  const syncInvestmentCashFlowToWallet = useCallback((payload) => {
    const amount = Number(payload.amount || 0);
    if (!amount || amount <= 0 || !payload.assetName) {
      return { ok: false, reason: 'invalid' };
    }

    if (payload.type === 'buy' && amount > walletBalance) {
      return { ok: false, reason: 'insufficient_balance' };
    }

    const isDebit = payload.type === 'buy';
    const isCredit = payload.type === 'sell' || payload.type === 'dividend';
    if (!isDebit && !isCredit) return { ok: false, reason: 'unsupported' };

    applyWalletBalanceChange(isDebit ? -amount : amount, payload.walletId || activeWalletId || wallet.id);
    const walletEntry = recordWalletTransaction({
      walletId: payload.walletId || activeWalletId || wallet.id,
      type: payload.type,
      direction: isCredit ? 'in' : 'out',
      amount,
      category: payload.type === 'dividend' ? 'Investment Return' : 'Investment',
      source: WALLET_TRANSACTION_SOURCES.portfolio,
      assetName: payload.assetName,
      assetId: payload.assetId || null,
      date: payload.date || formatDateKey(new Date()),
      note: payload.notes || '',
      referenceId: payload.referenceId || null,
    });

    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.INVESTMENT_TRANSACTION_CREATED, {
      amount,
      assetName: payload.assetName,
      walletTransactionId: walletEntry?.id,
      type: payload.type,
    });

    return { ok: true, walletTransaction: walletEntry };
  }, [activeWalletId, applyWalletBalanceChange, emitDashboardRefresh, recordWalletTransaction, wallet.id, walletBalance]);

  const addWalletCard = useCallback((payload) => {
    const label = String(payload.label || '').trim();
    const holder = String(payload.holder || '').trim();
    const last4 = String(payload.last4 || '').trim();
    const expires = String(payload.expires || '').trim();
    if (!label || !holder || last4.length !== 4 || !expires) return false;
    setWalletCards((current) => [
      {
        id: `wallet-card-${Date.now()}`,
        label,
        holder,
        last4,
        expires,
      },
      ...current,
    ]);
    showToast(`Card "${label}" added`);
    return true;
  }, [showToast]);

  const addCustomCategory = useCallback((type, categoryName) => {
    const trimmed = String(categoryName || '').trim();
    if (!trimmed) return { ok: false, reason: 'empty' };

    if (type === 'income') {
      const exists = [...INCOME_CATEGORIES, ...customIncomeCategories].some(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return { ok: false, reason: 'exists' };
      setCustomIncomeCategories((current) => [...current, trimmed]);
      showToast(`"${trimmed}" category added`);
      return { ok: true, value: trimmed };
    }

    const exists = [...EXPENSE_CATEGORIES, ...customExpenseCategories].some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return { ok: false, reason: 'exists' };
    setCustomExpenseCategories((current) => [...current, trimmed]);
    showToast(`"${trimmed}" category added`);
    return { ok: true, value: trimmed };
  }, [customExpenseCategories, customIncomeCategories, showToast]);

  const removeCustomCategory = useCallback((type, categoryName) => {
    const trimmed = String(categoryName || '').trim();
    if (!trimmed) return { ok: false, reason: 'empty' };

    if (type === 'income') {
      const exists = customIncomeCategories.some((item) => item.toLowerCase() === trimmed.toLowerCase());
      if (!exists) return { ok: false, reason: 'missing' };
      setCustomIncomeCategories((current) => current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()));
      showToast(`"${trimmed}" category removed`, 'error');
      return { ok: true };
    }

    const exists = customExpenseCategories.some((item) => item.toLowerCase() === trimmed.toLowerCase());
    if (!exists) return { ok: false, reason: 'missing' };
    setCustomExpenseCategories((current) => current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()));
    showToast(`"${trimmed}" category removed`, 'error');
    return { ok: true };
  }, [customExpenseCategories, customIncomeCategories, showToast]);

  const syncLedgerWalletTransaction = useCallback((transaction) => {
    const delta = getTransactionWalletDelta(transaction);
    if (!delta) return null;
    const walletEntry = recordWalletTransaction({
      walletId: transaction.walletId || activeWalletId || wallet.id,
      type: transaction.type,
      direction: transaction.type === 'income' ? 'in' : 'out',
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category || null,
      source: transaction.type === 'income' ? WALLET_TRANSACTION_SOURCES.income : WALLET_TRANSACTION_SOURCES.expense,
      referenceId: transaction.id,
      note: transaction.notes || '',
    });
    applyWalletBalanceChange(delta, transaction.walletId || activeWalletId || wallet.id);
    return walletEntry;
  }, [activeWalletId, applyWalletBalanceChange, recordWalletTransaction, wallet.id]);

  const addWalletTransaction = useCallback((payload) => {
    const transaction = recordWalletTransaction(payload);
    if (!transaction) return null;
    const delta = transaction.direction === 'in' ? transaction.amount : -transaction.amount;
    applyWalletBalanceChange(delta, transaction.walletId);
    return transaction;
  }, [applyWalletBalanceChange, recordWalletTransaction]);

  const saveTransaction = useCallback((payload, explicitType) => {
    const type = explicitType || payload.type;
    const amount = validateAmount(payload.amount);
    if (!amount) {
      showToast('Enter a valid amount', 'error');
      return null;
    }
    if ((type === 'expense' || type === 'buy') && amount > walletBalance) {
      showToast('Insufficient wallet balance', 'error');
      return null;
    }
    const nextTransaction = normalizeTransactionPayload(payload, explicitType);
    nextTransaction.amount = amount;
    nextTransaction.walletId = payload.walletId || activeWalletId || wallet.id;

    setTransactions((current) => sortTransactionsNewestFirst([nextTransaction, ...current]));
    if (type === 'income') {
      setIncomeEntries((current) => [
        normalizeFinanceEntry({
          ...createEntryFromTransaction(nextTransaction),
          frequency: payload.frequency || 'one-time',
          startDate: payload.startDate || nextTransaction.date,
          effectiveDate: nextTransaction.date,
        }, ENTRY_KINDS.income),
        ...current,
      ]);
    }
    if (type === 'expense') {
      setExpenseEntries((current) => [
        normalizeFinanceEntry({
          ...createEntryFromTransaction(nextTransaction),
          frequency: payload.frequency || 'one-time',
          startDate: payload.startDate || nextTransaction.date,
          effectiveDate: nextTransaction.date,
        }, ENTRY_KINDS.expense),
        ...current,
      ]);
    }
    if (type === 'income' || type === 'expense') {
      syncLedgerWalletTransaction(nextTransaction);
    }
    emitDashboardRefresh(
      type === 'income' ? DASHBOARD_REFRESH_EVENTS.INCOME_CREATED : DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED,
      { transactionId: nextTransaction.id }
    );
    showToast(`"${nextTransaction.title}" added`);
    return nextTransaction;
  }, [activeWalletId, emitDashboardRefresh, showToast, syncLedgerWalletTransaction, wallet.id, walletBalance]);

  const addIncome = useCallback((payload) => saveTransaction(payload, 'income'), [saveTransaction]);
  const addExpense = useCallback((payload) => saveTransaction(payload, 'expense'), [saveTransaction]);
  const adjustWalletBalance = useCallback((payload) => {
    const amount = validateAmount(Math.abs(Number(payload.amount || 0)));
    if (!amount) {
      showToast('Enter a valid adjustment amount', 'error');
      return null;
    }
    const direction = payload.direction === 'out' ? 'out' : 'in';
    return addWalletTransaction({
      walletId: payload.walletId || activeWalletId || wallet.id,
      type: 'adjustment',
      direction,
      amount,
      category: payload.category || null,
      source: payload.source || 'manual',
      referenceId: payload.referenceId || null,
      note: payload.note || 'Manual balance adjustment',
      date: payload.date || formatDateKey(new Date()),
      linkedTransactionId: null,
    });
  }, [activeWalletId, addWalletTransaction, showToast, wallet.id]);

  const addMoneyToAccount = useCallback((payload) => (
    adjustWalletBalance({
      ...payload,
      direction: 'in',
      source: payload.source || 'manual',
      note: payload.note || 'Manual balance addition',
    })
  ), [adjustWalletBalance]);

  const subtractMoneyFromAccount = useCallback((payload) => {
    const accountId = payload.walletId || payload.accountId || activeWalletId || wallet.id;
    const accountBalance = getWalletById({ wallets }, accountId)?.balance || 0;
    const amount = validateAmount(payload.amount);
    if (amount > accountBalance) {
      showToast('Insufficient balance for subtraction', 'error');
      return null;
    }
    return adjustWalletBalance({
      ...payload,
      walletId: accountId,
      direction: 'out',
      source: payload.source || 'manual',
      note: payload.note || 'Manual balance deduction',
    });
  }, [activeWalletId, adjustWalletBalance, showToast, wallet.id, wallets]);

  const transferBetweenWallets = useCallback((payload) => {
    const amount = validateAmount(payload.amount);
    const sourceWalletId = payload.fromWalletId || activeWalletId || wallet.id;
    const destinationWalletId = payload.toWalletId;
    if (!amount || !sourceWalletId || !destinationWalletId || sourceWalletId === destinationWalletId) {
      showToast('Choose two wallets and a valid amount', 'error');
      return { ok: false, reason: 'invalid' };
    }
    const sourceWallet = wallets.find((walletItem) => walletItem.id === sourceWalletId);
    if (!sourceWallet || sourceWallet.balance < amount) {
      showToast('Insufficient balance for transfer', 'error');
      return { ok: false, reason: 'insufficient_balance' };
    }
    const linkId = `transfer-${Date.now()}`;
    const outbound = recordWalletTransaction({
      walletId: sourceWalletId,
      type: 'transfer-out',
      direction: 'out',
      amount,
      category: null,
      source: 'wallet',
      referenceId: payload.referenceId || null,
      note: payload.note || 'Wallet transfer',
      date: payload.date || formatDateKey(new Date()),
      linkedTransactionId: linkId,
    });
    const inbound = recordWalletTransaction({
      walletId: destinationWalletId,
      type: 'transfer-in',
      direction: 'in',
      amount,
      category: null,
      source: 'wallet',
      referenceId: payload.referenceId || null,
      note: payload.note || 'Wallet transfer',
      date: payload.date || formatDateKey(new Date()),
      linkedTransactionId: linkId,
    });
    applyWalletBalanceChange(-amount, sourceWalletId);
    applyWalletBalanceChange(amount, destinationWalletId);
    return { ok: true, outbound, inbound };
  }, [activeWalletId, applyWalletBalanceChange, recordWalletTransaction, showToast, wallet.id, wallets]);

  const transferBetweenAccounts = useCallback((payload) => transferBetweenWallets(payload), [transferBetweenWallets]);

  const addTransfer = useCallback((payload) => {
    if (payload.fromWalletId || payload.toWalletId) {
      return transferBetweenWallets(payload);
    }
    return saveTransaction(payload, 'transfer');
  }, [saveTransaction, transferBetweenWallets]);
  const addBudgetEntry = useCallback((payload) => {
    const amount = validateAmount(payload.amount);
    if (!amount) {
      showToast('Enter a valid budget amount', 'error');
      return null;
    }
    const nextEntry = normalizeFinanceEntry({
      id: payload.id || `budget-entry-${Date.now()}`,
      kind: ENTRY_KINDS.budget,
      title: payload.title || `${payload.category || 'General'} budget`,
      category: payload.category || 'General',
      amount,
      frequency: payload.frequency || 'weekly',
      startDate: payload.date || payload.startDate || formatDateKey(new Date()),
      effectiveDate: payload.date || payload.startDate || formatDateKey(new Date()),
      notes: payload.notes || '',
      source: WALLET_TRANSACTION_SOURCES.budget,
    }, ENTRY_KINDS.budget);
    setBudgetEntries((current) => {
      const exists = current.some((entry) => entry.id === nextEntry.id);
      return exists ? current.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry)) : [nextEntry, ...current];
    });
    showToast(`Budget saved for ${nextEntry.category}`);
    return nextEntry;
  }, [showToast]);

  const updateTransaction = useCallback((id, payload) => {
    const existing = transactions.find((transaction) => transaction.id === id);
    if (!existing) return;
    let updatedTitle = '';
    const nextTransactionCandidate = normalizeTransactionPayload({
      ...existing,
      ...payload,
      id,
      category: payload.category || existing.category,
      type: payload.type || existing.type,
      amount: payload.amount ?? existing.amount,
    });
    const delta = getTransactionWalletDelta(nextTransactionCandidate) - getTransactionWalletDelta(existing);
    if (delta < 0 && Math.abs(delta) > walletBalance) {
      showToast('Insufficient wallet balance for that update', 'error');
      return;
    }
    setTransactions((current) =>
      sortTransactionsNewestFirst(
        current.map((transaction) => {
          if (transaction.id !== id) return transaction;
          updatedTitle = payload.title || transaction.title;
          return nextTransactionCandidate;
        })
      )
    );
    if (delta) {
      applyWalletBalanceChange(delta, existing.walletId || activeWalletId || wallet.id);
    }
    removeWalletTransactionByReference(id);
    if (nextTransactionCandidate.type === 'income' || nextTransactionCandidate.type === 'expense') {
      syncLedgerWalletTransaction(nextTransactionCandidate);
    }
    if ((payload.type || '').toString() === 'income') {
      setIncomeEntries((current) => current.map((entry) => (
        entry.linkedTransactionId === id
          ? normalizeFinanceEntry({
              ...entry,
              title: payload.title || payload.name || entry.title,
              category: payload.category || payload.cat || entry.category,
              amount: payload.amount ?? entry.amount,
              startDate: payload.date || entry.startDate,
              effectiveDate: payload.date || entry.effectiveDate,
              accountName: payload.account || entry.accountName,
              notes: payload.notes ?? entry.notes,
            }, ENTRY_KINDS.income)
          : entry
      )));
    }
    if ((payload.type || '').toString() === 'expense') {
      setExpenseEntries((current) => current.map((entry) => (
        entry.linkedTransactionId === id
          ? normalizeFinanceEntry({
              ...entry,
              title: payload.title || payload.name || entry.title,
              category: payload.category || payload.cat || entry.category,
              amount: payload.amount ?? entry.amount,
              startDate: payload.date || entry.startDate,
              effectiveDate: payload.date || entry.effectiveDate,
              accountName: payload.account || entry.accountName,
              notes: payload.notes ?? entry.notes,
            }, ENTRY_KINDS.expense)
          : entry
      )));
    }
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED, { transactionId: id, action: 'updated' });
    showToast(`"${updatedTitle}" updated`);
  }, [activeWalletId, applyWalletBalanceChange, emitDashboardRefresh, removeWalletTransactionByReference, showToast, syncLedgerWalletTransaction, transactions, wallet.id, walletBalance]);

  const deleteTransaction = useCallback((id) => {
    const existing = transactions.find((transaction) => transaction.id === id);
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    setIncomeEntries((current) => current.filter((entry) => entry.linkedTransactionId !== id));
    setExpenseEntries((current) => current.filter((entry) => entry.linkedTransactionId !== id));
    removeWalletTransactionByReference(id);
    const delta = -getTransactionWalletDelta(existing);
    if (delta) {
      applyWalletBalanceChange(delta, existing?.walletId || activeWalletId || wallet.id);
    }
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED, { transactionId: id, action: 'deleted' });
    showToast(`"${existing?.title || 'Transaction'}" deleted`, 'error');
  }, [activeWalletId, applyWalletBalanceChange, emitDashboardRefresh, removeWalletTransactionByReference, transactions, showToast, wallet.id]);

  const updateExpense = useCallback((id, payload) => {
    updateTransaction(id, {
      ...payload,
      type: 'expense',
      title: payload.title || payload.name,
      category: payload.category || payload.cat,
    });
  }, [updateTransaction]);

  const deleteExpense = useCallback((id) => {
    deleteTransaction(id);
  }, [deleteTransaction]);

  const shiftActiveWeek = useCallback((amount) => {
    setActiveWeekStart((current) => formatDateKey(addWeeks(current, amount)));
  }, []);

  const resetActiveWeek = useCallback(() => {
    setActiveWeekStart(formatDateKey(startOfWeek(new Date())));
  }, []);

  const sendMoney = useCallback((to, amount) => {
    const value = validateAmount(amount);
    if (!to.trim() || !value || value <= 0 || value > walletBalance) return false;
    addWalletTransaction({
      walletId: activeWalletId || wallet.id,
      type: 'transfer-out',
      direction: 'out',
      amount: value,
      category: null,
      source: WALLET_TRANSACTION_SOURCES.wallet,
      date: formatDateKey(new Date()),
      note: `Sent to ${to.trim()}`,
    });
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.TRANSFER_CREATED, { amount: value });
    showToast(`Sent ₹${value.toLocaleString('en-IN')} to ${to.trim()}`);
    return true;
  }, [activeWalletId, addWalletTransaction, emitDashboardRefresh, showToast, wallet.id, walletBalance]);

  const removeSubscription = useCallback((id) => {
    const subscription = subscriptions.find((item) => item.id === id);
    setSubscriptions((current) => current.filter((item) => item.id !== id));
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.SUBSCRIPTION_PAYMENT_CREATED, { subscriptionId: id });
    if (subscription) showToast(`"${subscription.name}" removed`, 'error');
  }, [emitDashboardRefresh, subscriptions, showToast]);

  const notifyInvestmentTransaction = useCallback((meta = {}) => {
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.INVESTMENT_TRANSACTION_CREATED, meta);
  }, [emitDashboardRefresh]);

  const investmentHoldings = useMemo(
    () => buildInvestmentHoldings(investmentAssets, investmentTransactions, investmentPrices),
    [investmentAssets, investmentPrices, investmentTransactions]
  );

  const upsertInvestmentAsset = useCallback((asset, priceValue) => {
    const nextId = asset.id || `asset-${Date.now()}`;
    const nextAsset = {
      id: nextId,
      name: asset.name,
      ticker: asset.ticker || '',
      assetType: asset.assetType || 'stock',
      sector: asset.sector || 'General',
      quantityPrecision: asset.assetType === 'crypto' ? 6 : 2,
      color: asset.color || '#4fc3f7',
    };
    setInvestmentAssets((current) => {
      const exists = current.some((item) => item.id === nextId);
      return exists ? current.map((item) => (item.id === nextId ? nextAsset : item)) : [nextAsset, ...current];
    });
    setInvestmentPrices((current) => ({ ...current, [nextId]: Number(priceValue) || 0 }));
    return nextAsset;
  }, []);

  const removeInvestmentAsset = useCallback((assetId, mode = 'all-history') => {
    const existingAsset = investmentAssets.find((asset) => asset.id === assetId);
    const relatedTransactions = investmentTransactions.filter((transaction) => transaction.assetId === assetId);
    const relatedIds = new Set(relatedTransactions.map((transaction) => transaction.id));
    setInvestmentAssets((current) => current.filter((asset) => asset.id !== assetId));
    setInvestmentPrices((current) => {
      const next = { ...current };
      delete next[assetId];
      return next;
    });
    if (mode === 'all-history') {
      setInvestmentTransactions((current) => current.filter((transaction) => transaction.assetId !== assetId));
      const reversal = relatedTransactions.reduce((sum, transaction) => {
        if (transaction.type === 'buy') return sum + Number(transaction.amount || 0);
        if (transaction.type === 'sell' || transaction.type === 'dividend') return sum - Number(transaction.amount || 0);
        return sum;
      }, 0);
      if (reversal) {
        applyWalletBalanceChange(reversal);
      }
      setWalletTransactions((current) => current.filter((transaction) => transaction.assetId !== assetId && !relatedIds.has(transaction.referenceId)));
    }
    if (existingAsset) {
      showToast(`Asset "${existingAsset.name}" removed`, 'error');
    }
  }, [applyWalletBalanceChange, investmentAssets, investmentTransactions, showToast]);

  const addInvestmentGoal = useCallback((goal) => {
    const nextGoal = { ...goal, id: goal.id || `goal-${Date.now()}` };
    setInvestmentGoals((current) => [nextGoal, ...current]);
    return nextGoal;
  }, []);

  const saveInvestmentTransaction = useCallback((payload) => {
    setInvestmentTransactions((current) => {
      const exists = current.some((item) => item.id === payload.id);
      return exists ? current.map((item) => (item.id === payload.id ? payload : item)) : [payload, ...current];
    });
    return payload;
  }, []);

  const revertInvestmentWalletEffect = useCallback((transaction) => {
    if (!transaction) return;
    const walletTransaction = walletTransactions.find((item) => item.referenceId === transaction.id);
    if (walletTransaction) {
      const reversal = walletTransaction.direction === 'in' ? -walletTransaction.amount : walletTransaction.amount;
      applyWalletBalanceChange(reversal, walletTransaction.walletId);
      setWalletTransactions((current) => current.filter((item) => item.id !== walletTransaction.id));
    }
  }, [applyWalletBalanceChange, walletTransactions]);

  const buyAsset = useCallback((payload) => {
    const amount = validateAmount(payload.amount);
    const quantity = validateAmount(payload.quantity) || Number((amount / Math.max(Number(payload.pricePerUnit || investmentPrices[payload.assetId] || 1), 1)).toFixed(6));
    const asset = investmentAssets.find((item) => item.id === payload.assetId);
    if (!asset || !amount || !quantity) {
      showToast('Select a valid asset and amount', 'error');
      return { ok: false, reason: 'invalid' };
    }
    if (amount > walletBalance) {
      showToast('Insufficient wallet balance', 'error');
      return { ok: false, reason: 'insufficient_balance' };
    }
    const transaction = {
      id: payload.id || `investment-${Date.now()}`,
      assetId: payload.assetId,
      assetName: asset.name,
      accountId: payload.accountId || 'wallet-primary',
      type: 'buy',
      action: 'buy',
      quantity,
      amount,
      pricePerUnit: Number(payload.pricePerUnit || investmentPrices[payload.assetId] || 0),
      fees: Number(payload.fees || 0),
      date: validateDate(payload.date),
      time: payload.time || '09:30',
      notes: payload.notes || '',
      linkedGoalId: payload.linkedGoalId || '',
      schedule: payload.schedule || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvestmentTransaction(transaction);
    syncInvestmentCashFlowToWallet({
      type: 'buy',
      amount,
      assetId: asset.id,
      assetName: asset.name,
      accountName: payload.accountName || 'FinSphere Wallet',
      date: transaction.date,
      referenceId: transaction.id,
      notes: transaction.notes,
    });
    notifyInvestmentTransaction({ transactionId: transaction.id, type: 'buy', assetId: asset.id, amount });
    showToast(`Bought ${asset.name}`);
    return { ok: true, transaction };
  }, [investmentAssets, investmentPrices, notifyInvestmentTransaction, saveInvestmentTransaction, showToast, syncInvestmentCashFlowToWallet, walletBalance]);

  const sellAsset = useCallback((payload) => {
    const amount = validateAmount(payload.amount);
    const quantity = validateAmount(payload.quantity);
    const asset = investmentAssets.find((item) => item.id === payload.assetId);
    const holding = investmentHoldings.find((item) => item.assetId === payload.assetId);
    if (!asset || !amount || !quantity) {
      showToast('Select a valid asset, quantity, and amount', 'error');
      return { ok: false, reason: 'invalid' };
    }
    if ((holding?.quantity || 0) < quantity) {
      showToast('Not enough units to sell', 'error');
      return { ok: false, reason: 'insufficient_quantity' };
    }
    const transaction = {
      id: payload.id || `investment-${Date.now()}`,
      assetId: payload.assetId,
      assetName: asset.name,
      accountId: payload.accountId || 'wallet-primary',
      type: 'sell',
      action: 'sell',
      quantity,
      amount,
      pricePerUnit: Number(payload.pricePerUnit || investmentPrices[payload.assetId] || 0),
      fees: Number(payload.fees || 0),
      date: validateDate(payload.date),
      time: payload.time || '09:30',
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvestmentTransaction(transaction);
    syncInvestmentCashFlowToWallet({
      type: 'sell',
      amount,
      assetId: asset.id,
      assetName: asset.name,
      accountName: payload.accountName || 'FinSphere Wallet',
      date: transaction.date,
      referenceId: transaction.id,
      notes: transaction.notes,
    });
    notifyInvestmentTransaction({ transactionId: transaction.id, type: 'sell', assetId: asset.id, amount });
    showToast(`Sold ${asset.name}`);
    return { ok: true, transaction };
  }, [investmentAssets, investmentHoldings, investmentPrices, notifyInvestmentTransaction, saveInvestmentTransaction, showToast, syncInvestmentCashFlowToWallet]);

  const addDividend = useCallback((payload) => {
    const amount = validateAmount(payload.amount);
    const asset = investmentAssets.find((item) => item.id === payload.assetId);
    if (!asset || !amount) {
      showToast('Select a valid asset and amount', 'error');
      return { ok: false, reason: 'invalid' };
    }
    const transaction = {
      id: payload.id || `investment-${Date.now()}`,
      assetId: payload.assetId,
      assetName: asset.name,
      accountId: payload.accountId || 'wallet-primary',
      type: 'dividend',
      action: 'dividend',
      quantity: 0,
      amount,
      pricePerUnit: 0,
      fees: 0,
      date: validateDate(payload.date),
      time: payload.time || '09:30',
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvestmentTransaction(transaction);
    syncInvestmentCashFlowToWallet({
      type: 'dividend',
      amount,
      assetId: asset.id,
      assetName: asset.name,
      accountName: payload.accountName || 'FinSphere Wallet',
      date: transaction.date,
      referenceId: transaction.id,
      notes: transaction.notes,
    });
    notifyInvestmentTransaction({ transactionId: transaction.id, type: 'dividend', assetId: asset.id, amount });
    showToast(`Dividend added for ${asset.name}`);
    return { ok: true, transaction };
  }, [investmentAssets, notifyInvestmentTransaction, saveInvestmentTransaction, showToast, syncInvestmentCashFlowToWallet]);

  const updateInvestmentTransaction = useCallback((transactionId, payload) => {
    const existing = investmentTransactions.find((item) => item.id === transactionId);
    if (!existing) return { ok: false, reason: 'missing' };

    revertInvestmentWalletEffect(existing);
    setInvestmentTransactions((current) => current.filter((item) => item.id !== transactionId));

    const result = payload.type === 'buy'
      ? buyAsset({ ...existing, ...payload, id: transactionId })
      : payload.type === 'sell'
        ? sellAsset({ ...existing, ...payload, id: transactionId })
        : addDividend({ ...existing, ...payload, id: transactionId });

    if (!result?.ok) {
      setInvestmentTransactions((current) => [existing, ...current]);
      syncInvestmentCashFlowToWallet({
        type: existing.type,
        amount: existing.amount,
        assetId: existing.assetId,
        assetName: existing.assetName,
        accountName: payload.accountName || 'FinSphere Wallet',
        date: existing.date,
        referenceId: existing.id,
        notes: existing.notes,
      });
      return result;
    }

    return result;
  }, [addDividend, buyAsset, investmentTransactions, revertInvestmentWalletEffect, sellAsset, syncInvestmentCashFlowToWallet]);

  const deleteInvestmentTransaction = useCallback((transactionId) => {
    const existing = investmentTransactions.find((item) => item.id === transactionId);
    if (!existing) return { ok: false, reason: 'missing' };
    revertInvestmentWalletEffect(existing);
    setInvestmentTransactions((current) => current.filter((item) => item.id !== transactionId));
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.INVESTMENT_TRANSACTION_CREATED, {
      transactionId,
      type: existing.type,
      action: 'deleted',
    });
    showToast(`${existing.assetName || 'Investment'} transaction deleted`, 'error');
    return { ok: true };
  }, [emitDashboardRefresh, investmentTransactions, revertInvestmentWalletEffect, showToast]);

  const subscriptionSummary = useMemo(() => {
    const total = subscriptions.reduce((sum, subscription) => sum + subscription.price, 0);
    const annual = total * 12;
    const sorted = [...subscriptions].sort((left, right) => parseRenewalDate(left.date).getTime() - parseRenewalDate(right.date).getTime());
    return { total, annual, sorted };
  }, [subscriptions]);

  const expenses = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'expense').map(toLegacyExpense),
    [transactions]
  );
  const weeklySummaries = useMemo(() => buildWeeklySeries({
    incomeEntries,
    expenseEntries,
    budgetEntries,
    transactions,
    activeWeekStart,
    count: 8,
  }), [activeWeekStart, budgetEntries, expenseEntries, incomeEntries, transactions]);
  const monthlyReflection = useMemo(() => buildMonthlyReflection(weeklySummaries), [weeklySummaries]);
  const walletBalanceTrend = useMemo(
    () => buildWalletBalanceTrend(walletTransactions, walletBalance),
    [walletTransactions, walletBalance]
  );
  const searchIndex = useMemo(() => buildSearchIndex({
    transactions,
    walletTransactions,
    assets: investmentAssets,
    budgetEntries,
  }), [budgetEntries, investmentAssets, transactions, walletTransactions]);
  const totalBalance = useMemo(() => getTotalBalance({ wallets }), [wallets]);
  const state = useMemo(() => ({
    wallets,
    activeWalletId,
    wallet,
    walletBalance,
    walletTransactions,
    investmentAssets,
    investmentTransactions,
    investmentPrices,
    incomeEntries,
    expenseEntries,
    budgetEntries,
    transactions,
    activeWeekStart,
  }), [
    activeWalletId,
    activeWeekStart,
    budgetEntries,
    expenseEntries,
    incomeEntries,
    investmentAssets,
    investmentPrices,
    investmentTransactions,
    transactions,
    wallets,
    wallet,
    walletBalance,
    walletTransactions,
  ]);
  const selectors = useMemo(() => ({
    getWalletBalance: () => getWalletBalance(state),
    getTotalBalance: () => getTotalBalance(state),
    getRecentTransactions: (limit) => getRecentTransactions(state, limit),
    getAllAccounts: () => getAllAccounts(state),
    getActiveWallet: () => getActiveWallet(state),
    getWalletById: (walletId) => getWalletById(state, walletId),
    getAccountById: (accountId) => getAccountById(state, accountId),
    getAccountBalance: (accountId) => getAccountBalance(state, accountId),
    getWalletTransactions: (walletId) => getWalletTransactions(state, walletId),
    getTransactionsByAccount: (accountId) => getTransactionsByAccount(state, accountId),
    getRecentWalletTransactions: (walletId, limit = 8) => getRecentWalletTransactions(state, walletId, limit),
    getWeeklyWalletIncome: (walletId, weekRange) => getWeeklyWalletIncome(state, walletId, weekRange),
    getWeeklyWalletExpense: (walletId, weekRange) => getWeeklyWalletExpense(state, walletId, weekRange),
    getIncomeByAccount: (accountId, period) => getIncomeByAccount(state, accountId, period),
    getExpenseByAccount: (accountId, period) => getExpenseByAccount(state, accountId, period),
    getNetCashFlow: (walletId, weekRange) => getNetCashFlow(state, walletId, weekRange),
    getWalletTrendData: (walletId) => getWalletTrendData(state, walletId),
    getPortfolioValue: () => getPortfolioValue(state),
    getWeeklySummary: () => getWeeklySummary(state),
    getMonthlySummary: () => getMonthlySummary(state),
    getAssets: () => getAssetSnapshots(state),
  }), [state]);
  const income = dashboardMetrics.currentPeriodSummary.income;
  const budget = weeklyBudgetLimit;
  const totalSpent = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalIncome = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const savings = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0.0';
  const budgetLeft = weeklyBudgetLimit - dashboardMetrics.weeklySummary.expense;
  const byCategory = dashboardMetrics.categoryBreakdown;
  const weeklySpending = dashboardMetrics.last4Weeks.map((week) => ({ date: week.rangeLabel, amount: week.expense }));
  const monthlySpending = getMonthlyRollupsForYear(transactions, activeWeekStart).map((rollup) => ({ label: rollup.label, amount: rollup.expense }));
  const dailySpending = dashboardMetrics.currentWeekTransactions
    .filter((transaction) => transaction.type === 'expense')
    .map((transaction) => ({ date: transaction.date, amount: transaction.amount }));

  const value = {
    appStateVersion: APP_STATE_VERSION,
    state,
    selectors,
    wallets,
    accounts: wallets,
    activeWalletId,
    wallet,
    totalBalance,
    createWallet,
    addAccount: createWallet,
    updateWallet,
    updateAccount: updateWallet,
    deleteWallet,
    deleteAccount: deleteWallet,
    setActiveWallet,
    transactions,
    incomeEntries,
    expenseEntries,
    budgetEntries,
    setBudgetEntries,
    selectedPeriod,
    activeWeekStart,
    weeklyBudgetLimit,
    monthlyBudgetLimit,
    monthlyBudgetOverride,
    transactionModal,
    setSelectedPeriod,
    setWeeklyBudgetLimit,
    setMonthlyBudgetLimit,
    resetMonthlyBudgetToDefault,
    openTransactionModal,
    closeTransactionModal,
    addIncome,
    addExpense,
    addBudgetEntry,
    addTransfer,
    transferBetweenWallets,
    transferBetweenAccounts,
    adjustWalletBalance,
    addMoneyToAccount,
    subtractMoneyFromAccount,
    buyAsset,
    sellAsset,
    addDividend,
    updateTransaction,
    deleteTransaction,
    shiftActiveWeek,
    resetActiveWeek,
    dashboardMetrics,
    weeklySummaries,
    monthlyReflection,
    expenses,
    income,
    budget,
    totalSpent,
    savings,
    savingsRate,
    budgetLeft,
    byCategory,
    weeklySpending,
    monthlySpending,
    dailySpending,
    updateExpense,
    deleteExpense,
    walletBalance,
    walletTransactions,
    walletBalanceTrend,
    walletCards,
    addWalletTransaction,
    sendMoney,
    receiveMoney,
    recordWalletTransaction,
    applyWalletBalanceChange,
    syncInvestmentCashFlowToWallet,
    addWalletCard,
    investmentAssets,
    assets: getAssetSnapshots(state),
    investmentTransactions,
    portfolioTransactions: investmentTransactions,
    investmentGoals,
    investmentPrices,
    investmentPerformanceFeed: PORTFOLIO_PERFORMANCE_SEED,
    upsertInvestmentAsset,
    removeInvestmentAsset,
    deleteAsset: removeInvestmentAsset,
    addInvestmentGoal,
    saveInvestmentTransaction,
    updateInvestmentTransaction,
    deleteInvestmentTransaction,
    subscriptions,
    removeSubscription,
    subscriptionSummary,
    CAT_META,
    customExpenseCategories,
    customIncomeCategories,
    expenseCategories: [...EXPENSE_CATEGORIES, ...customExpenseCategories],
    incomeCategories: [...INCOME_CATEGORIES, ...customIncomeCategories],
    expenseFilters: ['All', ...EXPENSE_CATEGORIES, ...customExpenseCategories],
    addCustomCategory,
    removeCustomCategory,
    toast,
    showToast,
    searchIndex,
    dashboardRefreshVersion,
    lastDashboardRefreshEvent,
    dashboardReloadStrategy: createDashboardReloadStrategy(),
    emitDashboardRefresh,
    notifyInvestmentTransaction,
    uiData: {
      aiInsights: AI_INSIGHTS,
      wallet: INITIAL_WALLET,
      investments: INVESTMENT_DATA,
      subscriptionBudget: SUBSCRIPTION_BUDGET,
      aiChat: AI_CHAT,
    },
    helpers: {
      getAIReply: (message) => getAIReply(message, AI_CHAT.responses),
      getRenewalDaysLeft,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
export { CAT_META };
