// Custom two-tone icons in the logo's language: dark-green outline + mustache-green fill.
const S = { stroke: 'var(--ink)', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function IconCamera(p: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={p.className} aria-hidden="true">
      <rect x="6" y="18" width="52" height="36" rx="9" fill="#fff" {...S} />
      <path d="M22 18l4-7h12l4 7" fill="var(--mint-2)" {...S} />
      <circle cx="32" cy="36" r="11" fill="var(--green)" {...S} />
      <path d="M27 32a6 6 0 0 1 5-3" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function IconVote(p: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={p.className} aria-hidden="true">
      <rect x="8" y="30" width="48" height="26" rx="7" fill="#fff" {...S} />
      <path d="M20 30V12h24v18" fill="var(--mint-2)" {...S} />
      <path d="M25 21l5 5 9-10" fill="none" {...S} stroke="var(--green-lo)" strokeWidth="4" />
      <path d="M8 40h48" fill="none" {...S} />
    </svg>
  );
}
export function IconTrophy(p: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={p.className} aria-hidden="true">
      <path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="var(--green)" {...S} />
      <path d="M18 13H9v4a9 9 0 0 0 9 9M46 13h9v4a9 9 0 0 1-9 9" fill="none" {...S} />
      <path d="M32 36v10M22 56h20l-3-10H25z" fill="#fff" {...S} />
      <path d="M24 14a5 5 0 0 1 4-3" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function IconPill(p: { className?: string }) {
  return (
    <svg viewBox="0 0 80 36" className={p.className} aria-hidden="true">
      <rect x="3" y="3" width="74" height="30" rx="15" fill="#fff" {...S} />
      <path d="M40 3h22a15 15 0 0 1 0 30H40z" fill="var(--green)" {...S} />
      <path d="M12 12a8 8 0 0 1 8-4" fill="none" stroke="var(--mint-2)" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 11h12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function IconFlag(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} aria-hidden="true" width="14" height="14">
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconCopy(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} aria-hidden="true" width="18" height="18">
      <rect x="8" y="8" width="12" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}
export function IconX(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} aria-hidden="true" width="18" height="18">
      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
export function IconPump(p: { className?: string }) {
  // generic capsule mark (pump.fun style pill) — drawn, not a copied logo
  return (
    <svg viewBox="0 0 24 24" className={p.className} aria-hidden="true" width="20" height="20">
      <g transform="rotate(-45 12 12)">
        <rect x="2.5" y="7.5" width="19" height="9" rx="4.5" fill="#fff" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7.5h5a4.5 4.5 0 0 1 0 9h-5z" fill="var(--green)" stroke="currentColor" strokeWidth="2" />
      </g>
    </svg>
  );
}
export function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 110" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9ecf8" />
        </linearGradient>
      </defs>
      <path d="M30 98c-16 0-26-11-26-24s11-24 25-23c3-19 19-32 38-30 9-13 26-19 42-13 14 5 22 17 24 30 6-3 13-4 20-2 15 4 23 18 21 32 14 2 22 13 21 24-1 6-6 6-6 6z" fill="url(#cg)" />
    </svg>
  );
}
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="#fff" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
