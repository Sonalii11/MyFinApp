import { buildDashboardSnapshot } from '../selectors';

export async function getSubscriptionManagerPreview(snapshot) {
  // Future API integration: fetch upcoming bills/subscription payments from Subscription Manager.
  return buildDashboardSnapshot(snapshot).upcomingSubscriptions;
}
