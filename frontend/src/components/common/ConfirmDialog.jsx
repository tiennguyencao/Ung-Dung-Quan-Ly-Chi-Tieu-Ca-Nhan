import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import useLanguage from '../../hooks/useLanguage.js';

// Reused for every "delete" across Transactions/Categories/Budgets — one
// component, per the component hierarchy in ui-design-baseline-v1.0.md.
export default function ConfirmDialog({ open, onClose, title, message, confirmLabel = 'Delete', onConfirm }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-muted">{t(message)}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button variant="danger" onClick={handleConfirm} loading={loading}>
          {t(confirmLabel)}
        </Button>
      </div>
    </Modal>
  );
}
