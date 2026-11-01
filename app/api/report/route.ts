import { NextResponse } from 'next/server';
import { ensureVoter, friendly, ipHash, rpc, sameOrigin } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  let postId: number;
  try {
    postId = Number((await req.json())?.postId);
    if (!Number.isSafeInteger(postId) || postId <= 0) throw new Error();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  try {
    const voter = await ensureVoter();
    const res = await rpc<{ status: string; hidden?: boolean }>('mo_report', {
      p_reporter: voter, p_ip: await ipHash(), p_post: postId,
    });
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: friendly(e) }, { status: 400 });
  }
}
