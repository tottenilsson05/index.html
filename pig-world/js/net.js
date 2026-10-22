// Everything that talks to the outside world: which backend we are on, the shared chat,
// presence, the wallet, and the pump.fun launch pipeline.
//
// Two backends, same interface:
//  • hosted  — the Vercel deployment: /api/live (Upstash Redis) for chat + online count,
//              /api/upload, /api/create, /api/send for real pump.fun launches (PumpPortal).
//  • artifact — the Claude-hosted page: the `db` capability for shared chat and `room` for who's online.
import { PIG } from "./config.js";

export const API = location.origin + "/api";
const store = {
  get(k, d) { try { const v = localStorage.getItem("pig:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("pig:" + k, JSON.stringify(v)); } catch {} },
};
export { store };

export const SID = (() => {
  let s = store.get("sid", null);
  if (!s) { s = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); store.set("sid", s); }
  return s;
})();

export function guestName() {
  let n = store.get("name", null);
  if (!n) { n = "piglet" + Math.floor(1000 + Math.random() * 9000); store.set("name", n); }
  return n;
}
export const cleanName = s => String(s || "").replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 16);

async function withTimeout(p, ms) {
  let t; const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error("timeout")), ms); });
  try { return await Promise.race([p, timeout]); } finally { clearTimeout(t); }
}

// ---------- backend detection ----------
let modePromise = null;
export function detectMode() {
  if (!modePromise) modePromise = (async () => {
    try {
      const r = await withTimeout(fetch(API + "/live?probe=1", { cache: "no-store" }), 2500);
      if (r.ok && (r.headers.get("content-type") || "").includes("json")) return "hosted";
    } catch {}
    return "artifact";
  })();
  return modePromise;
}

// ---------- chat ----------
// Message shape everywhere: {id, name, text, ts, sid, r:{key:count}}
export const REACTS = [
  { k: "pig", e: "🐷", label: "pig" },
  { k: "snout", e: "🐽", label: "oink" },
  { k: "bag", e: "💰", label: "greed" },
  { k: "pump", e: "📈", label: "pump" },
  { k: "rekt", e: "🔪", label: "slaughtered" },
];

function clip(t) { return String(t || "").replace(/\s+/g, " ").trim().slice(0, 280); }

class HostedChat {
  constructor() { this.subs = new Set(); this.msgs = []; this.online = null; this.timer = null; this.mode = "hosted"; this.canWrite = true; this.ready = false; this.error = null; }
  start() {
    const tick = async () => {
      try {
        const r = await fetch(API + "/live", { cache: "no-store" });
        const j = await r.json();
        if (Array.isArray(j.msgs)) { this.msgs = j.msgs; this.ready = true; }
        this.error = j.error ? "offline" : null;
        if (typeof j.online === "number") this.online = j.online;
        this.emit();
      } catch {}
    };
    const beat = () => this.post({ t: "hi" }).then(j => { if (j && typeof j.online === "number") { this.online = j.online; this.emit(); } }).catch(() => {});
    tick(); beat();
    this.timer = setInterval(() => { if (!document.hidden) tick(); }, 1800);
    this.beat = setInterval(beat, 30000);
  }
  async post(body) {
    const r = await fetch(API + "/live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, sid: SID }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "the pen didn't take that message");
    return j;
  }
  async send(name, text) {
    const j = await this.post({ t: "chat", name, text: clip(text) });
    if (j.msg) { this.msgs = [...this.msgs.filter(m => m.id !== j.msg.id), j.msg]; this.emit(); }
  }
  async react(m, k) { await this.post({ t: "react", id: m.id, k }); }
  subscribe(fn) { this.subs.add(fn); fn(this); return () => this.subs.delete(fn); }
  emit() { this.subs.forEach(f => f(this)); }
}

class ArtifactChat {
  constructor() { this.subs = new Set(); this.msgs = []; this.online = null; this.mode = "artifact"; this.canWrite = null; this.ready = false; this.error = null; }
  async start() {
    let c = window.claude;
    for (let i = 0; i < 30 && !(c && c.use); i++) { await new Promise(r => setTimeout(r, 100)); c = window.claude; }
    if (!c || !c.use) { this.error = "offline"; this.canWrite = false; this.emit(); return; }
    const [db, room, user] = await Promise.all([c.use("db"), c.use("room"), c.use("user")]);
    this.db = db;
    if (user) {
      try { const w = await user.can("data.write"); this.canWrite = w == null ? null : !!w; } catch {}
      try { this.uid = await user.id(); } catch {}
    }
    if (!db) { this.error = "offline"; this.canWrite = false; this.emit(); return; }
    db.collection("pen").orderBy("ts", "desc").limit(80).onSnapshot(snap => {
      this.msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
      this.ready = true; this.emit();
    }, e => { this.error = e.code; this.emit(); });
    if (room) {
      const count = () => { const ps = room.peers().filter(p => p.kind === "viewer"); this.online = Math.max(1, ps.length); this.emit(); };
      room.onPeers(count, () => {});
      room.presence({ at: "pig-world" }).catch(() => {});
    }
  }
  async send(name, text) {
    if (!this.db) throw new Error("chat is offline in this view");
    try {
      await this.db.collection("pen").add({ name, text: clip(text), ts: Date.now(), sid: SID, r: {} });
    } catch (e) {
      if (e && e.code === "invalid_argument") { this.canWrite = false; this.emit(); throw new Error("You can read the pen here, but posting needs Contributor access to this page."); }
      if (e && e.code === "quota_exceeded") throw new Error("The pen is full. The owner needs to clear old messages.");
      throw new Error("Message didn't send. Try again in a moment.");
    }
  }
  async react(m, k) {
    if (!this.db) return;
    const cur = (m.r && m.r[k]) || 0;
    await this.db.doc("pen/" + m.id).update({ r: { [k]: cur + 1 } });
  }
  subscribe(fn) { this.subs.add(fn); fn(this); return () => this.subs.delete(fn); }
  emit() { this.subs.forEach(f => f(this)); }
}

let chatInst = null;
export async function getChat() {
  if (chatInst) return chatInst;
  const mode = await detectMode();
  chatInst = mode === "hosted" ? new HostedChat() : new ArtifactChat();
  chatInst.start();
  return chatInst;
}

// ---------- wallet (Phantom / any Solana wallet that injects window.solana) ----------
export function walletProvider() {
  const p = (window.phantom && window.phantom.solana) || window.solana || (window.backpack && window.backpack.solana) || null;
  return p && p.connect ? p : null;
}
export const short = a => a ? a.slice(0, 4) + "…" + a.slice(-4) : "";
export async function connectWallet() {
  const p = walletProvider();
  if (!p) throw new Error("No Solana wallet found in this browser. Install Phantom, then reload this page.");
  const res = await p.connect();
  const pk = (res && res.publicKey) || p.publicKey;
  return pk.toString();
}
export async function disconnectWallet() { try { await walletProvider()?.disconnect(); } catch {} }

// ---------- launch on pump.fun (hosted only) ----------
const b64ToBytes = b => Uint8Array.from(atob(b), c => c.charCodeAt(0));
const bytesToB64 = u => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };

