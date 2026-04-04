import { formatDateKey } from '../utils/budgeting';

const TODAY = new Date('2026-04-01T12:00:00');

export const INVESTMENT_ASSETS_SEED = [
  { id: 'asset-reliance', name: 'Reliance Industries', ticker: 'RELIANCE', assetType: 'stock', sector: 'Energy', quantityPrecision: 3, color: '#4fc3f7' },
  { id: 'asset-tcs', name: 'Tata Consultancy Services', ticker: 'TCS', assetType: 'stock', sector: 'Technology', quantityPrecision: 3, color: '#22d4a0' },
  { id: 'asset-niftybees', name: 'Nippon India ETF Nifty BeES', ticker: 'NIFTYBEES', assetType: 'etf', sector: 'Index ETF', quantityPrecision: 3, color: '#7c6dfa' },
  { id: 'asset-ppfas', name: 'Parag Parikh Flexi Cap', ticker: 'PPFCF', assetType: 'mutual-fund', sector: 'Equity Fund', quantityPrecision: 3, color: '#f5a623' },
  { id: 'asset-bitcoin', name: 'Bitcoin', ticker: 'BTC', assetType: 'crypto', sector: 'Crypto', quantityPrecision: 6, color: '#f7931a' },
  { id: 'asset-fd', name: 'SBI Fixed Deposit', ticker: 'FD-26', assetType: 'fixed-deposit', sector: 'Fixed Income', quantityPrecision: 2, color: '#f05c7a' },
];

export const PORTFOLIO_PRICE_MAP = {
  'asset-reliance': 2942.5,
  'asset-tcs': 4081.2,
  'asset-niftybees': 271.8,
  'asset-ppfas': 67.2,
  'asset-bitcoin': 5920000,
  'asset-fd': 1,
};

export const LINKED_FUNDING_ACCOUNTS_SEED = [
  { id: 'fund-hdfc', name: 'HDFC Salary', kind: 'bank', balance: 185000, currency: 'INR' },
  { id: 'fund-wallet', name: 'FinSphere Wallet', kind: 'wallet', balance: 25500, currency: 'INR' },
  { id: 'fund-icici', name: 'ICICI Business', kind: 'bank', balance: 94000, currency: 'INR' },
  { id: 'fund-brokerage', name: 'Zerodha Funding', kind: 'brokerage', balance: 42000, currency: 'INR' },
];

export const INVESTMENT_TRANSACTIONS_SEED = [
  { id: 'itx-1', type: 'buy', assetId: 'asset-reliance', accountId: 'fund-hdfc', amount: 55000, quantity: 20, pricePerUnit: 2750, fees: 40, notes: 'Core India large-cap exposure', date: '2026-01-08', time: '09:45' },
  { id: 'itx-2', type: 'buy', assetId: 'asset-tcs', accountId: 'fund-hdfc', amount: 72000, quantity: 18, pricePerUnit: 4000, fees: 55, notes: 'Tech allocation', date: '2026-01-20', time: '10:20' },
  { id: 'itx-3', type: 'sip', assetId: 'asset-ppfas', accountId: 'fund-hdfc', amount: 18000, quantity: 285.714, pricePerUnit: 63, fees: 0, notes: 'Monthly SIP', date: '2026-02-05', time: '08:30', schedule: 'monthly', linkedGoalId: 'goal-wealth' },
  { id: 'itx-4', type: 'buy', assetId: 'asset-niftybees', accountId: 'fund-brokerage', amount: 21500, quantity: 84, pricePerUnit: 255.95, fees: 10, notes: 'Index ETF top-up', date: '2026-02-12', time: '11:10' },
  { id: 'itx-5', type: 'buy', assetId: 'asset-bitcoin', accountId: 'fund-wallet', amount: 30000, quantity: 0.0052, pricePerUnit: 5769230.77, fees: 120, notes: 'Small crypto allocation', date: '2026-02-18', time: '21:05' },
  { id: 'itx-6', type: 'transfer-in', accountId: 'fund-hdfc', amount: 20000, notes: 'Move cash into portfolio funding bucket', date: '2026-02-22', time: '13:10' },
  { id: 'itx-7', type: 'buy', assetId: 'asset-fd', accountId: 'fund-icici', amount: 60000, quantity: 60000, pricePerUnit: 1, fees: 0, notes: 'One-year fixed deposit', date: '2026-03-01', time: '14:00', linkedGoalId: 'goal-home' },
  { id: 'itx-8', type: 'sell', assetId: 'asset-reliance', accountId: 'fund-hdfc', amount: 14500, quantity: 5, pricePerUnit: 2900, fees: 35, notes: 'Rebalance after run-up', date: '2026-03-15', time: '10:40' },
  { id: 'itx-9', type: 'dividend', assetId: 'asset-tcs', accountId: 'fund-hdfc', amount: 2200, quantity: 0, pricePerUnit: 0, fees: 0, notes: 'Dividend credited', date: '2026-03-20', time: '16:10' },
  { id: 'itx-10', type: 'sip', assetId: 'asset-ppfas', accountId: 'fund-hdfc', amount: 18000, quantity: 272.727, pricePerUnit: 66, fees: 0, notes: 'Monthly SIP', date: '2026-03-25', time: '08:30', schedule: 'monthly', linkedGoalId: 'goal-wealth' },
  { id: 'itx-11', type: 'transfer-out', accountId: 'fund-brokerage', amount: 12000, notes: 'Move idle cash back to wallet', date: '2026-03-26', time: '15:25' },
];

