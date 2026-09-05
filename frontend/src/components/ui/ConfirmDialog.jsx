import React from 'react';
import Modal from '../Modal';
import Button from './Button';

/**
 * Accessible replacement for `window.confirm()` — that blocks the tab,
 * can't be styled, and freezes any in-flight animation. Built on the same
 * Modal (focus trap + Escape) used everywhere else.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-small text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  );
}
