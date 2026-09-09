import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const AddressBookContext = createContext(null);
const STORAGE_KEY = 'addresses';

// Address fields mirror the real backend's per-order `shippingAddress` JSONB
// shape exactly ({line1,line2,city,state,postalCode,country}) so a saved
// entry can be dropped straight into an order payload. `id`/`label`/
// `isDefault` are local-only bookkeeping — the backend has no address-book
// concept, so this list never leaves localStorage as its own entity.
export function AddressBookProvider({ children }) {
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = useCallback((address) => {
    setAddresses((prev) => {
      const entry = {
        id: crypto.randomUUID(),
        label: address.label || '',
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: prev.length === 0 ? true : !!address.isDefault,
      };
      return [...prev, entry];
    });
  }, []);

  const updateAddress = useCallback((id, patch) => {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, id: a.id } : a)));
  }, []);

  const removeAddress = useCallback((id) => {
    setAddresses((prev) => {
      const removed = prev.find((a) => a.id === id);
      const remaining = prev.filter((a) => a.id !== id);
      if (removed?.isDefault && remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  }, []);

  const setDefaultAddress = useCallback((id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault) || null, [addresses]);

  const value = { addresses, defaultAddress, addAddress, updateAddress, removeAddress, setDefaultAddress };

  return <AddressBookContext.Provider value={value}>{children}</AddressBookContext.Provider>;
}

export function useAddressBook() {
  const ctx = useContext(AddressBookContext);
  if (!ctx) throw new Error('useAddressBook must be used within an AddressBookProvider');
  return ctx;
}
