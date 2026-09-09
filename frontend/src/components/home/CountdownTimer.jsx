import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Cosmetic urgency timer for "Deals of the Day" — counts down to local
 * midnight by default. Not tied to any real backend deal-expiry field (the
 * product model has no discount/deal concept at all).
 */
export default function CountdownTimer({ endTime, className = '' }) {
  const target = useMemo(() => endTime || endOfToday(), [endTime]);
  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-white ${className}`}>
      <Clock className="h-4 w-4 text-accent-400" aria-hidden="true" />
      <span className="text-small font-semibold tabular-nums">
        Ends in {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
