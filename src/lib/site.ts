const env = (v: string | undefined) => (v && v.trim().length > 0 ? v.trim() : undefined);

/** Official $Together mint on Solana (launching on Pump.fun). */
export const CONTRACT_ADDRESS =
  env(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) ?? "F2NkmJrVJBnd9gg5snH5qF5Gg7E4MS7F3m7osWGspump";

export const SITE_URL = env(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://together-trenches.vercel.app";

/** Official X account. If emptied, the button shows "Soon" instead of a made-up link. */
export const X_URL = env(process.env.NEXT_PUBLIC_X_URL) ?? "https://x.com/togethercoinPF";

export const LINKS = {
  pumpfun: `https://pump.fun/coin/${CONTRACT_ADDRESS}`,
  dexscreener: `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`,
  x: X_URL,
};

/** Christmas = 25 December 00:00 UTC — one fixed moment worldwide. */
export const CHRISTMAS_LABEL = "Dec 25 · 00:00 UTC";

export function nextChristmas(now: number = Date.now()) {
  const year = new Date(now).getUTCFullYear();
  const thisYear = Date.UTC(year, 11, 25, 0, 0, 0);
  const endOfDay = Date.UTC(year, 11, 26, 0, 0, 0);
  if (now < thisYear) return { target: thisYear, isChristmas: false };
  if (now < endOfDay) return { target: thisYear, isChristmas: true };
  return { target: Date.UTC(year + 1, 11, 25, 0, 0, 0), isChristmas: false };
}
