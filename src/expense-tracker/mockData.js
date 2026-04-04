import { CAT_META } from '../data/appData';

export const PAYMENT_MODE_OPTIONS = ['UPI', 'Card', 'Bank', 'Cash', 'Auto-debit'];

export const SUGGESTED_TAGS = [
  { id: 'tag-essential', label: 'essential' },
  { id: 'tag-fixed', label: 'fixed' },
  { id: 'tag-lifestyle', label: 'lifestyle' },
  { id: 'tag-recurring', label: 'recurring' },
  { id: 'tag-tax', label: 'tax' },
];

export const ACCOUNT_SEED = [
  { id: 'acc-hdfc', name: 'HDFC Salary', kind: 'bank', baseBalance: 85000, currency: 'INR' },
  { id: 'acc-icici', name: 'ICICI Business', kind: 'bank', baseBalance: 42000, currency: 'INR' },
  { id: 'acc-wallet', name: 'FinSphere Wallet', kind: 'wallet', baseBalance: 12680, currency: 'INR' },
  { id: 'acc-card', name: 'HDFC Credit', kind: 'credit', baseBalance: 18000, currency: 'INR' },
];

export const CATEGORY_MASTER_SEED = [
  ...Object.entries(CAT_META).map(([name, meta]) => ({
    id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type: ['Salary', 'Freelance', 'Business', 'Investment Return', 'Gift'].includes(name) ? 'income' : 'expense',
    icon: meta.icon,
    color: meta.color,
  })),
  { id: 'cat-transfer', name: 'Transfer', type: 'shared', icon: '↔', color: '#7c6dfa' },
];

export const WEEKLY_BUDGET_SEED = {
  baseWeeklyBudget: 7000,
  monthlyBudgetSource: 28000,
  autoGenerateFromMonthly: true,
  carryForwardMode: 'carry-unused-forward',
  overspendDeduction: true,
  weeklyOverrides: {},
};

export const MONTHLY_BUDGET_SEED = {
  id: 'monthly-budget-current',
  monthKey: '2026-04',
  limit: 28000,
  includedCategories: ['Food', 'Travel', 'Bills', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other'],
};

export const CATEGORY_LIMITS_SEED = [
  { category: 'Food', weeklyLimit: 2500, monthlyLimit: 9000 },
  { category: 'Travel', weeklyLimit: 1200, monthlyLimit: 4500 },
  { category: 'Bills', weeklyLimit: 1800, monthlyLimit: 7000 },
  { category: 'Entertainment', weeklyLimit: 1000, monthlyLimit: 3200 },
  { category: 'Shopping', weeklyLimit: 1400, monthlyLimit: 5000 },
];
