import React, { useMemo, useState } from 'react';
import { Page, Card, Btn, Input, Modal, Select } from '../components/UI';
import { formatCurrency } from '../utils/finance';
import { useInvestmentPortfolio } from './useInvestmentPortfolioData';
import { PortfolioOverviewSection } from './components/PortfolioOverviewSection';
import { AssetListSection } from './components/AssetListSection';
import { InvestmentTransactionPanel } from './components/InvestmentTransactionPanel';
import { PortfolioAnalyticsSection } from './components/PortfolioAnalyticsSection';
import { InvestmentGoalsSection } from './components/InvestmentGoalsSection';

export default function InvestmentPortfolioPage() {
  const portfolio = useInvestmentPortfolio();
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [pendingDeleteAssetId, setPendingDeleteAssetId] = useState('');
  const [assetTransactionPage, setAssetTransactionPage] = useState(1);
  const assetTransactionPageSize = 5;

  const selectedAsset = useMemo(
    () => portfolio.data.holdings.find((item) => item.assetId === selectedAssetId) || null,
    [portfolio.data.holdings, selectedAssetId]
  );
  const pendingDeleteAsset = useMemo(
    () => portfolio.data.assets.find((item) => item.id === pendingDeleteAssetId) || null,
    [portfolio.data.assets, pendingDeleteAssetId]
  );
  const allAssetTransactions = useMemo(
    () => portfolio.data.portfolioTransactions.filter((item) => item.assetId === selectedAssetId),
    [portfolio.data.portfolioTransactions, selectedAssetId]
  );
  const totalAssetTransactionPages = Math.max(1, Math.ceil(allAssetTransactions.length / assetTransactionPageSize));
  const assetTransactions = useMemo(() => {
    const startIndex = (assetTransactionPage - 1) * assetTransactionPageSize;
    return allAssetTransactions.slice(startIndex, startIndex + assetTransactionPageSize);
  }, [allAssetTransactions, assetTransactionPage]);

  if (portfolio.loading) {
    return (
      <Page className="z1">
        <div className="portfolio-shell">
          {Array.from({ length: 5 }, (_, index) => (
            <Card key={index} className="dashboard-page-skeleton" />
          ))}
        </div>
      </Page>
    );
  }

  if (portfolio.error) {
    return (
      <Page className="z1">
        <Card className="dashboard-feedback-card">
          <h2>Investment Portfolio unavailable</h2>
          <p>{portfolio.error.message}</p>
          <Btn variant="primary" onClick={portfolio.actions.retry}>Retry</Btn>
        </Card>
      </Page>
    );
  }

  return (
    <Page className="z1">
      <div className="portfolio-shell">
        <div className="expense-tracker-heading">
          <div>
            <span className="dashboard-section-label">Investment portfolio page</span>
            <h1 className="dashboard-header-title">Simple portfolio tracker</h1>
            <p className="dashboard-header-subtitle">
              Track how much you invested, what it is worth now, and whether you are in profit or loss.
            </p>
          </div>
        </div>

        <PortfolioOverviewSection overview={portfolio.data.overview} />

        <AssetListSection
          holdings={portfolio.data.holdings}
          filters={{ assetTypeFilter: portfolio.state.assetTypeFilter, assetDraft: portfolio.state.assetDraft }}
          actions={{
            ...portfolio.actions,
            openAssetDetails: (assetId) => {
              portfolio.actions.editAsset(assetId);
              setAssetTransactionPage(1);
              setSelectedAssetId(assetId);
            },
            removeAsset: setPendingDeleteAssetId,
          }}
          options={{ assetTypes: portfolio.data.assetTypeOptions }}
        />

        <InvestmentTransactionPanel data={portfolio.data} state={portfolio.state} actions={portfolio.actions} />

        <PortfolioAnalyticsSection
          analytics={portfolio.data.analytics}
          range={portfolio.state.timeRange}
          options={portfolio.data.timeRangeOptions}
          onRangeChange={portfolio.actions.setTimeRange}
        />

        <InvestmentGoalsSection
          goals={portfolio.data.goals}
          draft={portfolio.state.goalDraft}
          actions={portfolio.actions}
        />
      </div>

      {selectedAsset ? (
        <Modal title="Asset Details" onClose={() => setSelectedAssetId('')}>
          <div className="portfolio-goal-card">
            <div className="portfolio-goal-top">
              <div>
                <div className="portfolio-metric-label">Asset</div>
                <div className="sec-title">{selectedAsset.assetName}</div>
                <div className="text2">{selectedAsset.ticker || selectedAsset.assetType}</div>
              </div>
              <Btn size="sm" variant="outline" onClick={() => portfolio.actions.openCreateForm('buy')}>
                Buy more
              </Btn>
            </div>

            <div className="portfolio-goal-metrics">
              <div>
                <span className="text2">Invested</span>
                <strong>{formatCurrency(selectedAsset.investedAmount)}</strong>
              </div>
              <div>
                <span className="text2">Current value</span>
                <strong>{formatCurrency(selectedAsset.currentValue)}</strong>
              </div>
              <div>
                <span className="text2">Profit / loss</span>
                <strong className={selectedAsset.gainLoss >= 0 ? 'up' : 'down'}>
                  {selectedAsset.gainLoss >= 0 ? '+' : ''}
                  {formatCurrency(selectedAsset.gainLoss)}
                </strong>
              </div>
              <div>
                <span className="text2">Units</span>
                <strong>{selectedAsset.quantity.toFixed(selectedAsset.assetType === 'crypto' ? 6 : 2)}</strong>
              </div>
            </div>

            <div className="portfolio-form-grid portfolio-form-grid-simple">
              <Input
                label="Asset name"
                value={portfolio.state.assetDraft.name}
                onChange={(event) => {
                  portfolio.actions.setAssetDraft((current) => ({ ...current, name: event.target.value }));
                }}
                className="portfolio-form-field"
              />
              <Input
                label="Ticker"
                value={portfolio.state.assetDraft.ticker}
                onChange={(event) => {
                  portfolio.actions.setAssetDraft((current) => ({ ...current, ticker: event.target.value }));
                }}
                className="portfolio-form-field"
              />
              <Select
                label="Asset type"
                value={portfolio.state.assetDraft.assetType}
                onChange={(event) => {
                  portfolio.actions.setAssetDraft((current) => ({ ...current, assetType: event.target.value }));
                }}
                options={portfolio.data.assetTypeOptions.filter((item) => item.value !== 'all')}
                className="portfolio-form-field"
              />
              <Input
                label="Current price"
                value={portfolio.state.assetDraft.currentPrice}
                onChange={(event) => {
                  portfolio.actions.setAssetDraft((current) => ({ ...current, currentPrice: event.target.value }));
                }}
                className="portfolio-form-field"
              />
            </div>

            <div className="portfolio-table">
              <div className="sec-title">Recent transactions</div>
              {assetTransactions.length ? assetTransactions.map((transaction) => (
                <div key={transaction.id} className="portfolio-table-row">
                  <div>
                    <strong>{transaction.type.replace('-', ' ')}</strong>
                    <div className="text2">{transaction.displayDateLabel} · {transaction.accountName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>{formatCurrency(transaction.amount)}</div>
                    <div className="dashboard-inline-actions" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                      <Btn size="sm" variant="outline" onClick={() => portfolio.actions.openEditTransaction(transaction)}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => portfolio.actions.deleteInvestmentTransaction(transaction.id)}>Delete</Btn>
                    </div>
                  </div>
                </div>
              )) : <div className="dashboard-empty-inline">No transactions for this asset yet.</div>}
              {allAssetTransactions.length > assetTransactionPageSize ? (
                <div className="dashboard-inline-actions">
                  <Btn
                    variant="outline"
                    size="sm"
                    disabled={assetTransactionPage === 1}
                    onClick={() => setAssetTransactionPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Btn>
                  <span className="text2">
                    Page {assetTransactionPage} of {totalAssetTransactionPages}
                  </span>
                  <Btn
                    variant="outline"
                    size="sm"
                    disabled={assetTransactionPage === totalAssetTransactionPages}
                    onClick={() => setAssetTransactionPage((current) => Math.min(totalAssetTransactionPages, current + 1))}
                  >
                    Next
                  </Btn>
                </div>
              ) : null}
            </div>

            <div className="dashboard-inline-actions">
              <Btn variant="outline" onClick={portfolio.actions.saveAsset}>
                Save asset changes
              </Btn>
              <Btn variant="ghost" onClick={() => portfolio.actions.openCreateForm('sell')}>Sell</Btn>
              <Btn variant="ghost" onClick={() => portfolio.actions.openCreateForm('dividend')}>Add dividend</Btn>
              <Btn variant="outline" style={{ color: 'var(--red)', borderColor: 'rgba(240,92,122,0.35)' }} onClick={() => {
                setSelectedAssetId('');
                setPendingDeleteAssetId(selectedAsset.assetId);
              }}>
                Delete asset
              </Btn>
            </div>
          </div>
        </Modal>
      ) : null}

      {pendingDeleteAsset ? (
        <Modal title="Delete Asset" onClose={() => setPendingDeleteAssetId('')}>
          <div className="portfolio-goal-card">
            <p style={{ margin: 0, color: 'var(--text2)' }}>
              Removing <strong>{pendingDeleteAsset.name}</strong> will also delete its related investment transactions. This affects invested history, profit/loss calculations, and analytics for this asset.
            </p>
            <div className="dashboard-inline-actions">
              <Btn variant="outline" onClick={() => setPendingDeleteAssetId('')}>Cancel</Btn>
              <Btn variant="outline" style={{ color: 'var(--red)', borderColor: 'rgba(240,92,122,0.35)' }} onClick={() => {
                portfolio.actions.removeAsset(pendingDeleteAsset.id);
                setPendingDeleteAssetId('');
              }}>
                Delete asset and history
              </Btn>
            </div>
          </div>
        </Modal>
      ) : null}
    </Page>
  );
}
