import React from 'react';
import { Page, Card, Btn } from '../components/UI';
import { useInvestmentPortfolio } from './useInvestmentPortfolioData';
import { PortfolioOverviewSection } from './components/PortfolioOverviewSection';
import { AssetListSection } from './components/AssetListSection';
import { InvestmentTransactionPanel } from './components/InvestmentTransactionPanel';
import { PortfolioAnalyticsSection } from './components/PortfolioAnalyticsSection';
import { InvestmentGoalsSection } from './components/InvestmentGoalsSection';

export default function InvestmentPortfolioPage() {
  const portfolio = useInvestmentPortfolio();

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
          actions={portfolio.actions}
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
    </Page>
  );
}
