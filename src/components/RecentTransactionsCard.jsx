import React from 'react';
import { Card } from './UI';
import { formatShortDate } from '../utils/finance';

export default function RecentTransactionsCard({ transactions }) {
  return (
    <Card className="recent-transactions-card">
      <div className="sec-header">
        <span className="sec-title">Recent Transactions</span>
        <span className="sec-link">{transactions.length} shown</span>
      </div>

      {transactions.length ? (
        <div>
          {transactions.map((transaction) => (
            <div key={transaction.id} className="tx-item">
              <div className="tx-icon" style={{ background: `${transaction.color}20` }}>
                {transaction.icon}
              </div>
              <div className="tx-info">
                <div className="tx-name">{transaction.title}</div>
                <div className="tx-meta">
                  {transaction.category} · {formatShortDate(transaction.date)}
                  {transaction.account ? ` · ${transaction.account}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`tx-amount ${transaction.type === 'income' ? 'up' : 'down'}`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text2">{transaction.type === 'income' ? 'Income' : 'Expense'}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">No transactions yet. Add income or expense to start tracking your weeks.</div>
      )}
    </Card>
  );
}
