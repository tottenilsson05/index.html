import { NextResponse } from 'next/server';
import { db, rpc, errMsg } from '@/lib/server';
import { creatorVaultLamports, fetchMarket, pumpLaunchStatus } from '@/lib/solana';
import { OFFICIAL_CA } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Monitor job. Called every 10s by pg_cron (pg_net) in Supabase, so it runs even when nobody has the site open.
 * 1. Pre-launch: checks Solana for the $MO mint + its pump.fun bonding curve. When both exist, launches once
 *    (mo_admin_launch is idempotent and row-locked, so repeated detections can never start a second round #1).
 * 2. Live: refreshes market cap, price and 24h volume from DexScreener (pump.fun API as fallback).
 * 3. Live: snapshots the creator-fee vaults of the coin's creator (read from the bonding curve on-chain,
 *    or CREATOR_WALLET if set). Round fees are computed from these snapshots in the database.
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const out: Record<string, unknown> = {};
  const log = async (source: string, e: unknown) => {
    out[source] = errMsg(e);
    try { await rpc('mo_log_error', { p_source: source, p_message: errMsg(e) }); } catch {}
  };

  const { data: s } = await db().from('mo_settings').select('launched, ca, fee_tracking, x_url').eq('id', 1).single();
  const ca: string = s?.ca || OFFICIAL_CA;
  if (s && !s.ca && !s.launched) {
    // store the official CA + Pump.fun link (pre-launch only; the CA is locked after launch)
    try {
      await rpc('mo_admin_set_settings', { p_ca: OFFICIAL_CA, p_pump_url: `https://pump.fun/coin/${OFFICIAL_CA}`, p_x_url: s.x_url || '', p_fee_tracking: true });
      out.ca = 'stored';
    } catch (e) { await log('store_ca', e); }
  }

  // ---- 1. launch detection (verified on-chain) ----
  let status: Awaited<ReturnType<typeof pumpLaunchStatus>> | null = null;
  try {
    status = await pumpLaunchStatus(ca);
    out.onchain = status.live ? 'live' : status.reason;
  } catch (e) {
    await log('launch_check', e);
  }
  if (!s?.launched) {
    if (!status?.live) return NextResponse.json({ ...out, state: 'launching_soon' });
    try {
      await rpc('mo_admin_launch');
      out.launched = 'auto: mint + pump.fun bonding curve verified on-chain';
    } catch (e) {
      if (errMsg(e) !== 'already_launched') { await log('auto_launch', e); return NextResponse.json(out); }
    }
  }

  // ---- 2. market data ----
  try {
    const m = await fetchMarket(ca);
    if (m) {
      try {
        await rpc('mo_record_market', { p_mcap: m.mcap, p_source: m.source, p_price: m.price, p_volume: m.volume24h });
      } catch {
        await rpc('mo_record_market', { p_mcap: m.mcap, p_source: m.source }); // older DB function without price/volume
      }
      out.market = m;
    } else out.market = 'unavailable';
  } catch (e) {
    await log('market', e);
  }

  // ---- 3. creator-fee vault snapshot ----
  const creator = process.env.CREATOR_WALLET || status?.creator;
  if (s?.fee_tracking !== false && creator) {
    try {
      const v = await creatorVaultLamports(creator);
      await rpc('mo_record_fee_snapshot', { p_lamports: v.total, p_detail: { ...v.detail, creator_source: process.env.CREATOR_WALLET ? 'env' : 'bonding_curve' } });
      out.vault = v.total;
    } catch (e) {
      await log('fee_snapshot', e);
    }
  } else if (!creator) {
    out.fees = 'creator wallet unknown';
  }
  return NextResponse.json(out);
}
