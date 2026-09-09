export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  if (Math.abs(value) >= 100000 || Math.abs(value) < .001) return value.toExponential(2);
  return Number(value.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
}
