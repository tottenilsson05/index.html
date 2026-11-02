'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supa } from '@/lib/browser';
import type { Post, PublicState, Winner } from '@/lib/types';
import { X_URL } from '@/lib/config';
import { clock, payoutLabel, roundNo, sol, usd, shortAddr, price } from '@/lib/format';
import { Cloud, IconCamera, IconCopy, IconFlag, IconPill, IconPump, IconTrophy, IconVote, IconX, Sparkle } from './Icons';
import UploadModal from './UploadModal';
import { Marquee, MoParticles, ScrollProgress, TiltBanner, burstMo } from './Motion';

type Initial = { state: PublicState | null; posts: Post[]; winners: Winner[]; winnersTotal: number; counts: Record<number, number> };
type Sort = 'top' | 'new' | 'random';
const PAGE = 8;

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
}

function useTick(ms = 250) {
  const [, set] = useState(0);
  useEffect(() => { const t = setInterval(() => set((x) => x + 1), ms); return () => clearInterval(t); }, [ms]);
}

function remainingMs(state: PublicState | null, offset: number) {
  if (!state?.round) return null;
  return new Date(state.round.ends_at).getTime() - (Date.now() + offset);
}

function fresh(ts: string | null | undefined, ms: number, offset: number) {
  return !!ts && Date.now() + offset - new Date(ts).getTime() < ms;
}

