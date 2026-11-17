"use client";
import { useEffect, useRef } from "react";

type Flake = { x: number; y: number; r: number; vy: number; amp: number; phase: number; o: number; layer: number };

/**
 * Three-depth canvas snowfall using a pre-rendered soft sprite (cheap to draw).
 * Pauses in background tabs; static and sparse with reduced motion.
 */
export default function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // soft round sprite
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);

    // far, mid, near
    const LAYERS = [
      { share: 0.55, r: [0.6, 1.3], vy: [0.18, 0.32], o: [0.25, 0.5] },
      { share: 0.35, r: [1.3, 2.2], vy: [0.32, 0.55], o: [0.45, 0.75] },
      { share: 0.1, r: [2.6, 4.2], vy: [0.6, 0.95], o: [0.35, 0.6] },
    ];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    let w = 0, h = 0, raf = 0, flakes: Flake[] = [], t = 0;
    const make = (layer: number, anyY: boolean): Flake => {
      const L = LAYERS[layer];
      return {
        x: Math.random() * w, y: anyY ? Math.random() * h : -12,
        r: rnd(L.r[0], L.r[1]), vy: rnd(L.vy[0], L.vy[1]),
        amp: rnd(0.15, 0.45) * (layer + 1) * 0.5, phase: Math.random() * Math.PI * 2,
        o: rnd(L.o[0], L.o[1]), layer,
      };
    };
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const total = Math.round(Math.min(120, (w * h) / 14000) * (reduced ? 0.35 : 1));
      flakes = [];
      LAYERS.forEach((L, i) => { for (let k = 0; k < Math.round(total * L.share); k++) flakes.push(make(i, true)); });
    };
    const draw = () => {
      t += 1 / 60;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        if (!reduced) {
          f.y += f.vy;
          f.x += Math.sin(t * 0.9 + f.phase) * f.amp * 0.4;
          if (f.y > h + 12) Object.assign(f, make(f.layer, false));
        }
        const d = f.r * 2.4;
        ctx.globalAlpha = f.o;
        ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden id="snow" />;
}
