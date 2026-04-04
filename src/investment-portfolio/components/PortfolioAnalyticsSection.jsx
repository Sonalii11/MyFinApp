import React from 'react';
import { Card, SectionHeader } from '../../components/UI';
import { LineChart, DonutChart } from '../../components/Charts';

export function PortfolioAnalyticsSection({ analytics, range, options, onRangeChange }) {
  return (
    <Card className="portfolio-section-card">
      <SectionHeader
        title="Basic analytics"
        action={
          <div className="portfolio-segmented portfolio-segmented-small">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`portfolio-segmented-button${range === option.value ? ' active' : ''}`}
                onClick={() => onRangeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="portfolio-analytics-simple-grid">
        <Card className="portfolio-analytics-card">
          <SectionHeader title="Portfolio growth" />
          <div className="chart-container">
            <LineChart
              data={analytics.performance.map((point) => point.value)}
              labels={analytics.performance.map((point) => point.label)}
              color="#22d4a0"
              height={220}
            />
          </div>
        </Card>

        <Card className="portfolio-analytics-card">
          <SectionHeader title="Asset distribution" />
          {analytics.assetAllocation.length ? (
            <div className="portfolio-chart-split">
              <div className="portfolio-chart-panel">
                <DonutChart
                  data={analytics.assetAllocation.map((item) => item.value)}
                  labels={analytics.assetAllocation.map((item) => item.label)}
                  colors={analytics.assetAllocation.map((item) => item.color)}
                  height={220}
                />
              </div>
              <div className="portfolio-legend-stack">
                {analytics.assetAllocation.map((item) => (
                  <div key={item.label} className="portfolio-allocation-row">
                    <div className="portfolio-allocation-title">
                      <span className="portfolio-allocation-dot" style={{ background: item.color }} />
                      <span>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-empty-copy">Add investments to see the distribution chart.</div>
          )}
        </Card>
      </div>
    </Card>
  );
}
