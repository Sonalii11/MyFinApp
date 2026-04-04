import React from 'react';
import { Card, SectionHeader, Btn, Tag } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

export function InvestmentAccountLinkagePanel({ accounts, impactPreview, eventMap, actions }) {
  return (
    <Card className="portfolio-section-card">
      <SectionHeader title="Investment account linkage" action={<Tag variant="green">Traceable account impact</Tag>} />
      <div className="portfolio-linkage-layout">
        <div className="portfolio-linkage-list">
          {accounts.map((account) => (
            <div key={account.id} className="portfolio-linkage-row">
              <div>
                <strong>{account.name}</strong>
                <div className="text2">{account.kind} funding source</div>
              </div>
              <div className="portfolio-linkage-balance">{formatCurrency(account.balance)}</div>
            </div>
          ))}
        </div>
        <div className="portfolio-linkage-preview">
          <div className="portfolio-metric-label">Current transaction preview</div>
          <div className="portfolio-linkage-impact">{impactPreview.label}</div>
          <div className="portfolio-linkage-metrics">
            <div><span className="text2">Before</span><strong>{formatCurrency(impactPreview.balanceBefore)}</strong></div>
            <div><span className="text2">After</span><strong className={impactPreview.direction === 'credit' ? 'up' : impactPreview.direction === 'debit' ? 'down' : 'neutral'}>{formatCurrency(impactPreview.balanceAfter)}</strong></div>
          </div>
          <div className="portfolio-linkage-note">
            Future sync points:
            <div className="text2">{eventMap.transactionSaved}</div>
            <div className="text2">{eventMap.walletLinkageUpdated}</div>
          </div>
          <div className="portfolio-inline-actions">
            <Btn variant="outline" onClick={actions.openWalletLinkage}>Open wallet linkage</Btn>
            <Btn variant="ghost" onClick={actions.openDashboardSync}>Refresh dashboard snapshot</Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}
