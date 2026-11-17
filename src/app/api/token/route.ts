import { NextResponse } from "next/server";
import { CONTRACT_ADDRESS } from "@/lib/site";
import type { TokenPayload } from "@/lib/types";

/**
 * Live token data with launch detection.
 * Providers are tried in order; the first one that knows the token wins:
 *   1. DexScreener  — indexes Pump.fun bonding-curve pairs and DEX pairs after migration
 *   2. GeckoTerminal — independent fallback, also covers Pump.fun pools
 *   3. Pump.fun     — its own API, used only if both indexers have nothing yet
 * If none of them know the mint, the token has not launched (or is not indexed yet) → "prelaunch".
 * Responses are cached briefly (in memory + CDN) so traffic never multiplies provider requests.
 */
export const dynamic = "force-dynamic";

const ADDRESS = CONTRACT_ADDRESS;
const LIVE_TTL = 3_000;
const PRELAUNCH_TTL = 15_000;

let cache: { at: number; ttl: number; body: TokenPayload } | null = null;
let inflight: Promise<TokenPayload> | null = null;

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
};

async function getJson(url: string, ms = 3500): Promise<unknown> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(ms),
    headers: { Accept: "application/json", "User-Agent": "together-site/1.0" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("json")) throw new Error(`${url} not json`);
  return res.json();
}

type DexPair = {
  dexId?: string;
  priceUsd?: string;
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
  priceChange?: { h24?: number };
  baseToken?: { address?: string };
};

async function fromDexScreener(): Promise<TokenPayload | null> {
  const data = (await getJson(`https://api.dexscreener.com/tokens/v1/solana/${ADDRESS}`)) as DexPair[] | null;
  // Only pairs where OUR mint is the base token — never another token's data.
  const pairs = (Array.isArray(data) ? data : []).filter((p) => p.baseToken?.address === ADDRESS);
  if (!pairs.length) return null;
  const best = [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  const mcap = num(best.marketCap);
  const fdv = num(best.fdv);
  return {
    status: "live",
    address: ADDRESS,
    marketCap: mcap ?? fdv,
    metric: mcap !== null ? "mcap" : "fdv",
    priceUsd: num(best.priceUsd),
    change24h: typeof best.priceChange?.h24 === "number" ? best.priceChange.h24 : null,
    venue: best.dexId ?? null,
    source: "dexscreener",
    checkedAt: Date.now(),
  };
}

async function fromGeckoTerminal(): Promise<TokenPayload | null> {
  const data = (await getJson(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${ADDRESS}`)) as {
    data?: { attributes?: { address?: string; market_cap_usd?: string | null; fdv_usd?: string | null; price_usd?: string | null } };
  } | null;
  const a = data?.data?.attributes;
  if (!a || a.address !== ADDRESS) return null;
  const mcap = num(a.market_cap_usd);
  const fdv = num(a.fdv_usd);
  if (mcap === null && fdv === null && num(a.price_usd) === null) return null;
  return {
    status: "live",
    address: ADDRESS,
    marketCap: mcap ?? fdv,
    metric: mcap !== null ? "mcap" : "fdv",
    priceUsd: num(a.price_usd),
    change24h: null,
    venue: null,
    source: "geckoterminal",
    checkedAt: Date.now(),
  };
}

async function fromPumpFun(): Promise<TokenPayload | null> {
  const c = (await getJson(`https://frontend-api-v3.pump.fun/coins/${ADDRESS}`, 2500)) as {
    mint?: string;
    usd_market_cap?: number;
    complete?: boolean;
  } | null;
  if (!c || c.mint !== ADDRESS) return null;
  const mcap = num(c.usd_market_cap);
  return {
    status: "live",
    address: ADDRESS,
    marketCap: mcap,
    metric: "mcap",
    priceUsd: null,
    change24h: null,
    venue: c.complete ? "pumpswap" : "pumpfun",
    source: "pumpfun",
    checkedAt: Date.now(),
  };
}

async function resolve(): Promise<TokenPayload> {
  let failures = 0;
  for (const provider of [fromDexScreener, fromGeckoTerminal, fromPumpFun]) {
    try {
      const r = await provider();
      if (r) return r;
    } catch {
      failures++;
    }
  }
  // All three failed outright → unknown; otherwise nobody knows the mint yet → pre-launch.
  return failures === 3
    ? { status: "error", address: ADDRESS, checkedAt: Date.now() }
    : { status: "prelaunch", address: ADDRESS, checkedAt: Date.now() };
}

export async function GET() {
  const now = Date.now();
  if (!cache || now - cache.at > cache.ttl) {
    inflight ??= resolve().finally(() => (inflight = null));
    const body = await inflight;
    // Keep the last good live value if a refresh errors.
    const keep = body.status === "error" && cache?.body.status === "live";
    cache = { at: now, ttl: body.status === "live" ? LIVE_TTL : PRELAUNCH_TTL, body: keep ? cache!.body : body };
  }
  const ttl = Math.round(cache.ttl / 1000);
  return NextResponse.json(cache.body, {
    headers: { "Cache-Control": `public, max-age=0, s-maxage=${ttl}, stale-while-revalidate=${ttl * 4}` },
  });
}
