import React from 'react';
import { Page, Grid, StatCard, Card, Tag, ProgressBar, Btn } from '../components/UI';
import { useApp } from '../context/AppContext';

export default function Subscriptions() {
  const { subscriptions, removeSubscription, subscriptionSummary, uiData, helpers } = useApp();
  const { subscriptionBudget } = uiData;
  const { getRenewalDaysLeft } = helpers;
  const { total, annual, sorted } = subscriptionSummary;
  const percentage = Math.min(100, (total / subscriptionBudget) * 100);

  return (
    <Page className="z1">
      <Grid cols={3} gap={16} style={{ marginBottom: 24 }}>
        <StatCard label="Monthly Cost" value={`₹${total.toLocaleString('en-IN')}`} accent="var(--accent2)" />
        <StatCard label="Annual Cost" value={`₹${annual.toLocaleString('en-IN')}`} accent="var(--red)" />
        <StatCard label="Active Plans" value={String(subscriptions.length)} accent="var(--green)" />
      </Grid>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Subscription Budget Usage</span>
          <span style={{ fontSize: 14, color: 'var(--orange)' }}>
            ₹{total} / ₹{subscriptionBudget.toLocaleString('en-IN')}
          </span>
        </div>
        <ProgressBar value={percentage} max={100} color="linear-gradient(90deg,var(--accent),var(--pink))" />
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
          {total > subscriptionBudget
            ? `⚠️ ₹${total - subscriptionBudget} over budget — consider pausing some subscriptions`
            : `✓ ₹${subscriptionBudget - total} remaining in budget`}
        </div>
      </Card>

      <Grid cols={2} gap={12} style={{ marginBottom: 24 }}>
        {subscriptions.map((sub) => {
          const left = getRenewalDaysLeft(sub.date);
          const urgent = left <= 5;

          return (
            <div key={sub.id} className="sub-card">
              <div className="sub-logo" style={{ background: `${sub.color}22`, fontSize: 26 }}>
                {sub.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{sub.name}</span>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 16 }}>
                    ₹{sub.price}/mo
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <Tag variant="blue" style={{ fontSize: 10 }}>
                    {sub.tag}
                  </Tag>
                  <Tag variant={urgent ? 'red' : 'green'} style={{ fontSize: 10 }}>
                    {urgent ? `⚠️ Due ${sub.date}` : `✓ ${sub.date}`}
                  </Tag>
                </div>
              </div>
              <Btn
                variant="ghost"
                size="sm"
                style={{ color: 'var(--red)', border: 'none', fontSize: 16 }}
                onClick={() => removeSubscription(sub.id)}
              >
                ✕
              </Btn>
            </div>
          );
        })}
      </Grid>

      <Card>
        <div className="sec-title" style={{ marginBottom: 16 }}>
          📅 Upcoming Renewals
        </div>
        <div>
          {sorted.map((sub) => {
            const left = getRenewalDaysLeft(sub.date);
            return (
              <div
                key={sub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 22 }}>{sub.icon}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500 }}>{sub.name}</span>
                  <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 8 }}>{sub.date}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="syne" style={{ fontWeight: 700 }}>
                    ₹{sub.price}
                  </div>
                  <div style={{ fontSize: 12, color: left <= 5 ? 'var(--red)' : 'var(--text2)' }}>
                    {left <= 0 ? 'Due today!' : `in ${left} days`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Page>
  );
}
