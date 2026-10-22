// Tiny synthesized sound kit — no audio files. Everything stays silent until the first click.
import { store } from "./net.js";

let ctx = null, master = null;
let enabled = store.get("sound", true);
const listeners = new Set();

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}
export const audioCtx = () => ac();

export const sfx = {
  get on() { return enabled; },
  set(v) { enabled = !!v; store.set("sound", enabled); listeners.forEach(f => f(enabled)); },
  sub(f) { listeners.add(f); return () => listeners.delete(f); },
};

function tone(freq, t0, dur, { type = "sine", vol = 0.25, to = null, attack = 0.01 } = {}) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, c.currentTime + t0 + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
  o.connect(g); g.connect(master); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
}

function grunt(t0, f0, f1, dur) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), o2 = c.createOscillator(), bp = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
  o.type = "sawtooth"; o2.type = "square";
  const t = c.currentTime + t0;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  o2.frequency.setValueAtTime(f0 * 0.5, t); o2.frequency.exponentialRampToValueAtTime(f1 * 0.5, t + dur);
  lfo.frequency.value = 38; lg.gain.value = 18; lfo.connect(lg); lg.connect(o.frequency);
  bp.type = "bandpass"; bp.frequency.setValueAtTime(950, t); bp.frequency.linearRampToValueAtTime(600, t + dur); bp.Q.value = 3;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(master);
  [o, o2, lfo].forEach(x => { x.start(t); x.stop(t + dur + 0.05); });
}

export const play = {
  open() { if (!enabled) return; tone(523, 0, 0.18, { type: "triangle", vol: 0.18 }); tone(784, 0.07, 0.22, { type: "triangle", vol: 0.16 }); tone(1047, 0.14, 0.3, { type: "sine", vol: 0.1 }); },
  close() { if (!enabled) return; tone(660, 0, 0.12, { type: "triangle", vol: 0.14 }); tone(440, 0.06, 0.16, { type: "triangle", vol: 0.12 }); },
  min() { if (!enabled) return; tone(700, 0, 0.18, { type: "sine", vol: 0.12, to: 300 }); },
  click() { if (!enabled) return; tone(1400, 0, 0.04, { type: "square", vol: 0.04 }); },
  pop() { if (!enabled) return; tone(880, 0, 0.09, { type: "triangle", vol: 0.15, to: 1320 }); },
  coin() { if (!enabled) return; tone(988, 0, 0.08, { type: "square", vol: 0.08 }); tone(1319, 0.08, 0.25, { type: "square", vol: 0.08 }); },
  oink() { if (!enabled) return; grunt(0, 260, 150, 0.16); grunt(0.2, 300, 170, 0.2); },
  boot() { if (!enabled) return; [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.11, 0.5, { type: "sine", vol: 0.12 })); },
  error() { if (!enabled) return; tone(220, 0, 0.25, { type: "square", vol: 0.08 }); },
};
