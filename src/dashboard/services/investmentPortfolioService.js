import { buildDashboardSnapshot } from '../selectors';

export async function getInvestmentPortfolioPreview(snapshot) {
  // Future API integration: replace with portfolio summary endpoint.
  return buildDashboardSnapshot(snapshot).investmentPreview;
}
