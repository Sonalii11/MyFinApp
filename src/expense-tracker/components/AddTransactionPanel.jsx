import React from 'react';
import { Btn, Card, Input, Modal, Select, Tag } from '../../components/UI';

export function TransactionTypeSwitcher({ value, onChange }) {
  const options = ['expense', 'income', 'transfer'];
  return (
    <div className="expense-type-switcher">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`expense-type-chip${value === option ? ' active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function AmountInputWithCalculator({ amount, expression, onAmountChange, onExpressionChange, onApply }) {
  return (
    <div className="expense-amount-block">
      <Input label="AMOUNT" type="number" value={amount} onChange={(event) => onAmountChange(event.target.value)} placeholder="0" />
      <div className="expense-calculator-row">
        <Input
          label="CALCULATOR"
          value={expression}
          onChange={(event) => onExpressionChange(event.target.value)}
          placeholder="e.g. 2500+499-200"
        />
        <Btn type="button" variant="outline" onClick={onApply}>Apply</Btn>
      </div>
    </div>
  );
}

export function CategorySelector({ value, options, onChange, hidden }) {
  if (hidden) return null;
  return <Select label="CATEGORY" value={value} onChange={(event) => onChange(event.target.value)} options={options} />;
}

export function AccountSelector({ type, formState, accounts, onChange }) {
  const accountOptions = accounts.map((account) => account.name);
  if (type === 'transfer') {
    return (
      <div className="expense-grid-2">
        <Select label="FROM ACCOUNT" value={formState.fromAccount} onChange={(event) => onChange('fromAccount', event.target.value)} options={accountOptions} />
        <Select label="TO ACCOUNT" value={formState.toAccount} onChange={(event) => onChange('toAccount', event.target.value)} options={accountOptions} />
      </div>
    );
  }
  return <Select label="PAYMENT ACCOUNT" value={formState.account} onChange={(event) => onChange('account', event.target.value)} options={accountOptions} />;
}

export function TagInputSection({ tags, tagInput, suggestions, onInputChange, onAdd, onRemove }) {
  return (
    <div className="input-group">
      <label className="input-label">TAGS</label>
      <div className="transaction-add-category-row">
        <input className="input" value={tagInput} onChange={(event) => onInputChange(event.target.value)} placeholder="Add tag" />
        <Btn type="button" variant="outline" onClick={() => onAdd(tagInput)}>Add</Btn>
      </div>
      <div className="transaction-category-chips">
        {suggestions.map((tag) => (
          <button key={tag.id} type="button" className="expense-tag-suggestion" onClick={() => onAdd(tag.label)}>
            #{tag.label}
          </button>
        ))}
      </div>
      {tags.length ? (
        <div className="transaction-category-chips">
          {tags.map((tag) => (
            <div key={tag} className="transaction-category-chip">
              <span>#{tag}</span>
              <button type="button" className="transaction-category-remove" onClick={() => onRemove(tag)}>x</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AttachmentUploader({ attachments, onAddFiles, onRemove }) {
  return (
    <div className="input-group">
      <label className="input-label">ATTACHMENTS</label>
      <input
        type="file"
        className="input"
        multiple
        onChange={(event) => onAddFiles(event.target.files)}
      />
      {attachments.length ? (
        <div className="expense-attachment-list">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="expense-attachment-item">
              <div>
                <strong>{attachment.name}</strong>
                <div className="tx-meta">{Math.round(attachment.size / 1024)} KB · {attachment.mimeType}</div>
              </div>
              <button type="button" className="transaction-category-remove" onClick={() => onRemove(attachment.id)}>x</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AddTransactionPanel({ data, state, actions, customCategoryManager }) {
  const { accounts, categories, paymentModes, tags } = data;
  const { formState, formMode, formError } = state;

  const availableCategories = categories
    .filter((category) => formState.type === 'transfer' ? category.name === 'Transfer' : category.type === formState.type || category.type === 'shared')
    .map((category) => category.name)
    .concat(formState.type === 'income' ? data.customCategories.income : formState.type === 'expense' ? data.customCategories.expense : [])
    .filter((name) => name !== 'Transfer' || formState.type === 'transfer');

  return (
    <Card className="expense-panel-card expense-panel-card-primary">
      <div className="sec-header">
        <div>
          <span className="dashboard-section-label">Add transaction module</span>
          <div className="sec-title">{formMode === 'edit' ? 'Edit transaction' : 'Add transaction'}</div>
        </div>
        <Tag variant="purple">Core finance engine</Tag>
      </div>

      <div className="expense-panel-stack">
        <TransactionTypeSwitcher value={formState.type} onChange={(value) => actions.openCreateForm(value)} />

        <div className="expense-grid-3">
          <Input label="TITLE" value={formState.title} onChange={(event) => actions.updateFormField('title', event.target.value)} placeholder="e.g. Rent, Salary, Wallet top-up" />
          <Input label="DATE" type="date" value={formState.date} onChange={(event) => actions.updateFormField('date', event.target.value)} />
          <Input label="TIME" type="time" value={formState.time} onChange={(event) => actions.updateFormField('time', event.target.value)} />
        </div>

        <AmountInputWithCalculator
          amount={formState.amount}
          expression={formState.calculatorExpression}
          onAmountChange={(value) => actions.updateFormField('amount', value)}
          onExpressionChange={(value) => actions.updateFormField('calculatorExpression', value)}
          onApply={actions.applyCalculator}
        />

        <div className="expense-grid-2">
          <CategorySelector value={formState.category} options={availableCategories} onChange={(value) => actions.updateFormField('category', value)} hidden={formState.type === 'transfer'} />
          <Select label="PAYMENT MODE" value={formState.paymentMode} onChange={(event) => actions.updateFormField('paymentMode', event.target.value)} options={paymentModes} />
        </div>

        <AccountSelector type={formState.type} formState={formState} accounts={accounts} onChange={actions.updateFormField} />

        <customCategoryManager.Component
          type={formState.type}
          selectedCategory={formState.category}
          onSelectCategory={(value) => actions.updateFormField('category', value)}
        />

        <TagInputSection
          tags={formState.tags}
          tagInput={formState.tagInput}
          suggestions={tags}
          onInputChange={(value) => actions.updateFormField('tagInput', value)}
          onAdd={actions.addTagToForm}
          onRemove={actions.removeTagFromForm}
        />

        <AttachmentUploader attachments={formState.attachments} onAddFiles={actions.addAttachmentList} onRemove={actions.removeAttachment} />

        <div className="input-group">
          <label className="input-label">NOTES</label>
          <textarea className="textarea" rows={4} value={formState.notes} onChange={(event) => actions.updateFormField('notes', event.target.value)} placeholder="Context, reason, people involved, or reference info" />
        </div>

        {formError ? <div className="form-error">⚠ {formError}</div> : null}
      </div>

      <div className="expense-sticky-actions">
        <Btn variant="outline" onClick={() => actions.openCreateForm(formState.type)}>Reset</Btn>
        <Btn variant="primary" onClick={actions.saveTransaction}>{formMode === 'edit' ? 'Save transaction' : 'Save transaction'}</Btn>
      </div>
    </Card>
  );
}

export function DeleteConfirmationModal({ transaction, onCancel, onConfirm }) {
  if (!transaction) return null;
  return (
    <Modal title="Delete transaction" onClose={onCancel}>
      <div className="expense-panel-stack">
        <p className="text-sm text2">
          Delete <strong>{transaction.title}</strong>? This updates budgets, analytics, and shared summaries immediately.
        </p>
        <div className="transaction-form-actions">
          <Btn variant="outline" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm} style={{ flex: 1, justifyContent: 'center' }}>Delete</Btn>
        </div>
      </div>
    </Modal>
  );
}
