import React from 'react';
import { Card } from '../../components/UI';
import { formatCurrency } from '../../utils/finance';

function PortfolioValueCard({ value }) {
  return (
    <Card className="portfolio-metric-card portfolio-metric-card-primary">
      <div className="portfolio-metric-label">Total portfolio value</div>
      <div className="portfolio-metric-value syne">{formatCurrency(value)}</div>
      <div className="portfolio-metric-sub">Live value from current holdings and latest mock pricing</div>
    </Card>
  );
}

function InvestedAmountCard({ value }) {
  return (
    <Card className="portfolio-metric-card">
      <div className="portfolio-metric-label">Total invested</div>
      <div className="portfolio-metric-compact syne">{formatCurrency(value)}</div>
      <div className="portfolio-metric-sub">Capital committed into assets</div>
    </Card>
  );
}

function GainLossCard({ value, percent, state }) {
  return (
    <Card className="portfolio-metric-card">
      <div className="portfolio-metric-label">Gain / loss</div>
      <div className={`portfolio-metric-compact syne ${state === 'negative' ? 'down' : state === 'positive' ? 'up' : 'neutral'}`}>
        {value > 0 ? '+' : ''}
        {formatCurrency(value)}
      </div>
      <div className={`portfolio-metric-sub ${state === 'negative' ? 'down' : state === 'positive' ? 'up' : 'neutral'}`}>
        {percent > 0 ? '+' : ''}
        {percent.toFixed(2)}%
      </div>
    </Card>
  );
}

function AllocationSummaryCard({ items }) {
  return (
    <Card className="portfolio-metric-card">
      <div className="portfolio-metric-label">Allocation</div>
      <div className="portfolio-allocation-stack">
        {items.length ? items.map((item) => (
          <div key={item.label} className="portfolio-allocation-row">
            <div className="portfolio-allocation-title">
              <span className="portfolio-allocation-dot" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
            <div className="portfolio-allocation-metrics">
              <span>{item.percentage.toFixed(1)}%</span>
              <span className="text2">{formatCurrency(item.value)}</span>
            </div>
          </div>
        )) : <div className="dashboard-empty-copy">Allocation will appear once holdings are added.</div>}
      </div>
    </Card>
  );
}

export function PortfolioOverviewSection({ overview }) {
  return (
    <section className="portfolio-section">
      <div className="portfolio-overview-grid">
        <PortfolioValueCard value={overview.totalValue} />
        <InvestedAmountCard value={overview.totalInvested} />
        <GainLossCard value={overview.gainLoss} percent={overview.gainLossPercent} state={overview.state} />
        <AllocationSummaryCard items={overview.allocation} />
      </div>
    </section>
  );
}
