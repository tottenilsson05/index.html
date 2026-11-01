import { NextResponse } from 'next/server';
import { isAdmin, rpc, sameOrigin, errMsg } from '@/lib/server';
import { pumpLaunchStatus, verifyMint, verifyPayoutTx } from '@/lib/solana';
import { LAMPORTS_PER_SOL } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  try {
    switch (b.action) {
      case 'settings': {
        const ca = String(b.ca || '').trim();
        if (ca) {
          const v = await verifyMint(ca);
          if (!v.ok) return NextResponse.json({ error: `CA rejected: ${v.reason}` }, { status: 400 });
        }
        await rpc('mo_admin_set_settings', {
          p_ca: ca || null, p_pump_url: String(b.pump_url || ''), p_x_url: String(b.x_url || ''), p_fee_tracking: Boolean(b.fee_tracking),
        });
        return NextResponse.json({ ok: true });
      }
      case 'launch': {
        if (b.confirm !== 'LAUNCH') return NextResponse.json({ error: 'Type LAUNCH to confirm' }, { status: 400 });
        const ov: any = await rpc('mo_admin_overview');
        const ca = ov?.settings?.ca;
        if (!ca) return NextResponse.json({ error: 'Save a contract address first' }, { status: 400 });
        const v = await pumpLaunchStatus(ca);
        if (!v.live) return NextResponse.json({ error: `Launch blocked: ${v.reason}` }, { status: 400 });
        const res = await rpc('mo_admin_launch');
        return NextResponse.json({ ok: true, settings: res });
      }
      case 'hide':
      case 'restore':
        await rpc('mo_admin_set_post_hidden', { p_post: Number(b.postId), p_hidden: b.action === 'hide' });
        return NextResponse.json({ ok: true });
      case 'set_fee': {
        const solAmt = Number(b.sol);
        if (!isFinite(solAmt) || solAmt < 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        await rpc('mo_admin_set_round_fee', {
          p_round: Number(b.round), p_lamports: Math.round(solAmt * LAMPORTS_PER_SOL), p_note: String(b.note || '').slice(0, 300),
        });
        return NextResponse.json({ ok: true });
      }
      case 'confirm_payout': {
        const round = Number(b.round);
        const sig = String(b.signature || '').trim();
        const target: any = await rpc('mo_admin_payout_target', { p_round: round });
        if (!target) return NextResponse.json({ error: 'No payout for that round' }, { status: 404 });
        if (target.status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 400 });
        const v = await verifyPayoutTx(sig, target.wallet, new Date(target.created_at));
        if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 400 });
        await rpc('mo_admin_confirm_payout', { p_round: round, p_sig: sig, p_verified: v.lamports });
        return NextResponse.json({ ok: true, lamports: v.lamports });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    try { await rpc('mo_log_error', { p_source: `admin_${b?.action}`, p_message: errMsg(e) }); } catch {}
    return NextResponse.json({ error: errMsg(e) }, { status: 400 });
  }
}
