import { NextResponse } from 'next/server';
import { checkAdminPassword, rpc, sameOrigin, setAdminSession } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  let pw = '';
  try { pw = String((await req.json())?.password || ''); } catch {}
  if (!pw || !checkAdminPassword(pw)) {
    await new Promise((r) => setTimeout(r, 900));
    try { await rpc('mo_log_error', { p_source: 'admin_login', p_message: 'failed login attempt' }); } catch {}
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
