import { NextResponse } from 'next/server';
import { ensureVoter, rpc } from '@/lib/server';

export const dynamic = 'force-dynamic';

/** Issues the anonymous voter credential and returns which post this visitor voted for in recent rounds. */
export async function GET() {
  try {
    const voter = await ensureVoter();
    const votes = await rpc<Record<string, number>>('mo_my_votes', { p_voter: voter });
    return NextResponse.json({ votes }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return NextResponse.json({ votes: {} }, { status: 200, headers: { 'cache-control': 'no-store' } });
  }
}
