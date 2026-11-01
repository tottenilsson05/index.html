import { LAMPORTS_PER_SOL } from './config';

export function sol(lamports: number | null | undefined, digits = 3): string {
  if (lamports == null) return '—';
  const v = Number(lamports) / LAMPORTS_PER_SOL;
  if (v === 0) return '0';
  if (v < 0.001) return v.toFixed(5);
  return v.toFixed(digits).replace(/\.?0+$/, (m) => (m.startsWith('.') ? '' : m));
}

export function usd(v: number | null | undefined): string {
  if (v == null || !isFinite(Number(v))) return '—';
  const n = Number(v);
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}

export function roundNo(n: number | null | undefined): string {
  return '#' + String(n ?? 0).padStart(3, '0');
}

export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

export function shortAddr(a: string | null | undefined): string {
  if (!a) return '';
  return a.length > 12 ? a.slice(0, 4) + '…' + a.slice(-4) : a;
}

export const payoutLabel: Record<string, string> = {
  pending: 'PENDING PAYMENT',
  paid: 'PAID',
  nothing_due: 'NO FEES THIS ROUND',
  awaiting_fees: 'FEES BEING COUNTED',
};

export function price(v: number | null | undefined): string {
  if (v == null || !isFinite(Number(v)) || Number(v) <= 0) return '—';
  const n = Number(v);
  if (n >= 1) return '$' + n.toFixed(2);
  const dec = Math.min(12, Math.max(4, -Math.floor(Math.log10(n)) + 3));
  return '$' + n.toFixed(dec);
}
