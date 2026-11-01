import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'crypto';
import { cookies, headers } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const serverKey = () => need('SERVER_KEY');

let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Call a key-protected RPC. Throws Error(code) using the DB exception message. */
export async function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}, withKey = true): Promise<T> {
  const { data, error } = await db().rpc(fn, withKey ? { p_key: serverKey(), ...args } : args);
  if (error) throw new Error(error.message || 'db_error');
  return data as T;
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
function safeEq(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

const VOTER_COOKIE = 'mo_vid';

/** Reads the signed anonymous voter id; returns null if missing/invalid. */
export async function readVoter(): Promise<string | null> {
  const c = (await cookies()).get(VOTER_COOKIE)?.value;
  if (!c) return null;
  const [id, sig] = c.split('.');
  if (!id || !sig || !/^[a-f0-9]{32}$/.test(id)) return null;
  return safeEq(sig, sign(id, need('VOTER_SECRET'))) ? id : null;
}

/** Returns a valid voter id, issuing a new signed cookie if needed. */
export async function ensureVoter(): Promise<string> {
  const existing = await readVoter();
  if (existing) return existing;
  const id = randomBytes(16).toString('hex');
  (await cookies()).set(VOTER_COOKIE, `${id}.${sign(id, need('VOTER_SECRET'))}`, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

export async function ipHash(): Promise<string> {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || '0.0.0.0').split(',')[0].trim();
  return createHash('sha256').update(ip + '|' + need('IP_SALT')).digest('hex');
}

/** Very small same-origin check for state-changing requests. */
export async function sameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get('origin');
  const host = h.get('x-forwarded-host') || h.get('host');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

// ---------- admin session ----------
const ADMIN_COOKIE = 'mo_admin';
export async function setAdminSession() {
  const exp = String(Date.now() + 1000 * 60 * 60 * 12);
  (await cookies()).set(ADMIN_COOKIE, `${exp}.${sign('admin:' + exp, need('ADMIN_SESSION_SECRET'))}`, {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 60 * 60 * 12,
  });
}
export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
export async function isAdmin(): Promise<boolean> {
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!c) return false;
  const [exp, sig] = c.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEq(sig, sign('admin:' + exp, need('ADMIN_SESSION_SECRET')));
}
export function checkAdminPassword(pw: string): boolean {
  const real = need('ADMIN_PASSWORD');
  const a = createHash('sha256').update(pw).digest();
  const b = createHash('sha256').update(real).digest();
  return timingSafeEqual(a, b);
}

export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Map DB exception codes to friendly text. */
export const FRIENDLY: Record<string, string> = {
  not_launched: 'Voting opens when $MO launches.',
  round_closed: 'That round just closed. Try again in a second.',
  post_not_found: 'That post is gone.',
  rate_limited: 'Slow down — too many attempts from your network.',
  already_voted: 'You already voted this round.',
  bad_caption: 'Caption must be 1–140 characters.',
  bad_x_handle: 'That X handle looks wrong.',
  bad_wallet: 'That is not a valid Solana address.',
  bad_upload: 'Upload expired. Please try again.',
  unauthorized: 'Server misconfigured.',
};
export function friendly(e: unknown): string {
  const m = errMsg(e);
  return FRIENDLY[m] || 'Something went wrong. Please try again.';
}
