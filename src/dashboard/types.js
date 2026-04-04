/**
 * Dashboard-facing data contracts.
 * These typedefs keep the current mock services API-ready without forcing a TypeScript migration.
 */

/**
 * @typedef {"week" | "month" | "year"} DashboardPeriod
 */

/**
 * @typedef {{ id: string, firstName: string, fullName: string, avatarLabel: string, membership: "Premium" | "Free" }} DashboardUser
 */

/**
 * @typedef {{ period: DashboardPeriod, income: number, spending: number, netBalance?: number, currency: string }} CashFlowSummary
 */

/**
 * @typedef {{ id: string, type: "income" | "expense" | "transfer", category: string, categoryIcon: string, linkedAccount: string, amount: number, currency: string, date: string, displayDateLabel: string }} TransactionPreview
 */

/**
 * @typedef {{ budget: number, spent: number, carryForwardAmount?: number, remaining: number, percentageUsed: number, status: "on-track" | "near-limit" | "exceeded" }} WeeklyBudgetSummary
 */

/**
 * @typedef {{ limit: number, spent: number, remaining: number, percentageUsed: number, status: "healthy" | "near-limit" | "exceeded" }} MonthlyBudgetSummary
 */

/**
 * @typedef {{ currentWeekSpend: number, lastWeekSpend: number, differenceAmount: number, trendDirection: "up" | "down" | "flat" }} SpendingComparison
 */

/**
 * @typedef {{ categoryName: string, amountSpent: number, percentageOfWeeklySpending: number, icon: string }} CategorySpendHighlight
 */

/**
 * @typedef {{ id: string | number, name: string, dueDate: string, dueLabel: string, cost: number }} SubscriptionPreview
 */

/**
 * @typedef {{ totalBalance: number, availableCredit?: number, currency: string }} WalletPreview
 */

/**
 * @typedef {{ portfolioValue: number, gainLossAmount: number, gainLossPercent: number, currency: string }} InvestmentPreview
 */

/**
 * @typedef {{ id: string, title: string, description: string, tone: "neutral" | "positive" | "warning" }} AIInsightPreview
 */

/**
 * @typedef {{ id: string, title: string, description: string, thumbnail?: string, ctaLabel?: string }} DashboardContentCard
 */

/**
 * @typedef {{
 *   user: DashboardUser,
 *   cashFlowByPeriod: Record<DashboardPeriod, CashFlowSummary>,
 *   recentTransactions: TransactionPreview[],
 *   weeklyBudget: WeeklyBudgetSummary,
 *   monthlyBudget: MonthlyBudgetSummary,
 *   weeklyComparison: SpendingComparison,
 *   categoryHighlight: CategorySpendHighlight | null,
 *   upcomingSubscriptions: SubscriptionPreview[],
 *   walletPreview: WalletPreview | null,
 *   investmentPreview: InvestmentPreview | null,
 *   aiInsights: AIInsightPreview[],
 *   contentCards: DashboardContentCard[],
 *   isEmpty: boolean
 * }} DashboardPageData
 */

export const DASHBOARD_PERIOD_OPTIONS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

export const DASHBOARD_REFRESH_EVENTS = {
  EXPENSE_CREATED: 'expense.created',
  INCOME_CREATED: 'income.created',
  TRANSFER_CREATED: 'transfer.created',
  SUBSCRIPTION_PAYMENT_CREATED: 'subscription.payment.created',
  INVESTMENT_TRANSACTION_CREATED: 'investment.transaction.created',
};
