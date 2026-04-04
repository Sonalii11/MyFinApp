import React from 'react';
import { Card, SectionHeader, Btn, Input, Select } from '../../components/UI';

function InvestmentTransactionTypeSwitcher({ value, options, onChange }) {
  return (
    <div className="portfolio-segmented">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`portfolio-segmented-button${value === option.value ? ' active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function WalletImpactNote({ preview }) {
  return (
    <div className="portfolio-impact-preview">
      <div className="portfolio-impact-copy">
        <span className="dashboard-section-label">Wallet effect</span>
        <strong>{preview.accountName}</strong>
        <p>{preview.label}</p>
      </div>
      <div className="portfolio-impact-metrics">
        <span className="text2">Before: ₹{preview.balanceBefore.toLocaleString('en-IN')}</span>
        <span className={preview.direction === 'credit' ? 'up' : preview.direction === 'debit' ? 'down' : 'neutral'}>
          After: ₹{preview.balanceAfter.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export function InvestmentTransactionPanel({ data, state, actions }) {
  const typeOptions = data.transactionTypeOptions.filter((option) => ['buy', 'sell', 'dividend'].includes(option.value));

  return (
    <Card className="portfolio-section-card">
      <SectionHeader title="Add investment" />
      <p className="dashboard-header-subtitle portfolio-section-subtitle">
        Buy deducts from the selected wallet account, sell adds money back, and dividends are treated as income.
      </p>

      <InvestmentTransactionTypeSwitcher
        value={state.formState.type}
        options={typeOptions}
        onChange={actions.openCreateForm}
      />

      <form
        className="portfolio-form-grid portfolio-form-grid-simple"
        onSubmit={(event) => {
          event.preventDefault();
          actions.saveTransaction();
        }}
      >
        <Select
          label="Asset"
          value={state.formState.assetId}
          onChange={(event) => actions.updateFormField('assetId', event.target.value)}
          options={[
            { value: '', label: 'Select asset' },
            ...data.assets.map((asset) => ({ value: asset.id, label: `${asset.name}${asset.ticker ? ` (${asset.ticker})` : ''}` })),
          ]}
          className="portfolio-form-field"
        />
        <Select
          label="Account"
          value={state.formState.accountId}
          onChange={(event) => actions.updateFormField('accountId', event.target.value)}
          options={[
            { value: '', label: 'Select wallet account' },
            ...data.fundingAccounts.map((account) => ({ value: account.id, label: `${account.name} · ₹${account.balance.toLocaleString('en-IN')}` })),
          ]}
          className="portfolio-form-field"
        />
        <Input
          label="Amount"
          value={state.formState.amount}
          onChange={(event) => actions.updateFormField('amount', event.target.value)}
          className="portfolio-form-field"
        />
        <Input
          label="Date"
          type="date"
          value={state.formState.date}
          onChange={(event) => actions.updateFormField('date', event.target.value)}
          className="portfolio-form-field"
        />

        <WalletImpactNote preview={data.accountImpactPreview} />

        {state.formError ? <div className="portfolio-form-error">{state.formError}</div> : null}

        <div className="portfolio-form-actions">
          <Btn type="button" variant="ghost" onClick={() => actions.openCreateForm(state.formState.type)}>Reset</Btn>
          <Btn type="submit" variant="primary">Save transaction</Btn>
        </div>
      </form>
    </Card>
  );
}
