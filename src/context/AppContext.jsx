import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';

const CAT_META = {
  Food:          { icon: '🍔', color: '#fdcb6e' },
  Travel:        { icon: '🚗', color: '#74b9ff' },
  Bills:         { icon: '⚡', color: '#ffeaa7' },
  Entertainment: { icon: '🎬', color: '#e84393' },
  Health:        { icon: '💊', color: '#00cec9' },
  Shopping:      { icon: '🛒', color: '#a29bfe' },
  Education:     { icon: '📚', color: '#55efc4' },
  Other:         { icon: '💸', color: '#636e72' },
};

const INIT_EXPENSES = [
  { id: uuid(), name: 'Zomato Order',     cat: 'Food',          amount: 485,  date: '2026-03-16' },
  { id: uuid(), name: 'Uber Ride',        cat: 'Travel',        amount: 230,  date: '2026-03-16' },
  { id: uuid(), name: 'Electricity Bill', cat: 'Bills',         amount: 1840, date: '2026-03-15' },
  { id: uuid(), name: 'Netflix',          cat: 'Entertainment', amount: 649,  date: '2026-03-14' },
  { id: uuid(), name: 'D-Mart Grocery',  cat: 'Food',          amount: 2350, date: '2026-03-13' },
  { id: uuid(), name: 'Gym Membership',  cat: 'Health',        amount: 1500, date: '2026-03-12' },
  { id: uuid(), name: 'Airtel Recharge', cat: 'Bills',         amount: 599,  date: '2026-03-11' },
  { id: uuid(), name: 'BookMyShow',       cat: 'Entertainment', amount: 350,  date: '2026-03-10' },
  { id: uuid(), name: 'Amazon Order',    cat: 'Shopping',      amount: 1200, date: '2026-03-09' },
  { id: uuid(), name: 'Yoga Class',      cat: 'Health',        amount: 800,  date: '2026-03-08' },
  { id: uuid(), name: 'Swiggy Dinner',   cat: 'Food',          amount: 340,  date: '2026-03-07' },
  { id: uuid(), name: 'Metro Card',      cat: 'Travel',        amount: 200,  date: '2026-03-06' },
];

const INIT_INCOME = 68000;
const INIT_BUDGET = 25000;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [expenses,   setExpenses]  = useState(INIT_EXPENSES);
  const [income,     setIncome]    = useState(INIT_INCOME);
  const [budget,     setBudget]    = useState(INIT_BUDGET);
  const [page,       setPage]      = useState('dashboard');
  const [toast,      setToast]     = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addExpense = useCallback((data) => {
    const meta = CAT_META[data.cat] || CAT_META.Other;
    setExpenses(p => [{ ...data, id: uuid(), icon: meta.icon, color: meta.color }, ...p]);
    showToast(`"${data.name}" added ✓`);
  }, [showToast]);

  const updateExpense = useCallback((id, data) => {
    const meta = CAT_META[data.cat] || CAT_META.Other;
    setExpenses(p => p.map(e => e.id === id ? { ...e, ...data, icon: meta.icon, color: meta.color } : e));
    showToast(`"${data.name}" updated ✓`);
  }, [showToast]);

  const deleteExpense = useCallback((id) => {
    const exp = expenses.find(e => e.id === id);
    setExpenses(p => p.filter(e => e.id !== id));
    showToast(`"${exp?.name}" deleted`, 'error');
  }, [expenses, showToast]);

  // Derived stats
  const totalSpent  = expenses.reduce((s, e) => s + e.amount, 0);
  const savings     = income - totalSpent;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
  const budgetLeft  = budget - totalSpent;

  // Category breakdown
  const byCategory = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.cat] = (acc[e.cat] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([cat, amount]) => ({ cat, amount, ...CAT_META[cat] }))
   .sort((a, b) => b.amount - a.amount);

  // Daily spending (last 30 days)
  const dailySpending = (() => {
    const days = {};
    const now = new Date('2026-03-18');
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    expenses.forEach(e => {
      if (days[e.date] !== undefined) days[e.date] += e.amount;
    });
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  })();

  // Weekly spending (last 7 days labels)
  const weeklySpending = dailySpending.slice(-7);

  // Monthly spending (group by month)
  const monthlySpending = (() => {
    const months = {};
    expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      months[m] = (months[m] || 0) + e.amount;
    });
    const sorted = Object.entries(months).sort(([a],[b]) => a.localeCompare(b));
    return sorted.map(([month, amount]) => ({
      label: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
      amount
    }));
  })();

  return (
    <AppContext.Provider value={{
      expenses, income, budget, page,
      setPage, setIncome, setBudget,
      addExpense, updateExpense, deleteExpense,
      totalSpent, savings, savingsRate, budgetLeft,
      byCategory, weeklySpending, monthlySpending, dailySpending,
      CAT_META, toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export { CAT_META };
