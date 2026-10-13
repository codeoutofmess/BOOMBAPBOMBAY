/* Opening: the cold open (first visit per session), the original landing's
   intro, and the crime-scene tapes that seal the cut into reel two. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REDUCED } from "../ui/scroll.js";

/* Cold open, ~2.4s, once per session; any key or tap skips it.
   KSHAH PRESENTS → the cylinder spins and locks → the blood blooms out from
   behind it into the landing (the original loader, cut tighter).
   Resolves when the landing can start its own intro. */
export function runColdOpen() {
  const root = document.documentElement;
  if (!root.classList.contains("show-intro")) return Promise.resolve();

  const el = document.getElementById("coldopen");
  const credit = el.querySelector(".coldopen__credit");
  const chamber = el.querySelector(".coldopen__chamber");
  const blood = el.querySelector(".coldopen__blood");

  document.body.classList.add("intro-open");
  window.dispatchEvent(new CustomEvent("bbb:lock", { detail: true }));

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      tl.kill();
      try {
        sessionStorage.setItem("bbb_intro_seen", "1");
      } catch {}
      gsap.to(el, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          root.classList.remove("show-intro");
          document.body.classList.remove("intro-open");
          window.dispatchEvent(new CustomEvent("bbb:lock", { detail: false }));
          resolve();
        },
      });
    };

    const bloom = { v: 0 };
    const setMask = () => {
      const size = `${bloom.v}% ${bloom.v}%`;
      blood.style.webkitMaskSize = size;
      blood.style.maskSize = size;
    };
    const shake = (target) =>
      gsap.fromTo(
        target,
        { x: 0, y: 0 },
        { keyframes: [{ x: -12, y: 7, duration: 0.03 }, { x: 10, y: -8, duration: 0.03 }, { x: -5, y: 4, duration: 0.04 }, { x: 0, y: 0, duration: 0.08 }] }
      );

    const tl = gsap.timeline({ paused: true, onComplete: finish });
    tl.fromTo(credit, { opacity: 0, letterSpacing: "1.2em" }, { opacity: 1, letterSpacing: "0.6em", duration: 0.5, ease: "power3.out" }, 0)
      .to(credit, { opacity: 0, duration: 0.12 }, 0.75)
      // The cylinder spins up out of the dark and locks with a jolt.
      .fromTo(chamber, { opacity: 0, scale: 0.6, rotate: 0 }, { opacity: 1, scale: 1, rotate: -900, duration: 0.85, ease: "power3.out" }, 0.8)
      .to(chamber, { rotate: "-=14", duration: 0.06, ease: "none" }, 1.65)
      .to(chamber, { rotate: "+=14", duration: 0.05, ease: "none" })
      .add(() => shake(chamber), 1.65)
      // The cylinder sinks back as the blood comes through and takes the screen.
      .to(chamber, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" }, 1.85)
      .to(bloom, { v: 320, duration: 1.0, ease: "power2.in", onUpdate: setMask }, 1.75);

    const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 900))]);
    fontsReady.then(() => tl.play());

    el.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("keydown", finish, { once: true });
  });
}

/* ------------------------------------------------------------- landing */
const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

function finalText(el) {
  if (!el.dataset.final) el.dataset.final = el.textContent;
  return el.dataset.final;
}

/* Resolve left to right out of noise, as the original nav did. */
function scrambleOnce(el, { duration = 0.28, delay = 0 } = {}) {
  const original = finalText(el);
  const startAt = performance.now() + delay * 1000;

  function tick(now) {
    if (now < startAt) return requestAnimationFrame(tick);
    const p = (now - startAt) / (duration * 1000);
    el.textContent = original
      .split("")
      .map((c, i) => (c === " " ? " " : i / original.length < p ? c : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]))
      .join("");
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = original;
  }
  requestAnimationFrame(tick);
}

function attachHoverScramble(el, { duration = 0.28, fps = 30 } = {}) {
  const original = finalText(el);
  let tween = null;
  const noise = () =>
    (el.textContent = original
      .split("")
      .map((c) => (c === " " ? " " : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]))
      .join(""));
  const stop = () => {
    tween?.kill();
    tween = null;
    el.textContent = original;
  };
  el.addEventListener("mouseenter", () => {
    if (tween) return;
    let last = -1;
    tween = gsap.to(
      {},
      {
        duration,
        ease: "none",
        onUpdate() {
          const t = this.time();
          if (t - last >= 1 / fps) {
            last = t;
            noise();
          }
        },
        onComplete: stop,
      }
    );
  });
  el.addEventListener("mouseleave", stop);
}

