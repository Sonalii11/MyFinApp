import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getExpenseTrackerAccounts, getExpenseTrackerBudgetConfig, getExpenseTrackerCategories, getExpenseTrackerReferenceData, getExpenseTrackerTags } from './services';
import {
  applyHistoryFilters,
  buildAccountsWithBalances,
  buildAnalyticsSnapshot,
  buildCategoryLimitRows,
  buildMonthlyBudgetView,
  buildWeeklyBudgetView,
  createAttachmentMeta,
  createEmptyTransactionForm,
  evaluateCalculatorExpression,
  evaluateExpenseAlerts,
  getExpenseTrackerEventMap,
  groupTransactions,
  sortCategoryLimitRows,
  validateTransactionForm,
} from './selectors';

export function useExpenseTrackerData() {
  const app = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountsSeed, setAccountsSeed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [weeklyBudgetConfig, setWeeklyBudgetConfig] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    type: 'all',
    category: 'All',
    account: 'All',
    tag: 'All',
    paymentMode: 'All',
    search: '',
    groupBy: 'day',
  });
  const [analyticsRange, setAnalyticsRange] = useState('month');
  const [customAnalyticsRange, setCustomAnalyticsRange] = useState({ from: '', to: '' });
  const [categorySort, setCategorySort] = useState('exceeded-first');
  const [dismissedAlertIds, setDismissedAlertIds] = useState([]);
  const [formState, setFormState] = useState(createEmptyTransactionForm('expense'));
  const [formMode, setFormMode] = useState('create');
  const [formError, setFormError] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadReferenceData() {
      setLoading(true);
      setError(null);
      try {
        const [accounts, categoryMaster, tagLibrary, budgetConfig, references] = await Promise.all([
          getExpenseTrackerAccounts(),
          getExpenseTrackerCategories(),
          getExpenseTrackerTags(),
          getExpenseTrackerBudgetConfig(),
          getExpenseTrackerReferenceData(),
        ]);
        if (cancelled) return;
        setAccountsSeed(accounts);
        setCategories(categoryMaster);
        setTags(tagLibrary);
        setPaymentModes(references.paymentModes);
        setWeeklyBudgetConfig(budgetConfig.weeklyBudget);
        setMonthlyBudget(budgetConfig.monthlyBudget);
        setCategoryLimits(budgetConfig.categoryLimits);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Unable to load expense tracker data.'));
        setLoading(false);
      }
    }

    loadReferenceData();
    return () => {
      cancelled = true;
    };
  }, []);

  const accounts = useMemo(
    () => buildAccountsWithBalances(accountsSeed, app.transactions),
    [accountsSeed, app.transactions]
  );

  const historyTransactions = useMemo(
    () => applyHistoryFilters(app.transactions, historyFilters),
    [app.transactions, historyFilters]
  );

  const groupedTransactions = useMemo(
    () => groupTransactions(historyTransactions, historyFilters.groupBy),
    [historyTransactions, historyFilters.groupBy]
  );

  const weeklyBudget = useMemo(
    () => (weeklyBudgetConfig ? buildWeeklyBudgetView(app.transactions, weeklyBudgetConfig, app.activeWeekStart) : null),
    [app.transactions, app.activeWeekStart, weeklyBudgetConfig]
  );

  const monthlyBudgetView = useMemo(
    () => (monthlyBudget ? buildMonthlyBudgetView(app.transactions, monthlyBudget) : null),
    [app.transactions, monthlyBudget]
  );

  const categoryLimitRows = useMemo(
    () => sortCategoryLimitRows(buildCategoryLimitRows(app.transactions, categoryLimits, app.activeWeekStart), categorySort),
    [app.transactions, categoryLimits, app.activeWeekStart, categorySort]
  );

  const analytics = useMemo(
    () => buildAnalyticsSnapshot(app.transactions, analyticsRange, app.CAT_META, customAnalyticsRange),
    [app.transactions, analyticsRange, app.CAT_META, customAnalyticsRange]
  );

  const alerts = useMemo(() => {
    if (!weeklyBudget || !monthlyBudgetView) return [];
    return evaluateExpenseAlerts({
      weeklyBudget,
      monthlyBudget: monthlyBudgetView,
      categoryRows: categoryLimitRows,
      transactions: app.transactions,
      activeWeekStart: app.activeWeekStart,
    }).filter((item) => !dismissedAlertIds.includes(item.id));
  }, [weeklyBudget, monthlyBudgetView, categoryLimitRows, app.transactions, app.activeWeekStart, dismissedAlertIds]);

  function openCreateForm(type = 'expense') {
    setFormMode('create');
    setFormError('');
    setFormState(createEmptyTransactionForm(type));
  }

  function openEditForm(transaction) {
    setFormMode('edit');
    setFormError('');
    setFormState({
      id: transaction.id,
      type: transaction.type,
      title: transaction.title,
      date: transaction.date,
      time: transaction.time || '09:00',
      amount: String(transaction.amount),
      calculatorExpression: '',
      category: transaction.category || '',
      account: transaction.account || '',
      fromAccount: transaction.fromAccount || '',
      toAccount: transaction.toAccount || '',
      paymentMode: transaction.paymentMode || 'Bank',
      notes: transaction.notes || '',
      tags: Array.isArray(transaction.tags) ? transaction.tags : [],
      tagInput: '',
      attachments: Array.isArray(transaction.attachments) ? transaction.attachments : [],
    });
  }

  function updateFormField(key, value) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function applyCalculator() {
    const value = evaluateCalculatorExpression(formState.calculatorExpression);
    if (value === null) {
      setFormError('Unable to evaluate that calculator expression.');
      return;
    }
    setFormError('');
    setFormState((current) => ({ ...current, amount: String(value), calculatorExpression: '' }));
  }

  function addTagToForm(tag) {
    const next = tag.trim().toLowerCase();
    if (!next || formState.tags.includes(next)) return;
    setFormState((current) => ({ ...current, tags: [...current.tags, next], tagInput: '' }));
  }

  function removeTagFromForm(tag) {
    setFormState((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }));
  }

  function addAttachmentList(files) {
    const items = Array.from(files || []).map(createAttachmentMeta);
    setFormState((current) => ({ ...current, attachments: [...current.attachments, ...items] }));
  }

  function removeAttachment(id) {
    setFormState((current) => ({ ...current, attachments: current.attachments.filter((item) => item.id !== id) }));
  }

  function saveTransaction() {
    const errorMessage = validateTransactionForm(formState);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    const payload = {
      id: formState.id,
      type: formState.type,
      title: formState.title.trim(),
      date: formState.date,
      time: formState.time,
      amount: Number(formState.amount),
      category: formState.type === 'transfer' ? 'Transfer' : formState.category,
      account: formState.type === 'transfer' ? formState.fromAccount : formState.account,
      fromAccount: formState.fromAccount,
      toAccount: formState.toAccount,
      paymentMode: formState.paymentMode,
      notes: formState.notes.trim(),
      tags: formState.tags,
      attachments: formState.attachments,
    };

    if (formMode === 'edit' && formState.id) {
      app.updateTransaction(formState.id, payload);
    } else if (formState.type === 'income') {
      app.addIncome(payload);
    } else if (formState.type === 'transfer') {
      app.addTransfer(payload);
    } else {
      app.addExpense(payload);
    }

    openCreateForm(formState.type);
  }

  function requestDelete(transaction) {
    setDeleteCandidate(transaction);
  }

  function confirmDelete() {
    if (!deleteCandidate) return;
    app.deleteTransaction(deleteCandidate.id);
    setDeleteCandidate(null);
  }

  return {
    loading,
    error,
    isEmpty: !app.transactions.length,
    eventMap: getExpenseTrackerEventMap(),
    data: {
      transactions: groupedTransactions,
      flatTransactions: historyTransactions,
      accounts,
      categories,
      customCategories: {
        expense: app.customExpenseCategories,
        income: app.customIncomeCategories,
      },
      tags,
      paymentModes,
      weeklyBudget,
      monthlyBudget: monthlyBudgetView,
      rawMonthlyBudget: monthlyBudget,
      categoryLimitRows,
      analytics,
      alerts,
      dashboardRefreshVersion: app.dashboardRefreshVersion,
    },
    state: {
      historyFilters,
      analyticsRange,
      customAnalyticsRange,
      categorySort,
      formState,
      formMode,
      formError,
      deleteCandidate,
    },
    actions: {
      retry: () => window.location.reload(),
      openCreateForm,
      openEditForm,
      updateFormField,
      applyCalculator,
      addTagToForm,
      removeTagFromForm,
      addAttachmentList,
      removeAttachment,
      saveTransaction,
      requestDelete,
      confirmDelete,
      cancelDelete: () => setDeleteCandidate(null),
      setHistoryFilters,
      setAnalyticsRange,
      setCustomAnalyticsRange,
      dismissAlert: (id) => setDismissedAlertIds((current) => [...current, id]),
      setCategorySort,
      updateWeeklyBudgetConfig: (patch) => setWeeklyBudgetConfig((current) => ({ ...current, ...patch })),
      setWeeklyOverride: (weekStart, value) => setWeeklyBudgetConfig((current) => ({
        ...current,
        weeklyOverrides: {
          ...current.weeklyOverrides,
          [weekStart]: Number(value) || 0,
        },
      })),
      updateMonthlyBudget: (patch) => setMonthlyBudget((current) => ({ ...current, ...patch })),
      deleteMonthlyBudget: () => setMonthlyBudget(null),
      restoreMonthlyBudget: () => setMonthlyBudget({
        id: 'monthly-budget-current',
        monthKey: formatDateKey(new Date()).slice(0, 7),
        limit: 0,
        includedCategories: [],
      }),
      updateCategoryLimit: (category, patch) => setCategoryLimits((current) =>
        current.map((item) => item.category === category ? { ...item, ...patch } : item)
      ),
      resetCategoryLimits: () => setCategoryLimits((current) =>
        current.map((item) => ({ ...item, weeklyLimit: 0, monthlyLimit: 0 }))
      ),
    },
  };
}