let web3p = null;
function loadWeb3() {
  if (window.solanaWeb3) return Promise.resolve(window.solanaWeb3);
  if (!web3p) web3p = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.95.8/lib/index.iife.min.js";
    s.onload = () => window.solanaWeb3 ? res(window.solanaWeb3) : rej(new Error("Solana library failed to load"));
    s.onerror = () => rej(new Error("Solana library failed to load"));
    document.head.appendChild(s);
  });
  return web3p;
}

export async function launchesReady() {
  if ((await detectMode()) !== "hosted") return { ready: false, why: "preview" };
  try { const j = await (await fetch(API + "/upload")).json(); return { ready: !!j.ready, why: j.ready ? "" : "off" }; }
  catch { return { ready: false, why: "off" }; }
}

// step(name, state) is called as the launch moves: upload → build → sign → send
export async function launchCoin(form, owner, step) {
  const p = walletProvider();
  if (!p) throw new Error("Connect a Solana wallet first.");
  step("upload", "doing");
  const up = await fetch(API + "/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
  const uj = await up.json().catch(() => ({}));
  if (!up.ok || !uj.uri) { step("upload", "fail"); throw new Error(uj.error || "Image upload failed."); }
  step("upload", "done");

  step("build", "doing");
  const web3 = await loadWeb3();
  const mint = web3.Keypair.generate();
  const cr = await fetch(API + "/create", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey: owner, mint: mint.publicKey.toBase58(), name: form.name, symbol: form.symbol, uri: uj.uri, amount: form.amount }) });
  const cj = await cr.json().catch(() => ({}));
  if (!cr.ok || !cj.tx) { step("build", "fail"); throw new Error(cj.error || "pump.fun didn't build the transaction."); }
  const tx = web3.VersionedTransaction.deserialize(b64ToBytes(cj.tx));
  tx.sign([mint]);
  step("build", "done");

  step("sign", "doing");
  let signed;
  try { signed = await p.signTransaction(tx); }
  catch { step("sign", "fail"); throw new Error("You declined the transaction in your wallet. Nothing was sent."); }
  step("sign", "done");

  step("send", "doing");
  const sr = await fetch(API + "/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tx: bytesToB64(signed.serialize()) }) });
  const sj = await sr.json().catch(() => ({}));
  if (!sr.ok || !sj.signature) { step("send", "fail"); throw new Error(sj.error || "Solana rejected the transaction."); }
  step("send", "done");
  fetch(API + "/live", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ t: "launch", sid: SID, mint: mint.publicKey.toBase58(), name: form.name, symbol: form.symbol, sig: sj.signature }) }).catch(() => {});
  return { mint: mint.publicKey.toBase58(), signature: sj.signature };
}
