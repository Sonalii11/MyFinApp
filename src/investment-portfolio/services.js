import {
  INVESTMENT_ASSETS_SEED,
  INVESTMENT_GOALS_SEED,
  INVESTMENT_TRANSACTIONS_SEED,
  LINKED_FUNDING_ACCOUNTS_SEED,
  PORTFOLIO_CONTENT_CONFIG,
  PORTFOLIO_PERFORMANCE_SEED,
  PORTFOLIO_PRICE_MAP,
  PORTFOLIO_REFERENCE_DATA,
} from './mockData';

export async function getInvestmentAssets() {
  // Future API integration: replace with portfolio holdings master endpoint.
  return INVESTMENT_ASSETS_SEED;
}

export async function getInvestmentTransactions() {
  // Future API integration: replace with investment transaction ledger endpoint.
  return INVESTMENT_TRANSACTIONS_SEED;
}

export async function getInvestmentGoals() {
  // Future API integration: replace with goal-linked investing endpoint.
  return INVESTMENT_GOALS_SEED;
}

export async function getLinkedFundingAccounts() {
  // Future API integration: replace with Digital Wallet / bank accounts connector.
  return LINKED_FUNDING_ACCOUNTS_SEED;
}

export async function getPortfolioPrices() {
  // Future API integration: replace with market data / NAV / pricing service.
  return PORTFOLIO_PRICE_MAP;
}

export async function getPortfolioAnalyticsFeed() {
  // Future API integration: replace with analytics service or time-series endpoint.
  return PORTFOLIO_PERFORMANCE_SEED;
}

export async function getInvestmentReferenceData() {
  return {
    config: PORTFOLIO_REFERENCE_DATA,
    content: PORTFOLIO_CONTENT_CONFIG,
  };
}
