import Image from "next/image";
import { LINKS } from "@/lib/site";

type B = { label: string; href: string; icon: string; w: number; h: number };
const BUTTONS: B[] = [
  { label: "Pump.fun", href: LINKS.pumpfun, icon: "/logos/pumpfun.png", w: 20, h: 20 },
  { label: "X", href: LINKS.x, icon: "/logos/x.svg", w: 17, h: 17 },
  { label: "DexScreener", href: LINKS.dexscreener, icon: "/logos/dexscreener.png", w: 21, h: 21 },
];

export default function LinkButtons() {
  return (
    <>
      {BUTTONS.map((b) =>
        b.href ? (
          <a key={b.label} className="btn" href={b.href} target="_blank" rel="noopener noreferrer" aria-label={`${b.label} (opens in a new tab)`}>
            <span className="ico"><Image src={b.icon} alt="" width={b.w} height={b.h} unoptimized /></span>
            {b.label}
          </a>
        ) : (
          <span key={b.label} className="btn soon" aria-disabled="true" title="Official X account coming soon">
            <span className="ico"><Image src={b.icon} alt="" width={b.w} height={b.h} unoptimized /></span>
            {b.label}<small>Soon</small>
          </span>
        )
      )}
    </>
  );
}
