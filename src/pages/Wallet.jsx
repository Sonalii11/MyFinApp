import React, { useMemo, useState } from 'react';
import { Page, Grid, Card, SectionHeader, Btn, Input, Tag } from '../components/UI';
import { useApp } from '../context/AppContext';

export default function Wallet() {
  const { walletBalance, walletTransactions, sendMoney, uiData } = useApp();
  const { wallet } = uiData;
  const [sendTo, setSendTo] = useState('');
  const [sendAmt, setSendAmt] = useState('');

  const recentTransactions = useMemo(() => walletTransactions.slice(0, 6), [walletTransactions]);

  function handleSendMoney() {
    const ok = sendMoney(sendTo, sendAmt);
    if (!ok) return;
    setSendTo('');
    setSendAmt('');
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
            ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: 12, opacity: 0.7, fontSize: 13 }}>•••• •••• •••• 4821</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>CARDHOLDER</div>
              <div style={{ fontWeight: 600 }}>Aryan Mehta</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>EXPIRES</div>
              <div style={{ fontWeight: 600 }}>09/29</div>
            </div>
            <div style={{ fontSize: 28, opacity: 0.6 }}>◎◎</div>
          </div>
        </div>
      </div>

      <Grid cols={4} gap={16} style={{ marginBottom: 24 }}>
        {wallet.quickActions.map((action) => (
          <Card
            key={action.label}
            style={{ textAlign: 'center', cursor: 'pointer' }}
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
            Send Money
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
              {wallet.quickAmounts.map((value) => (
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
          <SectionHeader title="Transactions" action={<Tag variant="blue">Recent</Tag>} />
          <div>
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: 'var(--bg3)' }}>
                  {tx.type === 'received' ? '💼' : '👤'}
                </div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name}</div>
                  <div className="tx-meta">{tx.time}</div>
                </div>
                <div className={`tx-amount ${tx.type === 'received' ? 'up' : 'down'}`}>
                  {tx.type === 'received' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </Page>
  );
}
