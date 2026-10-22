// PIG World — the desktop shell: wallpaper, mascot, icons, window manager, widget, taskbar.
import { html, render, useState, useEffect, useRef, useReducer, useCallback, cx, isMobile, ICONS, Window, Mascot, startLook, copyText } from "./ui.js";
import { Welcome, Chat, Radio, Facts, Launch, Pfp, Buy, Gallery } from "./apps.js";
import { PIG } from "./config.js";
import { detectMode, getChat, connectWallet, disconnectWallet, walletProvider, short, SID } from "./net.js";
import { sfx, play } from "./sfx.js";
import { yt } from "./ytradio.js";
import { TRACKS } from "./config.js";

const APPS = [
  { id: "welcome", file: "PIG.exe", title: "PIG.exe — Welcome to PIG", w: 640, h: 540 },
  { id: "chat", file: "Chat.exe", title: "Chat.exe — PIG PEN", w: 380, h: 560 },
  { id: "radio", file: "Radio.exe", title: "PIG RADIO", w: 430, h: 560 },
  { id: "facts", file: "PigFacts.txt", title: "PigFacts.txt — Notepad", w: 620, h: 600 },
  { id: "launch", file: "Launch.exe", title: "Launch.exe — Launch a Coin", w: 520, h: 620 },
  { id: "pfp", file: "PFP.exe", title: "PFP.exe — PIG Profile Picture", w: 700, h: 540 },
  { id: "buy", file: "Buy.exe", title: "Buy.exe — " + PIG.ticker, w: 440, h: 440 },
  { id: "gallery", file: "Gallery.exe", title: "Gallery.exe — PIG Memes", w: 640, h: 500 },
];
const byId = Object.fromEntries(APPS.map(a => [a.id, a]));

// ---------- window manager ----------
function place(id, n) {
  const a = byId[id], vw = innerWidth, vh = innerHeight - 38;
  const w = Math.min(a.w, vw - 24), h = Math.min(a.h, vh - 24);
  if (id === "chat") { const top = vw >= 900 ? 160 : 10, bottom = document.querySelector(".dock") ? 230 : 14; return { x: vw - w - 12, y: top, w, h: Math.max(320, Math.min(620, vh - top - bottom)) }; }
  let x, y;
  if (id === "welcome") { x = Math.max(110, Math.round(vw * 0.36 - w / 2)); y = Math.max(14, Math.round((vh - h) / 2) - 30); }
  else { x = Math.round((vw - w) / 2) + (n % 6) * 24 - 70; y = Math.max(10, Math.round((vh - h) / 2) - 30) + (n % 6) * 20; }
  return { x: Math.max(8, Math.min(x, vw - w - 8)), y: Math.max(8, Math.min(y, vh - h - 8)), w, h };
}
function wm(s, a) {
  const top = s.z + 1;
  switch (a.t) {
    case "open": {
      const cur = s.wins[a.id];
      if (cur && cur.open) return { ...s, z: top, active: a.id, wins: { ...s.wins, [a.id]: { ...cur, min: false, z: top } } };
      return { ...s, z: top, active: a.id, n: s.n + 1, wins: { ...s.wins, [a.id]: { ...(cur && cur.w ? cur : place(a.id, s.n)), open: true, min: false, max: false, z: top } } };
    }
    case "focus": return s.wins[a.id] ? { ...s, z: top, active: a.id, wins: { ...s.wins, [a.id]: { ...s.wins[a.id], z: top, min: false } } } : s;
    case "close": { const w = { ...s.wins }; w[a.id] = { ...w[a.id], open: false }; return { ...s, wins: w, active: s.active === a.id ? null : s.active }; }
    case "min": return { ...s, active: s.active === a.id ? null : s.active, wins: { ...s.wins, [a.id]: { ...s.wins[a.id], min: true } } };
    case "max": return { ...s, z: top, active: a.id, wins: { ...s.wins, [a.id]: { ...s.wins[a.id], max: !s.wins[a.id].max, z: top } } };
    case "geom": return { ...s, wins: { ...s.wins, [a.id]: { ...s.wins[a.id], x: a.x, y: a.y, w: a.w, h: a.h } } };
    case "closeAll": { const w = {}; for (const k in s.wins) w[k] = { ...s.wins[k], open: false }; return { ...s, wins: w, active: null }; }
    default: return s;
  }
}

