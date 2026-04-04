import React from 'react';
import { Grid, StatCard } from './UI';
import { formatCurrency } from '../utils/finance';

export default function SummaryCards({ cards }) {
  return (
    <Grid cols={4} gap={16} style={{ marginBottom: 24 }}>
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.isPercent ? `${card.value.toFixed(0)}%` : formatCurrency(card.value)}
          sub={card.sub}
          accent={card.accent}
        />
      ))}
    </Grid>
  );
}
