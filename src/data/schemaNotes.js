/**
 * FinSphere internal schema notes.
 * These are lightweight runtime constants plus JSDoc contracts so features
 * can share one vocabulary without a TypeScript migration.
 */

export const APP_STATE_VERSION = 2;

export const ENTRY_FREQUENCIES = ['weekly', 'monthly', 'annual', 'one-time'];

export const ENTRY_KINDS = {
  income: 'income',
  expense: 'expense',
  budget: 'budget',
};

export const WALLET_TRANSACTION_SOURCES = {
  wallet: 'wallet',
  portfolio: 'portfolio',
  budget: 'budget',
  income: 'income',
  expense: 'expense',
  transfer: 'transfer',
};

export const WALLET_TRANSACTION_TYPES = ['income', 'expense', 'buy', 'sell', 'dividend', 'transfer'];

export const ASSET_TYPES = ['stock', 'mutual-fund', 'etf', 'crypto', 'fixed-deposit'];

export const ACCOUNT_TYPES = ['cash', 'bank', 'upi', 'card', 'wallet', 'savings', 'investment', 'other'];

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   type: string,
 *   balance: number,
 *   currency: string,
 *   details?: {
 *     accountHolderName?: string,
 *     bankName?: string,
 *     accountNumber?: string,
 *     upiId?: string,
 *     cardLast4?: string,
 *     note?: string
 *   },
 *   createdAt: string,
 *   updatedAt: string,
 *   isPrimary: boolean
 * }} Wallet
 */

/**
 * @typedef {"weekly" | "monthly" | "annual" | "one-time"} EntryFrequency
 */

/**
 * @typedef {"income" | "expense" | "budget"} EntryKind
 */

/**
 * @typedef {{
 *   id: string,
 *   kind: EntryKind,
 *   title: string,
 *   category: string,
 *   amount: number,
 *   currency: string,
 *   frequency: EntryFrequency,
 *   startDate: string,
 *   endDate?: string,
 *   effectiveDate?: string,
 *   accountId?: string,
 *   accountName?: string,
 *   notes?: string,
 *   source?: string,
 *   linkedTransactionId?: string,
 *   linkedAssetId?: string,
 *   linkedAssetName?: string,
 *   createdAt?: string,
 *   updatedAt?: string
 * }} FinanceEntry
 */

/**
 * @typedef {{
 *   id: string,
 *   type: "expense" | "income" | "transfer",
 *   title: string,
 *   category: string,
 *   amount: number,
 *   currency: string,
 *   date: string,
 *   time?: string,
 *   account?: string,
 *   accountId?: string,
 *   fromAccount?: string,
 *   toAccount?: string,
 *   paymentMode?: string,
 *   tags?: string[],
 *   notes?: string,
 *   attachments?: Array<object>,
 *   entryId?: string,
 *   source?: string,
 *   createdAt?: string,
 *   updatedAt?: string
 * }} LedgerTransaction
 */

/**
 * @typedef {{
 *   id: string,
 *   walletId: string,
 *   type: "income" | "expense" | "buy" | "sell" | "dividend" | "transfer-in" | "transfer-out" | "adjustment",
 *   direction: "in" | "out",
 *   amount: number,
 *   date: string,
 *   category: string | null,
 *   source: "wallet" | "portfolio" | "budget" | "dashboard" | "manual" | "system" | "income" | "expense" | "transfer",
 *   referenceId?: string,
 *   linkedTransactionId?: string | null,
 *   note?: string,
 *   assetId?: string,
 *   assetName?: string,
 *   createdAt?: string
 * }} WalletTransaction
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   symbol: string,
 *   type: "stock" | "mutual-fund" | "etf" | "crypto" | "fixed-deposit",
 *   quantity: number,
 *   averageBuyPrice: number,
 *   investedAmount: number,
 *   currentValue: number
 * }} AssetModel
 */

/**
 * @typedef {{
 *   id: string,
 *   assetId: string,
 *   action: "buy" | "sell" | "dividend",
 *   quantity: number,
 *   amount: number,
 *   date: string
 * }} PortfolioTransactionModel
 */

/**
 * @typedef {{
 *   id: string,
 *   amount: number,
 *   category: string,
 *   frequency: EntryFrequency,
 *   date: string
 * }} IncomeEntryModel
 */

/**
 * @typedef {{
 *   id: string,
 *   amount: number,
 *   category: string,
 *   frequency: EntryFrequency,
 *   date: string
 * }} ExpenseEntryModel
 */

/**
 * @typedef {{
 *   id: string,
 *   category: string,
 *   amount: number,
 *   frequency: EntryFrequency,
 *   date: string
 * }} BudgetEntryModel
 */
