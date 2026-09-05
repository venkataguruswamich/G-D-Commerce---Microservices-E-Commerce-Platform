export function formatMoney(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((cents || 0) / 100);
}

export function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
}
