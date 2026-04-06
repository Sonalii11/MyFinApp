import React, { useMemo, useState } from 'react';
import { Page, Grid, Card, SectionHeader, Btn, Input, Modal, Select, Tag } from '../components/UI';
import { useApp } from '../context/AppContext';

export default function Wallet() {
  const {
    wallet: activeWallet,
    walletBalance,
    totalBalance,
    accounts,
    walletCards,
    addAccount,
    updateAccount,
    deleteAccount,
    addIncome,
    addExpense,
    adjustWalletBalance,
    addMoneyToAccount,
    subtractMoneyFromAccount,
    transferBetweenAccounts,
    setActiveWallet,
    sendMoney,
    addWalletCard,
    selectors,
    uiData,
  } = useApp();
  const walletUi = uiData.wallet;
  const [sendTo, setSendTo] = useState('');
  const [sendAmt, setSendAmt] = useState('');
  const [activeAction, setActiveAction] = useState('');
  const [actionForm, setActionForm] = useState({
    name: '',
    amount: '',
    type: 'wallet',
    targetAccountId: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    upiId: '',
    cardLast4: '',
    note: '',
    label: '',
    holder: '',
    last4: '',
    expires: '',
  });
  const [editingAccountId, setEditingAccountId] = useState('');

  const recentTransactions = useMemo(() => selectors.getRecentWalletTransactions(undefined, 6), [selectors]);
  const weeklyIncome = useMemo(() => selectors.getWeeklyWalletIncome(), [selectors]);
  const weeklyExpense = useMemo(() => selectors.getWeeklyWalletExpense(), [selectors]);
  const netCashFlow = useMemo(() => selectors.getNetCashFlow(), [selectors]);
  const primaryCard = walletCards[0];

  function handleSendMoney() {
    const ok = sendMoney(sendTo, sendAmt);
    if (!ok) return;
    setSendTo('');
    setSendAmt('');
  }

  function resetActionForm() {
    setActionForm({
      name: '',
      amount: '',
      type: 'wallet',
      targetAccountId: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      upiId: '',
      cardLast4: '',
      note: '',
      label: '',
      holder: '',
      last4: '',
      expires: '',
    });
    setEditingAccountId('');
  }

  function openQuickAction(label) {
    setActiveAction(label);
    resetActionForm();
  }

  function submitQuickAction() {
    if (activeAction === 'Transfer') {
      const result = actionForm.targetAccountId
        ? transferBetweenAccounts({
            fromWalletId: activeWallet.id,
            toWalletId: actionForm.targetAccountId,
            amount: actionForm.amount,
            note: actionForm.note || `Transfer from ${activeWallet.name}`,
          })
        : { ok: sendMoney(actionForm.name, actionForm.amount) };
      if (result?.ok) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Add Income') {
      const created = addIncome({
        title: actionForm.name || 'Manual income',
        amount: actionForm.amount,
        category: 'Other',
        account: activeWallet.name,
      });
      if (created) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Add Expense') {
      const created = addExpense({
        title: actionForm.name || 'Manual expense',
        amount: actionForm.amount,
        category: 'Other',
        account: activeWallet.name,
      });
      if (created) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Adjust Balance') {
      const adjusted = adjustWalletBalance({
        amount: actionForm.amount,
        direction: Number(actionForm.amount) >= 0 ? 'in' : 'out',
        note: actionForm.note || actionForm.name || 'Manual wallet correction',
      });
      if (adjusted) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Add Money') {
      const created = addMoneyToAccount({
        walletId: editingAccountId || activeWallet.id,
        amount: actionForm.amount,
        note: actionForm.note || 'Manual balance addition',
      });
      if (created) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Subtract Money') {
      const created = subtractMoneyFromAccount({
        walletId: editingAccountId || activeWallet.id,
        amount: actionForm.amount,
        note: actionForm.note || 'Manual balance deduction',
      });
      if (created) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Add Account' || activeAction === 'Edit Account') {
      const payload = {
        name: actionForm.name,
        type: actionForm.type,
        balance: actionForm.amount || 0,
        details: {
          accountHolderName: actionForm.accountHolderName,
          bankName: actionForm.bankName,
          accountNumber: actionForm.accountNumber,
          upiId: actionForm.upiId,
          cardLast4: actionForm.cardLast4,
          note: actionForm.note,
        },
      };
      const result = activeAction === 'Edit Account'
        ? updateAccount(editingAccountId, payload)
        : addAccount(payload);
      if (result) {
        setActiveAction('');
        resetActionForm();
      }
      return;
    }

    if (activeAction === 'Add Card') {
      const ok = addWalletCard({
        label: actionForm.label,
        holder: actionForm.holder,
        last4: actionForm.last4,
        expires: actionForm.expires,
      });
      if (ok) {
        setActiveAction('');
        resetActionForm();
      }
    }
  }

  return (
    <Page className="z1">
      <div className="wallet-card" style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>TOTAL BALANCE</div>
          <div
            className="syne"
            style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}
          >
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: 12, opacity: 0.7, fontSize: 13 }}>Active account: {activeWallet?.name || 'Main Account'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>CARDHOLDER</div>
              <div style={{ fontWeight: 600 }}>{primaryCard?.holder || 'Aryan Mehta'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>EXPIRES</div>
              <div style={{ fontWeight: 600 }}>{primaryCard?.expires || '09/29'}</div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, alignSelf: 'end' }}>{walletCards.length} cards</div>
          </div>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <SectionHeader title="Accounts" action={<Btn variant="outline" onClick={() => openQuickAction('Add Account')}>Add Account</Btn>} />
        <div style={{ marginTop: 12, marginBottom: 16 }}>
          <div className="text2">Total Balance Across Accounts</div>
          <div className="sec-title">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {accounts.map((account) => (
            <div key={account.id} className="portfolio-table-row" style={{ alignItems: 'flex-start' }}>
              <div>
                <strong>{account.name}</strong>
                <div className="text2">{account.type}</div>
                {account.details?.accountHolderName ? <div className="tx-meta">Holder: {account.details.accountHolderName}</div> : null}
                {account.details?.bankName ? <div className="tx-meta">Bank: {account.details.bankName}</div> : null}
                {account.details?.accountNumber ? <div className="tx-meta">A/C: {account.details.accountNumber}</div> : null}
                {account.details?.upiId ? <div className="tx-meta">UPI: {account.details.upiId}</div> : null}
                {account.details?.cardLast4 ? <div className="tx-meta">Card: •••• {account.details.cardLast4}</div> : null}
                {account.details?.note ? <div className="tx-meta">{account.details.note}</div> : null}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="sec-title">₹{Number(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="dashboard-inline-actions" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <Btn size="sm" variant="outline" onClick={() => setActiveWallet(account.id)}>Use</Btn>
                  <Btn size="sm" variant="outline" onClick={() => {
                    setEditingAccountId(account.id);
                    setActionForm({
                      ...actionForm,
                      name: account.name,
                      type: account.type,
                      amount: String(account.balance),
                      accountHolderName: account.details?.accountHolderName || '',
                      bankName: account.details?.bankName || '',
                      accountNumber: account.details?.accountNumber || '',
                      upiId: account.details?.upiId || '',
                      cardLast4: account.details?.cardLast4 || '',
                      note: account.details?.note || '',
                    });
                    setActiveAction('Edit Account');
                  }}>Edit</Btn>
                  <Btn size="sm" variant="outline" onClick={() => {
                    setEditingAccountId(account.id);
                    setActiveAction('Add Money');
                  }}>Add Money</Btn>
                  <Btn size="sm" variant="outline" onClick={() => {
                    setEditingAccountId(account.id);
                    setActiveAction('Subtract Money');
                  }}>Subtract</Btn>
                  <Btn size="sm" variant="danger" onClick={() => deleteAccount(account.id)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Grid cols={3} gap={16} style={{ marginBottom: 24 }}>
        <Card>
          <div className="text2">Weekly Income</div>
          <div className="sec-title up">₹{weeklyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </Card>
        <Card>
          <div className="text2">Weekly Expense</div>
          <div className="sec-title down">₹{weeklyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </Card>
        <Card>
          <div className="text2">Net Cash Flow</div>
          <div className={`sec-title ${netCashFlow >= 0 ? 'up' : 'down'}`}>
            ₹{netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
      </Grid>

      <Grid cols={4} gap={16} style={{ marginBottom: 24 }}>
        {walletUi.quickActions.map((action) => (
          <Card
            key={action.label}
            style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={() => openQuickAction(action.label)}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: action.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: 22,
                color: action.color,
              }}
            >
              {action.icon}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</div>
          </Card>
        ))}
      </Grid>

      <Grid cols={2} gap={16}>
        <Card>
          <div className="sec-title" style={{ marginBottom: 16 }}>
            Transfer Out
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="To (UPI ID / Name)" value={sendTo} onChange={(event) => setSendTo(event.target.value)} placeholder="name@upi" />
            <Input
              label="Amount (₹)"
              type="number"
              value={sendAmt}
              onChange={(event) => setSendAmt(event.target.value)}
              placeholder="Enter amount"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {walletUi.quickAmounts.map((value) => (
                <Btn
                  key={value}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setSendAmt(String(value))}
                >
                  ₹{value}
                </Btn>
              ))}
            </div>
            <Btn variant="primary" className="w-full" onClick={handleSendMoney}>
              Send Money
            </Btn>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Wallet Transactions" action={<Tag variant="blue">Recent</Tag>} />
          <div>
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: 'var(--bg3)' }}>
                  {tx.source === 'portfolio' ? '📈' : tx.type === 'income' ? '💼' : tx.type === 'expense' ? '🧾' : '👤'}
                </div>
                <div className="tx-info">
                  <div className="tx-name">{tx.title || tx.note || 'Wallet activity'}</div>
                  <div className="tx-meta">{tx.source === 'portfolio' ? `Investment · ${tx.date}` : tx.date}</div>
                </div>
                <div className={`tx-amount ${['income', 'sell', 'dividend'].includes(tx.type) ? 'up' : 'down'}`}>
                  {['income', 'sell', 'dividend'].includes(tx.type) ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      {activeAction ? (
        <Modal title={activeAction} onClose={() => setActiveAction('')}>
          <div className="portfolio-goal-card">
            {activeAction === 'Add Account' || activeAction === 'Edit Account' ? (
              <>
                <Input label="Account name" value={actionForm.name} onChange={(event) => setActionForm((current) => ({ ...current, name: event.target.value }))} />
                <Input label="Opening balance" type="number" value={actionForm.amount} onChange={(event) => setActionForm((current) => ({ ...current, amount: event.target.value }))} />
                <Input label="Account type" value={actionForm.type} onChange={(event) => setActionForm((current) => ({ ...current, type: event.target.value }))} placeholder="cash, bank, upi, card..." />
                <Input label="Account holder" value={actionForm.accountHolderName} onChange={(event) => setActionForm((current) => ({ ...current, accountHolderName: event.target.value }))} />
                <Input label="Bank name" value={actionForm.bankName} onChange={(event) => setActionForm((current) => ({ ...current, bankName: event.target.value }))} />
                <Input label="Account number" value={actionForm.accountNumber} onChange={(event) => setActionForm((current) => ({ ...current, accountNumber: event.target.value }))} />
                <Input label="UPI ID" value={actionForm.upiId} onChange={(event) => setActionForm((current) => ({ ...current, upiId: event.target.value }))} />
                <Input label="Card last 4" value={actionForm.cardLast4} onChange={(event) => setActionForm((current) => ({ ...current, cardLast4: event.target.value.slice(0, 4) }))} />
                <Input label="Note" value={actionForm.note} onChange={(event) => setActionForm((current) => ({ ...current, note: event.target.value }))} />
              </>
            ) : activeAction === 'Add Card' ? (
              <>
                <Input label="Card label" value={actionForm.label} onChange={(event) => setActionForm((current) => ({ ...current, label: event.target.value }))} />
                <Input label="Cardholder" value={actionForm.holder} onChange={(event) => setActionForm((current) => ({ ...current, holder: event.target.value }))} />
                <div className="portfolio-form-grid portfolio-form-grid-simple">
                  <Input label="Last 4 digits" value={actionForm.last4} onChange={(event) => setActionForm((current) => ({ ...current, last4: event.target.value.slice(0, 4) }))} />
                  <Input label="Expires" value={actionForm.expires} onChange={(event) => setActionForm((current) => ({ ...current, expires: event.target.value }))} placeholder="MM/YY" />
                </div>
              </>
            ) : (
              <>
                <Input
                  label={activeAction === 'Transfer' ? 'To or leave blank for external payee' : activeAction === 'Add Expense' ? 'Expense title' : activeAction === 'Adjust Balance' || activeAction === 'Add Money' || activeAction === 'Subtract Money' ? 'Reason' : 'Income title'}
                  value={actionForm.name}
                  onChange={(event) => setActionForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={activeAction === 'Transfer' ? 'name@upi' : 'Enter name'}
                />
                {activeAction === 'Transfer' ? (
                  <Select
                    label="Destination account"
                    value={actionForm.targetAccountId}
                    onChange={(event) => setActionForm((current) => ({ ...current, targetAccountId: event.target.value }))}
                    options={[
                      { value: '', label: 'External transfer / payee' },
                      ...accounts.filter((account) => account.id !== activeWallet.id).map((account) => ({
                        value: account.id,
                        label: `${account.name} · ₹${Number(account.balance || 0).toLocaleString('en-IN')}`,
                      })),
                    ]}
                  />
                ) : null}
                <Input
                  label="Amount"
                  type="number"
                  value={actionForm.amount}
                  onChange={(event) => setActionForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Enter amount"
                />
                {activeAction === 'Adjust Balance' || activeAction === 'Add Money' || activeAction === 'Subtract Money' || activeAction === 'Transfer' ? (
                  <Input
                    label="Note"
                    value={actionForm.note}
                    onChange={(event) => setActionForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Optional note"
                  />
                ) : null}
              </>
            )}

            <div className="dashboard-inline-actions">
              <Btn variant="outline" onClick={() => setActiveAction('')}>Cancel</Btn>
              <Btn variant="primary" onClick={submitQuickAction}>
                {activeAction === 'Add Card' ? 'Save Card' : activeAction === 'Add Account' || activeAction === 'Edit Account' ? 'Save Account' : activeAction}
              </Btn>
            </div>
          </div>
        </Modal>
      ) : null}
    </Page>
  );
}
