// Gallery memes and PFP stickers, drawn on canvas from the real PIG art so nothing is redrawn by hand.
const cache = {};
export function loadImg(src) {
  if (!cache[src]) cache[src] = new Promise((res, rej) => { const i = new Image(); if (/^(https?:)?\/\//.test(src) || document.baseURI.indexOf(location.origin) !== 0) i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });
  return cache[src];
}
const fontReady = () => (document.fonts && document.fonts.load ? Promise.all([document.fonts.load("64px Anton"), document.fonts.load("700 40px Fredoka")]).catch(() => {}) : Promise.resolve());

function memeText(g, text, x, y, size, maxW, { fill = "#fff", stroke = "#000", align = "center", base = "top" } = {}) {
  g.font = `${size}px Anton, Impact, sans-serif`; g.textAlign = align; g.textBaseline = base;
  const words = text.toUpperCase().split(" "); const lines = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  lines.push(line);
  const lh = size * 1.08; const startY = base === "bottom" ? y - lh * (lines.length - 1) : y;
  g.lineJoin = "round"; g.lineWidth = size / 7; g.strokeStyle = stroke; g.fillStyle = fill;
  lines.forEach((l, i) => { g.strokeText(l, x, startY + i * lh); g.fillText(l, x, startY + i * lh); });
}

export function sky(g, W, H, horizon = 0.62) {
  const s = g.createLinearGradient(0, 0, 0, H * horizon);
  s.addColorStop(0, "#1f6fe0"); s.addColorStop(1, "#a9d6ff"); g.fillStyle = s; g.fillRect(0, 0, W, H);
  const cloud = (cx, cy, r) => { g.fillStyle = "rgba(255,255,255,.95)"; [[0, 0, 1], [-.9, .25, .7], [.9, .25, .75], [-.4, -.35, .7], [.45, -.3, .65]].forEach(([dx, dy, k]) => { g.beginPath(); g.arc(cx + dx * r, cy + dy * r, r * k, 0, 7); g.fill(); }); };
  cloud(W * .2, H * .18, W * .07); cloud(W * .78, H * .12, W * .09); cloud(W * .55, H * .32, W * .05);
  const hill = (y0, col, amp, ph) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x / W * Math.PI * 2 + ph) * amp); g.lineTo(W, H); g.fill(); };
  hill(H * (horizon - .04), "#3f9e2e", H * .03, 1); hill(H * horizon + 10, "#5cc93a", H * .02, 3.2);
  const gr = g.createLinearGradient(0, H * horizon, 0, H); gr.addColorStop(0, "rgba(140,230,80,.0)"); gr.addColorStop(1, "rgba(40,120,20,.35)"); g.fillStyle = gr; g.fillRect(0, H * horizon, W, H);
}

function chart(g, W, H, up) {
  g.fillStyle = "#0f1626"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 1;
  for (let i = 0; i < W; i += 40) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke(); }
  for (let i = 0; i < H; i += 40) { g.beginPath(); g.moveTo(0, i); g.lineTo(W, i); g.stroke(); }
  let y = up ? H * .8 : H * .2; const n = 22, cw = W / n;
  for (let i = 0; i < n; i++) {
    const drift = up ? -(H * .028) : H * .03; const o = y; const c = y + drift + (Math.sin(i * 1.7) * H * .03);
    const green = c < o; g.fillStyle = green ? "#22c55e" : "#ef4444"; g.strokeStyle = g.fillStyle;
    g.beginPath(); g.moveTo(i * cw + cw / 2, Math.min(o, c) - 14); g.lineTo(i * cw + cw / 2, Math.max(o, c) + 14); g.lineWidth = 2; g.stroke();
    g.fillRect(i * cw + 4, Math.min(o, c), cw - 8, Math.max(6, Math.abs(c - o))); y = c;
  }
}

function placePig(g, pig, cx, bottom, h, flip = false) {
  const w = h * pig.width / pig.height;
  g.save(); g.translate(cx, bottom); if (flip) g.scale(-1, 1);
  g.fillStyle = "rgba(20,60,10,.28)"; g.beginPath(); g.ellipse(0, -h * .01, w * .36, h * .03, 0, 0, 7); g.fill();
  g.drawImage(pig, -w / 2, -h, w, h); g.restore();
}

function shades(g, x, y, w) { // pixel sunglasses, centered at x,y
  const p = w / 24; g.fillStyle = "#111";
  const rows = ["111111111111111111111111", "011111111100001111111110", "011221111100001122111110", "001111111000000111111100", "000111110000000011111000"];
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== "0") { g.fillStyle = ch === "2" ? "#fff" : "#111"; g.fillRect(x - w / 2 + i * p, y + j * p, p + .5, p + .5); } }));
}
function crown(g, x, y, w) {
  const h = w * .62; g.save(); g.translate(x - w / 2, y);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#fff3a0"); gr.addColorStop(.5, "#f5c518"); gr.addColorStop(1, "#c08a00");
  g.fillStyle = gr; g.strokeStyle = "#8a6200"; g.lineWidth = w * .03;
  g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * .25); g.lineTo(w * .25, h * .6); g.lineTo(w * .5, 0); g.lineTo(w * .75, h * .6); g.lineTo(w, h * .25); g.lineTo(w, h); g.closePath(); g.fill(); g.stroke();
  [[.5, .2, "#f4a5b8"], [.12, .55, "#5ea9f5"], [.88, .55, "#68cf45"]].forEach(([a, b, c]) => { g.fillStyle = c; g.beginPath(); g.arc(w * a, h * b + h * .25, w * .06, 0, 7); g.fill(); });
  g.restore();
}

