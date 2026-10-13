/* One audio element for the whole site. Anything that plays a preview calls
   toggleTrack(); everything that shows play state listens for "bbb:audio". */

const audio = new Audio();
audio.preload = "none";

let current = null; // { id, title, sub, art, src }

const els = {};

function fmt(sec) {
  if (!Number.isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function emit() {
  window.dispatchEvent(
    new CustomEvent("bbb:audio", {
      detail: { id: current?.id ?? null, playing: !!current && !audio.paused },
    })
  );
}

function syncBar() {
  if (!els.root) return;
  const playing = !!current && !audio.paused;
  els.toggle.innerHTML = `<span class="play-icon${playing ? " is-pause" : ""}" aria-hidden="true"></span>`;
  els.toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
}

function show(track) {
  els.root.hidden = false;
  document.body.classList.add("has-player");
  els.title.textContent = track.title;
  els.sub.textContent = track.sub || "KSHAH";
  els.art.src = track.art;
}

export function isPlaying(id) {
  return current?.id === id && !audio.paused;
}

export function toggleTrack(track) {
  if (current?.id === track.id) {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    return;
  }

  current = track;
  audio.src = track.src;
  audio.currentTime = 0;
  show(track);
  audio.play().catch(() => {});
  emit();
  syncBar();
}

export function pauseAll() {
  if (!audio.paused) audio.pause();
}

export function stop() {
  audio.pause();
  current = null;
  els.root.hidden = true;
  document.body.classList.remove("has-player");
  emit();
}

export function initPlayer() {
  els.root = document.getElementById("player");
  els.art = document.getElementById("playerArt");
  els.title = document.getElementById("playerTitle");
  els.sub = document.getElementById("playerSub");
  els.toggle = document.getElementById("playerToggle");
  els.time = document.getElementById("playerTime");
  els.bar = document.getElementById("playerBar");
  els.progress = document.getElementById("playerProgress");
  const close = document.getElementById("playerClose");

  els.toggle.addEventListener("click", () => current && toggleTrack(current));
  close.addEventListener("click", stop);

  els.bar.addEventListener("click", (e) => {
    if (!Number.isFinite(audio.duration)) return;
    const r = els.bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  ["play", "pause"].forEach((ev) =>
    audio.addEventListener(ev, () => {
      emit();
      syncBar();
    })
  );

  audio.addEventListener("ended", () => {
    emit();
    syncBar();
  });

  audio.addEventListener("timeupdate", () => {
    const d = audio.duration;
    els.time.textContent = fmt(audio.currentTime);
    els.progress.style.width = Number.isFinite(d) ? `${(audio.currentTime / d) * 100}%` : "0%";
  });
}