// ---------- the world behind the desktop ----------
const WISPS = [{ y: "8%", w: "30vw", t: "260s", d: "-40s" }, { y: "22%", w: "18vw", t: "200s", d: "-150s" }, { y: "34%", w: "24vw", t: "320s", d: "-90s" }];

// small pixel things drifting through the sky: stars, hearts, coins, a tiny cursor
const SPRITES = {
  star: ["..#..", ".###.", "#####", ".###.", "..#.."],
  heart: [".#.#.", "#####", "#####", ".###.", "..#.."],
  coin: [".###.", "#+#+#", "##+##", "#+#+#", ".###."],
};
const SPRITE_COL = { star: ["#ffffff"], heart: ["#ef94ab"], coin: ["#ffcb3d", "#b98600"] };
function Floaties() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, g = c.getContext("2d"); let W, H, raf, last = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const kinds = ["star", "star", "star", "heart", "coin", "star"];
    const ps = Array.from({ length: 14 }, (_, i) => ({ k: kinds[i % kinds.length], x: Math.random(), y: 0.04 + Math.random() * 0.5, v: 0.004 + Math.random() * 0.01, s: 2 + (i % 3), ph: Math.random() * 6 }));
    const size = () => { W = c.width = Math.ceil(innerWidth / 2); H = c.height = Math.ceil(innerHeight / 2); g.imageSmoothingEnabled = false; };
    size(); addEventListener("resize", size);
    const drawSprite = (p, tw) => {
      const rows = SPRITES[p.k], col = SPRITE_COL[p.k];
      rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === ".") return; g.fillStyle = ch === "+" ? (col[1] || col[0]) : col[0]; g.globalAlpha = p.k === "star" ? 0.5 + 0.5 * tw : 0.9; g.fillRect(Math.round(p.x * W) + i * p.s / 2, Math.round(p.y * H + Math.sin(p.ph) * 4) + j * p.s / 2, Math.ceil(p.s / 2), Math.ceil(p.s / 2)); }));
    };
    const tick = t => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || t - last < 66) return; const dt = Math.min(200, t - last) / 1000; last = t;
      g.clearRect(0, 0, W, H);
      for (const p of ps) { p.x += p.v * dt; p.ph += dt * (0.6 + p.s * 0.1); if (p.x > 1.05) { p.x = -0.05; p.y = 0.04 + Math.random() * 0.5; } drawSprite(p, Math.abs(Math.sin(t / 700 + p.ph))); }
      g.globalAlpha = 1;
    };
    if (reduce) { ps.forEach(p => drawSprite(p, 1)); } else raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return html`<canvas class="floaties" ref=${ref} aria-hidden="true" style="width:100%;height:100%"></canvas>`;
}

