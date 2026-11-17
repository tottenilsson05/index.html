import Image from "next/image";

// Tree-light positions measured on the original artwork (% of the square image).
const TREE_LIGHTS: [number, number][] = [
  [9.6, 38.9], [10.4, 40.8], [10.5, 44.0], [12.1, 44.6], [5.4, 47.2], [12.4, 47.7], [7.2, 49.4],
  [3.6, 53.1], [13.4, 53.2], [11.4, 56.0], [8.6, 57.9], [5.6, 59.1], [2.2, 59.9], [14.4, 63.6],
  [16.9, 64.2], [5.8, 64.6], [14.4, 65.8],
];
const FENCE_LIGHTS: [number, number][] = [[83.5, 66.8], [86.4, 66.2], [89.2, 65.4], [92.4, 64.9], [95.6, 65.6]];

const SIZES = "(max-width: 899px) 100vw, 60vw";

/**
 * One continuous scene. The original artwork is never altered: every effect is a soft
 * light layer placed on top of it, aligned to the painting's own lights and rainbow.
 */
export default function Scene() {
  return (
    <div className="scene" aria-hidden>
      <div className="ext" />
      <div className="art">
        <Image src="/together-banner.webp" alt="" fill priority sizes={SIZES} />
        {/* the two friends breathe: a feathered copy of the same pixels, scaled by <1% from the ground up */}
        <div className="breathe">
          <Image src="/together-banner.webp" alt="" fill sizes={SIZES} />
        </div>
        <div className="rainbow" />
        <div className="ambient" />
        <span className="star" style={{ left: "9.3%", top: "33.9%" }} />
        {TREE_LIGHTS.map(([x, y], i) => (
          <span key={i} className="tl" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.73) % 4}s`, animationDuration: `${3 + (i % 4) * 0.7}s` }} />
        ))}
        {FENCE_LIGHTS.map(([x, y], i) => (
          <span key={`f${i}`} className="tl sm" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 1.1) % 4}s` }} />
        ))}
        <span className="win" style={{ left: "91.6%", top: "54.2%" }} />
      </div>
      <div className="shade" />
    </div>
  );
}
