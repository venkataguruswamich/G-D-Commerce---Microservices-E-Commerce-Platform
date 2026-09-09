import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const PaymentMethodsContext = createContext(null);
const STORAGE_KEY = 'paymentMethods';

// The real payment-service only ever models `method` as an enum label
// ('SIMULATED'|'CARD'|'WALLET') — there is no card/UPI/bank vault on the
// backend. This context is a UI-only "saved payment methods" list, and it is
// deliberately structured so a full card number can never be stored, even
// locally: only `last4` exists on the shape, never a PAN field.
export function PaymentMethodsProvider({ children }) {
  const [methods, setMethods] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  }, [methods]);

  const addMethod = useCallback((method) => {
    setMethods((prev) => {
      const entry = {
        id: crypto.randomUUID(),
        type: method.type,
        nickname: method.nickname || '',
        brand: method.type === 'CARD' ? method.brand || '' : undefined,
        last4: method.type === 'CARD' ? method.last4 : undefined,
        expiry: method.type === 'CARD' ? method.expiry : undefined,
        upiId: method.type === 'UPI' ? method.upiId : undefined,
        bankName: method.type === 'NETBANKING' ? method.bankName : undefined,
        isDefault: prev.length === 0 ? true : !!method.isDefault,
      };
      return [...prev, entry];
    });
  }, []);

  const removeMethod = useCallback((id) => {
    setMethods((prev) => {
      const removed = prev.find((m) => m.id === id);
      const remaining = prev.filter((m) => m.id !== id);
      if (removed?.isDefault && remaining.length > 0 && !remaining.some((m) => m.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  }, []);

  const setDefaultMethod = useCallback((id) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }, []);

  const defaultMethod = useMemo(() => methods.find((m) => m.isDefault) || null, [methods]);

  const value = { methods, defaultMethod, addMethod, removeMethod, setDefaultMethod };

  return <PaymentMethodsContext.Provider value={value}>{children}</PaymentMethodsContext.Provider>;
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  return ctx;
}
