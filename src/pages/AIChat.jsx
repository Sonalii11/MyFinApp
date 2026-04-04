import React, { useMemo, useState } from 'react';
import { Page, Card, Btn } from '../components/UI';
import { useApp } from '../context/AppContext';

export default function AIChat() {
  const { uiData, helpers } = useApp();
  const { aiChat } = uiData;
  const { getAIReply } = helpers;
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: aiChat.greeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const hasTyping = useMemo(() => busy, [busy]);

  async function sendMessage(preset) {
    if (busy) return;
    const text = (preset || input).trim();
    if (!text) return;

    setInput('');
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text }]);
    setBusy(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setMessages((current) => [...current, { id: Date.now() + 1, role: 'ai', text: getAIReply(text) }]);
    setBusy(false);
  }

  return (
    <Page className="z1" style={{ paddingBottom: 0 }}>
      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 130px)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((message) =>
              message.role === 'ai' ? (
                <div key={message.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), var(--pink))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    ✦
                  </div>
                  <div className="chat-bubble chat-ai">{message.text}</div>
                </div>
              ) : (
                <div key={message.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'flex-end' }}>
                  <div className="chat-bubble chat-user">{message.text}</div>
                </div>
              )
            )}

            {hasTyping ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--pink))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  ✦
                </div>
                <div className="chat-bubble chat-ai" style={{ display: 'flex', gap: 4, padding: '14px 18px' }}>
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        animation: `bounce 0.8s ease ${dot * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage();
              }}
              className="input"
              placeholder="Ask about your finances…"
              style={{ flex: 1 }}
            />
            <Btn variant="primary" onClick={() => sendMessage()}>
              →
            </Btn>
          </div>
        </div>

        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div className="sec-title" style={{ marginBottom: 12 }}>
              Quick Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {aiChat.suggestions.map((suggestion) => (
                <Btn
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </Btn>
              ))}
            </div>
          </Card>

          <Card>
            <div className="sec-title" style={{ marginBottom: 12 }}>
              📊 Quick Stats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiChat.quickStats.map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="text2">{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
