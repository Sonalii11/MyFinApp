import React from 'react';
import { Page, Card, Btn } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useExpenseTrackerData } from './useExpenseTrackerData';
import { AddTransactionPanel, DeleteConfirmationModal } from './components/AddTransactionPanel';
import { TransactionHistorySection } from './components/TransactionHistorySection';
import { WeeklyBudgetSection } from './components/WeeklyBudgetSection';
import { MonthlyBudgetSection } from './components/MonthlyBudgetSection';
import { CategoryLimitsSection } from './components/CategoryLimitsSection';
import { ExpenseAnalysisSection } from './components/ExpenseAnalysisSection';
import { ExpenseAlertsSection } from './components/ExpenseAlertsSection';

function CustomCategoryManager({ type, selectedCategory, onSelectCategory }) {
  const {
    customIncomeCategories,
    customExpenseCategories,
    addCustomCategory,
    removeCustomCategory,
  } = useApp();
  const customCategories = type === 'income' ? customIncomeCategories : type === 'expense' ? customExpenseCategories : [];
  const [draft, setDraft] = React.useState('');

  React.useEffect(() => {
    setDraft('');
  }, [type]);

  if (type === 'transfer') return null;

  return (
    <div className="expense-panel-stack">
      <div className="input-group">
        <label className="input-label">CUSTOM CATEGORY MANAGER</label>
        <div className="transaction-add-category-row">
          <input className="input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={type === 'income' ? 'e.g. Bonus' : 'e.g. Pet care'} />
          <Btn type="button" variant="outline" onClick={() => {
            const result = addCustomCategory(type, draft);
            if (result?.ok) {
              onSelectCategory(result.value);
              setDraft('');
            }
          }}>Add</Btn>
        </div>
      </div>
      {customCategories.length ? (
        <div className="transaction-category-chips">
          {customCategories.map((category) => (
            <div key={category} className={`transaction-category-chip${selectedCategory === category ? ' active' : ''}`}>
              <button type="button" className="expense-inline-chip-button" onClick={() => onSelectCategory(category)}>{category}</button>
              <button type="button" className="transaction-category-remove" onClick={() => removeCustomCategory(type, category)}>x</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ExpenseTrackerPage() {
  const tracker = useExpenseTrackerData();

  if (tracker.loading) {
    return (
      <Page className="z1">
        <div className="expense-tracker-shell">
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index} className="dashboard-page-skeleton" />
          ))}
        </div>
      </Page>
    );
  }

  if (tracker.error) {
    return (
      <Page className="z1">
        <Card className="dashboard-feedback-card">
          <h2>Expense Tracker unavailable</h2>
          <p>{tracker.error.message}</p>
          <Btn variant="primary" onClick={tracker.actions.retry}>Retry</Btn>
        </Card>
      </Page>
    );
  }

  return (
    <Page className="z1">
      <div className="expense-tracker-shell">
        <div className="expense-tracker-heading">
          <div>
            <span className="dashboard-section-label">Expense tracker page</span>
            <h1 className="dashboard-header-title">Weekly-first finance engine</h1>
            <p className="dashboard-header-subtitle">
              Transactions, budgets, category limits, analytics, and alerts all update from the same shared transaction layer.
            </p>
          </div>
        </div>

        <AddTransactionPanel
          data={tracker.data}
          state={tracker.state}
          actions={tracker.actions}
          customCategoryManager={{ Component: CustomCategoryManager }}
        />

        <TransactionHistorySection data={tracker.data} state={tracker.state} actions={tracker.actions} />
        <WeeklyBudgetSection weeklyBudget={tracker.data.weeklyBudget} actions={tracker.actions} />
        <MonthlyBudgetSection budget={tracker.data.monthlyBudget} categories={tracker.data.categories.filter((item) => item.type !== 'income' && item.name !== 'Transfer').map((item) => item.name)} actions={tracker.actions} />
        <CategoryLimitsSection rows={tracker.data.categoryLimitRows} sortBy={tracker.state.categorySort} onSort={tracker.actions.setCategorySort} onUpdate={tracker.actions.updateCategoryLimit} onReset={tracker.actions.resetCategoryLimits} />
        <ExpenseAnalysisSection analytics={tracker.data.analytics} range={tracker.state.analyticsRange} customRange={tracker.state.customAnalyticsRange} onRangeChange={tracker.actions.setAnalyticsRange} onCustomRangeChange={tracker.actions.setCustomAnalyticsRange} />
        <ExpenseAlertsSection alerts={tracker.data.alerts} onDismiss={tracker.actions.dismissAlert} />
      </div>

      <DeleteConfirmationModal
        transaction={tracker.state.deleteCandidate}
        onCancel={tracker.actions.cancelDelete}
        onConfirm={tracker.actions.confirmDelete}
      />
    </Page>
  );
}
