import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Btn } from '../components/UI';

function buildResponse(msg, ctx) {
  const m = msg.toLowerCase();
  const { totalSpent, income, savingsRate, budgetLeft, byCategory, expenses, budget } = ctx;
  const top = byCategory[0];

  if (m.includes('food') || m.includes('eat') || m.includes('zomato') || m.includes('swiggy')) {
    const foodAmt = byCategory.find(c => c.cat === 'Food')?.amount || 0;
    return `🍽️ **Food Spending Analysis**\n\nYou've spent ₹${foodAmt.toLocaleString()} on food this month — ${((foodAmt/totalSpent)*100).toFixed(0)}% of your total expenses.\n\n**Tips to save:**\n• Cook at home 3–4 days/week (saves ~₹800–1,200/mo)\n• Use Zomato Pro or Swiggy One for discounts\n• Batch grocery shopping on weekends`;
  }
  if (m.includes('save') || m.includes('saving')) {
    const canSave = income * 0.2 - (income - totalSpent);
    return `💡 **Savings Plan**\n\nYou're currently saving **${savingsRate}%** of your income.\n\n**Target: 20% rule** — You should save ₹${(income * 0.2).toLocaleString()}/month.\n\n**Quick wins:**\n• Cut subscriptions: saves ~₹500–900/mo\n• Reduce dining out by 30%: saves ~₹${Math.round(((byCategory.find(c=>c.cat==='Food')?.amount||0)*0.3)).toLocaleString()}\n• Automate SIP on salary day`;
  }
  if (m.includes('invest') || m.includes('sip') || m.includes('stock') || m.includes('portfolio')) {
    return `📈 **Investment Recommendations**\n\nBased on your savings rate of ${savingsRate}%:\n\n**Suggested allocation:**\n• 50% — NIFTY 50 Index Fund (low risk, 12% avg return)\n• 20% — Mid-cap Fund (moderate risk)\n• 20% — US Tech ETF (diversification)\n• 10% — Emergency fund / Gold\n\n**₹5,000/month SIP in NIFTY 50** → ₹9.2L in 10 years at 12% p.a.`;
  }
  if (m.includes('budget') || m.includes('spend') || m.includes('overspend')) {
    const pct = ((totalSpent / budget) * 100).toFixed(0);
    return `💰 **Budget Status**\n\nYou've used **${pct}%** of your ₹${budget.toLocaleString()} budget.\n\n**By Category:**\n${byCategory.slice(0,4).map(c => `• ${c.icon} ${c.cat}: ₹${c.amount.toLocaleString()} (${((c.amount/budget)*100).toFixed(0)}% of budget)`).join('\n')}\n\n${budgetLeft < 0 ? `⚠️ You're ₹${Math.abs(budgetLeft).toLocaleString()} over budget!` : `✅ ₹${budgetLeft.toLocaleString()} remaining this month.`}`;
  }
  if (m.includes('sub') || m.includes('netflix') || m.includes('spotify')) {
    return `📊 **Subscription Analysis**\n\nYou're spending on multiple subscriptions. Common duplicates to review:\n\n• Netflix + Hotstar = entertainment overlap → cancel one\n• Check if Amazon Prime is being used for shopping benefits\n• Notion free tier may cover your needs\n\n**Potential savings: ₹900–1,500/month** by pausing unused services.`;
  }
  if (m.includes('tip') || m.includes('suggest') || m.includes('advice')) {
    return `🎯 **Financial Tips for You**\n\n1. **50/30/20 Rule** — 50% needs, 30% wants, 20% savings\n2. **Emergency Fund** — Keep 3–6 months of expenses liquid\n3. **Automate** — Set SIPs and bill payments on autopay\n4. **Track Daily** — Review expenses every evening (5 min habit)\n5. **Tax Planning** — Use ₹1.5L 80C deductions via ELSS, PPF`;
  }
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) {
    return `👋 Hello! I'm **FinAI**, your personal financial assistant.\n\nI can see you have **${expenses.length} transactions** totaling ₹${totalSpent.toLocaleString()} this month.\n\nAsk me about:\n• Your spending patterns\n• How to save more\n• Investment advice\n• Budget analysis\n• Subscription review`;
  }
  if (m.includes('top') || m.includes('most') || m.includes('biggest')) {
    return `🔍 **Biggest Spending Categories**\n\n${byCategory.slice(0,5).map((c,i) => `${i+1}. ${c.icon} **${c.cat}** — ₹${c.amount.toLocaleString()} (${((c.amount/totalSpent)*100).toFixed(0)}%)`).join('\n')}\n\n${top ? `Your biggest category is **${top.cat}** at ₹${top.amount.toLocaleString()}. ${top.cat === 'Food' ? 'Consider meal prepping to reduce this.' : ''}` : ''}`;
  }
  return `I analyzed your finances. You have **${expenses.length} transactions** totaling ₹${totalSpent.toLocaleString()} this month.\n\nYour savings rate is **${savingsRate}%** and budget usage is **${((totalSpent/budget)*100).toFixed(0)}%**.\n\nTry asking about: food spending, savings tips, investment advice, or budget status!`;
}

