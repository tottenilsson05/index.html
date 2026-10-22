// The eight desktop applications.
import { html, useState, useEffect, useRef, cx, clamp, hhmm, copyText, saveFile, ICONS } from "./ui.js";
import { PIG, TRACKS, STATION, pumpUrl, dexUrl, solscanUrl } from "./config.js";
import { REACTS, short, store, SID, cleanName, launchesReady, launchCoin } from "./net.js";
import { play, audioCtx } from "./sfx.js";
import { makeMemes, makeStickers, loadImg, sky } from "./memes.js";
import { yt } from "./ytradio.js";

const Ico = id => html`<span class="ico">${ICONS[id]()}</span>`;

// =============== PIG.exe ===============
export function Welcome({ open, toast }) {
  const caRef = useRef(null);
  const copy = async () => { const ok = await copyText(PIG.CA, caRef.current); toast(ok ? "Contract address copied." : "Clipboard is blocked here. The address is selected, copy it manually.", "Copy"); };
  const item = (id, label) => html`<li><button onClick=${() => open(id)}>${Ico(id)}${label}</button></li>`;
  return html`<div class="welcome">
    <div class="hero" role="img" aria-label="PIG standing between giant pink P and G letters in a green field">
      <span class="stamp pix"><i class="led"></i>PIG WORLD ONLINE</span>
      <span class="ver pix">v1.0 · 2026</span>
    </div>
    <div class="wel">
      <aside class="tasks-pane" aria-label="PIG tasks">
        <section><h4>PIG tasks</h4><ul>
          ${item("buy", "Buy " + PIG.ticker)}
          ${item("launch", "Launch a coin")}
          ${item("chat", "Enter PIG Chat")}
          ${item("radio", "Listen to PIG Radio")}
          ${item("facts", "What is a PIG?")}
        </ul></section>
        <section><h4>Other places</h4><ul>
          ${item("pfp", "Make a PIG pfp")}
          ${item("gallery", "Meme gallery")}
        </ul></section>
      </aside>
      <div class="wel-main">
        <h1 class="saying"><span>Bulls make money.</span><span>Bears make money.</span><span class="slaughter">Pigs get slaughtered.</span></h1>
        <p><b>Welcome to PIG.</b> A world built for the greediest creatures in crypto. Poke the pig, take a seat in the pen, and try not to buy the top.</p>
        <div class="row">
          <button class="btn go lg" onClick=${() => open("buy")}>Buy ${PIG.ticker}</button>
          <button class="btn blue lg" onClick=${() => open("launch")}>Launch a Coin</button>
        </div>
        <div class="field"><label for="wel-ca">Contract address</label>
          <div class="ca"><input id="wel-ca" class="inp" ref=${caRef} readonly value=${PIG.CA || "Not live yet. It appears here at launch."} />
            <button class="btn sm" onClick=${copy} disabled=${!PIG.CA}>Copy</button></div></div>
      </div>
    </div>
  </div>`;
}

// =============== Chat.exe : an old-school room ===============
const NICK = ["#c0392b", "#1f5fd1", "#2a7a10", "#8e44ad", "#b35c00", "#0e7c86", "#b33c5d"];
const nickColor = n => NICK[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % NICK.length];
const EMOJI = ["🐷", "🐽", "💰", "📈", "📉", "🔪", "🚀", "💎", "😭", "🤑", "🌾", "☁️", "gm", "ngmi", "wagmi"];

