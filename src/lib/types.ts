export type TokenPayload =
  | { status: "prelaunch"; address: string; checkedAt: number }
  | { status: "error"; address: string; checkedAt: number }
  | {
      status: "live";
      address: string;
      /** USD market cap as reported by the provider (never estimated by us). */
      marketCap: number | null;
      /** "mcap" = provider-reported market cap, "fdv" = provider-reported fully diluted value. */
      metric: "mcap" | "fdv";
      priceUsd: number | null;
      change24h: number | null;
      /** Where the token currently trades, e.g. "pumpfun" (bonding curve), "pumpswap", "raydium". */
      venue: string | null;
      source: "dexscreener" | "geckoterminal" | "pumpfun";
      checkedAt: number;
    };
