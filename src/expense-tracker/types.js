/**
 * Expense Tracker domain contracts.
 * JSDoc keeps the data model explicit while staying compatible with the current JS setup.
 */

/**
 * @typedef {"expense" | "income" | "transfer"} TransactionType
 */

/**
 * @typedef {{ id: string, type: TransactionType, title: string, category: string, amount: number, currency: string, date: string, time?: string, account?: string, fromAccount?: string, toAccount?: string, paymentMode?: string, tags?: string[], notes?: string, attachments?: AttachmentMeta[], createdAt?: string, updatedAt?: string }} Transaction
 */

/**
 * @typedef {{ id: string, type: TransactionType, title: string, date: string, time: string, amount: string, calculatorExpression: string, category: string, account: string, fromAccount: string, toAccount: string, paymentMode: string, notes: string, tags: string[], tagInput: string, attachments: AttachmentMeta[] }} TransactionFormState
 */

/**
 * @typedef {{ id: string, name: string, kind: "bank" | "wallet" | "credit", baseBalance: number, currency: string }} Account
 */

/**
 * @typedef {{ id: string, name: string, type: "expense" | "income" | "shared", icon: string, color: string }} Category
 */

/**
 * @typedef {{ id: string, label: string }} Tag
 */

/**
 * @typedef {{ id: string, name: string, size: number, mimeType: string, uploadedAt: string }} AttachmentMeta
 */

/**
 * @typedef {{ baseWeeklyBudget: number, monthlyBudgetSource: number, autoGenerateFromMonthly: boolean, carryForwardMode: "strict-reset" | "carry-unused-forward" | "roll-deficit-forward", overspendDeduction: boolean, weeklyOverrides: Record<string, number> }} WeeklyBudget
 */

/**
 * @typedef {{ strictReset: boolean, carryUnusedForward: boolean, rollDeficitForward: boolean, overspendDeduction: boolean }} WeeklyBudgetRuleConfig
 */

/**
 * @typedef {{ id: string, monthKey: string, limit: number, includedCategories: string[] }} MonthlyBudget
 */

/**
 * @typedef {{ category: string, weeklyLimit?: number, monthlyLimit?: number }} CategoryLimit
 */

/**
 * @typedef {{ id: string, kind: "budget" | "category" | "summary", severity: "info" | "warning" | "critical", title: string, description: string }} BudgetAlert
 */

/**
 * @typedef {{ range: "week" | "month" | "year" | "custom", income: number, spending: number, transfers: number, netBalance: number, budgetStatus: string, categoryBreakdown: { label: string, amount: number, color: string }[], paymentModeBreakdown: PaymentModeBreakdownItem[], stats: ExpenseStats, changeSummary: { income: number, spending: number, balance: number } }} ExpenseAnalyticsSnapshot
 */

/**
 * @typedef {{ mode: string, amount: number }} PaymentModeBreakdownItem
 */

/**
 * @typedef {{ avgSpendingPerDay: number, avgSpendingPerTransaction: number, avgIncomePerDay: number, avgIncomePerTransaction: number }} ExpenseStats
 */

/**
 * @typedef {{ weekStart: string, label: string, budget: number, spent: number, remaining: number, percentageUsed: number, status: "on-track" | "near-limit" | "exceeded" }} WeekHistoryItem
 */