export const PORTFOLIO_PERFORMANCE_SEED = {
  all: [
    { label: 'Oct', value: 182000 },
    { label: 'Nov', value: 198000 },
    { label: 'Dec', value: 214500 },
    { label: 'Jan', value: 238000 },
    { label: 'Feb', value: 255400 },
    { label: 'Mar', value: 271900 },
    { label: 'Apr', value: 279600 },
  ],
  '1y': [
    { label: 'May', value: 149000 },
    { label: 'Jun', value: 158400 },
    { label: 'Jul', value: 171300 },
    { label: 'Aug', value: 176900 },
    { label: 'Sep', value: 180500 },
    { label: 'Oct', value: 182000 },
    { label: 'Nov', value: 198000 },
    { label: 'Dec', value: 214500 },
    { label: 'Jan', value: 238000 },
    { label: 'Feb', value: 255400 },
    { label: 'Mar', value: 271900 },
    { label: 'Apr', value: 279600 },
  ],
  '6m': [
    { label: 'Nov', value: 198000 },
    { label: 'Dec', value: 214500 },
    { label: 'Jan', value: 238000 },
    { label: 'Feb', value: 255400 },
    { label: 'Mar', value: 271900 },
    { label: 'Apr', value: 279600 },
  ],
  '3m': [
    { label: 'Jan', value: 238000 },
    { label: 'Feb', value: 255400 },
    { label: 'Mar', value: 271900 },
    { label: 'Apr', value: 279600 },
  ],
  '1m': [
    { label: 'Week 1', value: 264000 },
    { label: 'Week 2', value: 268500 },
    { label: 'Week 3', value: 272200 },
    { label: 'Week 4', value: 279600 },
  ],
  '1w': [
    { label: 'Mon', value: 274200 },
    { label: 'Tue', value: 275100 },
    { label: 'Wed', value: 274800 },
    { label: 'Thu', value: 277200 },
    { label: 'Fri', value: 279600 },
  ],
};

export const INVESTMENT_GOALS_SEED = [
  {
    id: 'goal-wealth',
    name: 'Wealth Builder 2026',
    targetAmount: 500000,
    currentValue: 186000,
    linkedAssetIds: ['asset-ppfas', 'asset-niftybees', 'asset-tcs'],
    contributionAmount: 18000,
    contributionSchedule: { frequency: 'monthly', label: 'Monthly SIP' },
    projectedMonthsRemaining: 18,
  },
  {
    id: 'goal-home',
    name: 'Home Down Payment',
    targetAmount: 900000,
    currentValue: 132000,
    linkedAssetIds: ['asset-fd', 'asset-reliance'],
    contributionAmount: 25000,
    contributionSchedule: { frequency: 'monthly', label: 'Monthly top-up' },
    projectedMonthsRemaining: 31,
  },
];

export const PORTFOLIO_CONTENT_CONFIG = [
  {
    id: 'content-1',
    title: 'Diversification check',
    description: 'Technology and broad index exposure are carrying most of the momentum this quarter.',
    actionLabel: 'Review allocation',
  },
  {
    id: 'content-2',
    title: 'Dividend insight',
    description: 'Dividend income can be routed into weekly cash flow or automatically recycled into goals later.',
    actionLabel: 'Plan reinvestment',
  },
];

export const PORTFOLIO_REFERENCE_DATA = {
  supportedTypes: ['stock', 'mutual-fund', 'etf', 'crypto', 'fixed-deposit'],
  timeRanges: ['1w', '1m', '3m', '6m', '1y', 'all'],
  defaultDate: formatDateKey(TODAY),
};