// tiny pixel sparkles behind the cursor (desktop pointers only)
function startTrail() {
  if (!matchMedia("(pointer:fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let last = 0; const cols = ["#ffffff", "#ef94ab", "#ffcb3d", "#7bd83f"];
  addEventListener("pointermove", e => {
    const now = performance.now(); if (now - last < 45) return; last = now;
    if (e.target.closest && e.target.closest(".win,.taskbar,.smenu")) return;
    const d = document.createElement("i"); d.className = "trail";
    d.style.left = e.clientX + (Math.random() * 10 - 5) + "px"; d.style.top = e.clientY + 8 + (Math.random() * 6) + "px"; d.style.background = cols[(Math.random() * cols.length) | 0];
    document.body.appendChild(d); setTimeout(() => d.remove(), 650);
  }, { passive: true });
}

// ---------- desktop widget ----------
function Widget({ online, radio, toast }) {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const copy = async () => { const ok = await copyText(PIG.CA); toast(ok ? "Contract address copied." : "Clipboard is blocked here. Copy it from Buy.exe.", "PIG World"); };
  return html`<aside class="widget" aria-label="PIG World status">
    <header><span class="on pix"><i class="led"></i>PIG WORLD ONLINE</span><span class="pix">${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></header>
    <div class="ticker" aria-label="Bulls make money. Bears make money. Pigs get slaughtered."><span aria-hidden="true">Bulls make money ✦ Bears make money ✦ <b>Pigs get slaughtered</b> ✦ Everyone is a pig sometimes ✦</span></div>
    <div class="rows">
      <div class="row"><span>In the pen</span><span>${online == null ? "–" : online + " online"}</span></div>
      <div class="row"><span>PIG Radio</span><span style="max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${radio.playing ? radio.title : "off air"}</span></div>
      <div class="row"><span>${PIG.ticker} CA</span>${PIG.CA ? html`<button onClick=${copy}>${short(PIG.CA)} copy</button>` : html`<span>at launch</span>`}</div>
    </div>
  </aside>`;
}

// ---------- taskbar pieces ----------
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 10000); return () => clearInterval(i); }, []);
  return html`<span class="clock" title=${t.toLocaleDateString()}>${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
}
function Eq({ real }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf; const root = document.documentElement; let ph = 0;
    const tick = () => { raf = requestAnimationFrame(tick); ph += 0.12; const l = real ? (+getComputedStyle(root).getPropertyValue("--lvl") || 0) : 0.35 + 0.25 * Math.sin(ph); const el = ref.current; if (!el) return;
      [...el.children].forEach((b, i) => { b.style.height = (3 + Math.min(1, l * (1.2 - i * 0.2) + (l ? Math.random() * 0.2 : 0)) * 9).toFixed(1) + "px"; }); };
    tick(); return () => cancelAnimationFrame(raf);
  }, [real]);
  return html`<span class="eq" ref=${ref} aria-hidden="true"><i></i><i></i><i></i></span>`;
}

// ---------- PIG Radio dock (hosted): YouTube's player lives here for the whole visit ----------
function RadioDock({ openRadio }) {
  const [st, setSt] = useState(yt.s);
  const [mini, setMini] = useState(false);
  const frame = useRef(null);
  useEffect(() => yt.sub(setSt), []);
  useEffect(() => { yt.attach(frame.current); }, []);
  const label = st.failed ? ["err", "NO SIGNAL"] : st.stalled ? ["err", "NOT STARTING"] : !st.ready ? ["wait", "TUNING IN…"] : st.status === "playing" ? ["", "ON AIR"] : st.status === "loading" ? ["wait", "BUFFERING…"] : ["", "PAUSED"];
  return html`<section class=${cx("dock", mini && "mini")} aria-label="PIG Radio player">
    <header><span class=${"st " + label[0]}>● ${label[1]}</span><span>PIG RADIO</span>
      <button onClick=${() => setMini(m => !m)} aria-label=${mini ? "Show video" : "Hide video"} title=${mini ? "Show video" : "Hide video"}>${mini ? "▴" : "▾"}</button>
      <button onClick=${openRadio} aria-label="Open Radio.exe" title="Open Radio.exe">⧉</button></header>
    <div class="vid"><iframe ref=${frame} src=${yt.src} title="PIG Radio: Lana Del Rey on YouTube" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <div class="row2">
      <button class="rb" aria-label="Previous track" onClick=${() => yt.prev()} disabled=${!st.ready}>${ICONS.prev()}</button>
      <button class=${cx("rb", st.status === "playing" && "on")} aria-label=${st.status === "playing" ? "Pause" : "Play"} onClick=${() => yt.toggle()} disabled=${!st.ready}>${st.status === "playing" ? ICONS.pause() : ICONS.play()}</button>
      <button class="rb" aria-label="Next track" onClick=${() => yt.next()} disabled=${!st.ready}>${ICONS.next()}</button>
      <button class=${cx("rb", st.muted && "on")} aria-label=${st.muted ? "Unmute" : "Mute"} onClick=${() => st.muted ? yt.unmute() : yt.mute()} disabled=${!st.ready}>${ICONS.sound(!st.muted)}</button>
      <div class=${cx("ttl", st.title.length > 18 && st.status === "playing" && "run")} title=${st.title}><span>${st.title} · Lana Del Rey</span></div>
    </div>
    ${(st.stalled || st.failed) && html`<div class="stall">YouTube isn't starting here. <a href=${"https://www.youtube.com/watch?v=" + (TRACKS[st.idx] || TRACKS[0]).id} target="_blank" rel="noopener">Open on YouTube ↗</a></div>`}
  </section>`;
}

function MusicGate({ onClose }) {
  const go = () => { yt.unmute(); yt.play(); play.boot(); onClose(); };
  useEffect(() => { const k = e => { if (e.key === "Enter") go(); if (e.key === "Escape") onClose(); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  return html`<div class="gate" role="dialog" aria-label="Enter PIG World">
    <div class="box"><div class="tb"><span class="ti">${ICONS.radio()}</span><span class="tt">PIG RADIO — sound check</span></div>
      <div class="in"><div class="art" role="img" aria-label="PIG between giant pink P and G letters"></div>
        <p>Your browser kept the music paused until you say so. PIG Radio is playing Lana Del Rey.</p>
        <button class="btn go lg" autofocus onClick=${go}>Enter PIG World — enable music</button>
        <button class="skip" onClick=${onClose}>Enter without music</button></div></div>
  </div>`;
}

function StartMenu({ open, close, closeAll, toast }) {
  const ref = useRef(null);
  useEffect(() => {
    const k = e => e.key === "Escape" && close();
    const out = e => ref.current && !ref.current.contains(e.target) && !e.target.closest(".start") && close();
    addEventListener("keydown", k); addEventListener("pointerdown", out);
    ref.current && ref.current.querySelector("button").focus();
    return () => { removeEventListener("keydown", k); removeEventListener("pointerdown", out); };
  }, []);
  const go = id => { open(id); close(); };
  const li = a => html`<li key=${a.id}><button onClick=${() => go(a.id)}><span class="ico">${ICONS[a.id]()}</span><span>${a.file}</span></button></li>`;
  return html`<nav class="smenu" ref=${ref} aria-label="Start menu">
    <div class="top"><img src="assets/pig_full.webp" alt="" />Pig User</div>
    <div class="cols"><ul>${APPS.slice(0, 4).map(li)}</ul>
      <ul>${APPS.slice(4).map(li)}${PIG.X && html`<li><a href=${PIG.X} target="_blank" rel="noopener"><span class="ico">${ICONS.x()}</span><span>PIG on X</span></a></li>`}</ul></div>
    <div class="bot">
      <button onClick=${() => { closeAll(); close(); }}>${ICONS.power()}<span>Close all windows</span></button>
      <button onClick=${() => { close(); toast("You can't shut down greed.", "Shut Down"); }}>${ICONS.power()}<span>Shut down</span></button>
    </div>
  </nav>`;
}

// ---------- app ----------
const SAYINGS = ["oink?", "wen moon", "I'm not greedy, I'm early", "one more pump", "ser pls", "is it too late to buy?", "I'll sell at 10x", "gm", "don't touch my bags"];

function App() {
  const [s, dispatch] = useReducer(wm, { wins: {}, z: 10, n: 0, active: null });
  const [mode, setMode] = useState(null);
  const [chat, setChat] = useState(null);
  const [online, setOnline] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [radio, setRadio] = useState({ playing: false, title: "", real: false });
  const [ys, setYs] = useState(yt.s);
  const [gate, setGate] = useState(false);
  const radioCtl = useRef(null);
  const [unread, setUnread] = useState(0);
  const [soundOn, setSoundOn] = useState(sfx.on);
  const [menu, setMenu] = useState(false);
  const [sel, setSel] = useState(null);
  const [idle, setIdle] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [mood, setMood] = useState("");
  const [say, setSay] = useState(null);
  const [piglet, setPiglet] = useState(null);
  const [rain, setRain] = useState(null);
  const clicks = useRef(0), moodT = useRef(0), incomingRef = useRef(() => {});

  const toast = useCallback((msg, head) => {
    const id = Math.random(); setToasts(t => [...t.slice(-2), { id, msg, head }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  const moodFor = (m, ms) => { setMood(m); clearTimeout(moodT.current); moodT.current = setTimeout(() => setMood(""), ms); };
  const speak = text => setSay({ text, k: Math.random() });
  const open = useCallback(id => { play.open(); dispatch({ t: "open", id }); moodFor("hop wiggle", 650); if (id === "chat") setUnread(0); }, []);

  useEffect(() => {
    startLook(); startTrail();
    detectMode().then(m => {
      setMode(m); getChat().then(c => {
        setChat(c);
        let seen = null;
        c.subscribe(x => {
          setOnline(x.online);
          const ready = x.ready;
          if (!ready) return;
          if (seen) { const fresh = x.msgs.filter(mm => !seen.has(mm.id) && mm.sid !== SID); if (fresh.length) incomingRef.current(fresh.length, fresh[fresh.length - 1]); }
          seen = new Set(x.msgs.map(mm => mm.id));
        });
      });
      dispatch({ t: "open", id: "welcome" });
      if (!isMobile() && innerWidth >= 900) { setTimeout(() => { dispatch({ t: "open", id: "chat" }); dispatch({ t: "focus", id: "welcome" }); }, 60); }
      if (m === "hosted") {
        yt.sub(setYs);
        // try to start the radio by itself; if the browser holds sound back, ask once
        let asked = false;
        const off = yt.sub(st => {
          if (st.ready && !asked) { asked = true; yt.play(); setTimeout(() => { if (!yt.s.everPlayed || yt.s.status !== "playing") setGate(true); }, 2600); }
          if (st.failed && !asked) { asked = true; }
        });
      }
    });
    const p = walletProvider();
    if (p && p.connect) p.connect({ onlyIfTrusted: true }).then(r => r && r.publicKey && setWallet(r.publicKey.toString())).catch(() => {});
    const unsub = sfx.sub(setSoundOn);
    const boot = document.getElementById("boot"); const done = () => boot && boot.classList.add("done");
    Promise.all(["assets/wallpaper.webp", "assets/pig_body.webp"].map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; }))).then(() => setTimeout(done, 300));
    setTimeout(done, 2500);
    // icons fidget now and then, never two at once
    const fid = setInterval(() => { const a = APPS[(Math.random() * APPS.length) | 0].id; setIdle(a); setTimeout(() => setIdle(null), 1300); }, 9000);
    return () => { unsub(); clearInterval(fid); };
  }, []);

  useEffect(() => {
    let t; const next = () => { t = setTimeout(() => { setPiglet({ k: Math.random(), back: Math.random() < 0.5 }); next(); }, 40000 + Math.random() * 40000); };
    t = setTimeout(() => { setPiglet({ k: 1, back: false }); next(); }, 12000);
    return () => clearTimeout(t);
  }, []);

  const connect = async () => {
    try { const pk = await connectWallet(); setWallet(pk); play.coin(); toast(`Connected ${short(pk)}.`, "Wallet"); }
    catch (e) { toast(e.message || "Wallet connection was cancelled.", "Wallet"); }
  };
  const walletBtn = async () => { if (wallet) { await disconnectWallet(); setWallet(null); toast("Wallet disconnected.", "Wallet"); } else connect(); };

  const chatVisible = !!(s.wins.chat && s.wins.chat.open && !s.wins.chat.min);
  const onIncoming = (n, m) => {
    moodFor("hop wiggle", 600);
    if (!chatVisible || document.hidden) { setUnread(u => u + n); if (m) toast(`<${m.name}> ${m.text.length > 80 ? m.text.slice(0, 80) + "…" : m.text}`, "PIG PEN"); }
  };
  const onSent = () => moodFor("hop", 560);
  incomingRef.current = onIncoming;
  useEffect(() => { if (chatVisible) setUnread(0); }, [chatVisible]);

  const pigClick = () => {
    play.click(); clicks.current++;
    if (clicks.current >= 10) { clicks.current = 0; greed(); return; }
    moodFor("derp hop", 900); speak(SAYINGS[(Math.random() * SAYINGS.length) | 0]);
  };
  const nose = e => { e.stopPropagation(); play.oink(); moodFor("hop wiggle", 700); speak("OINK!"); };
  const greed = () => {
    play.coin(); setTimeout(play.oink, 300);
    setRain(Array.from({ length: 34 }, (_, i) => ({ k: i, l: Math.random() * 100, d: 1.8 + Math.random() * 2.2, dl: Math.random() * 1.2 })));
    setTimeout(() => setRain(null), 4800);
    moodFor("spin", 950); speak("MORE.");
    toast("You clicked ten times hoping for more. Textbook pig.", "GREED MODE");
  };

  const statusFor = id => {
    if (id === "welcome") return [mode === "hosted" ? "Connected to PIG World" : "Preview of PIG World", wallet ? short(wallet) : "No wallet"];
    if (id === "chat") return [chat && chat.mode === "artifact" ? "Live via this page" : "Live", (online == null ? "–" : online) + " online"];
    if (id === "radio") return [music.playing ? "Playing: " + music.title : "Ready", music.playing && music.real ? "Visualizer: live" : hosted ? "YouTube · Lana Del Rey" : "Visualizer: idle"];
    if (id === "facts") return ["Ln 1, Col 1", "UTF-8"];
    if (id === "launch") return [mode === "hosted" ? "pump.fun via PumpPortal" : "Launches run on the hosted site", wallet ? short(wallet) : "No wallet"];
    if (id === "pfp") return ["400 × 400 PNG", "Drag · scroll to resize"];
    if (id === "buy") return [PIG.CA ? "Live" : "Not live yet", "Solana"];
    if (id === "gallery") return ["8 objects", "Click to view"];
  };
  const win = (id, body, opts = {}) => {
    const st = s.wins[id]; if (!st || !st.open) return null; const a = byId[id];
    return html`<${Window} key=${id} id=${id} st=${st} active=${s.active === id} title=${a.title} label=${a.file} icon=${ICONS[id]()} dispatch=${dispatch} flush=${opts.flush} status=${statusFor(id)}>${body}<//>`;
  };
  const hosted = mode === "hosted";
  const music = radio.playing ? radio : hosted && ys.status === "playing" ? { playing: true, title: ys.title, real: false } : { playing: false, title: hosted ? ys.title : radio.title, real: false };
  const radioOpen = !!(s.wins.radio && s.wins.radio.open);
  const rc = { toggle: () => radioOpen && radioCtl.current ? radioCtl.current.toggle() : hosted ? yt.toggle() : open("radio"),
    next: () => radioOpen && radioCtl.current ? radioCtl.current.next() : hosted ? yt.next() : open("radio"),
    prev: () => radioOpen && radioCtl.current ? radioCtl.current.prev() : hosted ? yt.prev() : open("radio") };
  const pigMood = cx(mood, music.playing && "dance");

  return html`<div class="world">
      <div class="wall" data-depth="14" aria-hidden="true"></div>
      <div class="wisps" aria-hidden="true">${WISPS.map((w, i) => html`<div class="wisp" key=${i} style=${`--y:${w.y};--w:${w.w};--t:${w.t};--d:${w.d}`}></div>`)}</div>
      <${Floaties} />
      <div class="field-pig" data-depth="26">
        <div class="shadow"></div>
        <${Mascot} mood=${pigMood}>
          <button class="pig-btn" aria-label="Poke PIG" onClick=${pigClick} onDblClick=${() => { moodFor("spin", 950); speak("wheee"); }}></button>
          <button class="nose-btn" aria-label="Boop the snout" onClick=${nose}></button>
        <//>
        ${say && html`<div class="say" key=${say.k} onAnimationEnd=${() => setSay(null)}>${say.text}</div>`}
        ${music.playing && html`<div class="notes" aria-hidden="true"><span>♪</span><span>♫</span><span>♪</span></div>`}
      </div>
    </div>

    <div class="icons" role="list" aria-label="Desktop">
      ${APPS.map(a => html`<button role="listitem" key=${a.id} class=${cx("icon", sel === a.id && "sel", idle === a.id && "idle")}
          onClick=${() => { if (isMobile()) open(a.id); else { setSel(a.id); play.click(); } }} onDblClick=${() => open(a.id)}
          onKeyDown=${e => e.key === "Enter" && open(a.id)} aria-label=${"Open " + a.file}>
        <span class="glyph">${ICONS[a.id]()}</span><span class="lbl">${a.file}</span>
        ${a.id === "chat" && unread > 0 && html`<span class="new">NEW</span>`}</button>`)}
    </div>

    ${!isMobile() && html`<${Widget} online=${online} radio=${music} toast=${toast} />`}
    ${hosted && html`<${RadioDock} openRadio=${() => open("radio")} />`}
    ${gate && html`<${MusicGate} onClose=${() => setGate(false)} />`}

    ${win("welcome", html`<${Welcome} open=${open} toast=${toast} />`)}
    ${win("chat", html`<${Chat} chat=${chat} wallet=${wallet} visible=${chatVisible} onSent=${onSent} />`, { flush: true })}
    ${win("radio", html`<${Radio} mode=${mode} visible=${!!(s.wins.radio && !s.wins.radio.min)} onState=${setRadio} ctl=${radioCtl} toast=${toast} />`, { flush: true })}
    ${win("facts", html`<${Facts} />`)}
    ${win("launch", html`<${Launch} wallet=${wallet} connect=${connect} toast=${toast} />`)}
    ${win("pfp", html`<${Pfp} toast=${toast} />`)}
    ${win("buy", html`<${Buy} toast=${toast} />`)}
    ${win("gallery", html`<${Gallery} toast=${toast} />`)}

    ${piglet && html`<div class=${cx("piglet", piglet.back && "back")} key=${piglet.k} onAnimationEnd=${() => setPiglet(null)}
        onClick=${() => { play.oink(); toast("You found a tiny pig. It's also holding bags.", "Secret"); }} role="button" aria-label="Tiny walking pig" tabindex="-1">
      <img src="assets/pig_full.webp" alt="" /></div>`}
    ${rain && html`<div class="coinrain" aria-hidden="true">${rain.map(c => html`<i key=${c.k} style=${`left:${c.l}%;animation-duration:${c.d}s;animation-delay:${c.dl}s`}>P</i>`)}</div>`}

    ${menu && html`<${StartMenu} open=${open} close=${() => setMenu(false)} closeAll=${() => dispatch({ t: "closeAll" })} toast=${toast} />`}
    <div class="toasts" aria-live="polite">${toasts.map(t => html`<div class="toast" key=${t.id}>${t.head && html`<b>${t.head}</b>`}${t.msg}</div>`)}</div>

    <footer class="taskbar">
      <button class="start" aria-expanded=${menu} aria-label="Start" onClick=${() => { play.click(); setMenu(m => !m); }}><img src="assets/pig_full.webp" alt="" /><span>start</span></button>
      <div class="tasks">
        ${APPS.filter(a => s.wins[a.id] && s.wins[a.id].open).map(a => {
          const st = s.wins[a.id]; const on = s.active === a.id && !st.min;
          return html`<button key=${a.id} class=${cx("task", on && "on")} title=${a.title}
              onClick=${() => { play.click(); if (on) dispatch({ t: "min", id: a.id }); else dispatch({ t: "focus", id: a.id }); if (a.id === "chat") setUnread(0); }}>
            <span class="ico">${ICONS[a.id]()}</span><span>${a.file}</span>${a.id === "chat" && unread > 0 && html`<i class="badge">${unread}</i>`}</button>`;
        })}
      </div>
      <div class="tray">
        ${music.playing && html`<${Eq} real=${music.real} />`}
        <button aria-label="Previous track" title="Previous track" onClick=${rc.prev}>${ICONS.prev()}</button>
        <button aria-label=${music.playing ? "Pause radio" : "Play radio"} title=${music.playing ? "Pause PIG Radio · " + music.title : "Play PIG Radio"} onClick=${rc.toggle}>${music.playing ? ICONS.pause() : ICONS.play()}</button>
        <button aria-label="Next track" title="Next track" onClick=${rc.next}>${ICONS.next()}</button>
        <button class="chatdot" aria-label=${unread ? unread + " new chat messages" : "Open chat"} title="PIG PEN" onClick=${() => open("chat")}><span class="ico">${ICONS.chat()}</span>${unread > 0 && html`<b>${unread > 9 ? "9+" : unread}</b>`}</button>
        <button aria-label=${soundOn ? "Mute sounds" : "Unmute sounds"} title=${soundOn ? "Sounds on" : "Sounds off"} aria-pressed=${!soundOn} onClick=${() => { sfx.set(!soundOn); if (!soundOn) play.pop(); }}>${ICONS.sound(soundOn)}</button>
        <button class="wal" onClick=${walletBtn} title=${wallet ? "Disconnect wallet" : "Connect a Solana wallet"}>${wallet ? short(wallet) : isMobile() ? "Wallet" : "Connect wallet"}</button>
        <${Clock} />
      </div>
    </footer>`;
}

render(html`<${App} />`, document.getElementById("root"));
