import React, { useState } from 'react';
import { Plus, Star, CreditCard, Smartphone, Landmark } from 'lucide-react';
import FormField from '../../components/FormField';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { usePaymentMethods } from '../../context/PaymentMethodsContext';
import { useNotify } from '../../context/NotificationContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const EMPTY_METHOD = { type: 'CARD', nickname: '', brand: 'Visa', last4: '', expiry: '', upiId: '', bankName: '' };
const TYPE_ICON = { CARD: CreditCard, UPI: Smartphone, NETBANKING: Landmark };

function describe(method) {
  if (method.type === 'CARD') return `${method.brand} •••• ${method.last4} · Exp ${method.expiry}`;
  if (method.type === 'UPI') return method.upiId;
  return method.bankName;
}

export default function AccountPaymentMethods() {
  useDocumentTitle('Payment Methods');
  const { methods, addMethod, removeMethod, setDefaultMethod } = usePaymentMethods();
  const notify = useNotify();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_METHOD);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const update = (field) => (e) => setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (draft.type === 'CARD' && !/^\d{4}$/.test(draft.last4)) {
      notify('Enter the last 4 digits of the card', 'error');
      return;
    }
    addMethod(draft);
    notify('Payment method added', 'success');
    setDraft(EMPTY_METHOD);
    setAdding(false);
  };

  const confirmDelete = () => {
    removeMethod(pendingDeleteId);
    setPendingDeleteId(null);
    notify('Payment method removed', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-small text-slate-500 dark:text-slate-400">
        For your security, we never ask for or store a full card number here — only the last 4 digits, so you can
        recognize a saved method at checkout.
      </p>

      {adding ? (
        <Card padding="md">
          <h3 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Add a payment method</h3>
          <form onSubmit={handleSubmit}>
            <FormField label="Type" id="pm-type">
              <Select id="pm-type" value={draft.type} onChange={update('type')}>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="NETBANKING">Net Banking</option>
              </Select>
            </FormField>

            {draft.type === 'CARD' && (
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <FormField label="Card brand" id="pm-brand">
                  <Select id="pm-brand" value={draft.brand} onChange={update('brand')}>
                    <option>Visa</option>
                    <option>Mastercard</option>
                    <option>Amex</option>
                  </Select>
                </FormField>
                <FormField label="Last 4 digits" id="pm-last4">
                  <Input id="pm-last4" required maxLength={4} inputMode="numeric" value={draft.last4} onChange={update('last4')} />
                </FormField>
                <FormField label="Expiry (MM/YY)" id="pm-expiry">
                  <Input id="pm-expiry" required placeholder="04/28" value={draft.expiry} onChange={update('expiry')} />
                </FormField>
              </div>
            )}

            {draft.type === 'UPI' && (
              <FormField label="UPI ID" id="pm-upi">
                <Input id="pm-upi" required placeholder="name@bank" value={draft.upiId} onChange={update('upiId')} />
              </FormField>
            )}

            {draft.type === 'NETBANKING' && (
              <FormField label="Bank name" id="pm-bank">
                <Input id="pm-bank" required value={draft.bankName} onChange={update('bankName')} />
              </FormField>
            )}

            <FormField label="Nickname (optional)" id="pm-nickname">
              <Input id="pm-nickname" value={draft.nickname} onChange={update('nickname')} placeholder="Personal card" />
            </FormField>

            <div className="mt-2 flex gap-3">
              <Button type="submit">Save Method</Button>
              <Button type="button" variant="secondary" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button onClick={() => setAdding(true)} className="w-fit">
          <Plus className="h-4 w-4" />
          Add payment method
        </Button>
      )}

      {methods.length === 0 && !adding && (
        <EmptyState icon="box" title="No saved payment methods" description="Add a card, UPI ID, or bank account for faster checkout." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {methods.map((method) => {
          const Icon = TYPE_ICON[method.type];
          return (
            <Card key={method.id} padding="md" className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  {method.nickname || method.type}
                </p>
                {method.isDefault && (
                  <span className="inline-flex items-center gap-1 text-caption font-medium text-brand-600 dark:text-brand-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Default
                  </span>
                )}
              </div>
              <p className="text-small text-slate-600 dark:text-slate-300">{describe(method)}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-small font-medium">
                {!method.isDefault && (
                  <button type="button" onClick={() => setDefaultMethod(method.id)} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    Set as default
                  </button>
                )}
                <button type="button" onClick={() => setPendingDeleteId(method.id)} className="text-danger-600 hover:text-danger-700">
                  Remove
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Remove payment method"
        message="Are you sure you want to remove this payment method?"
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
