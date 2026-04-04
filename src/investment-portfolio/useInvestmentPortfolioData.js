import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { loadJSON, saveJSON } from '../utils/storage';
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
  buildDashboardSnapshot,
  getInvestmentEventMap,
  normalizeInvestmentTransactionPayload,
  getTransactionTypeOptions,
  getAssetTypeOptions,
  getPortfolioTimeRanges,
} from './selectors';
import {
  getInvestmentAssets,
  getInvestmentTransactions,
  getInvestmentGoals,
  getLinkedFundingAccounts,
  getPortfolioPrices,
  getPortfolioAnalyticsFeed,
} from './services';

const STORAGE_KEYS = {
  assets: 'finsphere.investments.assets',
  prices: 'finsphere.investments.prices',
  transactions: 'finsphere.investments.transactions',
  goals: 'finsphere.investments.goals',
};

function deductFromWallet(account, amount) {
  return {
    accountId: account?.id || '',
    accountName: account?.name || 'Wallet account',
    amount: Number(amount) || 0,
    direction: 'debit',
  };
}

function addToWallet(account, amount) {
  return {
    accountId: account?.id || '',
    accountName: account?.name || 'Wallet account',
    amount: Number(amount) || 0,
    direction: 'credit',
  };
}

export function useInvestmentPortfolio() {
  const app = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [assets, setAssets] = useState(() => loadJSON(STORAGE_KEYS.assets, []));
  const [baseAccounts, setBaseAccounts] = useState([]);
  const [prices, setPrices] = useState(() => loadJSON(STORAGE_KEYS.prices, {}));
  const [performanceFeed, setPerformanceFeed] = useState({});
  const [transactions, setTransactions] = useState(() => loadJSON(STORAGE_KEYS.transactions, []));
  const [goals, setGoals] = useState(() => loadJSON(STORAGE_KEYS.goals, []));
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
        const [assetSeed, transactionSeed, goalSeed, accountSeed, priceSeed, analyticsSeed] = await Promise.all([
          getInvestmentAssets(),
          getInvestmentTransactions(),
          getInvestmentGoals(),
          getLinkedFundingAccounts(),
          getPortfolioPrices(),
          getPortfolioAnalyticsFeed(),
        ]);
        if (cancelled) return;
        setAssets((current) => (Array.isArray(current) && current.length ? current : assetSeed));
        setBaseAccounts(accountSeed);
        setPrices((current) => (current && Object.keys(current).length ? current : priceSeed));
        setPerformanceFeed(analyticsSeed);
        setTransactions((current) => (Array.isArray(current) && current.length ? current : transactionSeed));
        setGoals((current) => (Array.isArray(current) && current.length ? current : goalSeed));
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

  useEffect(() => {
    saveJSON(STORAGE_KEYS.assets, assets);
  }, [assets]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.prices, prices);
  }, [prices]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.goals, goals);
  }, [goals]);

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

    setAssets((current) => {
      const exists = current.some((item) => item.id === nextId);
      return exists ? current.map((item) => (item.id === nextId ? nextAsset : item)) : [nextAsset, ...current];
    });
    setPrices((current) => ({
      ...current,
      [nextId]: Number(assetDraft.currentPrice) || 0,
    }));
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
    const asset = assets.find((item) => item.id === assetId);
    setAssets((current) => current.filter((item) => item.id !== assetId));
    setTransactions((current) => current.filter((item) => item.assetId !== assetId));
    setPrices((current) => {
      const next = { ...current };
      delete next[assetId];
      return next;
    });
    if (asset) app.showToast(`Asset "${asset.name}" removed`, 'error');
  }

  function saveTransaction() {
    const errorMessage = validateInvestmentTransactionForm(formState);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    const payload = normalizeInvestmentTransactionPayload(formState, assets, prices);
    const actionLabel = payload.type.replace('-', ' ');
    const selectedAccount = fundingAccounts.find((account) => account.id === payload.accountId);

    if (payload.type === 'buy') {
      deductFromWallet(selectedAccount, payload.amount);
    }

    if (payload.type === 'sell' || payload.type === 'dividend') {
      addToWallet(selectedAccount, payload.amount);
    }

    setTransactions((current) => [payload, ...current]);

    if (payload.type === 'dividend') {
      app.addIncome({
        title: `${payload.assetName || 'Investment'} dividend`,
        category: 'Investment Return',
        amount: payload.amount,
        date: payload.date,
        time: payload.time,
        account: selectedAccount?.name || accountImpactPreview.accountName,
        notes: payload.notes,
      });
    }

    // Future global sync: publish to wallet/shared store here so Wallet and Dashboard consume one canonical investment event stream.
    app.notifyInvestmentTransaction({
      transactionId: payload.id,
      type: payload.type,
      amount: payload.amount,
      assetId: payload.assetId,
      accountId: payload.accountId,
      dashboardSnapshot,
    });

    app.showToast(
      `${actionLabel.charAt(0).toUpperCase()}${actionLabel.slice(1)} saved for ${payload.assetName || 'portfolio funding'}`
    );
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

    setGoals((current) => [nextGoal, ...current]);
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
    eventMap: getInvestmentEventMap(),
    data: {
      overview,
      holdings: assetRows,
      allHoldings: holdings,
      assets,
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
      updateFormField,
      saveTransaction,
      setGoalDraft,
      saveGoal,
      setAssetDraft,
      openAssetCreateForm,
      editAsset,
      saveAsset,
      removeAsset,
      openAssetDetails: (assetId) => app.showToast(`Open asset details for ${assetId}`),
      deductFromWallet,
      addToWallet,
    },
  };
}

export const useInvestmentPortfolioData = useInvestmentPortfolio;