/* ------------------------------------------------------------------ */
/* app                                                                 */
/* ------------------------------------------------------------------ */
export default function MoApp({ initial }: { initial: Initial }) {
  const [state, setState] = useState<PublicState | null>(initial.state);
  const [offset, setOffset] = useState(() => (initial.state ? new Date(initial.state.server_now).getTime() - Date.now() : 0));
  const [posts, setPosts] = useState<Post[]>(initial.posts);
  const [counts, setCounts] = useState<Record<number, number>>(initial.counts);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [winners, setWinners] = useState<Winner[]>(initial.winners);
  const [winnersTotal, setWinnersTotal] = useState(initial.winnersTotal);
  const [hofPage, setHofPage] = useState(0);
  const [sort, setSort] = useState<Sort>('top');
  const [seed, setSeed] = useState(1);
  const [show, setShow] = useState(24);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [bumped, setBumped] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<{ round: number; winner: Winner | null } | null>(null);
  const [rtOk, setRtOk] = useState(true);
  const [reported, setReported] = useState<Set<number>>(new Set());
  const roundRef = useRef<number | null>(initial.state?.round?.id ?? null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useReveal();

  const say = useCallback((m: string) => { setFlash(m); setTimeout(() => setFlash((f) => (f === m ? null : f)), 2600); }, []);

  /* ---------- data loaders ---------- */
  const refreshState = useCallback(async () => {
    const t0 = Date.now();
    const { data, error } = await supa().rpc('mo_public_state');
    if (error || !data) return;
    const t1 = Date.now();
    const s = data as PublicState;
    setOffset(new Date(s.server_now).getTime() - (t0 + t1) / 2);
    setState(s);
  }, []);

  const loadCounts = useCallback(async (roundId: number | null | undefined) => {
    if (!roundId) { setCounts({}); return; }
    const { data } = await supa().from('mo_vote_counts').select('post_id, votes').eq('round_id', roundId);
    const c: Record<number, number> = {};
    (data || []).forEach((r: any) => (c[r.post_id] = r.votes));
    setCounts(c);
  }, []);

  const loadPosts = useCallback(async () => {
    const { data } = await supa().from('mo_posts').select('id, short_id, image_url, caption, x_handle, created_at')
      .order('created_at', { ascending: false }).limit(300);
    if (data) setPosts(data as Post[]);
  }, []);

  const loadWinners = useCallback(async (page: number) => {
    const { data, count } = await supa().from('mo_winners').select('*', { count: 'exact' })
      .order('round_id', { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (data) setWinners(data as Winner[]);
    if (count != null) setWinnersTotal(count);
  }, []);

  const loadMine = useCallback(async () => {
    try {
      const r = await fetch('/api/me', { cache: 'no-store' });
      const j = await r.json();
      setMyVotes(j.votes || {});
    } catch {}
  }, []);

  useEffect(() => { loadMine(); }, [loadMine]);

  /* ---------- round transitions ---------- */
  useEffect(() => {
    const id = state?.round?.id ?? null;
    const prev = roundRef.current;
    if (id !== prev) {
      roundRef.current = id;
      loadCounts(id);
      if (prev != null && id != null && id > prev) {
        (async () => {
          const { data } = await supa().from('mo_winners').select('*').eq('round_id', prev).maybeSingle();
          setToast({ round: prev, winner: (data as Winner) || null });
          loadWinners(0); setHofPage(0);
          loadMine();
        })();
      }
    }
  }, [state?.round?.id, loadCounts, loadWinners, loadMine]);

  /* ---------- polling (authoritative fallback) ---------- */
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      if (!alive) return;
      await refreshState();
      const rem = remainingMs(stateRef.current, offset);
      const fast = stateRef.current?.launched && (rem == null || rem < 1500);
      timer = setTimeout(loop, fast ? 1000 : 5000);
    };
    timer = setTimeout(loop, 5000);
    const onVis = () => { if (document.visibilityState === 'visible') { refreshState(); loadPosts(); loadCounts(roundRef.current); } };
    document.addEventListener('visibilitychange', onVis);
    return () => { alive = false; clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
  }, [refreshState, offset, loadPosts, loadCounts]);

  useEffect(() => {
    // safety net: re-sync gallery + counts (fast when realtime is down)
    const t = setInterval(() => { loadCounts(roundRef.current); loadPosts(); }, rtOk ? 30000 : 4000);
    return () => clearInterval(t);
  }, [rtOk, loadCounts, loadPosts]);

  /* ---------- realtime ---------- */
  useEffect(() => {
    const ch = supa().channel('mo-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mo_posts' }, (p: any) => {
        const n = p.new as Post & { hidden?: boolean };
        if (n.hidden) return;
        setPosts((ps) => (ps.some((x) => x.id === n.id) ? ps : [n, ...ps]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mo_posts' }, (p: any) => {
        const n = p.new as Post & { hidden?: boolean };
        setPosts((ps) => (n.hidden ? ps.filter((x) => x.id !== n.id) : ps.map((x) => (x.id === n.id ? { ...x, ...n } : x))));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mo_vote_counts' }, (p: any) => {
        const n = p.new as { round_id: number; post_id: number; votes: number };
        if (!n || n.round_id !== roundRef.current) return;
        setCounts((c) => ({ ...c, [n.post_id]: Math.max(c[n.post_id] || 0, n.votes) }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mo_rounds' }, () => refreshState())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mo_winners' }, () => { refreshState(); loadWinners(0); })
      .subscribe((status) => setRtOk(status === 'SUBSCRIBED'));
    return () => { supa().removeChannel(ch); };
  }, [refreshState, loadWinners]);

  /* ---------- actions ---------- */
  const roundId = state?.round?.id ?? null;
  const votedFor = roundId != null ? myVotes[String(roundId)] : undefined;

  async function vote(postId: number, ev?: React.MouseEvent) {
    const pt = ev ? { x: ev.clientX, y: ev.clientY } : null;
    if (!state?.launched) { say('Voting opens when $MO launches.'); return; }
    if (!roundId || votedFor) return;
    setBusy(postId);
    try {
      const r = await fetch('/api/vote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId }) });
      const j = await r.json();
      if (r.ok) {
        setMyVotes((m) => ({ ...m, [String(j.round_id)]: postId }));
        if (j.round_id === roundRef.current) setCounts((c) => ({ ...c, [postId]: Math.max(c[postId] || 0, j.votes) }));
        setBumped(postId); setTimeout(() => setBumped(null), 600);
        if (pt) burstMo(pt.x, pt.y);
        say('Vote locked in. 🥸');
      } else {
        if (j.code === 'already_voted') loadMine();
        if (j.code === 'round_closed') refreshState();
        say(j.error || 'Vote failed');
      }
    } catch { say('Network error. Try again.'); }
    setBusy(null);
  }

  async function report(postId: number) {
    if (reported.has(postId)) return;
    if (!window.confirm('Report this post as inappropriate?')) return;
    try {
      const r = await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId }) });
      const j = await r.json();
      if (r.ok) {
        setReported((s) => new Set(s).add(postId));
        if (j.hidden) setPosts((ps) => ps.filter((p) => p.id !== postId));
        say(j.status === 'already_reported' ? 'You already reported this.' : 'Thanks — reported.');
      } else say(j.error || 'Report failed');
    } catch { say('Network error.'); }
  }

  const ca = state?.ca || null;
  const pumpUrl = state?.pump_url || (ca ? `https://pump.fun/coin/${ca}` : null);
  const dexUrl = ca ? `https://dexscreener.com/solana/${ca}` : null;
  function copyCA() {
    if (!ca) { say('The CA drops at launch.'); return; }
    navigator.clipboard?.writeText(ca).then(() => say('CA copied!'), () => say(ca));
  }
  function openUpload() {
    if (!state?.launched) { say('Posting opens when $MO goes live.'); return; }
    setUploadOpen(true);
  }

  /* ---------- derived ---------- */
  const sorted = useMemo(() => {
    const arr = [...posts];
    if (sort === 'new') arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else if (sort === 'top') arr.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || +new Date(a.created_at) - +new Date(b.created_at));
    else {
      let h = seed;
      const rnd = (id: number) => { const x = Math.sin(id * 9301 + h * 49297) * 233280; return x - Math.floor(x); };
      arr.sort((a, b) => rnd(a.id) - rnd(b.id));
    }
    return arr;
  }, [posts, counts, sort, seed]);

  const rankOf = useMemo(() => {
    const top = [...posts].filter((p) => (counts[p.id] || 0) > 0)
      .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || +new Date(a.created_at) - +new Date(b.created_at));
    const m: Record<number, number> = {};
    top.slice(0, 3).forEach((p, i) => (m[p.id] = i + 1));
    return m;
  }, [posts, counts]);

  const launched = !!state?.launched;

  return (
    <>
      <ScrollProgress />
      <MoParticles />
      <Nav onCopy={copyCA} ca={ca} xUrl={state?.x_url || X_URL} onSoon={() => say('Our X account drops soon.')} />

      <main>
        {/* ================= HERO ================= */}
        <header className="hero">
          <div className="rays" />
          <Cloud className="cloud drift-l" style={{ width: 220, left: -70, top: 330 }} />
          <Cloud className="cloud drift-r" style={{ width: 260, right: -90, top: 250 }} />
          <div className="wrap">
            <h1 className="sr-only">Post Your Mo ($MO)</h1>
            <div className="intro">
              <TiltBanner>
                <div className="banner">
                  <picture>
                    <source media="(max-width: 700px)" srcSet="/banner-sm.jpg" />
                    <img src="/banner.jpg" alt="Post Your MO — glossy green mustache logo in a mint sky" width={2172} height={724} fetchPriority="high" />
                  </picture>
                  <div className="shine" />
                </div>
              </TiltBanner>
            </div>

            <div className="hero-copy">
              {!launched && (
                <div className="intro" style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
                  <span className="chip chip-ink" style={{ height: 34, fontSize: 13 }}>LAUNCHING SOON.</span>
                  <span style={{ fontWeight: 800, color: 'var(--ink-2)' }}>The first 5-minute round begins when $MO goes live.</span>
                </div>
              )}
              {launched && <div className="intro"><span className="chip chip-green" style={{ height: 34, fontSize: 13 }}><span className="dot live" /> $MO IS LIVE</span></div>}
              <p className="hero-tag d intro-2" style={{ marginTop: 18 }}>
                <span className="w w1">GROW IT.</span> <span className="g w w2">POST IT.</span> <span className="w w3">WIN IT.</span>
              </p>
              <p className="hero-sub intro-3">
                Real mo. Fake mo. Dog mo. Drawn mo. We don&apos;t care. Post your mustache, get the votes, win the fees.
              </p>
              <div className="hero-ctas intro-3">
                <button className="btn btn-green" onClick={openUpload} disabled={!launched} title={launched ? undefined : 'Posting opens at launch'}>{launched ? 'Post your mo' : 'Posting opens at launch'}</button>
                <a className="btn" href="#wall">{launched ? 'Vote now' : 'See the wall'}</a>
              </div>
              <HeroStatus state={state} offset={offset} />
            </div>
          </div>
        </header>

        {/* ================= STATS ================= */}
        <div className="wrap" style={{ marginTop: 26 }}>
          <Stats state={state} offset={offset} />
        </div>

        <div style={{ marginTop: 56 }}><Marquee items={['GROW IT', 'POST IT', 'WIN IT', '$MO', 'EVERY 5 MINUTES', 'MOVEMBER IN THE TRENCHES']} /></div>

        {/* ================= WALL ================= */}
        <section id="wall" className="sec">
          <div className="wrap">
            <div className="sec-head reveal">
              <div>
                <div className="eyebrow">Round {roundNo(roundId)} · {posts.length} mo{posts.length === 1 ? '' : 's'} in the game</div>
                <h2 className="h2">THE MO <em>WALL.</em></h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <div className="seg" role="group" aria-label="Sort posts">
                  <button aria-pressed={sort === 'top'} onClick={() => setSort('top')}>Most voted</button>
                  <button aria-pressed={sort === 'new'} onClick={() => setSort('new')}>Newest</button>
                  <button aria-pressed={sort === 'random'} onClick={() => { setSort('random'); setSeed((s) => s + 1); }}>Random</button>
                </div>
                <button className="btn btn-green btn-sm" onClick={openUpload} disabled={!launched}>+ Post</button>
              </div>
            </div>

            {launched && votedFor && (
              <div className="reveal in" style={{ marginBottom: 18 }}>
                <span className="chip chip-green">✓ You voted this round — next vote unlocks in round {roundNo((roundId || 0) + 1)}</span>
              </div>
            )}
            {!launched && (
              <div style={{ marginBottom: 18 }}><span className="chip chip-mint">Posting and voting open when $MO goes live</span></div>
            )}

            {sorted.length === 0 ? (
              <div className="card empty reveal">
                <img src="/logo.png" alt="" width={160} height={59} />
                <p className="d" style={{ fontSize: 30, margin: 0 }}>NO MOS YET.</p>
                <p className="lede" style={{ margin: '8px 0 18px' }}>Be the first to post your mo.</p>
                <button className="btn btn-green" onClick={openUpload} disabled={!launched}>{launched ? 'Post your mo' : 'Posting opens at launch'}</button>
              </div>
            ) : (
              <>
                <div className="grid">
                  {sorted.slice(0, show).map((p, i) => (
                    <PostCard
                      key={p.id} p={p} i={i} votes={counts[p.id] || 0} rank={rankOf[p.id]}
                      launched={launched} mine={votedFor === p.id} locked={!!votedFor} busy={busy === p.id}
                      bumped={bumped === p.id} reported={reported.has(p.id)}
                      onVote={(e) => vote(p.id, e)} onReport={() => report(p.id)}
                    />
                  ))}
                </div>
                {sorted.length > show && (
                  <div style={{ textAlign: 'center', marginTop: 28 }}>
                    <button className="btn" onClick={() => setShow((s) => s + 24)}>Load more mos</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ================= LAST MO STANDING ================= */}
        <section id="winner" className="sec">
          <div className="wrap">
            <div className="sec-head reveal">
              <div>
                <div className="eyebrow">Previous round</div>
                <h2 className="h2">LAST MO <em>STANDING.</em></h2>
              </div>
            </div>
            <LastWinner w={state?.last_winner || null} launched={launched} />
          </div>
        </section>

        {/* ================= HALL OF FAME ================= */}
        <section id="hall" className="sec">
          <div className="wrap">
            <div className="sec-head reveal">
              <div>
                <div className="eyebrow">Every round winner, forever</div>
                <h2 className="h2">THE MO <em>HALL OF FAME.</em></h2>
              </div>
            </div>
            {winners.length === 0 ? (
              <div className="card empty reveal"><p className="d" style={{ fontSize: 26, margin: 0 }}>NO WINNERS YET.</p><p className="lede" style={{ margin: '8px 0 0' }}>The first winner will be crowned after launch.</p></div>
            ) : (
              <>
                <div className="hof">
                  {winners.map((w) => (
                    <article key={w.round_id} className="card item reveal in">
                      <div className="ph">
                        <img src={w.image_url} alt={`Round ${w.round_id} winner: ${w.caption}`} loading="lazy" />
                        <span className="chip chip-ink">{roundNo(w.round_id)}</span>
                      </div>
                      <div className="b">
                        <div className="p">{prizeText(w)}</div>
                        <div className="s">{w.votes} vote{w.votes === 1 ? '' : 's'}{w.x_handle ? ` · @${w.x_handle}` : ''}</div>
                        <span className={`chip ${w.payout_status === 'paid' ? 'chip-green' : 'chip-mint'}`} style={{ justifySelf: 'start' }}>{payoutLabel[w.payout_status]}</span>
                      </div>
                    </article>
                  ))}
                </div>
                {winnersTotal > PAGE && (
                  <div className="pager">
                    <button className="btn btn-sm" disabled={hofPage === 0} onClick={() => { const p = hofPage - 1; setHofPage(p); loadWinners(p); }}>← Newer</button>
                    <span>Page {hofPage + 1} / {Math.ceil(winnersTotal / PAGE)}</span>
                    <button className="btn btn-sm" disabled={(hofPage + 1) * PAGE >= winnersTotal} onClick={() => { const p = hofPage + 1; setHofPage(p); loadWinners(p); }}>Older →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div style={{ marginTop: 72 }}><Marquee items={['REAL MO', 'FAKE MO', 'DOG MO', 'DRAWN MO', 'ANY MO', 'POST YOUR MO']} reverse /></div>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how" className="sec">
          <div className="wrap">
            <div className="sec-head reveal">
              <div>
                <div className="eyebrow">Three steps. Five minutes.</div>
                <h2 className="h2">HOW IT <em>WORKS.</em></h2>
              </div>
            </div>
            <div className="steps">
              <div className="card step reveal">
                <IconCamera className="ic" />
                <div className="n">01</div>
                <h3>POST IT.</h3>
                <p>Upload your mustache, add a caption and enter your Solana wallet.</p>
              </div>
              <div className="card step reveal" style={{ transitionDelay: '.08s' }}>
                <IconVote className="ic" />
                <div className="n">02</div>
                <h3>VOTE IT.</h3>
                <p>The community picks its favorite mustache every five minutes. One vote per visitor per round.</p>
              </div>
              <div className="card step reveal" style={{ transitionDelay: '.16s' }}>
                <IconTrophy className="ic" />
                <div className="n">03</div>
                <h3>WIN IT.</h3>
                <p>The winning post is awarded the round&apos;s creator fees, subject to confirmed fee collection and manual settlement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY ================= */}
        <section id="why" className="sec">
          <div className="wrap">
            <div className="card why reveal">
              <div className="l">
                <div className="eyebrow">Why the mo?</div>
                <h2 className="h2" style={{ marginTop: 10 }}>IT&apos;S MORE THAN A <em>MUSTACHE.</em></h2>
                <p className="lede" style={{ marginTop: 18 }}>
                  November is Movember. A month to talk about men&apos;s health, mental health and prostate cancer awareness.
                  We&apos;re bringing that message into the memecoin trenches, one mustache at a time.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
                  <a className="btn btn-green" href="https://movember.com" target="_blank" rel="noopener noreferrer">Learn about Movember</a>
                  <a className="btn" href="https://www.who.int" target="_blank" rel="noopener noreferrer">Men&apos;s health — WHO</a>
                </div>
                <p className="disclaimer">
                  Post Your Mo is an independent community memecoin project and is not affiliated with or endorsed by the Movember Foundation.
                  Buying or holding $MO does not fund charity or medical research. If something feels off, talk to a doctor — getting checked is the real win.
                </p>
              </div>
              <div className="r" aria-hidden="true">
                <Cloud className="cloud" style={{ width: 200, left: -40, bottom: -10, zIndex: 0 }} />
                <Cloud className="cloud" style={{ width: 160, right: -30, top: 10, zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', gap: 16, padding: 30 }}>
                  <img src="/logo.png" alt="" width={260} height={96} className="bob" />
                  <IconPill className="" />
                  <Sparkle className="" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer state={state} onCopy={copyCA} pumpUrl={pumpUrl} dexUrl={dexUrl} />

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onPosted={(p) => { setPosts((ps) => (ps.some((x) => x.id === p.id) ? ps : [p, ...ps])); setSort('new'); }}
        />
      )}
      {toast && <WinnerToast data={toast} onClose={() => setToast(null)} />}
      {flash && <div className="flash" role="status"><span className="chip chip-ink" style={{ height: 38, fontSize: 12, padding: '0 16px' }}>{flash}</span></div>}
    </>
  );
}

function prizeText(w: Winner) {
  if (w.payout_status === 'paid') return `${sol(w.paid_lamports)} SOL`;
  if (w.prize_lamports == null) return 'Counting fees…';
  return `${sol(w.prize_lamports)} SOL`;
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */
function Nav({ onCopy, ca, xUrl, onSoon }: { onCopy: () => void; ca: string | null; xUrl: string | null; onSoon: () => void }) {
  return (
    <nav className="nav">
      <div className="wrap">
        <div className="nav-inner">
          <a href="#" className="brand" aria-label="Post Your Mo home">
            <img src="/logo.png" alt="" width={54} height={20} />
            <span>POST YOUR MO</span>
          </a>
          <div className="nav-links">
            <a href="#wall">Vote</a>
            <a href="#winner">Winners</a>
            <a href="#how">How it works</a>
            <a href="#why">Why the mo</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {xUrl ? (
            <a className="btn btn-sm xbtn-nav" href={xUrl} target="_blank" rel="noopener noreferrer" aria-label="Post Your Mo on X"><IconX /></a>
          ) : (
            <button className="btn btn-sm xbtn-nav" onClick={onSoon} aria-label="Post Your Mo on X (coming soon)"><IconX /></button>
          )}
          <button className="btn btn-sm btn-ink" onClick={onCopy} aria-label="Copy contract address">
            <IconCopy /> {ca ? shortAddr(ca) : 'CA soon'}
          </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroStatus({ state, offset }: { state: PublicState | null; offset: number }) {
  useTick(250);
  if (!state?.launched) {
    return <div className="status-pill intro-3"><span className="dot" /> Pre-launch · round #000 · clock starts at launch</div>;
  }
  const rem = remainingMs(state, offset);
  return (
    <div className="status-pill intro-3" aria-live="off">
      <span className="dot live" /> Round {roundNo(state.round?.id)} · <span className="t">{rem == null ? 'syncing…' : clock(rem)}</span> left
    </div>
  );
}

function Stats({ state, offset }: { state: PublicState | null; offset: number }) {
  useTick(250);
  const launched = !!state?.launched;
  const rem = remainingMs(state, offset);
  const pct = state?.round && rem != null ? Math.min(100, Math.max(0, 100 - (rem / (state.round_seconds * 1000)) * 100)) : 0;
  const mcapLive = launched && state?.market_cap_usd != null && fresh(state.mcap_updated_at, 5 * 60_000, offset);
  const feeLive = launched && !!state?.fee_tracking && fresh(state.fee_updated_at, 3 * 60_000, offset);

  const na = <span className="na">UNAVAILABLE</span>;
  return (
    <div className="card stats intro-3" role="region" aria-label="Live stats">
      <div className="stat lc">
        <div className="l">Current round</div>
        <div className="v">{state ? roundNo(launched ? state.round?.id : 0) : <span className="skel" style={{ display: 'inline-block', width: 90, height: 28 }} />}</div>
      </div>
      <div className="stat wide count">
        <div className="l">{launched && <span className="dot live" />}Next payout</div>
        <div className={`v ${launched && rem != null && rem < 10000 ? 'urgent' : ''}`}>{!state ? <span className="skel" style={{ display: 'inline-block', width: 110, height: 28 }} /> : !launched ? <span className="na">NOT STARTED</span> : rem == null ? <span className="na">SYNCING…</span> : clock(rem)}</div>
        <div className="bar" aria-hidden="true"><i style={{ width: `${launched ? pct : 0}%` }} /></div>
      </div>
      <div className="stat">
        <div className="l">{feeLive && <span className="dot live" />}Round creator fees</div>
        <div className="v">
          {!launched ? <>0<small>SOL</small></> : !state?.fee_tracking ? na : state.round_fee_lamports == null ? <span className="na">COUNTING…</span> : <>{sol(state.round_fee_lamports, 4)}<small>SOL</small></>}
        </div>
      </div>
      <div className="stat lc lr">
        <div className="l">{mcapLive && <span className="dot live" />}Market cap</div>
        <div className="v">{!launched ? '$0' : mcapLive ? usd(state!.market_cap_usd) : na}</div>
      </div>
      <div className="stat lr">
        <div className="l">Total paid out</div>
        <div className="v">{sol(state?.total_paid_lamports ?? 0)}<small>SOL</small></div>
      </div>
      <div className="ticker">
        <span><b>Price</b> {!launched ? '$0' : mcapLive && state?.price_usd ? price(state.price_usd) : 'Unavailable'}</span>
        <span><b>24h volume</b> {!launched ? '$0' : mcapLive && state?.volume_24h_usd != null ? usd(state.volume_24h_usd) : 'Unavailable'}</span>
        <span><b>Creator fees collected</b> {!launched ? '0 SOL' : feeLive || (state?.fees_total_lamports ?? 0) > 0 ? `${sol(state?.fees_total_lamports ?? 0, 4)} SOL` : 'Unavailable'}</span>
        <span><b>Status</b> {launched ? <>LIVE <span className="dot live" style={{ display: 'inline-block', marginLeft: 4 }} /></> : 'LAUNCHING SOON'}</span>
      </div>
    </div>
  );
}

function PostCard(props: {
  p: Post; i: number; votes: number; rank?: number; launched: boolean; mine: boolean; locked: boolean; busy: boolean; bumped: boolean; reported: boolean;
  onVote: (e: React.MouseEvent) => void; onReport: () => void;
}) {
  const { p, i, votes, rank, launched, mine, locked, busy, bumped, reported } = props;
  return (
    <article className={`card post ${mine ? 'voted' : ''}`} style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
      <div className="ph">
        <img src={p.image_url} alt={`Mustache post ${p.short_id || p.id}: ${p.caption}`} loading={i < 6 ? 'eager' : 'lazy'} decoding="async" />
        {rank && <span className="chip chip-ink rank">{rank === 1 ? '👑 #1' : `#${rank}`}</span>}
        {mine && <span className="chip chip-green yours">Your vote</span>}
      </div>
      <div className="body">
        <p className="cap">“{p.caption}”</p>
        <div className="meta">
          {p.x_handle ? <a href={`https://x.com/${p.x_handle}`} target="_blank" rel="noopener noreferrer nofollow">@{p.x_handle}</a> : <span>anon mo</span>}
          <span>{p.short_id || `MO-${p.id}`}</span>
        </div>
        <div className="row">
          <div className="votes"><b className={bumped ? 'bump' : ''}>{votes}</b><span>vote{votes === 1 ? '' : 's'}</span></div>
          <button
            className={`btn btn-sm ${mine ? 'btn-ink' : 'btn-green'}`}
            onClick={props.onVote}
            disabled={!launched || locked || busy}
            aria-label={`Vote for ${p.short_id || p.id}`}
          >
            {busy ? '…' : mine ? '✓ Voted' : !launched ? 'Soon' : locked ? 'Locked' : 'Vote'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="linkbtn" onClick={props.onReport} disabled={reported} aria-label="Report post">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconFlag /> {reported ? 'Reported' : 'Report'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function LastWinner({ w, launched }: { w: Winner | null; launched: boolean }) {
  if (!w) {
    return (
      <div className="card empty reveal">
        <IconTrophy className="" />
        <p className="d" style={{ fontSize: 30, margin: '10px 0 0' }}>{launched ? 'No winner yet.' : 'NO WINNERS YET.'}</p>
        <p className="lede" style={{ margin: '8px 0 0' }}>{launched ? 'The first round is still running.' : 'The first winner will be crowned after launch.'}</p>
      </div>
    );
  }
  return (
    <article className="card lastwin reveal">
      <div className="ph">
        <img src={w.image_url} alt={`Winning mustache of round ${w.round_id}`} loading="lazy" />
        <span className="chip chip-ink" style={{ position: 'absolute', left: 14, top: 14, height: 34, fontSize: 12 }}>👑 Winner {roundNo(w.round_id)}</span>
      </div>
      <div className="info">
        <div className="eyebrow">{w.x_handle ? <a href={`https://x.com/${w.x_handle}`} target="_blank" rel="noopener noreferrer nofollow">@{w.x_handle}</a> : 'Anon mo'} · {w.short_id}</div>
        <p className="q">“{w.caption}”</p>
        <div className="kv">
          <div><span>Round</span><b>{roundNo(w.round_id)}</b></div>
          <div><span>Votes</span><b>{w.votes}</b></div>
          <div><span>Creator fees</span><b>{prizeText(w)}</b></div>
          <div><span>Payment</span><b style={{ fontSize: 15 }}>{payoutLabel[w.payout_status]}</b></div>
        </div>
        {w.tx_signature && (
          <a className="linkbtn" href={`https://solscan.io/tx/${w.tx_signature}`} target="_blank" rel="noopener noreferrer">View payout transaction ↗</a>
        )}
      </div>
    </article>
  );
}

function WinnerToast({ data, onClose }: { data: { round: number; winner: Winner | null }; onClose: () => void }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOut(true), 9000);
    const b = setTimeout(onClose, 9400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [onClose]);
  const w = data.winner;
  return (
    <div className={`toast ${out ? 'out' : ''}`} role="status" aria-live="polite">
      <div className="card" style={{ gridTemplateColumns: w ? '96px 1fr' : '1fr' }}>
        {w && <div className="ph"><img src={w.image_url} alt="" /></div>}
        <div className="c">
          <div className="t1">Round {roundNo(data.round)} is over.</div>
          <div className="t2">{w ? 'WE HAVE A WINNER.' : 'NO VOTES THIS ROUND.'}</div>
          {w && <div style={{ fontWeight: 800, fontSize: 13 }}>“{w.caption}” · {w.votes} vote{w.votes === 1 ? '' : 's'} · {prizeText(w)} · {payoutLabel[w.payout_status]}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {w && <a className="btn btn-sm btn-green" href="#winner" onClick={() => setOut(true)}>View winner</a>}
            <button className="btn btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({ state, onCopy, pumpUrl, dexUrl }: { state: PublicState | null; onCopy: () => void; pumpUrl: string | null; dexUrl: string | null }) {
  return (
    <footer className="foot">
      <svg className="wave" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40V22c120-20 240-20 360 0s240 20 360 0 240-20 360 0 240 20 360 0v18z" fill="var(--ink)" />
      </svg>
      <div className="wrap">
        <div className="in">
          <div>
            <img src="/logo.png" alt="" width={120} height={44} style={{ marginBottom: 18, filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.35))' }} />
            <p className="big">POST YOUR <em>MO.</em></p>
            <p style={{ fontWeight: 800, fontSize: 18, margin: '12px 0 0', opacity: .9 }}>Grow it. Post it. Win it.</p>
          </div>
          <div style={{ display: 'grid', gap: 22 }}>
            <div className="btns">
              {pumpUrl ? <a className="btn btn-green btn-sm" href={pumpUrl} target="_blank" rel="noopener noreferrer"><IconPump /> Pump.fun</a>
                : <span className="btn btn-green btn-sm" aria-disabled="true" style={{ opacity: .6 }}><IconPump /> Pump.fun · soon</span>}
              {dexUrl && <a className="btn btn-sm" href={dexUrl} target="_blank" rel="noopener noreferrer">Dexscreener</a>}
              {(state?.x_url || X_URL) ? (
                <a className="btn btn-sm" href={state?.x_url || X_URL} target="_blank" rel="noopener noreferrer"><IconX /> X / Twitter</a>
              ) : (
                <span className="btn btn-sm" aria-disabled="true" style={{ opacity: .6 }}><IconX /> X · soon</span>
              )}
              <button className="btn btn-sm" onClick={onCopy}><IconCopy /> Copy CA</button>
            </div>
            <div className="ca" style={{ opacity: .85, wordBreak: 'break-all' }}>CA: {state?.ca || 'drops at launch'}</div>
            <div className="links">
              <a href="#how">How it works</a>
              <a href="#hall">Winners</a>
              <a href="#why">Why the mo</a>
            </div>
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} Post Your Mo ($MO). Community memecoin. Not financial advice.</span>
          <span>Not affiliated with the Movember Foundation.</span>
        </div>
      </div>
    </footer>
  );
}
