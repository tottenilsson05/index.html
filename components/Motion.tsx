'use client';

import { useEffect, useRef, useState } from 'react';

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Thin green progress bar at the very top that follows page scroll. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

/** Little logo mustaches drifting up behind the page. */
export function MoParticles({ count = 12 }: { count?: number }) {
  const [items, setItems] = useState<{ left: number; size: number; dur: number; delay: number; rot: number; op: number }[]>([]);
  useEffect(() => {
    if (reduced()) return;
    const n = window.innerWidth < 700 ? Math.round(count / 2) : count;
    setItems(Array.from({ length: n }, () => ({
      left: Math.random() * 100,
      size: 22 + Math.random() * 34,
      dur: 18 + Math.random() * 22,
      delay: -Math.random() * 40,
      rot: -25 + Math.random() * 50,
      op: 0.12 + Math.random() * 0.18,
    })));
  }, [count]);
  return (
    <div className="mo-particles" aria-hidden="true">
      {items.map((p, i) => (
        <img
          key={i}
          src="/logo.png"
          alt=""
          style={{ left: `${p.left}%`, width: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ['--rot' as any]: `${p.rot}deg`, opacity: p.op }}
        />
      ))}
    </div>
  );
}

/** Banner that tilts toward the pointer in 3D with a moving glare. */
export function TiltBanner({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia('(hover: hover)').matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1100px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-3px)`;
        el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
        el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
      });
    };
    const leave = () => { cancelAnimationFrame(raf); el.style.transform = ''; };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, []);
  return <div className="tilt" ref={ref}>{children}<div className="glare" aria-hidden="true" /></div>;
}

/** Endless ribbon of the tagline. */
export function Marquee({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const row = (
    <div className="marquee-row">
      {items.concat(items).map((t, i) => (
        <span key={i}>{t}<img src="/logo.png" alt="" width={34} height={13} /></span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${reverse ? 'rev' : ''}`} aria-hidden="true">
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}

/** Burst of tiny mustaches from a point on screen (used when someone votes). */
export function burstMo(x: number, y: number, n = 14) {
  if (typeof document === 'undefined' || reduced()) return;
  for (let i = 0; i < n; i++) {
    const img = document.createElement('img');
    img.src = '/logo.png';
    img.alt = '';
    img.className = 'mo-burst';
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const d = 70 + Math.random() * 90;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    img.style.setProperty('--dy', `${Math.sin(a) * d - 60}px`);
    img.style.setProperty('--r', `${-180 + Math.random() * 360}deg`);
    img.style.width = `${18 + Math.random() * 18}px`;
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 1100);
  }
}

/** Counts a number up when it changes (for stats). */
export function useCountUp(target: number, ms = 700) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced() || from.current === target) { from.current = target; setV(target); return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setV(a + (target - a) * e);
      if (k < 1) raf = requestAnimationFrame(step); else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
