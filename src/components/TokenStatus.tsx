"use client";
import { useEffect, useRef, useState } from "react";
import { CONTRACT_ADDRESS } from "@/lib/site";
import type { TokenPayload } from "@/lib/types";

const LIVE_POLL = 4_000;
const PRELAUNCH_POLL = 15_000;

const usd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;

const VENUES: Record<string, string> = {
  pumpfun: "Pump.fun",
  pumpswap: "PumpSwap",
  raydium: "Raydium",
  meteora: "Meteora",
  orca: "Orca",
};

export default function TokenStatus() {
  const [data, setData] = useState<TokenPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const last = useRef<TokenPayload | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      if (!document.hidden) {
        try {
          const res = await fetch("/api/token", { cache: "no-store" });
          const json = (await res.json()) as TokenPayload;
          // Never let a failed refresh wipe out real data we already showed.
          const next = json.status === "error" && last.current?.status === "live" ? last.current : json;
          last.current = next;
          if (alive) setData(next);
        } catch {
          if (alive && !last.current) setData({ status: "error", address: CONTRACT_ADDRESS, checkedAt: Date.now() });
        }
      }
      if (alive) timer = setTimeout(load, last.current?.status === "live" ? LIVE_POLL : PRELAUNCH_POLL);
    };
    load();
    const onVisible = () => { if (!document.hidden) { clearTimeout(timer); load(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => { alive = false; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const live = data?.status === "live" ? data : null;
  const venue = live?.venue ? VENUES[live.venue] ?? live.venue : null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(CONTRACT_ADDRESS); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <div className="status" aria-live="polite">
      <span className="st">
        <span className={`dot ${live ? "on" : ""}`} />
        <b>{live ? (venue ? `Live on ${venue}` : "Live") : data?.status === "error" ? "Data unavailable" : "Coming soon"}</b>
      </span>
      <span>
        {live?.metric === "fdv" ? "FDV" : "Market cap"}{" "}
        <b className="num">{live && live.marketCap !== null ? usd(live.marketCap) : live ? "—" : "Not launched"}</b>
        {live && live.change24h !== null && (
          <em className={live.change24h >= 0 ? "up" : "down"}>
            {live.change24h >= 0 ? "+" : ""}{live.change24h.toFixed(1)}%
          </em>
        )}
      </span>
      <button type="button" className="ca" onClick={copy} title={`Copy contract address ${CONTRACT_ADDRESS}`}>
        CA <b>{CONTRACT_ADDRESS.slice(0, 4)}…{CONTRACT_ADDRESS.slice(-4)}</b>
        <span className="cp">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
