/* Reel 04: the arsenal. Exhibit A is a playable MPC — the beat preview is
   decoded, its sixteen strongest transients become chops, and each chop is
   mapped onto one of the real pads in the render. */
import { BEATS, EXHIBITS, CONTACT_EMAIL } from "../data.js";
import { pauseAll } from "../ui/player.js";

/* Pad rectangles measured from /img/gear/mpc-top-*.webp (fractions of the
   image). Rows top to bottom hold pads 13–16, 9–12, 5–8, 1–4, as on the
   hardware. */
const PAD_COLS = [
  [0.1325, 0.2242],
  [0.2416, 0.3333],
  [0.3523, 0.4454],
  [0.4636, 0.5568],
];
const PAD_ROWS = [
  [0.5167, 0.6099],
  [0.6274, 0.7213],
  [0.7387, 0.8326],
  [0.8501, 0.944],
];
// Keyboard layout mirrors the pad grid: top row 1–4 down to Z–V.
const KEY_ROWS = ["1234", "qwer", "asdf", "zxcv"];

const CHOPS = 16;
const MAX_CHOP = 0.75;
const WINDOW_SEC = 45;

let ctx = null;
const buffers = new Map(); // beat index -> { buffer, chops, peaks }
let sampleIndex = 0;
let activePad = -1;
let activeUntil = 0;
const voices = [];

const $ = (id) => document.getElementById(id);

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

/* Energy-novelty onset detection on 10ms frames, then the strongest peaks
   at least 180ms apart, returned in time order. */
function findChops(buffer) {
  const sr = buffer.sampleRate;
  const a = buffer.getChannelData(0);
  const b = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : a;
  const hop = Math.round(sr * 0.01);
  const frames = Math.floor(a.length / hop);
  const energy = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let s = 0;
    for (let i = f * hop, end = i + hop; i < end; i++) {
      const v = (a[i] + b[i]) * 0.5;
      s += v * v;
    }
    energy[f] = Math.log10(s / hop + 1e-9);
  }

  const novelty = new Float32Array(frames);
  for (let f = 4; f < frames; f++) {
    const prev = (energy[f - 1] + energy[f - 2] + energy[f - 3] + energy[f - 4]) / 4;
    novelty[f] = Math.max(0, energy[f] - prev);
  }

  const lastFrame = Math.floor(frames * 0.97);
  const peaks = [];
  for (let f = 5; f < lastFrame; f++) {
    const v = novelty[f];
    if (v <= 0.15) continue;
    let isMax = true;
    for (let k = -5; k <= 5 && isMax; k++) if (k && novelty[f + k] > v) isMax = false;
    if (isMax) peaks.push({ t: f * 0.01, v: v + Math.max(0, energy[f] + 4) * 0.15 });
  }

  peaks.sort((p, q) => q.v - p.v);
  const picked = [];
  for (const p of peaks) {
    if (picked.every((q) => Math.abs(q.t - p.t) > 0.18)) picked.push(p);
    if (picked.length === CHOPS) break;
  }
  // Short or quiet files: fall back to an even grid.
  while (picked.length < CHOPS) picked.push({ t: (buffer.duration * picked.length) / CHOPS });

  picked.sort((p, q) => p.t - q.t);
  return picked.map((p, i) => {
    const next = picked[i + 1]?.t ?? buffer.duration;
    const start = Math.max(0, p.t - 0.008);
    return { start, dur: Math.min(MAX_CHOP, Math.max(0.12, next - start)) };
  });
}

function computePeaks(buffer, columns = 600) {
  const data = buffer.getChannelData(0);
  const step = Math.floor(data.length / columns);
  const out = new Float32Array(columns);
  for (let c = 0; c < columns; c++) {
    let m = 0;
    for (let i = c * step, end = i + step; i < end; i += 8) m = Math.max(m, Math.abs(data[i]));
    out[c] = m;
  }
  return out;
}

/* Chop from one stretch of the beat so the pads play like a single kit, and
   let the rest of the decoded audio go. */
