import React from 'react';
import { Btn, Card, Input, Modal, Select, Tag } from '../../components/UI';
import { formatShortDate } from '../../utils/finance';

export function TransactionSearchInput({ value, onChange }) {
  return <Input label="SEARCH" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search title, note, or tag" />;
}

export function TransactionFiltersBar({ filters, filterOptions, onChange }) {
  return (
    <div className="expense-history-filters">
      <Select label="TYPE" value={filters.type} onChange={(event) => onChange({ ...filters, type: event.target.value })} options={filterOptions.types} />
      <Select label="CATEGORY" value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value })} options={filterOptions.categories} />
      <Select label="ACCOUNT" value={filters.account} onChange={(event) => onChange({ ...filters, account: event.target.value })} options={filterOptions.accounts} />
      <Select label="TAG" value={filters.tag} onChange={(event) => onChange({ ...filters, tag: event.target.value })} options={filterOptions.tags} />
      <Select label="PAYMENT MODE" value={filters.paymentMode} onChange={(event) => onChange({ ...filters, paymentMode: event.target.value })} options={filterOptions.paymentModes} />
      <Select label="GROUP BY" value={filters.groupBy} onChange={(event) => onChange({ ...filters, groupBy: event.target.value })} options={['day', 'week', 'month']} />
    </div>
  );
}

export function TransactionGroupHeader({ label, count }) {
  return (
    <div className="expense-group-header">
      <span>{label}</span>
      <Tag variant="purple">{count}</Tag>
    </div>
  );
}

export function TransactionListItem({ transaction, onEdit, onDelete }) {
  const amountClass = transaction.type === 'income' ? 'up' : transaction.type === 'transfer' ? 'neutral' : 'down';
  const amountPrefix = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';
  return (
    <div className="expense-history-item">
      <div>
        <div className="tx-name">{transaction.title}</div>
        <div className="tx-meta">
          {transaction.category} · {formatShortDate(transaction.date)} · {transaction.paymentMode || 'Bank'}
          {transaction.type === 'transfer'
            ? ` · ${transaction.fromAccount} → ${transaction.toAccount}`
            : transaction.account
              ? ` · ${transaction.account}`
              : ''}
        </div>
        {(transaction.tags || []).length ? <div className="tx-meta">#{transaction.tags.join(' #')}</div> : null}
      </div>
      <div className="expense-history-actions">
        <div className={`tx-amount ${amountClass}`}>{amountPrefix}₹{transaction.amount.toLocaleString('en-IN')}</div>
        <div className="expense-history-action-row">
          <Btn size="sm" variant="outline" onClick={() => onEdit(transaction)}>Edit</Btn>
          <Btn size="sm" variant="danger" onClick={() => onDelete(transaction)}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

export function TransactionHistorySection({ data, state, actions }) {
  const filterOptions = {
    types: ['all', 'expense', 'income', 'transfer'],
    categories: ['All', ...new Set(data.flatTransactions.map((item) => item.category))],
    accounts: ['All', ...new Set(data.accounts.map((item) => item.name))],
    tags: ['All', ...new Set(data.flatTransactions.flatMap((item) => item.tags || []))],
    paymentModes: ['All', ...new Set(data.paymentModes)],
  };

  return (
    <Card className="expense-panel-card">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Transaction history module</span>
          <div className="sec-title">Searchable ledger</div>
        </div>
        <Tag variant="blue">{data.flatTransactions.length} items</Tag>
      </div>

      <div className="expense-panel-stack">
        <TransactionSearchInput value={state.historyFilters.search} onChange={(value) => actions.setHistoryFilters({ ...state.historyFilters, search: value })} />
        <TransactionFiltersBar filters={state.historyFilters} filterOptions={filterOptions} onChange={actions.setHistoryFilters} />

        {data.transactions.length ? (
          <div className="expense-history-groups">
            {data.transactions.map((group) => (
              <div key={group.key} className="expense-history-group">
                <TransactionGroupHeader label={group.label} count={group.items.length} />
                {group.items.map((transaction) => (
                  <TransactionListItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={actions.openEditForm}
                    onDelete={actions.requestDelete}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <strong>No transactions found</strong>
            <span>Try adjusting filters or create a new transaction to populate the ledger.</span>
          </div>
        )}
      </div>
    </Card>
  );
}
