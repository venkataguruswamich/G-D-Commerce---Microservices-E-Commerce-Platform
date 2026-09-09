import React, { useState } from 'react';
import { Plus, Star } from 'lucide-react';
import AddressForm from '../../components/account/AddressForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAddressBook } from '../../context/AddressBookContext';
import { useNotify } from '../../context/NotificationContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const EMPTY_ADDRESS = { label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };

export default function AccountAddresses() {
  useDocumentTitle('Addresses');
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAddressBook();
  const notify = useNotify();

  const [editingId, setEditingId] = useState(null); // null = not editing, 'new' = adding
  const [draft, setDraft] = useState(EMPTY_ADDRESS);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const startAdd = () => {
    setDraft(EMPTY_ADDRESS);
    setEditingId('new');
  };

  const startEdit = (address) => {
    setDraft(address);
    setEditingId(address.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY_ADDRESS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId === 'new') {
      addAddress(draft);
      notify('Address added', 'success');
    } else {
      updateAddress(editingId, draft);
      notify('Address updated', 'success');
    }
    cancelEdit();
  };

  const confirmDelete = () => {
    removeAddress(pendingDeleteId);
    setPendingDeleteId(null);
    notify('Address removed', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {editingId ? (
        <Card padding="md">
          <h3 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">
            {editingId === 'new' ? 'Add a new address' : 'Edit address'}
          </h3>
          <form onSubmit={handleSubmit}>
            <AddressForm value={draft} onChange={setDraft} idPrefix="account-address" showLabel />
            <div className="mt-2 flex gap-3">
              <Button type="submit">Save Address</Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button onClick={startAdd} className="w-fit">
          <Plus className="h-4 w-4" />
          Add new address
        </Button>
      )}

      {addresses.length === 0 && !editingId && (
        <EmptyState icon="box" title="No saved addresses" description="Add an address to speed up checkout next time." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} padding="md" className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900 dark:text-white">{address.label || 'Address'}</p>
              {address.isDefault && (
                <span className="inline-flex items-center gap-1 text-caption font-medium text-brand-600 dark:text-brand-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Default
                </span>
              )}
            </div>
            <p className="text-small text-slate-600 dark:text-slate-300">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-small font-medium">
              {!address.isDefault && (
                <button type="button" onClick={() => setDefaultAddress(address.id)} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Set as default
                </button>
              )}
              <button type="button" onClick={() => startEdit(address)} className="text-slate-600 hover:text-brand-600 dark:text-slate-300">
                Edit
              </button>
              <button type="button" onClick={() => setPendingDeleteId(address.id)} className="text-danger-600 hover:text-danger-700">
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Remove address"
        message="Are you sure you want to remove this address?"
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
