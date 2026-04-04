import React from 'react';
import TransactionModal from './TransactionModal';

export default function ExpenseForm({ onClose }) {
  return <TransactionModal type="expense" onClose={onClose} />;
}
