export const CAT_META = {
  Salary: { icon: '💼', color: '#22d4a0' },
  Freelance: { icon: '🧑‍💻', color: '#4fc3f7' },
  Business: { icon: '🏢', color: '#fbbf24' },
  'Investment Return': { icon: '📈', color: '#a594fd' },
  Gift: { icon: '🎁', color: '#f472b6' },
  Food: { icon: '🍔', color: '#f5a623' },
  Travel: { icon: '🚗', color: '#4fc3f7' },
  Bills: { icon: '⚡', color: '#fbbf24' },
  Entertainment: { icon: '🎬', color: '#f05c7a' },
  Health: { icon: '💊', color: '#22d4a0' },
  Shopping: { icon: '🛍️', color: '#a594fd' },
  Education: { icon: '📚', color: '#55efc4' },
  Other: { icon: '💸', color: '#636e72' },
};

export const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment Return', 'Gift', 'Other'];
export const EXPENSE_FILTERS = ['All', ...EXPENSE_CATEGORIES];

export const AI_INSIGHTS = [
  {
    icon: '🔥',
    title: 'Weekly focus:',
    body: 'Track week-to-week swings first. Your 4-week rollup becomes more useful when each week stays intentional.',
  },
  {
    icon: '💡',
    title: 'Cash-flow tip:',
    body: 'Treat income and expenses as one stream. Smaller weekly corrections are easier than end-of-month catchups.',
  },
  {
    icon: '⚠️',
    title: 'Overspend alert:',
    body: 'When a week crosses its budget, the dashboard highlights the overage immediately so it can be corrected before the rollup compounds.',
  },
];

export const INITIAL_WALLET = {
  balance: 124680.5,
  quickAmounts: [100, 200, 500, 1000],
  quickActions: [
    { label: 'Send', icon: '↗', bg: 'rgba(124,109,250,0.2)', color: 'var(--accent)' },
    { label: 'Receive', icon: '↙', bg: 'rgba(34,212,160,0.2)', color: 'var(--green)' },
    { label: 'Scan QR', icon: '▦', bg: 'rgba(245,166,35,0.2)', color: 'var(--orange)' },
    { label: 'Add Card', icon: '＋', bg: 'rgba(244,114,182,0.2)', color: 'var(--pink)' },
  ],
  transactions: [
    { id: 1, name: 'Rahul Sharma', type: 'sent', amount: 500, time: '2h ago' },
    { id: 2, name: 'Salary Credit', type: 'received', amount: 68000, time: 'Mar 1' },
    { id: 3, name: 'Priya M.', type: 'sent', amount: 1200, time: 'Mar 15' },
    { id: 4, name: 'Cashback Reward', type: 'received', amount: 84, time: 'Mar 14' },
    { id: 5, name: 'Suresh K.', type: 'sent', amount: 350, time: 'Mar 10' },
  ],
};

export const INVESTMENT_DATA = {
  stocks: [
    { tick: 'RELIANCE', name: 'Reliance Industries', price: 2847.5, change: 1.34, val: 142375, color: '#4fc3f7' },
    { tick: 'TCS', name: 'Tata Consultancy', price: 3912.0, change: -0.72, val: 195600, color: '#22d4a0' },
    { tick: 'INFY', name: 'Infosys Ltd', price: 1450.25, change: 2.18, val: 72512, color: '#a594fd' },
    { tick: 'BTC', name: 'Bitcoin', price: 6847320, change: 3.45, val: 342366, color: '#f5a623' },
    { tick: 'ETH', name: 'Ethereum', price: 283450, change: -1.22, val: 56690, color: '#627EEA' },
  ],
  growthLabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  growthData: [420000, 435000, 410000, 455000, 448000, 472000, 490000, 505000, 498000, 520000, 515000, 531455],
  allocationLabels: ['Stocks', 'Crypto', 'Mutual Funds', 'Cash'],
  allocationData: [42, 28, 18, 12],
  allocationColors: ['#7c6dfa', '#f5a623', '#22d4a0', '#4fc3f7'],
};

export const INITIAL_SUBSCRIPTIONS = [
  { id: 1, name: 'Netflix', icon: '🎬', price: 649, date: 'Apr 2', color: '#e50914', tag: 'Entertainment' },
  { id: 2, name: 'Spotify', icon: '🎵', price: 119, date: 'Apr 5', color: '#1db954', tag: 'Music' },
  { id: 3, name: 'Amazon Prime', icon: '📦', price: 299, date: 'Apr 9', color: '#ff9900', tag: 'Shopping' },
  { id: 4, name: 'Hotstar', icon: '⭐', price: 899, date: 'Apr 12', color: '#1c44b9', tag: 'OTT' },
  { id: 5, name: 'Notion', icon: '📝', price: 160, date: 'Apr 18', color: '#aaaaaa', tag: 'Productivity' },
  { id: 6, name: 'Canva Pro', icon: '🎨', price: 399, date: 'Apr 21', color: '#00c4cc', tag: 'Design' },
];

export const SUBSCRIPTION_BUDGET = 3000;

export const AI_CHAT = {
  suggestions: [
    'How can I save more this week?',
    'Analyze my food spending',
    'How is my monthly rollup looking?',
    'Review my subscriptions',
    'What is my budget status?',
    'Give me a money tip',
  ],
  quickStats: [
    ['Primary Mode', 'Weekly'],
    ['Rollup Window', '4 weeks'],
    ['Budgeting Style', 'Manual entry'],
    ['Theme', 'Premium dark'],
  ],
  greeting:
    "Hi! I'm FinAI. I can help you understand weekly cash flow, spot overspending, and explain how your 4-week rollup is trending.",
  responses: {
    food: "You've been spending more on food than your typical weekly pace. Try batching one grocery run and limiting delivery apps to one treat day.",
    save: 'Small weekly corrections compound fast. Reduce one variable expense category this week and your 4-week rollup will improve noticeably.',
    invest:
      'Protect your weekly cash flow first, then move surplus into investments. Consistent excess cash beats irregular lump-sum investing for discipline.',
    subs:
      'Subscriptions are easiest to review during a budget reset week. Pause anything that did not earn attention in the last 7 days.',
    budget: 'Your budget status is strongest when viewed weekly first. Check the weekly spend versus limit, then confirm the 4-week rollup is still on track.',
    tip: 'A good weekly budgeting habit is to review income, expenses, and next recurring bills on the same day each week.',
    default:
      'Ask me about weekly spending, saving more, investments, subscriptions, or how the 4-week monthly rollup is behaving.',
  },
};