export function Chat({ chat, wallet, visible, onSent }) {
  const [st, setSt] = useState({ msgs: [], online: null, canWrite: null, ready: false, error: null, mode: "" });
  const [text, setText] = useState("");
  const [name, setName] = useState(() => store.get("name", "piglet" + Math.floor(1000 + Math.random() * 9000)));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [emo, setEmo] = useState(false);
  const [pops, setPops] = useState([]);
  const [mine, setMine] = useState(() => new Set(store.get("reacted", [])));
  const log = useRef(null), seen = useRef(null), last = useRef(0);

  useEffect(() => { store.set("name", name); }, [name]);
  useEffect(() => chat ? chat.subscribe(c => setSt({ msgs: c.msgs, online: c.online, canWrite: c.canWrite, ready: c.ready, error: c.error, mode: c.mode })) : undefined, [chat]);
  useEffect(() => {
    const el = log.current;
    if (seen.current) {
      const fresh = st.msgs.filter(m => !seen.current.has(m.id));
      const others = fresh.filter(m => m.sid !== SID);
      if (others.length) { play.pop(); const k = Date.now(); setPops(p => [...p, k]); setTimeout(() => setPops(p => p.filter(x => x !== k)), 1000); }
      if (el && (fresh.some(m => m.sid === SID) || el.scrollHeight - el.scrollTop - el.clientHeight < 100)) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    } else if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    seen.current = new Set(st.msgs.map(m => m.id));
  }, [st.msgs]);
  useEffect(() => { if (visible && log.current) log.current.scrollTop = log.current.scrollHeight; }, [visible]);

  const who = wallet ? short(wallet) : cleanName(name) || "piglet";
  const send = async e => {
    e.preventDefault(); setErr("");
    const t = text.trim(); if (!t || !chat) return;
    if (Date.now() - last.current < 1200) { setErr("Slow down, pig. One message a second."); return; }
    setBusy(true);
    try { await chat.send(who, t); setText(""); setEmo(false); last.current = Date.now(); onSent && onSent(); }
    catch (x) { setErr(x.message); play.error(); }
    finally { setBusy(false); }
  };
  const react = async (m, k) => {
    const key = m.id + ":" + k; if (mine.has(key)) return;
    const next = new Set(mine); next.add(key); setMine(next); store.set("reacted", [...next].slice(-300));
    play.click(); try { await chat.react(m, k); } catch {}
  };
  const readOnly = st.canWrite === false;
  return html`<div class="chat">
    <div class="chat-head">
      <span class="room pix">PIG PEN</span><span class="topic">bulls make money · bears make money · you know the rest</span>
      <span class="who" title="People in the pen right now"><i class="dot"></i>${st.online == null ? "–" : st.online} online</span>
    </div>
    <div class="log" ref=${log} aria-live="polite">
      ${!st.ready && !st.error && html`<div class="sys">* Connecting to the PIG PEN…</div>`}
      ${st.error && html`<div class="empty"><img src="assets/pig_full.webp" alt="" /><b>The pen can't connect right now.</b><span>${st.mode === "hosted" ? "The chat server is offline. Try again in a minute." : "Chat needs a signed-in Claude session here, or the hosted PIG site."}</span></div>`}
      ${st.ready && html`<div class="sys">* Now talking in the PIG PEN. Be greedy, be nice.</div>`}
      ${st.ready && !st.msgs.length && html`<div class="sys">* Nobody has said anything yet. Say gm.</div>`}
      ${st.msgs.map(m => html`<div class=${cx("ln", m.sid === SID && "me")} key=${m.id}>
        <time>[${hhmm(m.ts)}]</time><span class="nick" style=${"color:" + nickColor(m.name || "?")}>${"<" + m.name + ">"}</span>${m.text}
        <span class="rx">
          ${REACTS.filter(r => m.r && m.r[r.k]).map(r => html`<button class=${mine.has(m.id + ":" + r.k) ? "on" : ""} onClick=${() => react(m, r.k)} title=${r.label} aria-label=${r.label + " " + m.r[r.k]}>${r.e} ${m.r[r.k]}</button>`)}
          ${!readOnly && REACTS.filter(r => !(m.r && m.r[r.k])).slice(0, 2).map(r => html`<button class="add" onClick=${() => react(m, r.k)} title=${r.label} aria-label=${"React " + r.label}>${r.e}</button>`)}
        </span>
      </div>`)}
    </div>
    ${pops.map(k => html`<img key=${k} class="snout-pop" src="assets/snout.webp" alt="" />`)}
    <div>
      ${emo && html`<div class="emoji-row">${EMOJI.map(e => html`<button type="button" key=${e} onClick=${() => setText(t => (t + (t && !t.endsWith(" ") ? " " : "") + e).slice(0, 280))}>${e}</button>`)}</div>`}
      ${err && html`<div class="notice bad" style="margin:4px">${err}</div>`}
      ${readOnly
        ? html`<div class="notice" style="margin:4px">You're reading the pen. Posting here needs Contributor access to this page; on the hosted PIG site everyone can post.</div>`
        : html`<div class="nickbar">${wallet
            ? html`<span>Nick: <b class="mono">${who}</b> (wallet)</span>`
            : html`<label for="chat-name">Nick</label><input id="chat-name" value=${name} maxlength="16" onInput=${e => setName(cleanName(e.target.value))} /><span>or connect a wallet</span>`}</div>`}
    </div>
    <form class="chat-in" onSubmit=${send}>
      <button type="button" class="btn sm" aria-label="Emoji" aria-pressed=${emo} onClick=${() => setEmo(v => !v)}>🐷</button>
      <input id="chat-input" class="inp" placeholder="oink something..." maxlength="280" value=${text} disabled=${readOnly || !chat} onInput=${e => setText(e.target.value)} aria-label="Message" autocomplete="off" />
      <button class="btn sm blue" disabled=${readOnly || busy || !text.trim()}>Send</button>
    </form>
  </div>`;
}

// =============== Radio.exe ===============
// Two real engines: the desktop-level YouTube player for the Lana Del Rey picks (hosted site), and an <audio>
// engine for station tracks and your own files, which also feeds the visualizer and the dancing pig.
const fmt = s => isFinite(s) && s > 0 ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";

export function Radio({ mode, visible, onState, ctl, toast }) {
  const hosted = mode === "hosted";
  const [ys, setYs] = useState(yt.s);
  useEffect(() => hosted ? yt.sub(setYs) : undefined, [hosted]);
  const [tab, setTab] = useState(hosted ? "lana" : "station");
  const [station, setStation] = useState(STATION.map(t => ({ ...t, url: t.src })));
  const [mine, setMine] = useState([]);
  const [src, setSrc] = useState(hosted ? { kind: "yt", list: "lana", idx: yt.s.idx } : null);
  const [ast, setAst] = useState("idle");   // audio engine: idle | loading | playing | paused | error
  const [errMsg, setErrMsg] = useState("");
  const [at, setAt] = useState([0, 0]);
  const [vol, setVol] = useState(() => store.get("vol", 70));
  const [muted, setMuted] = useState(false);
  const [canUpload, setCanUpload] = useState(null);
  const [upBusy, setUpBusy] = useState(false);
  const audio = useRef(null), canvas = useRef(null), an = useRef(null), fileIn = useRef(null), upIn = useRef(null), dbRef = useRef(null);

  useEffect(() => {
    if (hosted || !window.claude || !window.claude.use) return;
    let off;
    (async () => {
      const db = await window.claude.use("db"); dbRef.current = db;
      if (db) off = db.doc("radio/station").onSnapshot(s => {
        const extra = (s.exists && Array.isArray(s.data().tracks)) ? s.data().tracks.map(x => ({ ...x, url: "/_blob/" + x.id })) : [];
        setStation([...STATION.map(x => ({ ...x, url: x.src })), ...extra]);
      }, () => {});
      const assets = await window.claude.use("assets"); setCanUpload(!!assets);
    })();
    return () => off && off();
  }, [hosted]);

  const lists = { station, mine, lana: TRACKS.map(x => ({ title: x.title, artist: "Lana Del Rey", album: x.album, yt: x.id })) };
  const listsRef = useRef(lists); listsRef.current = lists;
  const isYt = src && src.kind === "yt";
  const status = isYt ? (hosted ? (ys.failed ? "error" : ys.ready ? ys.status : "loading") : "idle") : ast;
  const playing = status === "playing";
  const cur = src ? (isYt ? lists.lana[ys.idx] : lists[src.list][src.idx]) : null;
  const t = isYt ? [ys.time, ys.dur] : at;

  const ensureAnalyser = () => {
    if (an.current) return;
    const c = audioCtx(); if (!c || !audio.current) return;
    try { const s = c.createMediaElementSource(audio.current); const a = c.createAnalyser(); a.fftSize = 128; a.smoothingTimeConstant = 0.78; s.connect(a); a.connect(c.destination); an.current = a; } catch {}
  };
  const playAt = (list, idx) => {
    const item = listsRef.current[list][idx]; if (!item) return;
    setErrMsg(""); play.click();
    if (item.yt) {
      if (!hosted) { setErrMsg("YouTube's player can't run inside this preview. It plays on the hosted PIG site; here you can open the track on YouTube."); return; }
      audio.current && audio.current.pause();
      setSrc({ kind: "yt", list, idx }); yt.playAt(idx); return;
    }
    if (hosted) yt.pause();
    setSrc({ kind: "audio", list, idx }); setAst("loading");
    const a = audio.current; ensureAnalyser(); a.src = item.url; a.volume = vol / 100; a.muted = muted;
    a.play().catch(e => { if (e && e.name === "NotAllowedError") { setAst("paused"); setErrMsg("Press play to start. Your browser waits for a click before playing sound."); } });
  };
  const toggle = () => {
    if (isYt) { if (hosted) yt.toggle(); return; }
    if (!src) { const first = station.length ? ["station", 0] : mine.length ? ["mine", 0] : null; if (first) { setTab(first[0]); playAt(first[0], first[1]); } else { setTab("mine"); setErrMsg("Nothing to play here yet. Add audio files under My files."); } return; }
    const a = audio.current; ensureAnalyser(); if (a.paused) a.play().catch(() => {}); else a.pause();
  };
  const step = d => {
    if (isYt) { if (hosted) d > 0 ? yt.next() : yt.prev(); return; }
    if (!src) return toggle(); const n = listsRef.current[src.list].length; if (!n) return; playAt(src.list, (src.idx + d + n) % n);
  };
  const stop = () => { if (!src) return; if (isYt) { yt.pause(); yt.seek(0); } else { audio.current.pause(); audio.current.currentTime = 0; } };
  ctl.current = { toggle, next: () => step(1), prev: () => step(-1) };

  useEffect(() => { store.set("vol", vol); if (audio.current) audio.current.volume = vol / 100; if (hosted) yt.setVol(vol); }, [vol]);
  useEffect(() => { if (audio.current) audio.current.muted = muted; if (hosted) muted ? yt.mute() : yt.unmute(); }, [muted]);

  const title = cur ? cur.title : "";
  const ytTitle = isYt && hosted ? ys.title : title;
  useEffect(() => { onState({ playing: !isYt && playing, title, real: !isYt }); }, [playing, title, isYt]);

  // visualizer: real frequency data from the audio engine
  useEffect(() => {
    if (!visible) return;
    const c = canvas.current; if (!c) return; const g = c.getContext("2d");
    let raf; const buf = new Uint8Array(64); const root = document.documentElement; const dpr = devicePixelRatio || 1;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const W = c.width = c.clientWidth * dpr, H = c.height = c.clientHeight * dpr;
      g.clearRect(0, 0, W, H);
      const live = an.current && !isYt && playing;
      if (live) an.current.getByteFrequencyData(buf); else buf.fill(0);
      const n = 32, bw = W / n, cell = 4 * dpr; let energy = 0;
      for (let i = 0; i < n; i++) {
        const v = buf[Math.min(63, Math.floor(Math.pow(i / n, 1.7) * 60) + 1)] / 255; if (i < 8) energy += v / 8;
        const cells = Math.max(1, Math.ceil(v * H * 0.95 / cell)), tot = H / cell;
        for (let k = 0; k < cells; k++) { g.fillStyle = k / tot > .75 ? "#ff7d9a" : k / tot > .5 ? "#ffd24a" : "#6bff8f"; g.fillRect(i * bw + 1, H - (k + 1) * cell, bw - 2, cell - dpr); }
      }
      if (isYt) { g.fillStyle = "#8ea4d0"; g.font = `${10 * dpr}px Tahoma, sans-serif`; g.fillText(hosted ? "YouTube audio can't be analysed. Bars react to station tracks and your files." : "Pick a station track or one of your files.", 8 * dpr, H / 2 + 4 * dpr); }
      if (!isYt) root.style.setProperty("--lvl", live ? energy.toFixed(3) : "0");
    };
    draw(); return () => { cancelAnimationFrame(raf); if (!isYt) root.style.setProperty("--lvl", "0"); };
  }, [visible, playing, isYt]);

  const addMine = e => {
    const fs = [...e.target.files].filter(f => f.type.startsWith("audio/") || /\.(mp3|m4a|ogg|wav|flac|webm)$/i.test(f.name)).map(f => ({ title: f.name.replace(/\.[^.]+$/, ""), artist: "Your file", url: URL.createObjectURL(f) }));
    e.target.value = ""; if (!fs.length) return;
    const start = mine.length; setMine(m => [...m, ...fs]); setTab("mine"); setTimeout(() => playAt("mine", start), 30);
  };
  const upload = async e => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const type = ext === "m4a" || ext === "mp4" ? "video/mp4" : ext === "webm" ? "video/webm" : null;
    if (!type) { toast("Station uploads take M4A, MP4 or WEBM audio. Convert MP3s first, or send them to Claude to publish with the site.", "PIG Radio"); return; }
    setUpBusy(true);
    try {
      const assets = await window.claude.use("assets"); const r = await assets.upload(f, { type });
      const ref = dbRef.current.doc("radio/station"); const snap = await ref.get();
      const tracks = (snap.exists && Array.isArray(snap.data().tracks)) ? snap.data().tracks : [];
      await ref.set({ tracks: [...tracks, { id: r.id, title: f.name.replace(/\.[^.]+$/, ""), artist: "PIG Radio" }] });
      toast("Track added to the station for everyone.", "PIG Radio");
    } catch (x) { toast(x && x.code === "too_large" ? "That file is over 20 MB." : "Upload failed. Try again in a moment.", "PIG Radio"); }
    finally { setUpBusy(false); }
  };

  const stateLabel = { idle: "STOPPED", loading: "TUNING IN…", playing: "ON AIR", paused: "PAUSED", error: "NO SIGNAL" }[status];
  const list = lists[tab];
  const shownTitle = isYt ? ytTitle : title;
  const curIdx = isYt ? ys.idx : src ? src.idx : -1;
  return html`<div class="radio">
    <div class="screen">
      <div class="meta">
        <span class=${cx("state pix", status === "error" && "err", status === "loading" && "wait")}>● ${stateLabel}</span>
        <div class=${cx("marq", (shownTitle || "").length > 24 && playing && "run")}><span>${shownTitle || "PIG RADIO"}</span></div>
        <div class="sub">${cur ? [cur.artist, cur.album].filter(Boolean).join(" · ") : "Dreamy, nostalgic, a little melancholic."}</div>
        <div class="time">${fmt(t[0])} / ${fmt(t[1])}</div>
      </div>
      <div class=${cx("pigcam", playing && "on")} aria-hidden="true"><img src="assets/pig_full.webp" alt="" /></div>
    </div>
    <canvas class="viz" ref=${canvas} aria-hidden="true"></canvas>
    <div class="seek"><span>${fmt(t[0])}</span>
      <input id="radio-seek" type="range" min="0" max=${Math.max(1, t[1] || 1)} step="0.5" value=${t[0] || 0} disabled=${!src || !t[1]} aria-label="Playback position"
        onInput=${e => { const v = +e.target.value; if (isYt) yt.seek(v); else { audio.current.currentTime = v; setAt(x => [v, x[1]]); } }} />
      <span>${fmt(t[1])}</span></div>
    <div class="deck">
      <button class="rb" aria-label="Previous track" title="Previous" onClick=${() => step(-1)}>${ICONS.prev()}</button>
      <button class=${cx("rb big", playing && "on")} aria-label=${playing ? "Pause" : "Play"} title=${playing ? "Pause" : "Play"} onClick=${toggle}>${playing ? ICONS.pause() : ICONS.play()}</button>
      <button class="rb" aria-label="Stop" title="Stop" onClick=${stop}><svg viewBox="0 0 48 48"><rect x="12" y="12" width="24" height="24" /></svg></button>
      <button class="rb" aria-label="Next track" title="Next" onClick=${() => step(1)}>${ICONS.next()}</button>
      <button class=${cx("rb", muted && "on")} aria-label=${muted ? "Unmute" : "Mute"} title=${muted ? "Unmute" : "Mute"} aria-pressed=${muted} onClick=${() => setMuted(m => !m)}>${ICONS.sound(!muted)}</button>
      <label class="vol"><span class="pix">VOL</span><input id="radio-vol" type="range" min="0" max="100" value=${vol} onInput=${e => setVol(+e.target.value)} aria-label="Volume" /></label>
    </div>
    <div class="plist">
      <div class="tabs" role="tablist">
        ${[["lana", "Lana Del Rey"], ["station", `Station (${station.length})`], ["mine", `My files (${mine.length})`]].map(([k, l]) => html`<button role="tab" key=${k} aria-selected=${tab === k} class=${tab === k ? "on" : ""} onClick=${() => setTab(k)}>${l}</button>`)}
      </div>
      ${(errMsg || (isYt && hosted && ys.failed)) && html`<div class="notice bad" style="margin:6px">${errMsg || "YouTube's player didn't load. Check your connection or ad blocker, then reload."}</div>`}
      ${list.length ? html`<ol>${list.map((x, i) => html`<li key=${tab + i} class=${src && (isYt ? tab === "lana" : src.list === tab) && curIdx === i ? "cur" : ""}>
          <span class="n">${String(i + 1).padStart(2, "0")}</span>
          <button class="t" onClick=${() => playAt(tab, i)} title=${"Play " + x.title}>${x.title} <small>${x.album || x.artist}</small></button>
          ${x.yt && html`<a href=${"https://www.youtube.com/watch?v=" + x.yt} target="_blank" rel="noopener" title="Open on YouTube">YouTube ↗</a>`}
        </li>`)}</ol>`
      : html`<div class="none">${tab === "station"
          ? "No station tracks yet. The site owner adds songs here, and everyone can play them with the live visualizer."
          : "Pick audio files from your computer to play them here. They stay on your device."}</div>`}
      <div class="foot">
        ${tab === "lana" && html`<span style="font-size:11px;color:var(--muted)">${hosted ? "Official Lana Del Rey uploads, played through YouTube's player in the corner dock." : "These play through YouTube's player on the hosted PIG site. In this preview, open them on YouTube."}</span>`}
        ${tab === "mine" && html`<div class="row"><button class="btn sm" onClick=${() => fileIn.current.click()}>Add audio files…</button><span style="font-size:11px;color:var(--muted)">MP3, M4A, OGG, WAV</span></div>`}
        ${tab === "station" && canUpload && html`<div class="row"><button class="btn sm" disabled=${upBusy} onClick=${() => upIn.current.click()}>${upBusy ? "Uploading…" : "Add track to station…"}</button><span style="font-size:11px;color:var(--muted)">M4A or WEBM, only songs you have the rights to</span></div>`}
        <input ref=${fileIn} type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav,.flac" multiple hidden onChange=${addMine} />
        <input ref=${upIn} type="file" accept=".m4a,.mp4,.webm,audio/mp4,audio/webm" hidden onChange=${upload} />
      </div>
    </div>
    <audio ref=${audio} preload="auto"
      onPlaying=${() => { setAst("playing"); setErrMsg(""); }} onPause=${() => setAst(s => s === "error" ? s : "paused")} onWaiting=${() => setAst("loading")}
      onEnded=${() => step(1)} onTimeUpdate=${e => setAt([e.target.currentTime, e.target.duration])} onLoadedMetadata=${e => setAt([0, e.target.duration])}
      onError=${() => { if (src && src.kind === "audio") { setAst("error"); setErrMsg("This track couldn't be loaded. It may be missing or in a format your browser can't play."); } }}></audio>
  </div>`;
}

// =============== PigFacts.txt ===============
const TRAITS = [
  ["Chase pumps after prices have already exploded.", "The chart is vertical, so obviously it keeps going. Right?"],
  ["Ignore risk because they expect more profit.", "Stop-losses are for people who plan to lose."],
  ["Refuse to take profits.", "Up 5x is just the warm-up. 10x or nothing."],
  ["Follow hype instead of research.", "Three accounts with anime pfps said it's the one."],
  ["Believe every coin will make them rich.", "This time is different. It's always this time."],
  ["Let greed overpower discipline.", "The plan was to sell at 2x. The plan has been updated."],
];
const VERDICTS = ["Disciplined bull. Suspicious, honestly.", "Careful bear with a tiny snout.", "Piglet energy. Watch it.", "Certified pig. Oink responsibly.", "Full hog. The butcher knows your name.", "Absolute unit of greed. Welcome home.", "Absolute unit of greed. Welcome home."];
export function Facts() {
  const [chk, setChk] = useState(() => TRAITS.map(() => false));
  const [flip, setFlip] = useState(-1);
  const n = chk.filter(Boolean).length, pct = Math.round(n / TRAITS.length * 100);
  return html`<div class="doc">
    <div class="menu" aria-hidden="true"><span>File</span><span>Edit</span><span>Format</span><span>View</span><span>Help</span></div>
    <article class="doc-in">
      <header><span class="kicker pix">PigFacts.txt · the greedy investor</span><h2>What is a PIG?</h2></header>
      <div class="def"><img src="assets/pig_full.webp" alt="" />
        <div><h3>The greedy investor</h3>
        <p>A pig is a greedy, impatient or emotional investor who drops a disciplined strategy to chase unrealistic short-term gains, hot tips or hype without proper research.</p></div></div>
      <section>
        <span class="kicker pix">The famous market saying</span>
        <p class="quote"><span class="bulls">Bulls make money,</span><span class="bears">bears make money,</span><span class="pigs">pigs get slaughtered.</span></p>
        <p style="margin-top:10px">Extreme greed and reckless risk-taking can turn into heavy losses the moment the market reverses. Bulls bet on up, bears bet on down, and both can win with a plan. The pig has no plan, only appetite.</p>
      </section>
      <div class="trio">
        <div class="animal bull"><b>Bull</b><span>Expects prices to rise and buys with a plan.</span></div>
        <div class="animal bear"><b>Bear</b><span>Expects prices to fall and positions for it.</span></div>
        <div class="animal pig"><b>Pig</b><span>Wants it all, right now, and never sells.</span></div>
      </div>
      <section>
        <span class="kicker pix">The psychology of a pig · hover or tap a card</span>
        <div class="cards">${TRAITS.map(([a, b], i) => html`<button class=${cx("flip", flip === i && "on")} key=${i} onClick=${() => setFlip(flip === i ? -1 : i)} aria-label=${a + " " + b}>
          <div class="in"><div class="f"><small class="pix">Pigs often</small><b>${a}</b></div><div class="b">${b}</div></div></button>`)}</div>
      </section>
      <fieldset class="group meter" style="border-color:var(--line)">
        <span class="legend">Greed-o-meter</span>
        <h3>Am I a pig? Tick what you did this week.</h3>
        ${TRAITS.map(([a], i) => html`<label class="chk" key=${i}><input id=${"trait-" + i} type="checkbox" checked=${chk[i]} onChange=${() => { play.click(); setChk(c => c.map((v, j) => j === i ? !v : v)); }} />${a}</label>`)}
        <div class="gauge" role="meter" aria-valuenow=${pct} aria-valuemin="0" aria-valuemax="100" aria-label="Greed meter"><i style=${"width:" + pct + "%"}></i></div>
        <div class="verdict">${pct}% pig · ${VERDICTS[n]}</div>
      </fieldset>
      <div class="philo"><img src="assets/pig_full.webp" alt="" /><div><q>Everyone is a pig sometimes.</q>
        <p>In crypto the next massive opportunity is always one post away. PIG turns that familiar urge into a self-aware internet meme.</p></div></div>
    </article>
  </div>`;
}

// =============== Launch.exe ===============
const STEPS = [["upload", "Upload image and metadata"], ["build", "Build the pump.fun transaction"], ["sign", "Approve in your wallet"], ["send", "Send to Solana"]];
export function Launch({ wallet, connect, toast }) {
  const [f, setF] = useState({ name: "", symbol: "", description: "", twitter: "", telegram: "", website: "", amount: "0" });
  const [img, setImg] = useState(null);
  const [errs, setErrs] = useState({});
  const [ready, setReady] = useState(null);
  const [steps, setSteps] = useState({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const [done, setDone] = useState(null);
  const fileIn = useRef(null);
  useEffect(() => { launchesReady().then(setReady); }, []);
  const set = k => e => setF(v => ({ ...v, [k]: k === "symbol" ? e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 10) : e.target.value }));
  const pickImg = e => {
    const file = e.target.files[0]; if (!file) return;
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) { setErrs(x => ({ ...x, img: "Use a PNG, JPG, GIF or WEBP image." })); return; }
    if (file.size > 3 * 1024 * 1024) { setErrs(x => ({ ...x, img: "Keep the image under 3 MB." })); return; }
    const r = new FileReader(); r.onload = () => { setImg(r.result); setErrs(x => ({ ...x, img: "" })); }; r.readAsDataURL(file);
  };
  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Give your coin a name."; else if (f.name.trim().length > 32) e.name = "Names max out at 32 characters.";
    if (f.symbol.length < 2) e.symbol = "Tickers need 2 to 10 letters or numbers.";
    if (f.description.length > 500) e.description = "Keep the description under 500 characters.";
    if (!img) e.img = "Add an image for your coin.";
    ["twitter", "telegram", "website"].forEach(k => { if (f[k] && !/^https:\/\/\S+\.\S+/.test(f[k])) e[k] = "Links must start with https://"; });
    const a = Number(f.amount); if (!(a >= 0 && a <= 5)) e.amount = "Dev buy must be between 0 and 5 SOL.";
    setErrs(e); return !Object.keys(e).length;
  };
  const submit = async ev => {
    ev.preventDefault(); setFail(""); setDone(null);
    if (!validate()) { play.error(); return; }
    if (!ready || !ready.ready) return;
    if (!wallet) { toast("Connect your wallet to launch.", "Launch.exe"); connect(); return; }
    setBusy(true); setSteps({});
    try {
      const res = await launchCoin({ ...f, name: f.name.trim(), amount: Number(f.amount) || 0, image: img }, wallet, (k, s) => setSteps(x => ({ ...x, [k]: s })));
      setDone(res); play.coin(); toast(`${f.symbol} is live on pump.fun.`, "Launch.exe");
    } catch (x) { setFail(x.message || "Launch failed."); play.error(); }
    finally { setBusy(false); }
  };
  const blocked = ready && !ready.ready;
  const fld = (k, label, attrs = {}) => html`<div class="field"><label for=${"l-" + k}>${label}</label>
    <input id=${"l-" + k} value=${f[k]} onInput=${set(k)} ...${attrs} />${errs[k] && html`<span class="err">${errs[k]}</span>`}</div>`;
  return html`<form class="pad" onSubmit=${submit} noValidate>
    ${ready == null && html`<div class="notice">Checking the launch line…</div>`}
    ${ready && ready.why === "preview" && html`<div class="notice"><span><b>Launches run on the hosted PIG site.</b> This preview can't reach pump.fun or your wallet, so you can fill in the form but the launch button stays off.</span></div>`}
    ${ready && ready.why === "off" && html`<div class="notice"><span><b>Launches aren't switched on yet.</b> The site owner still needs to connect image storage on the server.</span></div>`}
    <fieldset class="group"><span class="legend">Coin</span>
      <div class="launch-grid">
        <div>
          <div class=${cx("imgdrop", img && "has")} style=${img ? `background-image:url(${img})` : ""} role="button" tabindex="0" aria-label="Choose coin image"
            onClick=${() => fileIn.current.click()} onKeyDown=${e => (e.key === "Enter" || e.key === " ") && fileIn.current.click()}>
            <span>Click to add the coin image<br />PNG · JPG · GIF · WEBP<br />max 3 MB</span></div>
          <input ref=${fileIn} id="l-img" type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange=${pickImg} />
          ${errs.img && html`<span class="err">${errs.img}</span>`}
        </div>
        <div style="display:grid;gap:8px;align-content:start;min-width:0">
          ${fld("name", "Name", { maxlength: 32, placeholder: "Pig Pen" })}
          ${fld("symbol", "Ticker", { placeholder: "OINK" })}
          <div class="field"><label for="l-description">Description</label>
            <textarea id="l-description" rows="3" maxlength="500" value=${f.description} onInput=${set("description")} placeholder="What makes this coin greedy?"></textarea>
            <span class="hint">${f.description.length}/500</span>${errs.description && html`<span class="err">${errs.description}</span>`}</div>
        </div>
      </div>
    </fieldset>
    <fieldset class="group"><span class="legend">Links and dev buy (optional)</span>
      <div class="grid2">${fld("twitter", "X link", { placeholder: "https://x.com/…" })}${fld("telegram", "Telegram", { placeholder: "https://t.me/…" })}</div>
      <div class="grid2">${fld("website", "Website", { placeholder: "https://…" })}${fld("amount", "Dev buy (SOL)", { type: "number", min: 0, max: 5, step: "0.01" })}</div>
    </fieldset>
    <div class="notice"><span>You sign the launch in your own wallet. PIG never asks for a seed phrase or private key, and nobody from PIG ever will.</span></div>
    ${Object.keys(steps).length > 0 && html`<ul class="steps">${STEPS.map(([k, l]) => html`<li class=${steps[k] || ""} key=${k}>${l}</li>`)}</ul>`}
    ${fail && html`<div class="notice bad">${fail}</div>`}
    ${done && html`<div class="notice ok"><span><b>Live.</b> <a href=${pumpUrl(done.mint)} target="_blank" rel="noopener">Open on pump.fun ↗</a> · <a href=${"https://solscan.io/tx/" + done.signature} target="_blank" rel="noopener">Transaction ↗</a></span></div>`}
    <div class="row">
      ${wallet ? html`<span class="mono" style="font-size:11px;color:var(--muted)">Wallet ${short(wallet)}</span>` : html`<button type="button" class="btn" onClick=${connect} disabled=${blocked}>Connect wallet</button>`}
      <button class="btn blue lg" style="margin-left:auto" disabled=${busy || !ready || blocked}>${busy ? "Launching…" : "Launch on pump.fun"}</button>
    </div>
  </form>`;
}

// =============== PFP.exe ===============
const FRAMES = [["none", "None"], ["xp", "Window"], ["field", "Field"], ["ring", "Ring"]];
export function Pfp({ toast }) {
  const cv = useRef(null), fileIn = useRef(null);
  const [stickers, setStickers] = useState([]);
  const [base, setBase] = useState(null);
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(-1);
  const [frame, setFrame] = useState("xp");
  const [wall, setWall] = useState(null);
  const W = 800;
  useEffect(() => { loadImg("assets/wallpaper.webp").then(setWall).catch(() => {}); makeStickers().then(async s => {
    setStickers(s); const pig = await loadImg(s[0].src);
    setItems([{ src: s[0].src, img: pig, x: W / 2, y: W * 0.6, s: 0.95, r: 0 }]); setSel(0);
  }); }, []);
  const add = async st => {
    const img = await loadImg(st.src); play.pop();
    const fit = st.id === "word" || st.id === "pig" ? 0.9 : 0.42; const s = (W * fit) / Math.max(img.width, img.height);
    setItems(it => { const n = [...it, { src: st.src, img, x: W / 2, y: W / 2, s, r: 0 }]; setSel(n.length - 1); return n; });
  };
  const draw = (g, size, showSel) => {
    const k = size / W; g.save(); g.clearRect(0, 0, size, size); g.scale(k, k);
    const bg = base || wall;
    if (bg) { const r = Math.max(W / bg.width, W / bg.height); g.drawImage(bg, (W - bg.width * r) / 2, (W - bg.height * r) / 2 + (base ? 0 : 40), bg.width * r, bg.height * r); }
    else sky(g, W, W, 0.66);
    items.forEach((it, i) => { g.save(); g.translate(it.x, it.y); g.rotate(it.r); const w = it.img.width * it.s, h = it.img.height * it.s; g.drawImage(it.img, -w / 2, -h / 2, w, h);
      if (showSel && i === sel) { g.strokeStyle = "#0b45b8"; g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12); }
      g.restore(); });
    g.setLineDash([]);
    if (frame === "xp") {
      const tb = g.createLinearGradient(0, 0, 0, 64); tb.addColorStop(0, "#5ea2f7"); tb.addColorStop(.45, "#1764e2"); tb.addColorStop(.52, "#0c55d5"); tb.addColorStop(1, "#2a74ea");
      g.fillStyle = "#1f6fe6"; g.fillRect(0, 0, 14, W); g.fillRect(W - 14, 0, 14, W); g.fillRect(0, W - 14, W, 14);
      g.fillStyle = tb; g.fillRect(0, 0, W, 64); g.font = "bold 34px Tahoma, Verdana, sans-serif"; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText("PIG.exe", 22, 33);
      g.fillStyle = "#e0502e"; g.fillRect(W - 62, 12, 44, 40); g.strokeStyle = "#fff"; g.lineWidth = 3; g.strokeRect(W - 62, 12, 44, 40); g.lineWidth = 6;
      g.beginPath(); g.moveTo(W - 52, 22); g.lineTo(W - 28, 42); g.moveTo(W - 28, 22); g.lineTo(W - 52, 42); g.stroke();
    }
    if (frame === "field") { g.strokeStyle = "#46b21e"; g.lineWidth = 28; g.strokeRect(14, 14, W - 28, W - 28); g.fillStyle = "#0b1f4d"; g.fillRect(0, W - 70, W, 70); g.font = "900 44px Archivo, Arial Narrow, sans-serif"; g.textAlign = "center"; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText("PIGS GET SLAUGHTERED", W / 2, W - 34); g.textAlign = "start"; }
    if (frame === "ring") { g.lineWidth = 36; g.strokeStyle = "#1f6fe6"; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 18, 0, 7); g.stroke(); g.lineWidth = 6; g.strokeStyle = "#ef94ab"; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 39, 0, 7); g.stroke(); }
    g.restore();
  };
  useEffect(() => { const c = cv.current; if (c) draw(c.getContext("2d"), W, true); }, [items, sel, base, frame, wall]);
  const toLocal = e => { const r = cv.current.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * W / r.height]; };
  const hit = (x, y) => { for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; const dx = x - it.x, dy = y - it.y; const c = Math.cos(-it.r), s = Math.sin(-it.r); const lx = dx * c - dy * s, ly = dx * s + dy * c; if (Math.abs(lx) <= it.img.width * it.s / 2 && Math.abs(ly) <= it.img.height * it.s / 2) return i; } return -1; };
  const down = e => {
    const [x, y] = toLocal(e); const i = hit(x, y); setSel(i); if (i < 0) return;
    const el = cv.current; el.setPointerCapture(e.pointerId); const it = items[i]; const ox = x - it.x, oy = y - it.y;
    const mv = ev => { const [mx, my] = toLocal(ev); setItems(arr => arr.map((v, j) => j === i ? { ...v, x: clamp(mx - ox, 0, W), y: clamp(my - oy, 0, W) } : v)); };
    const up = () => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); };
    el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up);
  };
  const upd = p => setItems(arr => arr.map((v, j) => j === sel ? { ...v, ...p } : v));
  const wheel = e => { if (sel < 0) return; e.preventDefault(); upd({ s: clamp(items[sel].s * (e.deltaY < 0 ? 1.06 : 0.94), 0.05, 6) }); };
  const cur = items[sel];
  const upload = e => { const file = e.target.files[0]; if (!file) return; const i = new Image(); i.onload = () => { setBase(i); toast("Photo added. Now dress it up.", "PFP.exe"); }; i.src = URL.createObjectURL(file); e.target.value = ""; };
  const exportPng = () => {
    const c = document.createElement("canvas"); c.width = c.height = 400; draw(c.getContext("2d"), 400, false);
    c.toBlob(async b => { const r = await saveFile("pig-pfp.png", b); toast(r === "saved" ? "Saved pig-pfp.png (400×400)." : r === "declined" ? "Save cancelled." : "Couldn't save the file here.", "PFP.exe"); }, "image/png");
  };
  return html`<div class="pfp">
    <div class="stage"><canvas ref=${cv} width=${W} height=${W} onPointerDown=${down} onWheel=${wheel} aria-label="Profile picture canvas. Drag stickers to move them."></canvas></div>
    <div class="side">
      <fieldset class="group"><span class="legend">Photo</span>
        <div class="row"><button class="btn sm" onClick=${() => fileIn.current.click()}>Upload…</button>${base && html`<button class="btn sm" onClick=${() => setBase(null)}>Use the field</button>`}</div>
        <input ref=${fileIn} type="file" accept="image/*" hidden onChange=${upload} /></fieldset>
      <fieldset class="group"><span class="legend">Stickers</span>
        <div class="stickers">${stickers.map(s => html`<button key=${s.id} title=${s.name} aria-label=${"Add " + s.name} style=${`background-image:url(${s.src})`} onClick=${() => add(s)}></button>`)}</div></fieldset>
      <fieldset class="group"><span class="legend">Frame</span>
        <div class="frames">${FRAMES.map(([k, l]) => html`<button key=${k} class=${frame === k ? "on" : ""} aria-pressed=${frame === k} onClick=${() => setFrame(k)}>${l}</button>`)}</div></fieldset>
      ${cur ? html`<fieldset class="group"><span class="legend">Selected sticker</span>
          <div class="field"><label for="pfp-size">Size</label><input id="pfp-size" type="range" min="0.05" max="3" step="0.01" value=${cur.s} onInput=${e => upd({ s: +e.target.value })} /></div>
          <div class="field"><label for="pfp-rot">Rotate</label><input id="pfp-rot" type="range" min="-3.1416" max="3.1416" step="0.01" value=${cur.r} onInput=${e => upd({ r: +e.target.value })} /></div>
          <div class="row"><button class="btn sm" onClick=${() => { setItems(a => [...a.filter((_, j) => j !== sel), a[sel]]); setSel(items.length - 1); }}>To front</button>
            <button class="btn sm" onClick=${() => { setItems(a => a.filter((_, j) => j !== sel)); setSel(-1); }}>Remove</button></div></fieldset>`
        : html`<p style="margin:0;font-size:11px;color:var(--muted)">Click a sticker on the canvas to move, resize or rotate it.</p>`}
      <button class="btn go lg" onClick=${exportPng}>Save 400×400 PNG</button>
    </div>
  </div>`;
}

// =============== Buy.exe ===============
export function Buy({ toast }) {
  const caRef = useRef(null); const ca = PIG.CA;
  const copy = async () => { const ok = await copyText(ca, caRef.current); toast(ok ? "Contract address copied." : "Clipboard is blocked here. The address is selected, copy it manually.", "Buy.exe"); };
  return html`<div class="pad">
    <div class="coin-card"><img src="assets/logo.webp" alt="" />
      <div><h3>${PIG.ticker}</h3><div style="color:var(--muted);font-size:11px">PIG on Solana · launches on ${PIG.launchProvider}</div></div></div>
    <div class="field"><label for="buy-ca">Verified contract address</label>
      <div class="ca"><input id="buy-ca" class="inp" ref=${caRef} readonly value=${ca || "Not live yet"} /><button class="btn sm" onClick=${copy} disabled=${!ca}>Copy</button></div></div>
    ${ca ? html`<div class="links">
        <a class="btn go" href=${pumpUrl(ca)} target="_blank" rel="noopener">Buy on pump.fun ↗</a>
        <a class="btn blue" href=${dexUrl(ca)} target="_blank" rel="noopener">Dexscreener ↗</a>
        <a class="btn" href=${solscanUrl(ca)} target="_blank" rel="noopener">Solscan ↗</a></div>`
      : html`<div class="notice"><span><b>${PIG.ticker} isn't live yet.</b> The address shows here the moment it launches. Until then there is nothing to buy, and any "$PIG" address shared before it appears here isn't ours.</span></div>`}
    <fieldset class="group"><span class="legend">How to buy</span>
      <ol class="how"><li>Install Phantom and fund it with SOL.</li><li>Copy the address from this window and check every character.</li><li>Open it on pump.fun, connect, and buy only what you can afford to lose.</li></ol></fieldset>
    ${PIG.X && html`<a class="btn" href=${PIG.X} target="_blank" rel="noopener">PIG on X ↗</a>`}
  </div>`;
}

// =============== Gallery.exe ===============
export function Gallery({ toast }) {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(-1);
  useEffect(() => { makeMemes().then(setItems).catch(() => setItems([])); }, []);
  useEffect(() => {
    if (open < 0) return;
    const k = e => { if (e.key === "Escape") setOpen(-1); if (e.key === "ArrowRight") setOpen(i => (i + 1) % items.length); if (e.key === "ArrowLeft") setOpen(i => (i - 1 + items.length) % items.length); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [open, items]);
  const save = async it => {
    const b = await (await fetch(it.src)).blob(); const ext = it.src.startsWith("data:image/jpeg") ? "jpg" : "webp";
    const r = await saveFile(it.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "." + ext, b);
    toast(r === "saved" ? "Meme saved." : r === "declined" ? "Save cancelled." : "Couldn't save here.", "Gallery.exe");
  };
  if (!items) return html`<div class="pad"><div class="notice">Developing the memes…</div></div>`;
  const it = items[open];
  return html`<div>
    <div class="gal">${items.map((m, i) => html`<button key=${i} onClick=${() => { play.click(); setOpen(i); }} aria-label=${"Open " + m.title}><img src=${m.src} alt=${m.title} loading="lazy" /><span>${m.title}</span></button>`)}</div>
    ${it && html`<div class="lightbox" onClick=${e => e.target === e.currentTarget && setOpen(-1)} role="dialog" aria-label=${it.title}>
      <figure><img src=${it.src} alt=${it.title} />
        <figcaption><b>${it.title}</b>
          <button class="btn sm" onClick=${() => setOpen((open - 1 + items.length) % items.length)}>‹ Prev</button>
          <button class="btn sm" onClick=${() => setOpen((open + 1) % items.length)}>Next ›</button>
          <button class="btn sm go" onClick=${() => save(it)}>Save</button>
          <button class="btn sm" onClick=${() => setOpen(-1)}>Close</button></figcaption></figure></div>`}
  </div>`;
}