function trim(buffer, seconds) {
  const len = Math.min(buffer.length, Math.floor(seconds * buffer.sampleRate));
  if (len === buffer.length) return buffer;
  const out = audioCtx().createBuffer(buffer.numberOfChannels, len, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) out.copyToChannel(buffer.getChannelData(ch).subarray(0, len), ch);
  return out;
}

async function loadSample(i) {
  if (buffers.has(i)) return buffers.get(i);
  const pending = (async () => {
    const res = await fetch(BEATS[i].preview);
    const arr = await res.arrayBuffer();
    const full = await new Promise((resolve, reject) => audioCtx().decodeAudioData(arr, resolve, reject));
    const buffer = trim(full, WINDOW_SEC);
    return { buffer, chops: findChops(buffer), peaks: computePeaks(buffer) };
  })();
  // A decoded preview is tens of MB; keep the current sample and one more.
  for (const key of buffers.keys()) if (buffers.size >= 2 && key !== sampleIndex) buffers.delete(key);
  buffers.set(i, pending);
  try {
    const value = await pending;
    buffers.set(i, value);
    return value;
  } catch (err) {
    buffers.delete(i);
    throw err;
  }
}

/* ---------------------------------------------------------------- screen */
function fmtTime(t) {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

function drawWave(sample) {
  const canvas = $("mpcWave");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const g = canvas.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);

  const mid = h / 2;
  if (!sample || sample instanceof Promise) {
    g.fillStyle = "rgba(236,228,214,0.25)";
    g.fillRect(0, mid, w, 1);
    return;
  }

  const { peaks, chops, buffer } = sample;
  const dur = buffer.duration;
  const live = activePad >= 0 && performance.now() < activeUntil ? chops[activePad] : null;

  const bars = Math.min(peaks.length, Math.floor(w / 2));
  const bw = w / bars;
  for (let x = 0; x < bars; x++) {
    const p = peaks[Math.floor((x / bars) * peaks.length)];
    const t = (x / bars) * dur;
    const inLive = live && t >= live.start && t <= live.start + live.dur;
    g.fillStyle = inLive ? "#ec5a4c" : "rgba(236,228,214,0.55)";
    const bh = Math.max(1, p * (h * 0.86));
    g.fillRect(x * bw, mid - bh / 2, Math.max(1, bw - 0.6), bh);
  }

  g.fillStyle = "#ab1212";
  chops.forEach((c) => g.fillRect((c.start / dur) * w, 0, 1, h * 0.18));
}

function setStatus(text) {
  $("mpcStatus").textContent = text;
}

function renderLoop() {
  const sample = buffers.get(sampleIndex);
  drawWave(sample);
  if (activePad >= 0 && performance.now() < activeUntil) requestAnimationFrame(renderLoop);
  else drawWave(sample);
}

/* ------------------------------------------------------------------ play */
async function hit(padIndex, el) {
  el?.classList.add("is-hit");
  setTimeout(() => el?.classList.remove("is-hit"), 110);
  if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(8);

  const c = audioCtx();
  if (c.state === "suspended") c.resume();
  pauseAll();

  let sample = buffers.get(sampleIndex);
  if (!sample || sample instanceof Promise) {
    setStatus("LOADING CHOPS…");
    try {
      sample = await loadSample(sampleIndex);
    } catch {
      setStatus("SAMPLE FAILED");
      return;
    }
  }

  const chop = sample.chops[padIndex];
  const src = c.createBufferSource();
  src.buffer = sample.buffer;
  const gain = c.createGain();
  const now = c.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.95, now + 0.004);
  gain.gain.setValueAtTime(0.95, now + chop.dur - 0.04);
  gain.gain.linearRampToValueAtTime(0, now + chop.dur);
  src.connect(gain).connect(c.destination);
  src.start(now, chop.start, chop.dur);

  voices.push(src);
  if (voices.length > 8) voices.shift().stop();
  src.onended = () => {
    const k = voices.indexOf(src);
    if (k >= 0) voices.splice(k, 1);
  };

  activePad = padIndex;
  activeUntil = performance.now() + chop.dur * 1000;
  setStatus(`PAD ${String(padIndex + 1).padStart(2, "0")}`);
  $("mpcTime").textContent = fmtTime(chop.start);
  requestAnimationFrame(renderLoop);
}

