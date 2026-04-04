import React from 'react';
import { Btn, Card } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

export function TransactionPreviewItem({ transaction, onOpen }) {
  return (
    <button type="button" className="transaction-preview-item" onClick={() => onOpen(transaction)}>
      <div className="transaction-preview-leading">
        <div className="transaction-preview-icon">{transaction.categoryIcon}</div>
        <div>
          <div className="tx-name">{transaction.category}</div>
          <div className="tx-meta">{transaction.linkedAccount} · {transaction.displayDateLabel}</div>
        </div>
      </div>
      <div className={`transaction-preview-amount ${transaction.type === 'income' ? 'up' : transaction.type === 'transfer' ? 'neutral' : 'down'}`}>
        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
      </div>
    </button>
  );
}

export function RecentTransactionsPreview({
  transactions,
  loading,
  onSeeAll,
  onOpenTransaction,
}) {
  return (
    <Card className="dashboard-module-card">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Recent Activity</span>
          <div className="sec-title">Recent Transactions Preview</div>
        </div>
        <Btn variant="outline" size="sm" onClick={onSeeAll}>See all</Btn>
      </div>

      {loading ? (
        <div className="dashboard-list-skeleton">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="dashboard-skeleton-row" />
          ))}
        </div>
      ) : transactions.length ? (
        <div className="dashboard-list">
          {transactions.map((transaction) => (
            <TransactionPreviewItem
              key={transaction.id}
              transaction={transaction}
              onOpen={onOpenTransaction}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <strong>No recent transactions yet</strong>
          <span>New income, expenses, and transfers will appear here as soon as they happen.</span>
        </div>
      )}
    </Card>
  );
}

export const mockTransactionList = [];