function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={i} style={{ marginBottom: line === '' ? 4 : 0 }}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
      </div>
    );
  });
}

const SUGGESTIONS = [
  'Analyze my spending', 'How can I save more?', 'Investment tips',
  'Show budget status', 'Review subscriptions', 'What are my top expenses?',
];

export default function AIChat() {
  const ctx = useApp();
  const { expenses, totalSpent, byCategory } = ctx;
  const [msgs,    setMsgs]    = useState([{
    id: 1, role: 'ai',
    text: `👋 Hi! I'm **FinAI**, your personal financial assistant.\n\nI can see you have **${expenses.length} transactions** totaling ₹${totalSpent.toLocaleString()} this month.\n\nAsk me anything about your finances!`,
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMsgs(p => [...p, { id: Date.now(), role: 'user', text: msg }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const reply = buildResponse(msg, ctx);
    setMsgs(p => [...p, { id: Date.now() + 1, role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.35s ease' }}>
      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 140px)' }}>
        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
              {msgs.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-start' }}>
                  {m.role === 'ai' && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      ✦
                    </div>
                  )}
                  <div style={{
                    maxWidth: '72%', padding: '12px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.65,
                    ...(m.role === 'user'
                      ? { background: 'var(--accent)', color: '#fff', borderRadius: '16px 16px 4px 16px' }
                      : { background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: '16px 16px 16px 4px', color: 'var(--text)' }
                    ),
                    animation: 'fadeUp 0.25s ease',
                  }}>
                    {renderText(m.text)}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✦</div>
                  <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', display: 'flex', gap: 5 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 0.9s ease ${i * 0.18}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8, display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about your finances..."
                style={{
                  flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '11px 16px', color: 'var(--text)', fontSize: 14, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 12, padding: '11px 18px', cursor: 'pointer',
                  fontWeight: 700, fontSize: 16, opacity: loading ? 0.5 : 1,
                }}
              >→</button>
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div style={{ width: 230, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '8px 12px', color: 'var(--text2)',
                  fontSize: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                >{s}</button>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📊 Quick Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { l: 'Monthly Spend',  v: `₹${totalSpent.toLocaleString()}` },
                { l: 'Transactions',   v: expenses.length },
                { l: 'Top Category',   v: byCategory[0] ? `${byCategory[0].icon} ${byCategory[0].cat}` : '—' },
                { l: 'Savings Rate',   v: `${ctx.savingsRate}%` },
                { l: 'Budget Left',    v: `₹${Math.abs(ctx.budgetLeft).toLocaleString()}` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text2)' }}>{s.l}</span>
                  <span style={{ fontWeight: 700 }}>{s.v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
