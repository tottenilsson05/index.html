import { NextResponse } from 'next/server';
import { ensureVoter, friendly, ipHash, rpc, sameOrigin, errMsg } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  let postId: number;
  try {
    const body = await req.json();
    postId = Number(body?.postId);
    if (!Number.isSafeInteger(postId) || postId <= 0) throw new Error();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  try {
    const voter = await ensureVoter();
    const res = await rpc<{ round_id: number; post_id: number; votes: number }>('mo_cast_vote', {
      p_voter: voter, p_ip: await ipHash(), p_post: postId,
    });
    return NextResponse.json(res);
  } catch (e) {
    const code = errMsg(e);
    const status = code === 'already_voted' ? 409 : code === 'rate_limited' ? 429 : 400;
    return NextResponse.json({ error: friendly(e), code }, { status });
  }
}