function maskReveal(wrapper, { duration = 0.6, delay = 0 } = {}) {
  const inner = wrapper?.querySelector(".reveal__inner") ?? (wrapper?.classList.contains("reveal__inner") ? wrapper : null);
  if (inner) gsap.fromTo(inner, { yPercent: 120 }, { yPercent: 0, duration, ease: "power4.out", delay });
}

/* Hide everything the intro reveals, before the first paint after boot. */
export function primeLanding() {
  if (REDUCED) return;
  gsap.set(".landing .reveal__inner", { yPercent: 120 });
  gsap.set(".landing .scene-composite", { y: 160, opacity: 0 });
  gsap.set(".chrome__nav .nav-item", { autoAlpha: 0 });
}

export function heroIntro() {
  const items = gsap.utils.toArray(".chrome__nav .nav-item");
  items.forEach(finalText);
  if (matchMedia("(hover: hover)").matches) items.forEach((el) => attachHoverScramble(el));
  if (REDUCED) return;

  const mobile = innerWidth <= 768;

  // Nav: each item fades in and resolves out of noise.
  items.forEach((el, i) => {
    const d = 0.3 + i * 0.08;
    gsap.to(el, { autoAlpha: 1, duration: 0.12, ease: "power1.out", delay: d });
    scrambleOnce(el, { duration: 3.0, delay: d });
  });

  const meta = gsap.utils.toArray(".landing .meta-reveal");
  const desc = gsap.utils.toArray(".landing .desc .reveal");
  const logo = document.querySelector(".landing .hero-logo");
  const latest = document.querySelector(".landing .latest-reveal");
  const drop = document.querySelector(".landing .drop-reveal");

  // Original timings; phones run a touch quicker.
  const t = mobile
    ? { meta: 0.45, logoAt: 0.08, logo: 1.0, sceneAt: 0.12, scene: 1.0, descAt: 0.42, desc: 0.55, descGap: 0.1, latestAt: 0.7, dropAt: 0.92, line: 0.5 }
    : { meta: 0.6, logoAt: 0.1, logo: 1.8, sceneAt: 0.2, scene: 1.5, descAt: 0.8, desc: 0.7, descGap: 0.18, latestAt: 1.35, dropAt: 1.75, line: 0.7 };

  const tl = gsap.timeline();
  tl.add(() => meta.forEach((w, i) => maskReveal(w, { duration: t.meta, delay: i * 0.06 })), 0)
    .add(() => maskReveal(logo, { duration: t.logo }), t.logoAt)
    .to(".landing .scene-composite", { y: 0, opacity: 1, duration: t.scene, ease: mobile ? "power2.out" : "power3.out" }, t.sceneAt)
    .add(() => desc.forEach((w, i) => maskReveal(w, { duration: t.desc, delay: i * t.descGap })), t.descAt)
    .add(() => maskReveal(latest, { duration: t.line }), t.latestAt)
    .add(() => maskReveal(drop, { duration: t.line }), t.dropAt);
  return tl;
}

export function initHero() {
  // The new chrome stays out of the way while the landing is on screen.
  ScrollTrigger.create({
    trigger: "#home",
    start: "top bottom", // already active at scroll 0, unlike "top top"
    end: "bottom 35%",
    onToggle: (self) => document.body.classList.toggle("on-hero", self.isActive),
  });
  document.body.classList.toggle("on-hero", scrollY < innerHeight * 0.65);

  initTapes();
}

function initTapes() {
  const tracks = gsap.utils.toArray(".tape__track");
  const loops = tracks.map((track, i) => {
    const text = track.dataset.tape;
    const unit = `<span>${text}</span>`;
    // Two identical halves so a -50% shift loops seamlessly.
    track.innerHTML = unit.repeat(4) + unit.repeat(4);
    const dir = i % 2 ? 1 : -1;
    return gsap.fromTo(
      track,
      { xPercent: dir < 0 ? 0 : -50 },
      { xPercent: dir < 0 ? -50 : 0, duration: 38, ease: "none", repeat: -1 }
    );
  });

  if (REDUCED) {
    loops.forEach((l) => l.pause());
    return;
  }

  // Scrolling pushes the tape faster, then it settles back.
  let boost = { v: 1 };
  ScrollTrigger.create({
    trigger: ".tapes",
    start: "top bottom",
    end: "top top",
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 300, 7);
      gsap.to(boost, {
        v: 1 + v,
        duration: 0.2,
        overwrite: true,
        onUpdate: () => loops.forEach((l) => l.timeScale(boost.v)),
        onComplete: () =>
          gsap.to(boost, { v: 1, duration: 1.2, onUpdate: () => loops.forEach((l) => l.timeScale(boost.v)) }),
      });
    },
  });
}
