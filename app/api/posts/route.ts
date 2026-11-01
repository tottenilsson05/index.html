import { NextResponse } from 'next/server';
import { db, ensureVoter, friendly, ipHash, rpc, sameOrigin, errMsg } from '@/lib/server';
import { isValidSolAddress } from '@/lib/solana';
import { BUCKET } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_BYTES = 6 * 1024 * 1024;

function sniff(buf: Uint8Array): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45) return 'image/webp';
  return null;
}

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  // Accepts multipart (the site) or JSON with a base64 image (API clients).
  let get: (k: string) => string;
  let buf: Uint8Array;
  try {
    if ((req.headers.get('content-type') || '').includes('application/json')) {
      const j = await req.json();
      get = (k) => String(j?.[k] ?? '');
      const b64 = String(j?.imageBase64 || '').replace(/^data:[^,]+,/, '');
      if (b64.length > MAX_BYTES * 1.4) return NextResponse.json({ error: 'Photo is too large (max 6 MB).' }, { status: 400 });
      buf = new Uint8Array(Buffer.from(b64, 'base64'));
    } else {
      const form = await req.formData();
      get = (k) => String(form.get(k) ?? '');
      const file = form.get('image');
      if (!(file instanceof Blob)) return NextResponse.json({ error: 'Add a photo of your mo.' }, { status: 400 });
      if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Photo is too large (max 6 MB).' }, { status: 400 });
      buf = new Uint8Array(await file.arrayBuffer());
    }
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  // honeypot: humans never fill this
  if (get('website').length > 0) return NextResponse.json({ ok: true });

  const caption = get('caption').trim();
  const wallet = get('wallet').trim();
  const xRaw = get('x').trim().replace(/^@/, '');

  if (buf.length === 0) return NextResponse.json({ error: 'Add a photo of your mo.' }, { status: 400 });
  if (buf.length > MAX_BYTES) return NextResponse.json({ error: 'Photo is too large (max 6 MB).' }, { status: 400 });
  if (caption.length < 1 || caption.length > 140) return NextResponse.json({ error: 'Caption must be 1–140 characters.' }, { status: 400 });
  if (!isValidSolAddress(wallet)) return NextResponse.json({ error: 'That is not a valid Solana wallet address.' }, { status: 400 });
  if (xRaw && !/^[A-Za-z0-9_]{1,15}$/.test(xRaw)) return NextResponse.json({ error: 'That X handle looks wrong.' }, { status: 400 });

  const type = sniff(buf);
  if (!type) return NextResponse.json({ error: 'Only JPG, PNG or WEBP photos.' }, { status: 400 });

  try {
    const voter = await ensureVoter();
    const ip = await ipHash();
    const path = await rpc<string>('mo_issue_upload', { p_voter: voter, p_ip: ip });
    const up = await db().storage.from(BUCKET).upload(path, buf, { contentType: type, upsert: false, cacheControl: '31536000' });
    if (up.error) throw new Error('upload_failed: ' + up.error.message);
    const url = db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const res = await rpc<{ id: number; short_id: string }>('mo_create_post', {
      p_voter: voter, p_ip: ip, p_path: path, p_url: url, p_caption: caption, p_x: xRaw || null, p_wallet: wallet,
    });
    return NextResponse.json({ ok: true, ...res, image_url: url });
  } catch (e) {
    const code = errMsg(e);
    if (code.startsWith('upload_failed')) {
      try { await rpc('mo_log_error', { p_source: 'upload', p_message: code }); } catch {}
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }
    return NextResponse.json({ error: friendly(e) }, { status: code === 'rate_limited' ? 429 : 400 });
  }
}
