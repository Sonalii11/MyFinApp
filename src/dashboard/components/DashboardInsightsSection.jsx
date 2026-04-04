import React from 'react';
import { Btn, Card, Tag } from '../../components/UI';

export function InsightContentCard({ item, onOpen }) {
  return (
    <Card className="dashboard-insight-card">
      {item.thumbnail ? <span className="dashboard-content-thumbnail">{item.thumbnail}</span> : null}
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <Btn variant="outline" size="sm" onClick={() => onOpen(item)}>{item.ctaLabel || 'Open'}</Btn>
    </Card>
  );
}

export function AIAssistantShortcutCard({ insights, onOpenAI }) {
  return (
    <Card className="dashboard-insight-card ai-shortcut">
      <Tag variant="purple">AI Assistant</Tag>
      <h3>AI Financial Assistant</h3>
      <p>{insights[0]?.description || 'Get quick help understanding spending patterns and budget signals.'}</p>
      <Btn variant="primary" size="sm" onClick={onOpenAI}>Open AI Assistant</Btn>
    </Card>
  );
}

export function DashboardInsightsSection({
  contentCards,
  aiInsights,
  onOpenContentCard,
  onOpenAI,
}) {
  return (
    <section className="dashboard-grid-section">
      <div className="dashboard-section-heading">
        <span className="dashboard-section-label">Discover / insights / promo</span>
        <h2 className="sec-title">Discover more with FinSphere</h2>
      </div>

      <div className="dashboard-insights-grid">
        {contentCards.map((item) => (
          <InsightContentCard key={item.id} item={item} onOpen={onOpenContentCard} />
        ))}
        <AIAssistantShortcutCard insights={aiInsights} onOpenAI={onOpenAI} />
      </div>
    </section>
  );
}
