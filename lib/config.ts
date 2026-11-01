// Public values (safe to ship to the browser).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vmpwizdfwxkeukznlibm.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcHdpemRmd3hrZXVrem5saWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTUyMjgsImV4cCI6MjEwODg3MTIyOH0.gBhfNturoapFrBanQ1m5yT9ZuluyrwYAkLoJhhJaBCo';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://postyourmo.vercel.app';
export const BUCKET = 'mo-images';
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Official $MO token (pump.fun). Having a CA does NOT mean the coin is live; launch is detected on-chain.
export const OFFICIAL_CA = 'HAB42JadC7ETDGEWCuLBGVkSBgBaREE25THCo5tspump';
export const PUMP_URL = `https://pump.fun/coin/${OFFICIAL_CA}`;
export const DEX_URL = `https://dexscreener.com/solana/${OFFICIAL_CA}`;
