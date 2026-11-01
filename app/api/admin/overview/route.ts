import { NextResponse } from 'next/server';
import { isAdmin, rpc, errMsg } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const data = await rpc('mo_admin_overview');
    return NextResponse.json({
      ...(data as object),
      env: {
        creator_wallet_set: Boolean(process.env.CREATOR_WALLET),
        rpc_custom: Boolean(process.env.SOLANA_RPC_URL),
      },
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}
