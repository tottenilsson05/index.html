// PIG Radio's Lana Del Rey channel: YouTube's official embedded player, driven over its postMessage API.
// It lives at desktop level (the dock above the tray), so it never reloads when windows open, close or minimize.
import { TRACKS } from "./config.js";
import { store } from "./net.js";

const ORIGIN = "https://www.youtube-nocookie.com";

class YTRadio {
  constructor() {
    this.frame = null; this.subs = new Set(); this.listening = null;
    this.s = { ready: false, status: "idle", idx: 0, title: TRACKS[0].title, time: 0, dur: 0, vol: store.get("vol", 70), muted: false, failed: false, everPlayed: false };
    addEventListener("message", e => this.onMsg(e));
  }
  get src() {
    const ids = TRACKS.map(t => t.id);
    return `${ORIGIN}/embed/${ids[0]}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&playlist=${ids.slice(1).join(",")}&loop=1&origin=${encodeURIComponent(location.origin)}`;
  }
  attach(frame) {
    if (this.frame === frame) return; this.frame = frame;
    clearInterval(this.listening);
    this.listening = setInterval(() => { if (this.s.ready) return clearInterval(this.listening); this.post({ event: "listening", id: 1, channel: "widget" }); }, 300);
    setTimeout(() => { if (!this.s.ready) this.set({ failed: true, status: "error" }); }, 12000);
  }
  post(obj) { try { this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify(obj), ORIGIN); } catch {} }
  cmd(func, args = []) { this.post({ event: "command", func, args, id: 1, channel: "widget" }); }
  set(p) { this.s = { ...this.s, ...p }; this.subs.forEach(f => f(this.s)); }
  sub(f) { this.subs.add(f); f(this.s); return () => this.subs.delete(f); }
  onMsg(e) {
    if (e.origin !== ORIGIN || !this.frame || e.source !== this.frame.contentWindow) return;
    let d; try { d = JSON.parse(e.data); } catch { return; }
    if (d.event === "onReady" || (d.event === "infoDelivery" && !this.s.ready)) {
      if (!this.s.ready) { this.set({ ready: true, failed: false, status: this.s.status === "error" ? "idle" : this.s.status }); this.cmd("setVolume", [this.s.vol]); }
    }
    if (d.event === "onError") this.set({ status: "error" });
    const i = d.event === "infoDelivery" ? d.info : null;
    if (d.event === "onStateChange") this.state(d.info);
    if (!i) return;
    const p = {};
    if (typeof i.playerState === "number") Object.assign(p, this.stateP(i.playerState));
    if (typeof i.playlistIndex === "number" && i.playlistIndex >= 0) { p.idx = i.playlistIndex; if (!(i.videoData && i.videoData.title)) p.title = TRACKS[i.playlistIndex] ? TRACKS[i.playlistIndex].title : this.s.title; }
    if (i.videoData && i.videoData.title) p.title = i.videoData.title.replace(/^Lana Del Rey\s*[-–]\s*/i, "").replace(/\s*\((Official|Audio).*?\)\s*$/i, "");
    if (typeof i.currentTime === "number") p.time = i.currentTime;
    if (typeof i.duration === "number" && i.duration > 0) p.dur = i.duration;
    if (typeof i.muted === "boolean") p.muted = i.muted;
    if (Object.keys(p).length) this.set(p);
  }
  stateP(n) { // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (n === 1) return { status: "playing", everPlayed: true };
    if (n === 3) return { status: "loading" };
    if (n === 2) return { status: "paused" };
    if (n === 0) return { status: "paused" };
    return {};
  }
  state(n) { const p = this.stateP(n); if (Object.keys(p).length) this.set(p); }
  play() { if (this.s.muted) this.unmute(); this.cmd("playVideo"); }
  pause() { this.cmd("pauseVideo"); }
  toggle() { this.s.status === "playing" || this.s.status === "loading" ? this.pause() : this.play(); }
  next() { this.cmd("nextVideo"); }
  prev() { this.cmd("previousVideo"); }
  playAt(i) { this.set({ idx: i, title: TRACKS[i].title }); this.cmd("playVideoAt", [i]); }
  setVol(v) { this.set({ vol: v }); store.set("vol", v); this.cmd("setVolume", [v]); }
  mute() { this.set({ muted: true }); this.cmd("mute"); }
  unmute() { this.set({ muted: false }); this.cmd("unMute"); }
  seek(t) { this.set({ time: t }); this.cmd("seekTo", [t, true]); }
}

export const yt = new YTRadio();
