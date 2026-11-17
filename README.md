# Together ($TOGETHER)

Better trenches. Better Christmas. Together.

Single-screen Christmas site: Next.js 15 · React 19 · Tailwind CSS 4 · Framer Motion. Deployed on Vercel.

## Run locally
```bash
npm install
npm run dev     # http://localhost:3000
```

## Token
- Contract (Pump.fun): `FBJU2Jms2XmVuq1SiZzecJYtGmu5hidCUywKNNvbpump` — set in `src/lib/site.ts`
- Pump.fun button → `https://pump.fun/coin/<CA>` · DexScreener button → `https://dexscreener.com/solana/<CA>`
- X button → `https://x.com/togethercoinPF` (`X_URL` in `src/lib/site.ts`, or the `NEXT_PUBLIC_X_URL` env var in Vercel)

## Launch detection & live data (`/api/token`)
Server route, no API keys needed. Providers in order, first match wins:
1. **DexScreener** – indexes Pump.fun bonding-curve pairs and DEX pairs after migration
2. **GeckoTerminal** – independent fallback
3. **Pump.fun API** – last resort if neither indexer knows the mint yet

Only data whose mint exactly equals the contract is used. Nothing is estimated: if a provider reports FDV
instead of market cap, the site labels it **FDV**. No provider knows the mint → "Coming soon".

Caching: 3 s when live / 15 s before launch (in-memory + CDN). Browsers poll every 4 s once live, 15 s before,
and pause in background tabs. A failed refresh never replaces a value that was already shown.

## Countdown
Fixed to **25 Dec 00:00 UTC** (same moment worldwide). Shows "Merry Christmas" on the day, then rolls to next year.

## Assets
- `public/together-banner.webp` – original artwork (never altered; effects are separate light layers)
- `public/logos/pumpfun.png` – official mark (Pump.fun GitHub organization avatar)
- `public/logos/dexscreener.png` – official mark (DexScreener docs icon, docs.dexscreener.com)
- `public/logos/x.svg` – official X logo (Simple Icons)
