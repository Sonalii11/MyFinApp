/**
 * Investment Portfolio domain contracts.
 */

/**
 * @typedef {"stock" | "mutual-fund" | "etf" | "crypto" | "fixed-deposit"} InvestmentAssetType
 */

/**
 * @typedef {"buy" | "sell" | "dividend" | "sip" | "transfer-in" | "transfer-out"} InvestmentTransactionType
 */

/**
 * @typedef {{ id: string, name: string, ticker?: string, assetType: InvestmentAssetType, sector: string, quantityPrecision?: number, color: string }} InvestmentAsset
 */

/**
 * @typedef {{ assetId: string, quantity: number, investedAmount: number, currentPrice: number, currentValue: number, averageBuyPrice: number, gainLoss: number, gainLossPercent: number, allocationPercent: number, assetType: InvestmentAssetType, assetName: string, ticker?: string, sector: string, color: string }} InvestmentHolding
 */

/**
 * @typedef {{ id: string, type: InvestmentTransactionType, assetId?: string, assetName?: string, accountId: string, amount: number, quantity?: number, pricePerUnit?: number, fees?: number, notes?: string, date: string, time?: string, linkedGoalId?: string, schedule?: ContributionSchedule["frequency"], createdAt?: string, updatedAt?: string }} InvestmentTransaction
 */

/**
 * @typedef {{ id: string, type: InvestmentTransactionType, assetId: string, accountId: string, date: string, time: string, amount: string, quantity: string, pricePerUnit: string, fees: string, notes: string, linkedGoalId: string, schedule: ContributionSchedule["frequency"] | "" }} InvestmentTransactionFormState
 */

/**
 * @typedef {{ totalValue: number, totalInvested: number, gainLoss: number, gainLossPercent: number, allocation: PortfolioAllocationItem[], state: "positive" | "neutral" | "negative" }} PortfolioOverview
 */

/**
 * @typedef {{ label: string, value: number, percentage: number, color: string }} PortfolioAllocationItem
 */

/**
 * @typedef {{ label: string, value: number }} PerformancePoint
 */

/**
 * @typedef {{ label: string, value: number, color: string }} SectorDistributionItem
 */

/**
 * @typedef {{ assetId: string, assetName: string, ticker?: string, gainLoss: number, gainLossPercent: number, currentValue: number }} ProfitLossAssetRow
 */

/**
 * @typedef {{ investedIn: number, withdrawn: number, dividends: number, netCashFlow: number }} InvestmentCashFlowSummary
 */

/**
 * @typedef {{ frequency: "weekly" | "monthly" | "custom", label: string }} ContributionSchedule
 */

/**
 * @typedef {{ id: string, name: string, targetAmount: number, currentValue: number, linkedAssetIds: string[], contributionAmount: number, contributionSchedule: ContributionSchedule, projectedMonthsRemaining: number }} InvestmentGoal
 */

/**
 * @typedef {{ id: string, name: string, kind: "bank" | "wallet" | "brokerage", balance: number, currency: string }} LinkedFundingAccount
 */

/**
 * @typedef {{ accountId: string, accountName: string, direction: "debit" | "credit" | "none", amount: number, balanceBefore: number, balanceAfter: number, label: string }} AccountImpactPreview
 */
