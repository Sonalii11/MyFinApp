import React from 'react';
import { Card, SectionHeader, Btn, Tag } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

export function InvestmentTransactionHistorySection({ transactions, onEdit }) {
  return (
    <Card className="portfolio-section-card">
      <SectionHeader title="Investment transaction history" action={<Tag variant="default">{transactions.length} entries</Tag>} />
      {!transactions.length ? (
        <div className="dashboard-empty-copy">No investment transactions yet.</div>
      ) : (
        <div className="portfolio-table">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="portfolio-table-row portfolio-table-row-compact">
              <div>
                <strong>{transaction.assetName}</strong>
                <div className="text2">{transaction.type.replace('-', ' ')} · {transaction.accountName}</div>
              </div>
              <div className="text2">{transaction.displayDateLabel}</div>
              <div>{formatCurrency(transaction.amount)}</div>
              <div className="text2">{transaction.quantity ? `${transaction.quantity} units` : 'Cash movement'}</div>
              <div className="portfolio-inline-actions">
                <Btn variant="ghost" size="sm" onClick={() => onEdit(transaction)}>Edit</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
