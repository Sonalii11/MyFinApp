import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/finance';
import {
  createEmptyInvestmentTransactionForm,
  validateInvestmentTransactionForm,
  buildInvestmentHoldings,
  buildPortfolioOverview,
  addAllocationShare,
  buildAssetRows,
  buildPortfolioAnalytics,
  buildGoalRows,
  buildFundingAccounts,
  buildAccountImpactPreview,
  buildTransactionLedger,
  buildDashboardSnapshot,
  normalizeInvestmentTransactionPayload,
  getTransactionTypeOptions,
  getAssetTypeOptions,
  getPortfolioTimeRanges,
} from './selectors';
import {
  getLinkedFundingAccounts,
  getPortfolioAnalyticsFeed,
} from './services';

export function useInvestmentPortfolio() {
  const app = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [baseAccounts, setBaseAccounts] = useState([]);
  const [performanceFeed, setPerformanceFeed] = useState({});
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('6m');
  const [formError, setFormError] = useState('');
  const [formState, setFormState] = useState(createEmptyInvestmentTransactionForm('buy'));
  const [goalDraft, setGoalDraft] = useState({
    name: '',
    targetAmount: '',
    currentProgress: '',
  });
  const [assetDraft, setAssetDraft] = useState({
    id: '',
    name: '',
    ticker: '',
    assetType: 'stock',
    currentPrice: '',
    color: '#4fc3f7',
    sector: '',
  });

  useEffect(() => {
    let cancelled = false;
    async function loadPortfolio() {
      setLoading(true);
      setError(null);
      try {
        const [accountSeed, analyticsSeed] = await Promise.all([
          getLinkedFundingAccounts(),
          getPortfolioAnalyticsFeed(),
        ]);
        if (cancelled) return;
        setBaseAccounts(accountSeed);
        setPerformanceFeed(analyticsSeed);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Unable to load investment portfolio.'));
        setLoading(false);
      }
    }

    loadPortfolio();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const assets = app.investmentAssets;
  const prices = app.investmentPrices;
  const transactions = app.investmentTransactions;
  const goals = app.investmentGoals;

  const holdings = useMemo(
    () => addAllocationShare(buildInvestmentHoldings(assets, transactions, prices)),
    [assets, transactions, prices]
  );

  const overview = useMemo(() => buildPortfolioOverview(holdings), [holdings]);
  const assetsWithMetrics = useMemo(() => {
    const holdingsMap = new Map(holdings.map((item) => [item.assetId, item]));
    return assets.map((asset) => {
      const holding = holdingsMap.get(asset.id);
      return {
        assetId: asset.id,
        assetName: asset.name,
        ticker: asset.ticker,
        assetType: asset.assetType,
        sector: asset.sector,
        color: asset.color,
        quantity: holding?.quantity || 0,
        investedAmount: holding?.investedAmount || 0,
        averageBuyPrice: holding?.averageBuyPrice || 0,
        currentValue: holding?.currentValue || 0,
        gainLoss: holding?.gainLoss || 0,
        allocationPercent: holding?.allocationPercent || 0,
      };
    });
  }, [assets, holdings]);
  const assetRows = useMemo(
    () => buildAssetRows(assetsWithMetrics, { assetType: assetTypeFilter, sortBy: 'value' }),
    [assetsWithMetrics, assetTypeFilter]
  );
  const analytics = useMemo(
    () => buildPortfolioAnalytics({ holdings, transactions, performanceFeed, timeRange }),
    [holdings, transactions, performanceFeed, timeRange]
  );
  const goalRows = useMemo(() => buildGoalRows(goals, holdings), [goals, holdings]);
  const fundingAccounts = useMemo(
    () => buildFundingAccounts(baseAccounts, transactions),
    [baseAccounts, transactions]
  );
  const portfolioTransactions = useMemo(
    () => buildTransactionLedger(transactions, assets, fundingAccounts),
    [transactions, assets, fundingAccounts]
  );
  const accountImpactPreview = useMemo(
    () => buildAccountImpactPreview(fundingAccounts, formState),
    [fundingAccounts, formState]
  );
  const dashboardSnapshot = useMemo(
    () => buildDashboardSnapshot(overview, assetRows, goalRows),
    [overview, assetRows, goalRows]
  );

  function updateFormField(key, value) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm(type = 'buy') {
    setFormError('');
    setFormState(createEmptyInvestmentTransactionForm(type));
  }

  function openEditTransaction(transaction) {
    setFormError('');
    setFormState(createEmptyInvestmentTransactionForm(transaction.type, {
      id: transaction.id,
      assetId: transaction.assetId,
      accountId: transaction.accountId,
      date: transaction.date,
      time: transaction.time,
      amount: transaction.amount,
      quantity: transaction.quantity,
      pricePerUnit: transaction.pricePerUnit,
      fees: transaction.fees,
      notes: transaction.notes,
      linkedGoalId: transaction.linkedGoalId,
      schedule: transaction.schedule,
    }));
  }

  function openAssetCreateForm() {
    setAssetDraft({
      id: '',
      name: '',
      ticker: '',
      assetType: 'stock',
      currentPrice: '',
      color: '#4fc3f7',
      sector: '',
    });
  }

  function editAsset(assetId) {
    const asset = assets.find((item) => item.id === assetId);
    if (!asset) return;
    setAssetDraft({
      id: asset.id,
      name: asset.name,
      ticker: asset.ticker || '',
      assetType: asset.assetType,
      currentPrice: String(prices[asset.id] ?? ''),
      color: asset.color || '#4fc3f7',
      sector: asset.sector || '',
    });
  }

  function saveAsset() {
    const name = assetDraft.name.trim();
    if (!name) {
      app.showToast('Please enter an asset name', 'error');
      return;
    }

    const nextId = assetDraft.id || `asset-${Date.now()}`;
    const nextAsset = {
      id: nextId,
      name,
      ticker: assetDraft.ticker.trim(),
      assetType: assetDraft.assetType,
      sector: assetDraft.sector.trim() || 'General',
      quantityPrecision: assetDraft.assetType === 'crypto' ? 6 : 2,
      color: assetDraft.color || '#4fc3f7',
    };

    app.upsertInvestmentAsset(nextAsset, assetDraft.currentPrice);
    setAssetDraft({
      id: '',
      name: '',
      ticker: '',
      assetType: 'stock',
      currentPrice: '',
      color: '#4fc3f7',
      sector: '',
    });
    app.showToast(`Asset "${name}" saved`);
  }

  function removeAsset(assetId) {
    app.removeInvestmentAsset(assetId);
  }

  function saveTransaction() {
    const errorMessage = validateInvestmentTransactionForm(formState);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    const payload = normalizeInvestmentTransactionPayload(formState, assets, prices);
    const selectedAccount = fundingAccounts.find((account) => account.id === payload.accountId);
    const actionPayload = {
      ...payload,
      accountName: selectedAccount?.name || accountImpactPreview.accountName,
    };
    const isEdit = Boolean(formState.id && transactions.some((transaction) => transaction.id === formState.id));
    const result = isEdit
      ? app.updateInvestmentTransaction(formState.id, actionPayload)
      : payload.type === 'buy'
        ? app.buyAsset(actionPayload)
        : payload.type === 'sell'
          ? app.sellAsset(actionPayload)
          : app.addDividend(actionPayload);
    if (!result?.ok) {
      setFormError(
        result?.reason === 'insufficient_balance'
          ? 'Not enough wallet balance to complete this action.'
          : result?.reason === 'insufficient_quantity'
            ? 'Not enough units to sell.'
            : 'Unable to save this portfolio transaction.'
      );
      return;
    }
    openCreateForm(formState.type);
  }

  function saveGoal() {
    const name = goalDraft.name.trim();
    const targetAmount = Number(goalDraft.targetAmount);
    if (!name || targetAmount <= 0) return;

    const nextGoal = {
      id: `goal-${Date.now()}`,
      name,
      targetAmount,
      currentValue: Number(goalDraft.currentProgress) || 0,
      linkedAssetIds: [],
      contributionAmount: 0,
      contributionSchedule: {
        frequency: 'monthly',
        label: 'Manual tracking',
      },
      projectedMonthsRemaining: 0,
    };

    app.addInvestmentGoal(nextGoal);
    setGoalDraft({
      name: '',
      targetAmount: '',
      currentProgress: '',
    });
    app.showToast(`Goal "${name}" saved`);
  }

  function retry() {
    setReloadToken((current) => current + 1);
  }

  return {
    loading,
    error,
    isEmpty: !holdings.length && !transactions.length,
    data: {
      overview,
      holdings: assetRows,
      allHoldings: holdings,
      assets,
      portfolioTransactions,
      analytics,
      goals: goalRows,
      fundingAccounts,
      accountImpactPreview,
      dashboardSnapshot,
      transactionTypeOptions: getTransactionTypeOptions(),
      assetTypeOptions: getAssetTypeOptions(),
      timeRangeOptions: getPortfolioTimeRanges(),
      formatCurrency,
    },
    state: {
      assetTypeFilter,
      timeRange,
      formState,
      formError,
      goalDraft,
      assetDraft,
    },
    actions: {
      retry,
      setAssetTypeFilter,
      setTimeRange,
      openCreateForm,
      openEditTransaction,
      updateFormField,
      saveTransaction,
      deleteInvestmentTransaction: app.deleteInvestmentTransaction,
      setGoalDraft,
      saveGoal,
      setAssetDraft,
      openAssetCreateForm,
      editAsset,
      saveAsset,
      removeAsset,
      openAssetDetails: () => {},
    },
  };
}

export const useInvestmentPortfolioData = useInvestmentPortfolio;
