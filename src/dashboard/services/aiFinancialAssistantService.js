import { buildDashboardSnapshot } from '../selectors';

export async function getAIFinancialAssistantPreview(snapshot) {
  // Future API integration: request tailored AI insight summaries from the AI service.
  const dashboardSnapshot = buildDashboardSnapshot(snapshot);
  return {
    aiInsights: dashboardSnapshot.aiInsights,
    contentCards: dashboardSnapshot.contentCards,
  };
}
