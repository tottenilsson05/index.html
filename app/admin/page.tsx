'use client';

import { useCallback, useEffect, useState } from 'react';
import { payoutLabel, roundNo, sol, shortAddr, usd } from '@/lib/format';

type Tab = 'launch' | 'payouts' | 'rounds' | 'posts' | 'log';

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('payouts');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/overview', { cache: 'no-store' });
    if (r.status === 401) { setAuthed(false); return; }
    const j = await r.json();
    if (r.ok) { setAuthed(true); setData(j); } else setMsg({ ok: false, t: j.error });
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!authed) return; const t = setInterval(load, 15000); return () => clearInterval(t); }, [authed, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (r.ok) { setPw(''); load(); } else setMsg({ ok: false, t: 'Wrong password' });
  }

  async function act(body: Record<string, unknown>, okText: string) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/admin/action', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      setMsg(r.ok ? { ok: true, t: okText + (j.lamports ? ` (${sol(j.lamports, 6)} SOL verified)` : '') } : { ok: false, t: j.error || 'Failed' });
      if (r.ok) await load();
    } catch { setMsg({ ok: false, t: 'Network error' }); }
    setBusy(false);
  }

  if (authed === null) return <Shell><p>Loading…</p></Shell>;
  if (!authed) {
    return (
      <Shell>
        <form onSubmit={login} className="card" style={{ maxWidth: 420, margin: '60px auto', padding: 24, display: 'grid', gap: 14 }}>
          <img src="/logo.png" alt="" width={140} height={52} />
          <h1 className="d" style={{ fontSize: 34, margin: 0 }}>ADMIN</h1>
          <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Admin password" autoFocus autoComplete="current-password" />
          {msg && <div className="err">{msg.t}</div>}
          <button className="btn btn-green" disabled={busy}>{busy ? '…' : 'Log in'}</button>
        </form>
      </Shell>
    );
  }
  if (!data) return <Shell><p>Loading…</p></Shell>;

  const s = data.settings;
  return (
    <Shell>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '24px 0' }}>
        <div>
          <div className="eyebrow">Post Your Mo · control room</div>
          <h1 className="d" style={{ fontSize: 40, margin: 0 }}>ADMIN</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn btn-sm" href="/">View site</a>
          <button className="btn btn-sm" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); setAuthed(false); }}>Log out</button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 }}>
        <Kv k="Status" v={s.launched ? 'LIVE' : 'PRE-LAUNCH'} />
        <Kv k="Launched at" v={s.launch_at ? new Date(s.launch_at).toLocaleString() : '—'} />
        <Kv k="Last tick" v={s.last_tick_at ? ago(s.last_tick_at) : '—'} />
        <Kv k="Market cap" v={s.market_cap_usd != null ? `${usd(s.market_cap_usd)} · ${ago(s.mcap_updated_at)}` : '—'} />
        <Kv k="Fee tracking" v={s.fee_tracking ? (data.env.creator_wallet_set ? `ON · ${s.fee_updated_at ? ago(s.fee_updated_at) : 'no data yet'}` : 'ON · CREATOR_WALLET missing!') : 'OFF'} />
        <Kv k="Unpaid" v={`${data.totals.unpaid_count} · ${sol(data.totals.unpaid_lamports)} SOL`} />
        <Kv k="Paid total" v={`${sol(data.totals.paid_lamports)} SOL`} />
      </div>

      <div className="seg" role="tablist" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
        {(['payouts', 'launch', 'rounds', 'posts', 'log'] as Tab[]).map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {msg && <div className={msg.ok ? 'chip chip-green' : 'err'} style={{ marginBottom: 14, height: 'auto', padding: '10px 14px', whiteSpace: 'normal' }}>{msg.t}</div>}

      {tab === 'launch' && <LaunchTab s={s} busy={busy} act={act} />}
      {tab === 'payouts' && <PayoutsTab rows={data.payouts} busy={busy} act={act} />}
      {tab === 'rounds' && <RoundsTab rows={data.rounds} snapshots={data.snapshots} busy={busy} act={act} />}
      {tab === 'posts' && <PostsTab rows={data.posts} busy={busy} act={act} />}
      {tab === 'log' && <LogTab audit={data.audit} errors={data.errors} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="wrap" style={{ paddingBottom: 80 }}>{children}</main>;
}
function Kv({ k, v }: { k: string; v: string }) {
  return <div><div className="eyebrow" style={{ fontSize: 10 }}>{k}</div><div style={{ fontWeight: 900, fontSize: 15, wordBreak: 'break-word' }}>{v}</div></div>;
}
function ago(ts: string) {
  const s = Math.round((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.round(s / 60)}m ago`; return `${Math.round(s / 3600)}h ago`;
}
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const td: React.CSSProperties = { padding: '10px 8px', borderBottom: '2px dashed var(--mint-2)', verticalAlign: 'middle', textAlign: 'left' };

function LaunchTab({ s, busy, act }: any) {
  const [ca, setCa] = useState(s.ca || '');
  const [pump, setPump] = useState(s.pump_url || '');
  const [x, setX] = useState(s.x_url || '');
  const [ft, setFt] = useState(!!s.fee_tracking);
  const [confirm, setConfirm] = useState('');
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <h2 className="d" style={{ fontSize: 26, margin: 0 }}>Coin settings</h2>
        <div className="field"><label>Contract address (pump.fun mint)</label>
          <input className="input" value={ca} onChange={(e) => setCa(e.target.value.trim())} disabled={s.launched} placeholder="…pump" />
          <div className="hint">Verified on-chain as a real token mint before saving. Locked after launch.</div></div>
        <div className="field"><label>Pump.fun link</label><input className="input" value={pump} onChange={(e) => setPump(e.target.value)} placeholder="https://pump.fun/coin/…" /></div>
        <div className="field"><label>X link</label><input className="input" value={x} onChange={(e) => setX(e.target.value)} placeholder="https://x.com/…" /></div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}>
          <input type="checkbox" checked={ft} onChange={(e) => setFt(e.target.checked)} style={{ width: 20, height: 20 }} />
          Track creator fees from the creator vault (needs CREATOR_WALLET env on Vercel)
        </label>
        <button className="btn btn-green" disabled={busy} onClick={() => act({ action: 'settings', ca, pump_url: pump, x_url: x, fee_tracking: ft }, 'Settings saved')}>Save settings</button>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <h2 className="d" style={{ fontSize: 26, margin: 0 }}>Launch</h2>
        {s.launched ? (
          <p style={{ fontWeight: 800, margin: 0 }}>Live since {new Date(s.launch_at).toLocaleString()}. Rounds run every {s.round_seconds / 60} minutes.</p>
        ) : (
          <>
            <p style={{ fontWeight: 700, margin: 0 }}>
              Only press this once $MO is actually live on pump.fun. It verifies the saved CA on-chain, then starts round #001 and the 5-minute clock for everyone. This cannot be undone.
            </p>
            <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type LAUNCH to confirm" />
            <button className="btn btn-ink" disabled={busy || confirm !== 'LAUNCH' || !s.ca} onClick={() => act({ action: 'launch', confirm }, 'Launched! Round #001 is live.')}>Start the competition</button>
          </>
        )}
      </div>
    </div>
  );
}

function PayoutsTab({ rows, busy, act }: any) {
  const [sig, setSig] = useState<Record<number, string>>({});
  if (!rows.length) return <div className="card" style={{ padding: 20 }}>No winners yet.</div>;
  return (
    <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
      <table style={tbl}>
        <thead><tr>{['Round', 'Winner', 'Wallet', 'Amount due', 'Status', 'Payout tx'].map((h) => <th key={h} style={{ ...td, fontSize: 11, letterSpacing: '.12em' }}>{h.toUpperCase()}</th>)}</tr></thead>
        <tbody>
          {rows.map((p: any) => (
            <tr key={p.round_id}>
              <td style={td}><b>{roundNo(p.round_id)}</b></td>
              <td style={td}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><img src={p.image_url} alt="" width={44} height={44} style={{ borderRadius: 8, border: '2px solid var(--ink)', objectFit: 'cover' }} />{p.short_id} · {p.votes}v</div></td>
              <td style={td}>
                <button className="linkbtn" onClick={() => navigator.clipboard?.writeText(p.wallet)} title={p.wallet}>{shortAddr(p.wallet)} ⧉</button>
              </td>
              <td style={td}><b>{p.amount_lamports == null ? 'awaiting fees' : `${sol(p.amount_lamports, 6)} SOL`}</b></td>
              <td style={td}><span className={`chip ${p.status === 'paid' ? 'chip-green' : 'chip-mint'}`}>{payoutLabel[p.status]}</span></td>
              <td style={td}>
                {p.status === 'paid' ? (
                  <a className="linkbtn" href={`https://solscan.io/tx/${p.tx_signature}`} target="_blank" rel="noreferrer">{shortAddr(p.tx_signature)} ↗ ({sol(p.verified_lamports, 6)})</a>
                ) : (
                  <div style={{ display: 'flex', gap: 6, minWidth: 260 }}>
                    <input className="input" style={{ height: 40, fontSize: 13 }} placeholder="Tx signature" value={sig[p.round_id] || ''} onChange={(e) => setSig({ ...sig, [p.round_id]: e.target.value.trim() })} />
                    <button className="btn btn-sm btn-green" disabled={busy || !sig[p.round_id]} onClick={() => act({ action: 'confirm_payout', round: p.round_id, signature: sig[p.round_id] }, `Round ${p.round_id} marked PAID`)}>Verify</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint" style={{ padding: '10px 8px 0' }}>Send SOL manually from your wallet, then paste the signature. It is checked on-chain: the winner wallet must have received SOL in that transaction.</p>
    </div>
  );
}

function RoundsTab({ rows, snapshots, busy, act }: any) {
  const [fee, setFee] = useState<Record<number, string>>({});
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>{['Round', 'Ended', 'Votes', 'Winner', 'Fees', 'Fee status', 'Override (SOL)'].map((h) => <th key={h} style={{ ...td, fontSize: 11, letterSpacing: '.12em' }}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td style={td}><b>{roundNo(r.id)}</b></td>
                <td style={td}>{new Date(r.ends_at).toLocaleTimeString()}</td>
                <td style={td}>{r.total_votes}</td>
                <td style={td}>{r.winner_post_id ? `#${r.winner_post_id} (${r.winner_votes}v)` : '—'}</td>
                <td style={td}>{r.fee_lamports == null ? '—' : `${sol(r.fee_lamports, 6)} SOL`}</td>
                <td style={td}>{r.fee_status}</td>
                <td style={td}>
                  {r.winner_post_id ? (
                    <div style={{ display: 'flex', gap: 6, minWidth: 180 }}>
                      <input className="input" style={{ height: 40, fontSize: 13 }} inputMode="decimal" placeholder="0.00" value={fee[r.id] || ''} onChange={(e) => setFee({ ...fee, [r.id]: e.target.value })} />
                      <button className="btn btn-sm" disabled={busy || fee[r.id] == null || fee[r.id] === ''} onClick={() => act({ action: 'set_fee', round: r.id, sol: Number(fee[r.id]), note: 'manual reconciliation' }, `Round ${r.id} fee set`)}>Set</button>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 8 }}>No finished rounds yet.</p>}
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3 className="d" style={{ fontSize: 22, margin: '0 0 8px' }}>Creator vault snapshots</h3>
        {snapshots.length ? snapshots.map((x: any) => <div key={x.id} style={{ fontWeight: 700, fontSize: 13 }}>{new Date(x.taken_at).toLocaleTimeString()} — {sol(x.vault_lamports, 6)} SOL</div>) : <p className="hint">None yet. Turn on fee tracking and set CREATOR_WALLET.</p>}
      </div>
    </div>
  );
}

function PostsTab({ rows, busy, act }: any) {
  const [filter, setFilter] = useState<'all' | 'reported' | 'hidden'>('reported');
  const list = rows.filter((p: any) => filter === 'all' || (filter === 'hidden' ? p.hidden : p.report_count > 0));
  return (
    <>
      <div className="seg" style={{ marginBottom: 14 }}>
        {(['reported', 'hidden', 'all'] as const).map((f) => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="grid">
        {list.map((p: any) => (
          <div key={p.id} className="card" style={{ overflow: 'hidden', opacity: p.hidden ? 0.7 : 1 }}>
            <img src={p.image_url} alt="" style={{ aspectRatio: '1/1', objectFit: 'cover', width: '100%', borderBottom: '3px solid var(--ink)' }} />
            <div style={{ padding: 12, display: 'grid', gap: 6 }}>
              <b>{p.short_id} · “{p.caption}”</b>
              <span className="hint">{p.x_handle ? '@' + p.x_handle + ' · ' : ''}{shortAddr(p.wallet)} · {p.report_count} reports{p.hidden ? ` · HIDDEN (${p.hidden_reason})` : ''}</span>
              {p.hidden ? (
                <button className="btn btn-sm btn-green" disabled={busy} onClick={() => act({ action: 'restore', postId: p.id }, 'Post restored')}>Restore</button>
              ) : (
                <button className="btn btn-sm btn-ink" disabled={busy} onClick={() => act({ action: 'hide', postId: p.id }, 'Post hidden')}>Hide</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {!list.length && <div className="card" style={{ padding: 20 }}>Nothing here.</div>}
    </>
  );
}

function LogTab({ audit, errors }: any) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card" style={{ padding: 16 }}>
        <h3 className="d" style={{ fontSize: 22, margin: '0 0 8px' }}>Failed operations</h3>
        {errors.length ? errors.map((e: any) => <div key={e.id} style={{ fontSize: 13, fontWeight: 700, padding: '4px 0' }}>{new Date(e.at).toLocaleString()} · <b>{e.source}</b> · {e.message}</div>) : <p className="hint">No errors.</p>}
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3 className="d" style={{ fontSize: 22, margin: '0 0 8px' }}>Admin audit log</h3>
        {audit.length ? audit.map((a: any) => <div key={a.id} style={{ fontSize: 13, fontWeight: 700, padding: '4px 0', wordBreak: 'break-word' }}>{new Date(a.at).toLocaleString()} · <b>{a.action}</b> · {JSON.stringify(a.detail)}</div>) : <p className="hint">Nothing yet.</p>}
      </div>
    </div>
  );
}
