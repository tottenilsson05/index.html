// Shared building blocks: Preact + htm, icons, the window frame, the animated mascot, small helpers.
export { html, render, useState, useEffect, useRef, useCallback, useMemo, useReducer } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.module.js";
import { html, useState, useEffect, useRef } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.module.js";
import { play } from "./sfx.js";
import { detectMode } from "./net.js";

// ---------- helpers ----------
export const cx = (...a) => a.filter(Boolean).join(" ");
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const isMobile = () => window.matchMedia("(max-width:760px)").matches;
export const hhmm = ts => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export async function copyText(text, fallbackEl) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    if (fallbackEl) { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    return false;
  }
}

export async function saveFile(filename, blob) {
  if ((await detectMode()) === "artifact" && window.claude && window.claude.use) {
    const d = await window.claude.use("downloads");
    if (d) {
      try { await d.save({ filename, data: blob }); return "saved"; }
      catch (e) { return e && e.code === "declined" ? "declined" : "failed"; }
    }
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return "saved";
}

// ---------- icons ----------
const S = (inner, vb = "0 0 48 48") => html`<svg viewBox=${vb} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const IMG = id => () => html`<img src=${"assets/icon_" + id + ".png"} alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;image-rendering:auto" />`;
const SVG_ICONS = {
  welcome: () => html`<span style="display:block;width:100%;height:100%;border-radius:12px;overflow:hidden;background:linear-gradient(#3b8ee8,#a9d6ff 62%,#5cc93a 62%);border:2px solid #fff;box-sizing:border-box">
      <img src="assets/pig_full.webp" alt="" style="width:100%;height:150%;object-fit:cover;object-position:50% 2%" /></span>`,
  chat: () => S(html`<defs><linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3ec"/><stop offset="1" stop-color="#f08aa9"/></linearGradient></defs>
      <path d="M8 8h32a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H22l-9 8v-8H8a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5z" fill="url(#gc)" stroke="#fff" stroke-width="2.5"/>
      <ellipse cx="24" cy="21.5" rx="9" ry="6.5" fill="#f9b9cb" stroke="#c8607f" stroke-width="1.6"/><ellipse cx="20.5" cy="21.5" rx="1.8" ry="2.6" fill="#8a3550"/><ellipse cx="27.5" cy="21.5" rx="1.8" ry="2.6" fill="#8a3550"/>`),
  radio: () => S(html`<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc6ff"/><stop offset="1" stop-color="#2a6ee0"/></linearGradient></defs>
      <path d="M14 14 L18 5 H30 L34 14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <rect x="3" y="13" width="42" height="28" rx="6" fill="url(#gr)" stroke="#fff" stroke-width="2.5"/>
      <circle cx="14" cy="28" r="7.5" fill="#1b2f66" stroke="#ffd6e5" stroke-width="2"/><circle cx="14" cy="28" r="2.5" fill="#f4a5b8"/>
      <circle cx="34" cy="28" r="7.5" fill="#1b2f66" stroke="#ffd6e5" stroke-width="2"/><circle cx="34" cy="28" r="2.5" fill="#f4a5b8"/>
      <rect x="20" y="17" width="8" height="4" rx="1" fill="#ffd6e5"/>`),
  facts: () => S(html`<path d="M10 4h22l8 8v32H10z" fill="#fff" stroke="#9bb7d9" stroke-width="2"/><path d="M32 4v8h8" fill="#ffd6e5" stroke="#9bb7d9" stroke-width="2"/>
      <path d="M15 18h18M15 23h18M15 28h12" stroke="#b8c8de" stroke-width="2"/>
      <circle cx="30" cy="35" r="8" fill="#f4a5b8" stroke="#fff" stroke-width="2"/><text x="30" y="39.5" font-size="12" font-weight="700" text-anchor="middle" fill="#fff" font-family="Fredoka,sans-serif">?</text>`),
  launch: () => S(html`<path d="M24 3c8 6 11 15 9 26l-4 5H19l-4-5C13 18 16 9 24 3z" fill="#ffe3ec" stroke="#fff" stroke-width="2.5"/><path d="M24 3c8 6 11 15 9 26l-4 5h-5V3z" fill="#f4a5b8"/>
      <circle cx="24" cy="17" r="4.5" fill="#5ea9f5" stroke="#fff" stroke-width="2"/><path d="M15 26l-6 7 7-1zM33 26l6 7-7-1z" fill="#e2789a" stroke="#fff" stroke-width="1.5"/>
      <path d="M20 35c1 5 2 8 4 10 2-2 3-5 4-10z" fill="#ffb347"/><path d="M22 35c.6 3 1.2 5 2 6 .8-1 1.4-3 2-6z" fill="#fff3a0"/>`),
  pfp: () => S(html`<rect x="4" y="4" width="40" height="40" rx="6" fill="#f5c518" stroke="#fff" stroke-width="2.5"/><rect x="9" y="9" width="30" height="30" rx="3" fill="#a9d6ff"/>
      <path d="M9 32c6-5 12-5 30-2v9H9z" fill="#5cc93a"/><circle cx="24" cy="23" r="7" fill="#f4a5b8"/><ellipse cx="24" cy="25" rx="3.4" ry="2.4" fill="#e2789a"/><circle cx="21.5" cy="20.5" r="1.2" fill="#222"/><circle cx="26.5" cy="20.5" r="1.2" fill="#222"/>`),
  buy: () => S(html`<defs><radialGradient id="gb" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6b0"/><stop offset=".5" stop-color="#f5c518"/><stop offset="1" stop-color="#c99400"/></radialGradient></defs>
      <circle cx="24" cy="24" r="20" fill="url(#gb)" stroke="#fff" stroke-width="2.5"/><circle cx="24" cy="24" r="14.5" fill="none" stroke="#b07f00" stroke-width="1.5" stroke-dasharray="2 2.5"/>
      <ellipse cx="24" cy="25" rx="9" ry="7" fill="#f4a5b8" stroke="#c8607f" stroke-width="1.5"/><ellipse cx="20.5" cy="25" rx="1.8" ry="2.7" fill="#8a3550"/><ellipse cx="27.5" cy="25" rx="1.8" ry="2.7" fill="#8a3550"/>`),
  gallery: () => S(html`<rect x="9" y="5" width="32" height="26" rx="2" fill="#fff" stroke="#c9d7ea" stroke-width="2" transform="rotate(8 25 18)"/>
      <rect x="5" y="13" width="34" height="28" rx="2" fill="#fff" stroke="#fff" stroke-width="2"/><rect x="8" y="16" width="28" height="19" fill="#5ea9f5"/>
      <path d="M8 35l9-9 6 5 5-4 8 8z" fill="#5cc93a"/><circle cx="30" cy="21" r="3" fill="#fff3a0"/><circle cx="17" cy="23" r="3.5" fill="#f4a5b8"/>`),
  sound: on => S(html`<path d="M4 18h8l10-8v28l-10-8H4z" fill="#fff"/>${on
      ? html`<path d="M28 17c3 3 3 11 0 14M33 12c6 6 6 18 0 24" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : html`<path d="M30 18l12 12M42 18L30 30" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`}`),
  play: () => S(html`<path d="M15 9l26 15-26 15z"/>`),
  pause: () => S(html`<rect x="12" y="9" width="9" height="30" rx="2"/><rect x="27" y="9" width="9" height="30" rx="2"/>`),
  next: () => S(html`<path d="M8 10l20 14L8 38zM32 10h6v28h-6z"/>`),
  prev: () => S(html`<path d="M40 10L20 24l20 14zM10 10h6v28h-6z"/>`),
  wallet: () => S(html`<rect x="4" y="12" width="40" height="28" rx="5" fill="#fff"/><path d="M8 12l26-7 3 7" fill="#ffd6e5"/><rect x="30" y="22" width="14" height="9" rx="3" fill="#f4a5b8"/>`),
  power: () => S(html`<circle cx="24" cy="24" r="19" fill="#e8513c" stroke="#fff" stroke-width="2.5"/><path d="M24 12v12" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M16 17a11 11 0 1 0 16 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  // the official X mark (path from Simple Icons) on a black tile
  x: () => S(html`<rect x="2" y="2" width="44" height="44" rx="10" fill="#000" stroke="#fff" stroke-width="2.5"/><g transform="translate(12 12)"><path fill="#fff" d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></g>`),
};
// Dexscreener's own logo via Google's favicon service (dexscreener.com blocks hotlinking its file); a plain tile if both are blocked.
const DEX_SRC = ["https://www.google.com/s2/favicons?domain=dexscreener.com&sz=128", "https://dexscreener.com/favicon.png"];
const DEX_FALLBACK = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="10" fill="#000" stroke="#fff" stroke-width="2.5"/><text x="24" y="30" font-family="Arial" font-weight="700" font-size="13" fill="#fff" text-anchor="middle">DEX</text></svg>');
export const DexLogo = () => html`<img class="dexlogo" src=${DEX_SRC[0]} alt="" draggable="false"
  onError=${e => { const i = e.currentTarget, n = +(i.dataset.n || 0) + 1; i.dataset.n = n; i.src = n < DEX_SRC.length ? DEX_SRC[n] : DEX_FALLBACK; if (n >= DEX_SRC.length) i.onerror = null; }} />`;
export const ICONS = { ...SVG_ICONS, dex: DexLogo, welcome: IMG("welcome"), chat: IMG("chat"), radio: IMG("radio"), facts: IMG("facts"), launch: IMG("launch"), pfp: IMG("pfp"), buy: IMG("buy"), gallery: IMG("gallery") };

// ---------- window frame ----------
const ctlIcon = {
  min: html`<svg viewBox="0 0 10 10"><path d="M1 8.5h8"/></svg>`,
  max: html`<svg viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8"/></svg>`,
  rest: html`<svg viewBox="0 0 10 10"><rect x="1" y="3" width="6" height="6"/><path d="M3 3V1h6v6H7"/></svg>`,
  close: html`<svg viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>`,
};

export function Window({ id, st, active, title, icon, flush, dispatch, children, label, status }) {
  const ref = useRef(null);
  const [anim, setAnim] = useState("");
  const [boot, setBoot] = useState(true);
  useEffect(() => { const t = setTimeout(() => setBoot(false), 520); return () => clearTimeout(t); }, []);
  const drag = (e, kind) => {
    if (e.button !== 0 || st.max || isMobile()) return;
    if (kind === "move" && e.target.closest("button")) return;
    const el = ref.current; e.preventDefault();
    dispatch({ t: "focus", id });
    const s = { px: e.clientX, py: e.clientY, x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    const tgt = e.currentTarget; tgt.setPointerCapture(e.pointerId);
    const vw = innerWidth, vh = innerHeight - 44;
    const mv = ev => {
      const dx = ev.clientX - s.px, dy = ev.clientY - s.py;
      if (kind === "move") { el.style.left = clamp(s.x + dx, 60 - s.w, vw - 60) + "px"; el.style.top = clamp(s.y + dy, 0, vh - 32) + "px"; }
      else { el.style.width = clamp(s.w + dx, 280, vw - s.x) + "px"; el.style.height = clamp(s.h + dy, 180, vh - s.y) + "px"; }
    };
    const up = () => {
      tgt.removeEventListener("pointermove", mv); tgt.removeEventListener("pointerup", up); tgt.removeEventListener("pointercancel", up);
      dispatch({ t: "geom", id, x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    tgt.addEventListener("pointermove", mv); tgt.addEventListener("pointerup", up); tgt.addEventListener("pointercancel", up);
  };
  const close = () => { play.close(); setAnim("closing"); setTimeout(() => { setAnim(""); dispatch({ t: "close", id }); }, 170); };
  const min = () => { play.min(); setAnim("minning"); setTimeout(() => { setAnim(""); dispatch({ t: "min", id }); }, 240); };
  const style = `left:${st.x}px;top:${st.y}px;width:${st.w}px;height:${st.h}px;z-index:${st.z};${st.min ? "visibility:hidden;pointer-events:none;" : ""}`;
  return html`<section ref=${ref} class=${cx("win", !active && "inactive", st.max && "max", anim)} style=${style} role="dialog" aria-label=${label || title}
      aria-hidden=${st.min ? "true" : "false"} onPointerDown=${() => !active && dispatch({ t: "focus", id })}>
    <header class="tb" onPointerDown=${e => drag(e, "move")} onDblClick=${e => !e.target.closest("button") && !isMobile() && dispatch({ t: "max", id })}>
      <span class="ti">${icon}</span><span class="tt">${title}</span>
      <span class="ctl">
        <button type="button" aria-label="Minimize" onClick=${min}>${ctlIcon.min}</button>
        <button type="button" class="mx" aria-label=${st.max ? "Restore" : "Maximize"} onClick=${() => { play.click(); dispatch({ t: "max", id }); }}>${st.max ? ctlIcon.rest : ctlIcon.max}</button>
        <button type="button" class="x" aria-label="Close" onClick=${close}>${ctlIcon.close}</button>
      </span>
    </header>
    <div class=${cx("wb", flush && "flush")}>${children}
      ${boot && html`<div class="wload" aria-hidden="true"><span class="pix">Loading ${label || title}…</span><div class="xpbar"><i></i></div></div>`}</div>
    ${status && html`<div class="sb">${status.map((t, i) => html`<span key=${i}>${t}</span>`)}</div>`}
    ${!st.max && html`<div class="grip" aria-hidden="true" onPointerDown=${e => drag(e, "size")}></div>`}
  </section>`;
}

// ---------- mascot ----------
// Layered from the real render: ears (rotate at their roots), body, two pupils that follow the cursor, eyelids for blinking.
export function Mascot({ mood = "", children }) {
  const [auto, setAuto] = useState("");
  useEffect(() => {
    let alive = true, t1, t2;
    const blink = () => { if (!alive) return; setAuto(a => a + " blink"); setTimeout(() => alive && setAuto(a => a.replace(" blink", "")), 200); t1 = setTimeout(blink, 2200 + Math.random() * 4200); };
    const ears = () => { if (!alive) return; setAuto(a => a + " wiggle"); setTimeout(() => alive && setAuto(a => a.replace(" wiggle", "")), 950); t2 = setTimeout(ears, 6000 + Math.random() * 7000); };
    t1 = setTimeout(blink, 1500); t2 = setTimeout(ears, 4000);
    return () => { alive = false; clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return html`<div class=${cx("mascot", mood, auto)}>
    <div class="bob">
      <img class="ear l" src="assets/pig_earL.webp" alt="" />
      <img class="ear r" src="assets/pig_earR.webp" alt="" />
      <img class="body" src="assets/pig_body.webp" alt="PIG, the low-poly pig in a diaper" />
      <img class="iris l" src="assets/iris0.webp" alt="" />
      <img class="iris r" src="assets/iris1.webp" alt="" />
      <i class="lid l"></i><i class="lid r"></i>
      ${children}
    </div>
  </div>`;
}

// Cursor tracking + parallax for every mascot and world layer, one listener for the whole page.
export function startLook() {
  let mx = innerWidth * 0.3, my = innerHeight * 0.4, raf = 0;
  const apply = () => {
    raf = 0;
    document.querySelectorAll(".mascot").forEach(m => {
      const r = m.getBoundingClientRect(); if (!r.width) return;
      const ex = r.left + r.width * 0.55, ey = r.top + r.height * 0.13;
      const dx = clamp((mx - ex) / (r.width * 1.6 + 200), -1, 1), dy = clamp((my - ey) / (r.height * 1.2 + 200), -1, 1);
      m.style.setProperty("--ix", (dx * 11).toFixed(1) + "%"); m.style.setProperty("--iy", (dy * 7).toFixed(1) + "%");
      m.style.setProperty("--tilt", (dx * 2).toFixed(2) + "deg");
    });
    const nx = mx / innerWidth - 0.5, ny = my / innerHeight - 0.5;
    document.querySelectorAll("[data-depth]").forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-nx * d).toFixed(1)}px,${(-ny * d * 0.5).toFixed(1)}px,0)`; });
  };
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(apply); }, { passive: true });
  apply();
}
