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
import { INITIAL_MONTHLY_BUDGET_LIMIT, INITIAL_WEEKLY_BUDGET_LIMIT, SEED_TRANSACTIONS } from '../data/seedTransactions';
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
  walletBalance: 'finsphere.wallet.balance',
  walletTransactions: 'finsphere.wallet.transactions',
  subscriptions: 'finsphere.subscriptions',
};

const AppContext = createContext(null);

function createInitialTransactions() {
  return sortTransactionsNewestFirst(SEED_TRANSACTIONS.map(normalizeTransaction));
}

function createInitialWalletTransactions() {
  return INITIAL_WALLET.transactions.map((transaction) => ({
    ...transaction,
    id: transaction.id || Date.now() + Math.random(),
  }));
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

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.transactions, null);
    return Array.isArray(stored) ? sortTransactionsNewestFirst(stored.map(normalizeTransaction)) : createInitialTransactions();
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
  const [walletBalance, setWalletBalance] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.walletBalance, INITIAL_WALLET.balance);
    return typeof stored === 'number' ? stored : INITIAL_WALLET.balance;
  });
  const [walletTransactions, setWalletTransactions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.walletTransactions, null);
    return Array.isArray(stored) ? stored : createInitialWalletTransactions();
  });
  const [subscriptions, setSubscriptions] = useState(() => {
    const stored = loadJSON(STORAGE_KEYS.subscriptions, null);
    return Array.isArray(stored) ? stored : INITIAL_SUBSCRIPTIONS;
  });

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
    saveJSON(STORAGE_KEYS.walletBalance, walletBalance);
  }, [walletBalance]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.walletTransactions, walletTransactions);
  }, [walletTransactions]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.subscriptions, subscriptions);
  }, [subscriptions]);

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

  const saveTransaction = useCallback((payload, explicitType) => {
    const type = explicitType || payload.type;
    const nextTransaction = normalizeTransactionPayload(payload, explicitType);

    setTransactions((current) => sortTransactionsNewestFirst([nextTransaction, ...current]));
    emitDashboardRefresh(
      type === 'income' ? DASHBOARD_REFRESH_EVENTS.INCOME_CREATED : DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED,
      { transactionId: nextTransaction.id }
    );
    showToast(`"${nextTransaction.title}" added`);
    return nextTransaction;
  }, [emitDashboardRefresh, showToast]);

  const addIncome = useCallback((payload) => saveTransaction(payload, 'income'), [saveTransaction]);
  const addExpense = useCallback((payload) => saveTransaction(payload, 'expense'), [saveTransaction]);
  const addTransfer = useCallback((payload) => saveTransaction(payload, 'transfer'), [saveTransaction]);

  const updateTransaction = useCallback((id, payload) => {
    let updatedTitle = '';
    setTransactions((current) =>
      sortTransactionsNewestFirst(
        current.map((transaction) => {
          if (transaction.id !== id) return transaction;
          updatedTitle = payload.title || transaction.title;
          return normalizeTransactionPayload({
            ...transaction,
            ...payload,
            id,
            category: payload.category || transaction.category,
            type: payload.type || transaction.type,
          });
        })
      )
    );
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED, { transactionId: id, action: 'updated' });
    showToast(`"${updatedTitle}" updated`);
  }, [emitDashboardRefresh, showToast]);

  const deleteTransaction = useCallback((id) => {
    const existing = transactions.find((transaction) => transaction.id === id);
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED, { transactionId: id, action: 'deleted' });
    showToast(`"${existing?.title || 'Transaction'}" deleted`, 'error');
  }, [emitDashboardRefresh, transactions, showToast]);

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
    const value = Number(amount);
    if (!to.trim() || !value || value <= 0) return false;
    setWalletTransactions((current) => [
      { id: Date.now(), name: to.trim(), type: 'sent', amount: value, time: 'just now' },
      ...current,
    ]);
    setWalletBalance((current) => current - value);
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.TRANSFER_CREATED, { amount: value });
    showToast(`Sent ₹${value.toLocaleString('en-IN')} to ${to.trim()}`);
    return true;
  }, [emitDashboardRefresh, showToast]);

  const removeSubscription = useCallback((id) => {
    const subscription = subscriptions.find((item) => item.id === id);
    setSubscriptions((current) => current.filter((item) => item.id !== id));
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.SUBSCRIPTION_PAYMENT_CREATED, { subscriptionId: id });
    if (subscription) showToast(`"${subscription.name}" removed`, 'error');
  }, [emitDashboardRefresh, subscriptions, showToast]);

  const notifyInvestmentTransaction = useCallback((meta = {}) => {
    emitDashboardRefresh(DASHBOARD_REFRESH_EVENTS.INVESTMENT_TRANSACTION_CREATED, meta);
  }, [emitDashboardRefresh]);

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
    transactions,
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
    addTransfer,
    updateTransaction,
    deleteTransaction,
    shiftActiveWeek,
    resetActiveWeek,
    dashboardMetrics,
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
    sendMoney,
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
