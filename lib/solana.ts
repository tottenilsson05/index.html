import 'server-only';
import { PublicKey } from '@solana/web3.js';

const RPC = () => process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

const PUMP_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const PUMP_AMM_PROGRAM = new PublicKey('pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA');
const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1tzqVUkvBYhNnEuaR';
const ATA_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const WSOL = new PublicKey('So11111111111111111111111111111111111111112');

export async function rpcCall<T = any>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`rpc_http_${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(`rpc_${j.error.code}: ${j.error.message}`);
  return j.result as T;
}

export function isValidSolAddress(a: string): boolean {
  try {
    const pk = new PublicKey(a);
    return pk.toBase58() === a && PublicKey.isOnCurve(pk.toBytes());
  } catch {
    return false;
  }
}

/** Confirms the address is a real SPL token mint on mainnet. */
export async function verifyMint(ca: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    new PublicKey(ca);
  } catch {
    return { ok: false, reason: 'Not a valid address' };
  }
  const r = await rpcCall<any>('getAccountInfo', [ca, { encoding: 'jsonParsed', commitment: 'confirmed' }]);
  const v = r?.value;
  if (!v) return { ok: false, reason: 'Mint account not found on-chain' };
  const owner = v.owner as string;
  if (owner !== TOKEN_PROGRAM.toBase58() && owner !== TOKEN_2022) return { ok: false, reason: 'Account is not a token mint' };
  if (v.data?.parsed?.type !== 'mint') return { ok: false, reason: 'Account is not a token mint' };
  return { ok: true };
}

/**
 * Creator-fee balance currently sitting in the pump.fun creator vaults of CREATOR_WALLET:
 * bonding-curve vault (SOL) + PumpSwap creator vault (WSOL token account).
 * Note: vaults are per creator wallet, so a dedicated dev wallet is required for exact per-coin numbers.
 */
export async function creatorVaultLamports(creator: string): Promise<{ total: number; detail: Record<string, unknown> }> {
  const c = new PublicKey(creator);
  const [bcVault] = PublicKey.findProgramAddressSync([Buffer.from('creator-vault'), c.toBuffer()], PUMP_PROGRAM);
  const [ammAuth] = PublicKey.findProgramAddressSync([Buffer.from('creator_vault'), c.toBuffer()], PUMP_AMM_PROGRAM);
  const [ammAta] = PublicKey.findProgramAddressSync([ammAuth.toBuffer(), TOKEN_PROGRAM.toBuffer(), WSOL.toBuffer()], ATA_PROGRAM);
  const r = await rpcCall<any>('getMultipleAccounts', [[bcVault.toBase58(), ammAta.toBase58()], { encoding: 'jsonParsed', commitment: 'confirmed' }]);
  const bc = r?.value?.[0];
  const ata = r?.value?.[1];
  const bcLamports = bc ? Number(bc.lamports) : 0;
  const ataAmount = ata?.data?.parsed?.info?.tokenAmount?.amount ? Number(ata.data.parsed.info.tokenAmount.amount) : 0;
  return {
    total: bcLamports + ataAmount,
    detail: { bonding_vault: bcVault.toBase58(), bc_lamports: bcLamports, amm_vault_ata: ammAta.toBase58(), amm_wsol: ataAmount },
  };
}

/** Verifies a payout transaction and returns lamports received by `wallet`. */
export async function verifyPayoutTx(sig: string, wallet: string, notBefore: Date): Promise<{ ok: boolean; lamports?: number; reason?: string }> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(sig)) return { ok: false, reason: 'Invalid signature format' };
  const tx = await rpcCall<any>('getTransaction', [sig, { encoding: 'jsonParsed', commitment: 'confirmed', maxSupportedTransactionVersion: 0 }]);
  if (!tx) return { ok: false, reason: 'Transaction not found (yet). Wait for confirmation and retry.' };
  if (tx.meta?.err) return { ok: false, reason: 'Transaction failed on-chain' };
  if (tx.blockTime && tx.blockTime * 1000 < notBefore.getTime() - 60_000)
    return { ok: false, reason: 'Transaction is older than the round result' };
  const keys: string[] = (tx.transaction?.message?.accountKeys || []).map((k: any) => (typeof k === 'string' ? k : k.pubkey));
  const i = keys.indexOf(wallet);
  if (i < 0) return { ok: false, reason: 'Winner wallet is not part of this transaction' };
  const delta = Number(tx.meta.postBalances[i]) - Number(tx.meta.preBalances[i]);
  if (!(delta > 0)) return { ok: false, reason: 'Winner wallet did not receive SOL in this transaction' };
  return { ok: true, lamports: delta };
}

/** Market cap in USD from DexScreener, falling back to pump.fun's public coin endpoint. */
export async function fetchMarketCap(ca: string): Promise<{ mcap: number; source: string } | null> {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const j = await r.json();
      const pairs: any[] = (j.pairs || []).filter((p: any) => p.chainId === 'solana' && p.baseToken?.address === ca);
      pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      const m = pairs[0]?.marketCap ?? pairs[0]?.fdv;
      if (m && isFinite(m)) return { mcap: Number(m), source: 'dexscreener' };
    }
  } catch {}
  try {
    const r = await fetch(`https://frontend-api-v3.pump.fun/coins/${ca}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const j = await r.json();
      const m = j?.usd_market_cap;
      if (m && isFinite(m)) return { mcap: Number(m), source: 'pump.fun' };
    }
  } catch {}
  return null;
}
