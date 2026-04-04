import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar  from './components/Topbar';
import { Toast } from './components/UI';
import TransactionModal from './components/TransactionModal';
import Dashboard     from './pages/Dashboard';
import Expenses      from './pages/Expenses';
import Wallet        from './pages/Wallet';
import Investments   from './pages/Investments';
import Subscriptions from './pages/Subscriptions';
import AIChat        from './pages/AIChat';

function GlowBg() {
  return (
    <div className="bg-glow" aria-hidden="true">
      <div className="glow-dot glow-1" />
      <div className="glow-dot glow-2" />
      <div className="glow-dot glow-3" />
    </div>
  );
}

function RoutedPages() {
  const location = useLocation();
  const { toast, transactionModal, closeTransactionModal } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="*" element={<Navigate to="/" replace state={{ from: location }} />} />
      </Routes>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {transactionModal?.isOpen ? (
        <TransactionModal type={transactionModal.type} onClose={closeTransactionModal} />
      ) : null}
    </>
  );
}

function AppShell() {
  return (
    <>
      <GlowBg />
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <RoutedPages />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
