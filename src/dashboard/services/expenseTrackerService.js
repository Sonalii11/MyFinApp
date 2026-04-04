import { buildDashboardSnapshot } from '../selectors';

export async function getExpenseTrackerDashboardData(snapshot) {
  // Future API integration: replace this transformation with an Expense Tracker endpoint call.
  const dashboardSnapshot = buildDashboardSnapshot(snapshot);
  return {
    cashFlowByPeriod: dashboardSnapshot.cashFlowByPeriod,
    recentTransactions: dashboardSnapshot.recentTransactions,
    weeklyBudget: dashboardSnapshot.weeklyBudget,
    monthlyBudget: dashboardSnapshot.monthlyBudget,
    weeklyComparison: dashboardSnapshot.weeklyComparison,
    categoryHighlight: dashboardSnapshot.categoryHighlight,
  };
}
