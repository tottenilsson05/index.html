import { NextResponse } from 'next/server';
import { db, rpc, errMsg } from '@/lib/server';
import { creatorVaultLamports, fetchMarketCap, verifyMint } from '@/lib/solana';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Called every 30s by pg_cron (pg_net) in Supabase.
 * - refreshes market cap from a real source
 * - snapshots the creator-fee vault balance (if CREATOR_WALLET is set and fee tracking is on)
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const out: Record<string, unknown> = {};
  try {
    await rpc('mo_my_votes', { p_voter: 'healthcheck' });
    out.server_key = 'ok';
  } catch (e) {
    out.server_key = errMsg(e);
  }
  const { data: s } = await db().from('mo_settings').select('launched, ca, fee_tracking').eq('id', 1).single();
  if (!s?.ca) return NextResponse.json({ ...out, skipped: 'no_ca' });

  // Pre-launch: start round #001 only once the $MO mint actually exists on-chain (pump.fun creates it at launch).
  if (!s.launched) {
    try {
      const v = await verifyMint(s.ca);
      if (!v.ok) return NextResponse.json({ ...out, skipped: 'not_launched', reason: v.reason });
      await rpc('mo_admin_launch');
      out.launched = 'auto: mint verified on-chain';
    } catch (e) {
      const m = errMsg(e);
      if (m !== 'already_launched') {
        try { await rpc('mo_log_error', { p_source: 'auto_launch', p_message: m }); } catch {}
        return NextResponse.json({ ...out, skipped: 'not_launched', error: m });
      }
    }
  }

  try {
    const m = await fetchMarketCap(s.ca);
    if (m) {
      await rpc('mo_record_market', { p_mcap: m.mcap, p_source: m.source });
      out.mcap = m;
    } else {
      out.mcap = 'unavailable';
    }
  } catch (e) {
    out.mcapError = errMsg(e);
    try { await rpc('mo_log_error', { p_source: 'market_cap', p_message: errMsg(e) }); } catch {}
  }

  const creator = process.env.CREATOR_WALLET;
  if (s.fee_tracking && creator) {
    try {
      const v = await creatorVaultLamports(creator);
      await rpc('mo_record_fee_snapshot', { p_lamports: v.total, p_detail: v.detail });
      out.vault = v.total;
    } catch (e) {
      out.feeError = errMsg(e);
      try { await rpc('mo_log_error', { p_source: 'fee_snapshot', p_message: errMsg(e) }); } catch {}
    }
  } else if (s.fee_tracking && !creator) {
    out.feeError = 'CREATOR_WALLET env missing';
  }
  return NextResponse.json(out);
}
