import { DASHBOARD_REFRESH_EVENTS } from './types';

export { DASHBOARD_REFRESH_EVENTS };

export const DASHBOARD_REFRESH_EVENT_MAP = {
  addExpense: DASHBOARD_REFRESH_EVENTS.EXPENSE_CREATED,
  addIncome: DASHBOARD_REFRESH_EVENTS.INCOME_CREATED,
  sendMoney: DASHBOARD_REFRESH_EVENTS.TRANSFER_CREATED,
  subscriptionPayment: DASHBOARD_REFRESH_EVENTS.SUBSCRIPTION_PAYMENT_CREATED,
  investmentTransaction: DASHBOARD_REFRESH_EVENTS.INVESTMENT_TRANSACTION_CREATED,
};

export function createDashboardReloadStrategy() {
  return {
    mode: 'event-version-invalidation',
    description:
      'Dashboard data reloads whenever the centralized dashboard refresh version changes. Future websocket or query invalidation can plug into this same boundary.',
  };
}
