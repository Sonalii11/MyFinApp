import {
  ACCOUNT_SEED,
  CATEGORY_LIMITS_SEED,
  CATEGORY_MASTER_SEED,
  MONTHLY_BUDGET_SEED,
  PAYMENT_MODE_OPTIONS,
  SUGGESTED_TAGS,
  WEEKLY_BUDGET_SEED,
} from './mockData';

export async function getExpenseTrackerAccounts() {
  // Future API integration: replace with Digital Wallet accounts endpoint.
  return ACCOUNT_SEED;
}

export async function getExpenseTrackerCategories() {
  // Future API integration: replace with category master endpoint.
  return CATEGORY_MASTER_SEED;
}

export async function getExpenseTrackerTags() {
  // Future API integration: replace with tags/notes/attachments metadata endpoint.
  return SUGGESTED_TAGS;
}

export async function getExpenseTrackerBudgetConfig() {
  // Future API integration: replace with budgeting engine config endpoint.
  return {
    weeklyBudget: WEEKLY_BUDGET_SEED,
    monthlyBudget: MONTHLY_BUDGET_SEED,
    categoryLimits: CATEGORY_LIMITS_SEED,
  };
}

export async function getExpenseTrackerReferenceData() {
  // Future API integration: fetch reference data in one request if the backend supports aggregation.
  return {
    paymentModes: PAYMENT_MODE_OPTIONS,
  };
}