export async function makeMemes() {
  await fontReady();
  const pig = await loadImg("assets/pig_full.webp");
  const S = 720, list = [];
  const mk = (title, draw) => { const c = document.createElement("canvas"); c.width = c.height = S; draw(c.getContext("2d")); list.push({ title, src: c.toDataURL("image/jpeg", 0.88) }); };

  mk("Bought the top", g => { chart(g, S, S, false); placePig(g, pig, S * .5, S * .98, S * .62); memeText(g, "me, 3 seconds after aping", S / 2, 24, 58, S - 60); memeText(g, "bought the top", S / 2, S - 22, 74, S - 60, { base: "bottom" }); });
  mk("The famous saying", g => {
    const bands = [["#2fb24a", "bulls make money"], ["#e8892a", "bears make money"], ["#d94141", "pigs get slaughtered"]];
    bands.forEach(([c, t], i) => { g.fillStyle = c; g.fillRect(0, i * S / 3, S, S / 3); memeText(g, t, i === 2 ? S * .36 : S / 2, i * S / 3 + S / 6, 56, i === 2 ? S * .62 : S - 60, { base: "middle" }); });
    placePig(g, pig, S * .82, S * 1.02, S * .38);
  });
  mk("I'll sell at 10x", g => { chart(g, S, S, true); placePig(g, pig, S * .5, S * .98, S * .58); memeText(g, "up 5x", S / 2, 26, 78, S - 60, { fill: "#86efac" }); memeText(g, "\"i'll sell at 10x\"", S / 2, S - 22, 66, S - 60, { base: "bottom" }); });
  mk("PIG World online", g => { sky(g, S, S); placePig(g, pig, S * .5, S * .95, S * .7); memeText(g, "gm from pig world", S / 2, 26, 64, S - 60, { fill: "#ffd6e5", stroke: "#9b3b5c" }); });
  mk("Everyone is a pig sometimes", g => {
    g.fillStyle = "#ffd6e5"; g.fillRect(0, 0, S, S);
    const h = S * .3; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.globalAlpha = r === 1 && c === 1 ? 1 : .35; placePig(g, pig, S * (c + .5) / 4, S * .38 + r * h * .82, h * .9, (r + c) % 2 === 1); }
    g.globalAlpha = 1; memeText(g, "everyone is a pig sometimes", S / 2, S - 26, 64, S - 60, { base: "bottom", fill: "#fff", stroke: "#9b3b5c" });
  });
  mk("Taking profits?", g => {
    sky(g, S, S, .66); const h = S * .72, w = h * pig.width / pig.height; placePig(g, pig, S * .5, S * .98, h);
    const top = S * .98 - h; shades(g, S * .5 + w * .05, top + h * .1, w * .5); crown(g, S * .5 + w * .048, top - h * .11, w * .36);
    memeText(g, "taking profits?", S / 2, 22, 70, S - 60); memeText(g, "never heard of her", S / 2, S - 22, 66, S - 60, { base: "bottom" });
  });
  list.push({ title: "Official PIG art", src: "assets/logo.webp" });
  list.push({ title: "PIG banner", src: "assets/banner.webp" });
  return list;
}

// Stickers for PFP.exe — real art layers plus a few drawn accessories.
export async function makeStickers() {
  await fontReady();
  const out = [
    { id: "pig", name: "PIG", src: "assets/pig_full.webp" },
    { id: "snout", name: "Snout", src: "assets/snout.webp" },
    { id: "earL", name: "Left ear", src: "assets/pig_earL.webp" },
    { id: "earR", name: "Right ear", src: "assets/pig_earR.webp" },
    { id: "word", name: "PIG logo", src: "assets/wordmark.webp" },
  ];
  const draw = (id, name, w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); out.push({ id, name, src: c.toDataURL("image/png") }); };
  draw("shades", "Shades", 240, 60, (g, w) => shades(g, w / 2, 5, w));
  draw("crown", "Crown", 220, 150, (g, w) => crown(g, w / 2, 6, w - 12));
  draw("ticker", "$PIG", 300, 120, (g, w, h) => { g.font = "700 92px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 14; g.strokeStyle = "#fff"; g.strokeText("$PIG", w / 2, h / 2 + 4); g.fillStyle = "#e2789a"; g.fillText("$PIG", w / 2, h / 2 + 4); });
  draw("bag", "Money bag", 200, 220, (g) => {
    const gr = g.createRadialGradient(80, 110, 10, 100, 140, 110); gr.addColorStop(0, "#f3dca0"); gr.addColorStop(1, "#b88a3a");
    g.fillStyle = gr; g.beginPath(); g.ellipse(100, 145, 82, 72, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(70, 80); g.quadraticCurveTo(100, 100, 130, 80); g.lineTo(145, 40); g.quadraticCurveTo(100, 62, 55, 40); g.closePath(); g.fill();
    g.fillStyle = "#7a5410"; g.fillRect(66, 76, 68, 10);
    g.font = "700 76px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2f7d1f"; g.fillText("$", 100, 150);
  });
  draw("heart", "Pink heart", 160, 150, (g) => { g.fillStyle = "#f48fb0"; g.strokeStyle = "#fff"; g.lineWidth = 10; g.beginPath(); g.moveTo(80, 138); g.bezierCurveTo(-30, 60, 30, -20, 80, 40); g.bezierCurveTo(130, -20, 190, 60, 80, 138); g.closePath(); g.stroke(); g.fill(); });
  return out;
}
