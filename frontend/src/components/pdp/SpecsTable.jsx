import React from 'react';

/**
 * `specs`: object of label -> value strings, from utils/merchandising.js —
 * the real Product model has no structured specifications field.
 */
export default function SpecsTable({ specs }) {
  const entries = Object.entries(specs || {});
  if (entries.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-small">
        <tbody>
          {entries.map(([label, value], i) => (
            <tr key={label} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              <th scope="row" className="w-1/3 px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                {label}
              </th>
              <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
