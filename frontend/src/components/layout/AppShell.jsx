import { useState, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import OfflineBanner from './OfflineBanner';
import TransactionFormModal from '../transactions/TransactionFormModal';
import useToast from '../../hooks/useToast';

// Shell owns the Transaction modal (mounted once, opened from any screen) and
// a refreshKey bumped on every save/delete, so whichever page is currently
// mounted can re-fetch — component hierarchy in ui-design-baseline-v1.0.md.
export default function AppShell() {
  const [txnModal, setTxnModal] = useState({ open: false, editing: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const { addToast } = useToast();

  const openAddTransaction = useCallback(() => setTxnModal({ open: true, editing: null }), []);
  const openEditTransaction = useCallback((txn) => setTxnModal({ open: true, editing: txn }), []);
  const closeTransactionModal = useCallback(() => setTxnModal({ open: false, editing: null }), []);

  function handleSaved(message) {
    closeTransactionModal();
    setRefreshKey((k) => k + 1);
    addToast(message);
  }

  const outletContext = useMemo(
    () => ({ openEditTransaction, refreshKey, notify: addToast }),
    [openEditTransaction, refreshKey, addToast]
  );

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <OfflineBanner />
        <TopBar onAddTransaction={openAddTransaction} />
        <main className="flex-1 p-4 md:p-8">
          <Outlet context={outletContext} />
        </main>
      </div>
      <BottomNav onAddTransaction={openAddTransaction} />
      <TransactionFormModal
        open={txnModal.open}
        editing={txnModal.editing}
        onClose={closeTransactionModal}
        onSaved={handleSaved}
      />
    </div>
  );
}
