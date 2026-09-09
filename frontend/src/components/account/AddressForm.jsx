import React from 'react';
import FormField from '../FormField';
import { Input } from '../ui/Input';

/**
 * Pure controlled field set — shared by Checkout's inline shipping form and
 * the Account > Addresses add/edit form. Fields mirror the real backend's
 * per-order `shippingAddress` JSONB shape exactly (line1/line2/city/state/
 * postalCode/country); `label` is local-only (address-book bookkeeping) and
 * only rendered when `showLabel` is set.
 */
export default function AddressForm({ value, onChange, idPrefix = 'address', showLabel = false }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      {showLabel && (
        <FormField label="Label (e.g. Home, Work)" id={`${idPrefix}-label`}>
          <Input id={`${idPrefix}-label`} value={value.label || ''} onChange={set('label')} placeholder="Home" />
        </FormField>
      )}
      <FormField label="Address Line 1" id={`${idPrefix}-line1`}>
        <Input id={`${idPrefix}-line1`} required value={value.line1 || ''} onChange={set('line1')} />
      </FormField>
      <FormField label="Address Line 2 (optional)" id={`${idPrefix}-line2`}>
        <Input id={`${idPrefix}-line2`} value={value.line2 || ''} onChange={set('line2')} />
      </FormField>
      <FormField label="City" id={`${idPrefix}-city`}>
        <Input id={`${idPrefix}-city`} required value={value.city || ''} onChange={set('city')} />
      </FormField>
      <FormField label="State" id={`${idPrefix}-state`}>
        <Input id={`${idPrefix}-state`} required value={value.state || ''} onChange={set('state')} />
      </FormField>
      <FormField label="Postal Code" id={`${idPrefix}-postalCode`}>
        <Input id={`${idPrefix}-postalCode`} required value={value.postalCode || ''} onChange={set('postalCode')} />
      </FormField>
      <FormField label="Country" id={`${idPrefix}-country`}>
        <Input id={`${idPrefix}-country`} required value={value.country || ''} onChange={set('country')} />
      </FormField>
    </div>
  );
}
