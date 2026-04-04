import React from 'react';
import { Card, SectionHeader, Select, ProgressBar, Btn, Input } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';
import { formatAssetTypeLabel } from '../selectors';

function AssetTypeFilterBar({ value, options, onChange }) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={options}
      className="portfolio-filter-field"
    />
  );
}

function AssetEditor({ draft, options, actions }) {
  return (
    <div className="portfolio-asset-editor">
      <div className="portfolio-form-grid portfolio-form-grid-simple">
        <Input
          label="Asset name"
          value={draft.name}
          onChange={(event) => actions.setAssetDraft((current) => ({ ...current, name: event.target.value }))}
          className="portfolio-form-field"
        />
        <Input
          label="Ticker"
          value={draft.ticker}
          onChange={(event) => actions.setAssetDraft((current) => ({ ...current, ticker: event.target.value }))}
          className="portfolio-form-field"
        />
        <Select
          label="Asset type"
          value={draft.assetType}
          onChange={(event) => actions.setAssetDraft((current) => ({ ...current, assetType: event.target.value }))}
          options={options.assetTypes.filter((item) => item.value !== 'all')}
          className="portfolio-form-field"
        />
        <Input
          label="Current price"
          value={draft.currentPrice}
          onChange={(event) => actions.setAssetDraft((current) => ({ ...current, currentPrice: event.target.value }))}
          className="portfolio-form-field"
        />
      </div>
      <div className="portfolio-inline-actions">
        <Btn variant="ghost" onClick={actions.openAssetCreateForm}>Clear</Btn>
        <Btn variant="primary" onClick={actions.saveAsset}>{draft.id ? 'Update Asset' : 'Add Asset'}</Btn>
      </div>
    </div>
  );
}

function AssetListItem({ asset, onOpen, onEdit, onRemove }) {
  return (
    <div className="portfolio-asset-row">
      <div className="portfolio-asset-main">
        <button type="button" className="portfolio-asset-button" onClick={() => onOpen(asset.assetId)}>
          <span className="portfolio-asset-avatar" style={{ background: `${asset.color}22`, color: asset.color }}>
            {(asset.ticker || asset.assetName).slice(0, 3)}
          </span>
          <span>
            <strong>{asset.assetName}</strong>
            <span className="text2">{asset.ticker || formatAssetTypeLabel(asset.assetType)}</span>
          </span>
        </button>
      </div>
      <div className="portfolio-asset-stat">
        <span className="text2">Units</span>
        <strong>{asset.quantity.toFixed(asset.assetType === 'crypto' ? 6 : 2)}</strong>
      </div>
      <div className="portfolio-asset-stat">
        <span className="text2">Avg buy</span>
        <strong>{formatCurrency(asset.averageBuyPrice)}</strong>
      </div>
      <div className="portfolio-asset-stat">
        <span className="text2">Current value</span>
        <strong>{formatCurrency(asset.currentValue)}</strong>
      </div>
      <div className="portfolio-asset-stat">
        <span className="text2">Gain / loss</span>
        <strong className={asset.gainLoss >= 0 ? 'up' : 'down'}>
          {asset.gainLoss >= 0 ? '+' : ''}
          {formatCurrency(asset.gainLoss)}
        </strong>
      </div>
      <div className="portfolio-asset-allocation">
        <span className="portfolio-asset-type-label">{formatAssetTypeLabel(asset.assetType)}</span>
        <ProgressBar value={asset.allocationPercent} max={100} className="portfolio-mini-progress" />
        <span className="text2">{asset.allocationPercent.toFixed(1)}% allocation</span>
      </div>
      <div className="portfolio-asset-actions">
        <Btn size="sm" variant="ghost" onClick={() => onEdit(asset.assetId)}>Edit</Btn>
        <Btn size="sm" variant="outline" onClick={() => onRemove(asset.assetId)}>Remove</Btn>
      </div>
    </div>
  );
}

export function AssetListSection({ holdings, filters, actions, options }) {
  return (
    <Card className="portfolio-section-card">
      <SectionHeader title="Assets list" action={<Btn variant="outline" onClick={actions.openAssetCreateForm}>Add Asset</Btn>} />
      <div className="portfolio-toolbar">
        <AssetTypeFilterBar value={filters.assetTypeFilter} options={options.assetTypes} onChange={actions.setAssetTypeFilter} />
      </div>
      <AssetEditor draft={filters.assetDraft} options={options} actions={actions} />
      {!holdings.length ? (
        <div className="dashboard-empty-copy">No investment holdings yet. Save your first buy, SIP, or fixed deposit to populate the list.</div>
      ) : (
        <div className="portfolio-asset-list">
          {holdings.map((asset) => (
            <AssetListItem
              key={asset.assetId}
              asset={asset}
              onOpen={actions.openAssetDetails}
              onEdit={actions.editAsset}
              onRemove={actions.removeAsset}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
