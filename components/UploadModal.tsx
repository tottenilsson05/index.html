'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';
import { IconCamera } from './Icons';

const OUT = 1080; // output square size
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EXAMPLES = ['3 weeks of hard work.', 'My dog has a better mo than me.', 'The trenches made me grow this.', "Not much but it's honest work."];

export default function UploadModal({ onClose, onPosted }: { onClose: () => void; onPosted: (p: Post) => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset in output px
  const [caption, setCaption] = useState('');
  const [wallet, setWallet] = useState('');
  const [xh, setXh] = useState('');
  const [hp, setHp] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number; pts: Map<number, { x: number; y: number }>; d0?: number; z0?: number } | null>(null);
  const placeholder = useRef(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);

  // close on escape, lock body scroll
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && !sending && onClose();
    window.addEventListener('keydown', k);
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = o; };
  }, [onClose, sending]);

  // geometry: image covers the square at zoom 1
  function geom(z = zoom, p = pos) {
    if (!img) return null;
    const base = Math.max(OUT / img.naturalWidth, OUT / img.naturalHeight);
    const s = base * z;
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    const maxX = (w - OUT) / 2, maxY = (h - OUT) / 2;
    const x = Math.max(-maxX, Math.min(maxX, p.x)), y = Math.max(-maxY, Math.min(maxY, p.y));
    return { s, w, h, x, y };
  }

  function draw(target?: HTMLCanvasElement) {
    const c = target || canvasRef.current;
    const g = geom();
    if (!c || !g || !img) return;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (OUT - g.w) / 2 + g.x, (OUT - g.h) / 2 + g.y, g.w, g.h);
  }
  useEffect(() => { draw(); });

  function pick(f: File | undefined) {
    setErr(null);
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr('Please choose a photo.'); return; }
    if (f.size > 25 * 1024 * 1024) { setErr('That photo is huge. Max 25 MB before cropping.'); return; }
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => { setImg(im); setZoom(1); setPos({ x: 0, y: 0 }); };
    im.onerror = () => setErr('Could not read that image. Try a JPG or PNG.');
    im.src = url;
  }

  // pointer drag + pinch
  function scaleFactor() {
    const c = canvasRef.current; if (!c) return 1;
    return OUT / c.getBoundingClientRect().width;
  }
  function onDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    if (!drag.current) drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, pts: new Map() };
    drag.current.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (drag.current.pts.size === 2) {
      const [a, b] = [...drag.current.pts.values()];
      drag.current.d0 = Math.hypot(a.x - b.x, a.y - b.y); drag.current.z0 = zoom;
    }
  }
  function onMove(e: React.PointerEvent) {
    const d = drag.current; if (!d || !d.pts.has(e.pointerId)) return;
    d.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (d.pts.size >= 2 && d.d0 && d.z0) {
      const [a, b] = [...d.pts.values()];
      setZoom(Math.max(1, Math.min(4, d.z0 * (Math.hypot(a.x - b.x, a.y - b.y) / d.d0))));
      return;
    }
    const k = scaleFactor();
    const g = geom(zoom, { x: d.px + (e.clientX - d.x) * k, y: d.py + (e.clientY - d.y) * k });
    if (g) setPos({ x: g.x, y: g.y });
  }
  function onUp(e: React.PointerEvent) {
    const d = drag.current; if (!d) return;
    d.pts.delete(e.pointerId);
    if (d.pts.size === 0) drag.current = null;
    else { const [p] = [...d.pts.values()]; d.x = p.x; d.y = p.y; d.px = pos.x; d.py = pos.y; d.d0 = undefined; }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!img) return setErr('Add a photo of your mo first.');
    if (!caption.trim()) return setErr('Write a caption.');
    if (!BASE58.test(wallet.trim())) return setErr('Enter a valid Solana wallet address (public address only).');
    if (xh && !/^@?[A-Za-z0-9_]{1,15}$/.test(xh.trim())) return setErr('That X handle looks wrong.');

    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    draw(out);
    const blob: Blob | null = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.86));
    if (!blob) return setErr('Could not process the photo.');

    const fd = new FormData();
    fd.append('image', blob, 'mo.jpg');
    fd.append('caption', caption.trim());
    fd.append('wallet', wallet.trim());
    fd.append('x', xh.trim());
    fd.append('website', hp);
    setSending(true);
    try {
      const r = await fetch('/api/posts', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || 'Upload failed.'); setSending(false); return; }
      onPosted({ id: j.id, short_id: j.short_id, image_url: j.image_url, caption: caption.trim(), x_handle: xh.trim().replace(/^@/, '') || null, created_at: new Date().toISOString() });
      setDone(j.short_id);
    } catch {
      setErr('Network error. Try again.');
    }
    setSending(false);
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !sending && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="up-title">
        <div className="modal-h">
          <h3 id="up-title">{done ? 'You’re on the wall!' : 'Post your mo'}</h3>
          <button className="xbtn" onClick={onClose} aria-label="Close" disabled={sending}>✕</button>
        </div>

        {done ? (
          <div className="modal-b ok-box">
            <img src="/logo.png" alt="" width={180} height={66} style={{ margin: '0 auto' }} className="bob" />
            <p className="d" style={{ fontSize: 34, margin: '8px 0 0' }}>POSTED. {done}</p>
            <p className="lede" style={{ margin: 0 }}>Your mo is live for everyone. Now go get the votes — share it on X.</p>
            <button className="btn btn-green btn-block" onClick={onClose}>Back to the wall</button>
          </div>
        ) : (
          <form className="modal-b" onSubmit={submit} noValidate>
            <div className="field">
              <label>Photo <small>{img ? 'Drag to move · pinch or slide to zoom' : 'Square crop'}</small></label>
              {!img ? (
                <div className="pick">
                  <label className="btn btn-green" style={{ cursor: 'pointer' }}>
                    <IconCamera className="" />
                    Upload photo
                    <input type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
                  </label>
                  <label className="btn" style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: 26 }}>📸</span>
                    Use camera
                    <input type="file" accept="image/*" capture="user" hidden onChange={(e) => pick(e.target.files?.[0])} />
                  </label>
                </div>
              ) : (
                <>
                  <div className="cropper" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                    <canvas ref={canvasRef} width={OUT} height={OUT} aria-label="Crop preview" />
                    <div className="gridlines" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                    <span style={{ fontWeight: 900, fontSize: 12 }}>ZOOM</span>
                    <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom" />
                    <button type="button" className="linkbtn" onClick={() => setImg(null)}>Change</button>
                  </div>
                </>
              )}
            </div>

            <div className="field">
              <label htmlFor="cap">Caption <small>{caption.length}/140</small></label>
              <textarea id="cap" className="input" maxLength={140} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={placeholder.current} />
            </div>

            <div className="field">
              <label htmlFor="wal">Solana wallet <small>for your winnings</small></label>
              <input id="wal" className="input" value={wallet} onChange={(e) => setWallet(e.target.value.trim())} placeholder="Your public SOL address" autoComplete="off" spellCheck={false} inputMode="text" />
              <div className="hint">Public address only. We will <b>never</b> ask for a seed phrase or private key.</div>
            </div>

            <div className="field">
              <label htmlFor="xh">X handle <small>optional</small></label>
              <input id="xh" className="input" value={xh} onChange={(e) => setXh(e.target.value)} placeholder="@username" autoComplete="off" spellCheck={false} />
            </div>

            {/* honeypot */}
            <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} name="website" />

            {err && <div className="err" role="alert">{err}</div>}

            <button className="btn btn-green btn-block" type="submit" disabled={sending} style={{ minHeight: 60, fontSize: 19 }}>
              {sending ? 'Posting…' : 'Post my mo'}
            </button>
            <p className="hint" style={{ textAlign: 'center', margin: 0 }}>
              Posts go live instantly. Keep it a mustache — anything inappropriate gets reported and hidden.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