async function selectSample(i) {
  const idx = (i + BEATS.length) % BEATS.length;
  sampleIndex = idx;
  $("mpcSample").textContent = BEATS[sampleIndex].title;
  activePad = -1;
  setStatus("LOADING…");
  drawWave(null);
  try {
    const s = await loadSample(idx);
    if (idx === sampleIndex) {
      drawWave(s);
      setStatus("TAP A PAD");
      $("mpcTime").textContent = fmtTime(0);
    }
  } catch {
    if (idx === sampleIndex) setStatus("SAMPLE FAILED");
  }
}

/* ------------------------------------------------------------------ init */
export function initArsenal() {
  const padsEl = $("mpcPads");
  const pads = [];

  PAD_ROWS.forEach(([top, bottom], r) => {
    PAD_COLS.forEach(([left, right], c) => {
      const padNo = (3 - r) * 4 + c + 1; // 1-based, bottom-left is pad 1
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pad";
      b.dataset.pad = String(padNo - 1);
      b.setAttribute("aria-label", `Pad ${padNo}, key ${KEY_ROWS[r][c].toUpperCase()}`);
      b.style.cssText = `left:${left * 100}%;top:${top * 100}%;width:${(right - left) * 100}%;height:${(bottom - top) * 100}%`;
      padsEl.append(b);
      pads[padNo - 1] = b;
    });
  });

  // Pointerdown, not click: pads should fire the instant a finger lands.
  padsEl.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".pad");
    if (!b) return;
    e.preventDefault();
    hit(Number(b.dataset.pad), b);
  });
  padsEl.addEventListener("keydown", (e) => {
    const b = e.target.closest(".pad");
    if (b && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      hit(Number(b.dataset.pad), b);
    }
  });

  // Keyboard play only while the MPC is on screen.
  let onScreen = false;
  new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0.35 }).observe($("mpc"));
  window.addEventListener("keydown", (e) => {
    if (!onScreen || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    if (document.body.classList.contains("menu-open") || document.body.classList.contains("cart-open")) return;
    const k = e.key.toLowerCase();
    KEY_ROWS.forEach((row, r) => {
      const c = row.indexOf(k);
      if (c < 0) return;
      e.preventDefault();
      const padNo = (3 - r) * 4 + c + 1;
      hit(padNo - 1, pads[padNo - 1]);
    });
  });

  $("mpcPrev").addEventListener("click", () => selectSample(sampleIndex - 1));
  $("mpcNext").addEventListener("click", () => selectSample(sampleIndex + 1));

  // Decode the first sample once the MPC is on screen, so the screen is live
  // before anyone touches it. With Data Saver on, wait for the first tap.
  if (!navigator.connection?.saveData) {
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        selectSample(0);
      },
      { threshold: 0.2 }
    );
    near.observe($("mpc"));
  }
  addEventListener("resize", () => drawWave(buffers.get(sampleIndex)));

  // Exhibits B–D and the commission link.
  $("exhibits").innerHTML = EXHIBITS.map(
    (x) => `
      <li class="exhibit">
        <div class="exhibit__img"><img src="${x.img}" alt="${x.name}" loading="lazy" /></div>
        <p class="tag"><b>EXHIBIT ${x.tag}</b></p>
        <h3 class="exhibit__name">${x.name}</h3>
        <p class="exhibit__role">${x.role}</p>
      </li>`
  ).join("");

  const subject = encodeURIComponent("Custom beat — Boom Bap Bombay");
  $("commissionBtn").href = `mailto:${CONTACT_EMAIL}?subject=${subject}`;
}
