import React, { useEffect, useMemo, useState } from 'react';
import { Btn, Input, Modal, Select } from './UI';
import { useApp } from '../context/AppContext';

const EMPTY_FORM = {
  title: '',
  amount: '',
  category: '',
  date: '',
  frequency: 'one-time',
  account: '',
  notes: '',
};

export default function TransactionModal({ type, onClose }) {
  const {
    addIncome,
    addExpense,
    incomeCategories,
    expenseCategories,
    customIncomeCategories,
    customExpenseCategories,
    addCustomCategory,
    removeCustomCategory,
  } = useApp();
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const customCategories = type === 'income' ? customIncomeCategories : customExpenseCategories;
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    setForm({
      ...EMPTY_FORM,
      category: categories[0],
      date: new Date().toISOString().slice(0, 10),
    });
    setError('');
    setNewCategory('');
  }, [type]);

  useEffect(() => {
    if (!categories.includes(form.category)) {
      setForm((current) => ({
        ...current,
        category: categories[0] || '',
      }));
    }
  }, [categories, form.category]);

  const title = useMemo(() => (type === 'income' ? 'Add Income' : 'Add Expense'), [type]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleAddCategory() {
    const result = addCustomCategory(type, newCategory);
    if (!result?.ok) {
      if (result?.reason === 'exists') {
        setError('That category already exists.');
      } else {
        setError('Please enter a category name.');
      }
      return;
    }

    setError('');
    setForm((current) => ({ ...current, category: result.value }));
    setNewCategory('');
  }

  function handleRemoveCategory(categoryName) {
    const result = removeCustomCategory(type, categoryName);
    if (!result?.ok) {
      setError('Unable to remove that category.');
      return;
    }

    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Please enter a title for this transaction.');
      return;
    }

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!form.date) {
      setError('Please choose a transaction date.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      frequency: form.frequency,
      account: form.account.trim(),
      notes: form.notes.trim(),
    };

    if (type === 'income') addIncome(payload);
    else addExpense(payload);

    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="transaction-type-pill">{type === 'income' ? 'Income Entry' : 'Expense Entry'}</div>

        <Input
          label="TITLE"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder={type === 'income' ? 'e.g. Salary credit' : 'e.g. Grocery run'}
          required
        />

        <div className="transaction-grid">
          <Input
            label="AMOUNT (₹)"
            type="number"
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            placeholder="0"
            required
          />
          <Input
            label="DATE"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
            required
          />
        </div>

        <Select
          label="FREQUENCY"
          value={form.frequency}
          onChange={(event) => updateField('frequency', event.target.value)}
          options={[
            { value: 'one-time', label: 'One-time' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
          ]}
        />

        <Select
          label="CATEGORY"
          value={form.category}
          onChange={(event) => updateField('category', event.target.value)}
          options={categories}
        />

        <div className="input-group">
          <label className="input-label">ADD NEW CATEGORY</label>
          <div className="transaction-add-category-row">
            <input
              className="input"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder={type === 'income' ? 'e.g. Bonus' : 'e.g. Pets'}
            />
            <Btn type="button" variant="outline" onClick={handleAddCategory}>
              Add
            </Btn>
          </div>
        </div>

        {customCategories.length ? (
          <div className="input-group">
            <label className="input-label">CUSTOM CATEGORIES</label>
            <div className="transaction-category-chips">
              {customCategories.map((categoryName) => (
                <div key={categoryName} className="transaction-category-chip">
                  <span>{categoryName}</span>
                  <button
                    type="button"
                    className="transaction-category-remove"
                    onClick={() => handleRemoveCategory(categoryName)}
                    aria-label={`Remove ${categoryName}`}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <Input
          label="ACCOUNT (OPTIONAL)"
          value={form.account}
          onChange={(event) => updateField('account', event.target.value)}
          placeholder="e.g. HDFC Salary / UPI / Credit Card"
        />

        <div className="input-group">
          <label className="input-label">NOTES (OPTIONAL)</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            rows={3}
            placeholder="Any context you want to remember"
          />
        </div>

        {error ? <div className="form-error">⚠ {error}</div> : null}

        <div className="transaction-form-actions">
          <Btn type="button" variant="outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
            Cancel
          </Btn>
          <Btn type="submit" variant={type === 'income' ? 'success' : 'primary'} style={{ flex: 1, justifyContent: 'center' }}>
            {title}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
