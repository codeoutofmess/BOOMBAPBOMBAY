import "./style.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip.js";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Flip);

const IS_MOBILE = window.innerWidth <= 768;

let mobileScenePanLoop = null;
let mobileBeatStoreModelsInitialized = false;

let mobileMasterTrigger = null;
let mobileViewportRaf = null;
let mobileViewportTrackingBound = false;
let mobileResizeRefreshRaf = null;
let mobileBeatStoreViewersRunning = false;
let mobileBeatStoreRaf = null;
let mobileBeatStoreLastTime = 0;
let mobileBoxViewers = [];
let mobileRevolverRaf = null;
let mobileRevolverRunning = false;
let mobileRevolverRenderer = null;

function getLiveViewportHeightMobile() {
  if (window.visualViewport && window.visualViewport.height) {
    return window.visualViewport.height;
  }
  return window.innerHeight || document.documentElement.clientHeight || 0;
}

function getMobileViewportHeight() {
  return getLiveViewportHeightMobile();
}

function setMobileViewportVars() {
  const liveH = getLiveViewportHeightMobile();
  document.documentElement.style.setProperty("--app-dvh", `${liveH}px`);
  document.documentElement.style.setProperty("--app-vh", `${liveH * 0.01}px`);
}

function ensureBeatStoreModelsMobile() {
  if (mobileBeatStoreModelsInitialized) return;
  mobileBeatStoreModelsInitialized = true;
  initBeatStoreModelsMobile();
}

function startBoxViewersMobile() {
  if (mobileBeatStoreViewersRunning) return;
  if (!mobileBoxViewers.length) return;

  mobileBeatStoreViewersRunning = true;
  mobileBeatStoreLastTime = performance.now();

  const loop = (now) => {
    if (!mobileBeatStoreViewersRunning) return;

    const dt = Math.min(0.05, (now - mobileBeatStoreLastTime) / 1000);
    mobileBeatStoreLastTime = now;

    for (const v of mobileBoxViewers) v.tick(dt);

    mobileBeatStoreRaf = requestAnimationFrame(loop);
  };

  mobileBeatStoreRaf = requestAnimationFrame(loop);
}

function stopBoxViewersMobile() {
  mobileBeatStoreViewersRunning = false;

  if (mobileBeatStoreRaf) {
    cancelAnimationFrame(mobileBeatStoreRaf);
    mobileBeatStoreRaf = null;
  }
}

const ROT_FIX = {
  "WAVES.optimized.glb": { x: Math.PI / 2, y: 0, z: 0 },
  "arturia_minilab_mkii_model.optimized.glb": { x: Math.PI / 2, y: 0, z: 0 },
  "mpc_one.optimized.glb": { x: Math.PI / 2, y: 0, z: 0 },
};

const MOBILE_MODEL_FIT = {
  "WAVES.optimized.glb": { y: -0.08, zoom: 1.32 },
  "fl_studio_logo.optimized.glb": { y: -0.02, zoom: 1.18 },
  "arturia_minilab_mkii_model.optimized.glb": { y: -0.06, zoom: 1.28 },
  "mpc_one.optimized.glb": { y: -0.03, zoom: 1.22 },
};

const PRELOAD_ASSETS = [
 "/assets/noise.svg",
  "/assets/revolver_load.svg",
  "/assets/blood-splatter.png",
];

const PRELOAD_ASSETS_MOBILE = [
  "/assets/noise.svg",
  "/assets/revolver_load.svg",
  "/assets/blood-splatter.png",
];

const BEATS = [
  {
    title: "GUNS",
    artist: "KSHAH",
    key: "Em",
    bpm: "94 BPM",
    date: "02/03/2026",
    time: "19:07:29",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "12/09/2026 / 19:07:29\n\nBY KSHAH & PSYESH / BOOM BAP\n\n84 BPM / E#m KEY",
    art: "/assets/album-art1.webp",
    preview: "/assets/previews/beat1.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:42",
  },
  {
    title: "DRUGS",
    artist: "KSHAH",
    key: "Dm",
    bpm: "88 BPM",
    date: "03/03/2026",
    time: "11:22:10",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details: "14/03/2026 / 21:32:56\n\nBY KSHAH / BOOM BAP\n\n67 BPM / F# KEY",
    art: "/assets/album-art2.webp",
    preview: "/assets/previews/beat2.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "03:05",
  },
  {
    title: "PILLS",
    artist: "KSHAH",
    key: "C# MINOR",
    bpm: "140 BPM",
    date: "04/03/2026",
    time: "09:14:55",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details: "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art3.webp",
    preview: "/assets/previews/beat3.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:23",
  },
  {
    title: "CARS",
    artist: "KSHAH",
    key: "F MINOR",
    bpm: "102 BPM",
    date: "05/03/2026",
    time: "14:40:18",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details: "14/03/2026 / 21:32:56\n\nBY KSHAH / BOOM BAP\n\n67 BPM / F# KEY",
    art: "/assets/album-art4.webp",
    preview: "/assets/previews/beat4.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:58",
  },
  {
    title: "SMOKES",
    artist: "KSHAH",
    key: "Am",
    bpm: "96 BPM",
    date: "06/03/2026",
    time: "17:02:31",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details: "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art5.webp",
    preview: "/assets/previews/beat5.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "03:11",
  },
  {
    title: "STACKS",
    artist: "KSHAH",
    key: "Gm",
    bpm: "110 BPM",
    date: "07/03/2026",
    time: "13:28:49",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details: "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art6.webp",
    preview: "/assets/previews/beat6.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:49",
  },
  {
    title: "GREENS",
    artist: "KSHAH",
    key: "Bm",
    bpm: "92 BPM",
    date: "08/03/2026",
    time: "20:15:00",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details: "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art7.webp",
    preview: "/assets/previews/beat7.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "03:21",
  },
];

const MUSIC_BEATS = [
  {
    title: "GUNS CARS AND BARS",
    artist: "KSHAH",
    key: "Em",
    bpm: "94 BPM",
    date: "02/03/2026",
    time: "19:07:29",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS.",
    details: "12/09/2026 / 19:07:29\n\nBY KSHAH / MUSIC\n\n94 BPM / Em KEY",
    art: "/assets/music-art1.webp",
    preview: "/assets/previews/beat1.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:42",
  },
  {
    title: "SECOND DROP",
    artist: "KSHAH",
    key: "Dm",
    bpm: "88 BPM",
    date: "03/03/2026",
    time: "11:22:10",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT.",
    details: "14/03/2026 / 21:32:56\n\nBY KSHAH / MUSIC\n\n88 BPM / Dm KEY",
    art: "/assets/music-art2.webp",
    preview: "/assets/previews/beat2.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "03:05",
  },
  {
    title: "THIRD CUT",
    artist: "KSHAH",
    key: "C#m",
    bpm: "140 BPM",
    date: "04/03/2026",
    time: "09:14:55",
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT.",
    details: "03/12/2026 / 05:37:13\n\nBY KSHAH / MUSIC\n\n140 BPM / C#m KEY",
    art: "/assets/music-art3.webp",
    preview: "/assets/previews/beat3.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:23",
  },
  {
    title: "FOURTH CUT",
    artist: "KSHAH",
    key: "Fm",
    bpm: "102 BPM",
    date: "05/03/2026",
    time: "14:40:18",
    description: "LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT.",
    details: "14/03/2026 / 21:32:56\n\nBY KSHAH / MUSIC\n\n102 BPM / Fm KEY",
    art: "/assets/music-art4.webp",
    preview: "/assets/previews/beat4.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:58",
  },
];

/* =========================
   SHARED LOADER
========================= */
function mountLoader() {
  document.querySelector("#app").innerHTML = `
    <div class="loader" id="loader">
      <div class="loader__blood" aria-hidden="true"></div>

      <div class="loader__inner">
        <img
          class="loader__chamber"
          id="loaderChamber"
          src="/assets/revolver_load.svg"
          alt=""
        />

        <div class="loader__text">LOADING...</div>

        <div class="loader__pct">
          <span id="loaderPct">0</span>%
        </div>
      </div>
    </div>
  `;
}

function unmountLoader() {
  const loader = document.querySelector("#loader");
  if (!loader) return;

  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.35,
    ease: "power2.out",
    onComplete: () => loader.remove(),
  });
}

function createLoaderDriver() {
  const chamber = document.getElementById("loaderChamber");
  const pctEl = document.getElementById("loaderPct");

  const counter = { v: 0 };
  const base = 0;

  gsap.set(chamber, { rotation: base });

  const spinTl = gsap.timeline({ repeat: -1 });

  spinTl
    .to(chamber, { rotation: "+=90", duration: 1, ease: "none" })
    .to(chamber, { rotation: "+=1080", duration: 1.9, ease: "none" })
    .to(chamber, { rotation: "+=270", duration: 1, ease: "none" });

  function setPercent(p) {
    const n = Math.max(0, Math.min(100, Math.round(p)));
    if (pctEl) pctEl.textContent = String(n);
  }

  function startPercent(durationSec = 2.0) {
    counter.v = 0;
    setPercent(0);

    return gsap.to(counter, {
      v: 100,
      duration: durationSec,
      ease: "power1.inOut",
      onUpdate: () => setPercent(counter.v),
    });
  }

  function finish() {
    spinTl.pause();

    const current = gsap.getProperty(chamber, "rotation");
    const snapped = Math.round((current - base) / 360) * 360 + base;

    return gsap
      .timeline()
      .to(chamber, { rotation: snapped, duration: 0.8, ease: "none" })
      .to(chamber, { rotation: snapped + 14, duration: 0.7, ease: "none" })
      .to(chamber, { rotation: snapped, duration: 0.1, ease: "none" });
  }

  return { startPercent, setPercent, finish };
}

/* =========================
   SHARED MARKUP
========================= */
function getAppMarkupDesktop() {
  return `
    <main class="app">
      <section class="page landing revolver-only" id="home">
        <div class="bg-layer"></div>

        <div class="scene-layer">
          <img class="scene-composite" src="/assets/scene-composite.svg" alt="" />
        </div>

        <canvas class="webgl"></canvas>

        <nav class="nav">
  <img src="/assets/ब.svg" class="nav-glyph hover-scramble nav-glyph-b-left" alt="ब" />
  <img src="/assets/B.svg" class="nav-glyph hover-scramble nav-glyph-B-left" alt="B" />

  <div class="nav-center">
  <a class="nav-item hover-scramble nav-link" href="#home">[ HOME ]</a>
  
  <a class="nav-item hover-scramble nav-link" href="#music">[ MUSIC ]</a>
  <a class="nav-item hover-scramble nav-link" href="#beat-store">[ BEAT STORE ]</a>
  <a class="nav-item hover-scramble nav-link" href="#about">[ ABOUT ]</a>
  <a class="nav-item hover-scramble nav-link" href="#updates">[ UPDATES ]</a>
</div>

  <img src="/assets/B.svg" class="nav-glyph hover-scramble nav-glyph-B-right" alt="B" />
  <img src="/assets/ब.svg" class="nav-glyph hover-scramble nav-glyph-b-right" alt="ब" />
</nav>



        <div class="text-layer">
          <div class="left-block">
            <div class="meta-row">
              <div class="reveal meta-reveal kicker-reveal">
                <div class="reveal__inner">[SOUND & VISUAL CULTURE]</div>
              </div>

              <div class="reveal meta-reveal est-reveal">
                <div class="reveal__inner">[EST 2026]</div>
              </div>
            </div>

            <div class="reveal hero-logo">
              <img class="reveal__inner" src="/assets/boombap-logo.svg" alt="BOOMBAP BOMBAY" />
            </div>

            <div class="desc">
              <div class="reveal desc-line">
                <div class="reveal__inner">/ IS A CREATIVE STUDIO</div>
              </div>

              <div class="reveal desc-line">
                <div class="reveal__inner">/ BASED IN MUMBAI, MAHARASHTRA</div>
              </div>
            </div>
          </div>

          <div class="right-block">
            <div class="reveal latest-reveal">
              <h2 class="latest reveal__inner">LATEST DROPS</h2>
            </div>

            <div class="reveal drop-reveal">
              <div class="drop-row reveal__inner">
                <span class="drop-text">/ GUNS, CARS AND BARS // BEAT TAPE</span>
                <span class="arrow-box" aria-hidden="true">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="page beat-store" id="beat-store">
        <div class="beat-store-bg"></div>

        <div class="beat-store-content">
          <div class="reveal bs-title-reveal">
            <h2 class="bs-title reveal__inner">BEAT STORE</h2>
          </div>

          <div class="reveal bs-copy-reveal">
            <p class="bs-copy reveal__inner">
              KSHAH, AS A SEASONED PRODUCER, CRAFTS BESPOKE BEATS FOR YOUR SPECIFIC NEEDS USING THE WEAPONS MENTIONED BELOW.
              HIRE US IF YOU NEED SOME BEATS!
            </p>
          </div>

          <button class="bs-btn">GET IN TOUCH</button>

          <div class="bs-grid">
            <div class="bs-row">
              <div class="bs-box bs-small" data-grid="img-2">
                <canvas class="bs-canvas" data-model="/models/WAVES.optimized.glb"></canvas>
              </div>

              <div class="bs-box bs-small" data-grid="img-3">
                <canvas class="bs-canvas" data-model="/models/fl_studio_logo.optimized.glb"></canvas>
              </div>

              <div class="bs-box bs-small" data-grid="img-4">
                <canvas class="bs-canvas" data-model="/models/arturia_minilab_mkii_model.optimized.glb"></canvas>
              </div>
            </div>

            <div class="bs-box bs-big bs-aim" data-grid="img-1">
              <canvas class="bs-canvas" data-model="/models/mpc_one.optimized.glb"></canvas>
            </div>
          </div>

          <div id="bs-arc">
            <div id="bsArcTitle" class="arc-title">BEAT NAME</div>

            <div id="bsArcPointer" class="arc-pointer" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="bs-arc-item" data-title="GUNS">
              <img src="/assets/album-art1.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="CARS">
              <img src="/assets/album-art2.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="BARS">
              <img src="/assets/album-art3.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="GREENS">
              <img src="/assets/album-art4.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="SMOKES">
              <img src="/assets/album-art5.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="PILLS">
              <img src="/assets/album-art6.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="DRINKS">
              <img src="/assets/album-art7.webp" alt="" />
            </div>
          </div>

          <div class="bs-music-left" id="bsMusicLeft">
            <div class="reveal bs-music-title-reveal">
              <h2 class="bs-music-title reveal__inner">MUSIC</h2>
            </div>

            <div class="reveal bs-music-copy-reveal">
              <p class="bs-music-copy reveal__inner">
                LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT. QUISQUE
                FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI
                PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA
                TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS.
              </p>
            </div>
          </div>

          <div id="music-arc-overlay" class="music-arc-overlay">
            <div id="musicArcOverlayTitle" class="arc-title">GUNS CARS AND BARS</div>

            <div class="arc-pointer" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="bs-arc-item" data-title="GUNS CARS AND BARS">
              <img src="/assets/music-art1.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="SECOND DROP">
              <img src="/assets/music-art2.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="THIRD CUT">
              <img src="/assets/music-art3.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="FOURTH CUT">
              <img src="/assets/music-art4.webp" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section class="page about-page" id="about">
        <div class="about-bg"></div>

        <div class="about-transition-map" id="aboutTransitionMap">
          <img src="/assets/mumbai-city.svg" alt="" />
        </div>

        <div class="about-inner">
          <div class="reveal about-title-reveal">
            <h2 class="about-title reveal__inner">ABOUT</h2>
          </div>

          <div class="about-map-wrap" id="aboutMapWrap">
            <img
              class="about-map"
              id="aboutMap"
              src="/assets/mumbai-city.svg"
              alt="Mumbai map"
            />
          </div>

          <div class="about-links">
            <a href="#">[ SPOTIFY ]</a>
            <a href="#">[ APPLE MUSIC ]</a>
            <a href="#">[ BEATSTARS ]</a>
            <a href="#">[ YOUTUBE ]</a>
            <a href="#">[ INSTAGRAM ]</a>
          </div>

          <div class="about-side">
            <div class="reveal about-copy-reveal">
              <p class="about-copy reveal__inner">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.

                <br />
                Dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor.
              </p>
            </div>

            <div class="reveal about-btn-reveal">
              <button class="about-btn reveal__inner">GET IN TOUCH</button>
            </div>
          </div>
        </div>
      </section>

      <section class="album-view" id="album-view" aria-hidden="true">
        <div class="album-view-bg">
          <div class="album-view-bg-site"></div>
          <div class="album-view-bg-base" id="albumViewBgBase"></div>
          <div class="album-view-bg-played" id="albumViewBgPlayed"></div>
        </div>

        <div class="album-view-progress-line" id="albumViewProgressLine" aria-hidden="true"></div>

        <div class="album-view-ui">
          <div class="album-view-top">
            <button class="album-view-more" id="albumViewMoreBtn" type="button">MORE BEATS</button>

            <div class="album-view-player-row">
              <div class="album-view-time album-view-time-current" id="albumViewCurrent">00:00</div>

              <button class="album-view-play" id="albumViewPlayBtn" type="button" aria-label="Play or pause">
                ▶
              </button>

              <div class="album-view-time album-view-time-duration" id="albumViewDuration">01:24</div>
            </div>

            <button class="album-view-sound" id="albumViewSoundBtn" type="button">SOUND OFF</button>
          </div>

          <div class="album-view-block2">
            <h2 class="album-view-title" id="albumViewTitle">GUNS</h2>

            <div class="album-view-center">
              <p class="album-view-desc" id="albumViewDesc">
                LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT.
              </p>

              <button class="album-view-buy" id="albumViewBuyBtn" type="button">BUY NOW</button>
            </div>

            <div class="album-view-details-side">
              <h3 class="album-view-details-title">DETAILS</h3>
              <div class="album-view-details-text" id="albumViewDetails">
                12/09/2026 / 19:07:29

                BY KSHAH &amp; PSYESH / BOOM BAP

                84 BPM / E#m KEY
              </div>
            </div>
          </div>

          <audio id="albumViewAudio" preload="metadata"></audio>
        </div>
      </section>
    </main>
  `;
}

function getAppMarkupMobile() {
  return `
    <main class="app">
    <div id="mobile-cinematic-root">
      <section class="page landing revolver-only" id="home">
        <div class="bg-layer"></div>

        <div class="scene-layer">
          <img class="scene-composite" src="/assets/scene-composite.svg" alt="" />
        </div>

        <canvas class="webgl"></canvas>

        <nav class="nav">
          <img src="/assets/ब.svg" class="nav-glyph hover-scramble nav-glyph-b-left" alt="ब" />
          <img src="/assets/B.svg" class="nav-glyph hover-scramble nav-glyph-B-left" alt="B" />

          <div class="nav-center">
            <span class="nav-item hover-scramble">[ HOME ]</span>
            <span class="nav-item hover-scramble">[ BEAT STORE ]</span>
            <span class="nav-item hover-scramble">[ MUSIC ]</span>
            <span class="nav-item hover-scramble">[ ABOUT ]</span>
            <span class="nav-item hover-scramble">[ UPDATES ]</span>
          </div>

          <img src="/assets/B.svg" class="nav-glyph hover-scramble nav-glyph-B-right" alt="B" />
          <img src="/assets/ब.svg" class="nav-glyph hover-scramble nav-glyph-b-right" alt="ब" />
        </nav>

        <button class="menu-btn" type="button" aria-label="Open menu">
  <img src="/assets/menu-btn.svg" alt="" />
</button>

        <div class="text-layer">
          <div class="left-block">
            <div class="meta-row">
              <div class="reveal meta-reveal kicker-reveal">
                <div class="reveal__inner">[SOUND & VISUAL CULTURE]</div>
              </div>

              <div class="reveal meta-reveal est-reveal">
                <div class="reveal__inner">[EST 2026]</div>
              </div>
            </div>

            <div class="reveal hero-logo">
              <img class="reveal__inner" src="/assets/boombap-logo.svg" alt="BOOMBAP BOMBAY" />
            </div>

            <div class="desc">
              <div class="reveal desc-line">
                <div class="reveal__inner">/ IS A CREATIVE STUDIO</div>
              </div>

              <div class="reveal desc-line">
                <div class="reveal__inner">/ BASED IN MUMBAI, MAHARASHTRA</div>
              </div>
            </div>
          </div>

          <div class="right-block">
            <div class="reveal latest-reveal">
              <h2 class="latest reveal__inner">LATEST DROPS</h2>
            </div>

            <div class="reveal drop-reveal">
              <div class="drop-row reveal__inner">
                <span class="drop-text">/ GUNS, CARS AND BARS // BEAT TAPE</span>
                <span class="arrow-box" aria-hidden="true">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="page music-page" id="music">
        <div class="beat-store-bg"></div>

        <div class="beat-store-content">
          <div class="bs-music-left" id="mobileMusicLeftStatic">
            <div class="reveal bs-music-title-reveal">
              <h2 class="bs-music-title reveal__inner">MUSIC</h2>
            </div>

            <div class="reveal bs-music-copy-reveal">
              <p class="bs-music-copy reveal__inner">
                LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT. QUISQUE
                FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI
                PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA
                TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS.
              </p>
            </div>
          </div>

          <div id="mobile-music-arc" class="music-arc-overlay">
            <div class="arc-title">GUNS CARS AND BARS</div>

            <div class="arc-pointer" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="bs-arc-item" data-title="GUNS CARS AND BARS">
              <img src="/assets/music-art1.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="SECOND DROP">
              <img src="/assets/music-art2.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="THIRD CUT">
              <img src="/assets/music-art3.webp" alt="" />
            </div>

            <div class="bs-arc-item" data-title="FOURTH CUT">
              <img src="/assets/music-art4.webp" alt="" />
            </div>
          </div>
        </div>
      </section>

<section class="page beat-store" id="beat-store">
  <div class="beat-store-bg"></div>

  <div class="beat-store-content">
    <div class="bs-mobile-left">
      <div class="reveal bs-title-reveal">
        <h2 class="bs-title reveal__inner">BEAT STORE</h2>
      </div>

      <div class="reveal bs-copy-reveal">
        <p class="bs-copy reveal__inner">
          KSHAH, AS A SEASONED PRODUCER, CRAFTS BESPOKE BEATS FOR YOUR SPECIFIC NEEDS USING THE WEAPONS MENTIONED BELOW.

          HIRE US IF YOU NEED SOME BEATS!
        </p>
      </div>

      <button class="bs-btn">GET IN TOUCH</button>
    </div>

    <div class="bs-mobile-visual">
      <div class="bs-mobile-grid-stage">
        <div class="bs-grid">
          <div class="bs-row">
            <div class="bs-box bs-small" data-grid="img-2">
              <canvas class="bs-canvas" data-model="/models/WAVES.optimized.glb"></canvas>
            </div>

            <div class="bs-box bs-small" data-grid="img-3">
              <canvas class="bs-canvas" data-model="/models/fl_studio_logo.optimized.glb"></canvas>
            </div>

            <div class="bs-box bs-small" data-grid="img-4">
              <canvas class="bs-canvas" data-model="/models/arturia_minilab_mkii_model.optimized.glb"></canvas>
            </div>
          </div>

          <div class="bs-box bs-big bs-aim" data-grid="img-1">
            <canvas class="bs-canvas" data-model="/models/mpc_one.optimized.glb"></canvas>
          </div>
        </div>
      </div>

      <div class="bs-mobile-arc-stage">
        <div id="bs-arc">
          <div id="bsArcTitle" class="arc-title">BEAT NAME</div>

          <div id="bsArcPointer" class="arc-pointer" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div class="bs-arc-item" data-title="GUNS">
            <img src="/assets/album-art1.webp" alt="" />
          </div>

          <div class="bs-arc-item" data-title="CARS">
            <img src="/assets/album-art2.webp" alt="" />
          </div>

          <div class="bs-arc-item" data-title="BARS">
            <img src="/assets/album-art3.webp" alt="" />
          </div>

          <div class="bs-arc-item" data-title="GREENS">
            <img src="/assets/album-art4.webp" alt="" />
          </div>

          <div class="bs-arc-item" data-title="SMOKES">
            <img src="/assets/album-art5.webp" alt="" />
          </div>

          <div class="bs-arc-item" data-title="PILLS">
            <img src="/assets/album-art6.webp" alt="" />
          </div>

          <div class="bs-arc-item" data-title="DRINKS">
            <img src="/assets/album-art7.webp" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      <section class="page about-page" id="about">
        <div class="about-bg"></div>

        <div class="about-transition-map" id="aboutTransitionMap">
          <img src="/assets/mumbai-city.svg" alt="" />
        </div>

        <div class="about-inner">
          <div class="reveal about-title-reveal">
            <h2 class="about-title reveal__inner">ABOUT</h2>
          </div>

          <div class="about-map-wrap" id="aboutMapWrap">
            <img
              class="about-map"
              id="aboutMap"
              src="/assets/mumbai-city.svg"
              alt="Mumbai map"
            />
          </div>

          <div class="about-links">
            <a href="#">[ SPOTIFY ]</a>
            <a href="#">[ APPLE MUSIC ]</a>
            <a href="#">[ BEATSTARS ]</a>
            <a href="#">[ YOUTUBE ]</a>
            <a href="#">[ INSTAGRAM ]</a>
          </div>

          <div class="about-side">
            <div class="reveal about-copy-reveal">
              <p class="about-copy reveal__inner">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.
                <br><br>
                Dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor.
              </p>
            </div>

            <div class="reveal about-btn-reveal">
              <button class="about-btn reveal__inner">GET IN TOUCH</button>
            </div>
          </div>
        </div>
      </section>

      <section class="album-view" id="album-view" aria-hidden="true">
        <div class="album-view-bg">
          <div class="album-view-bg-site"></div>
          <div class="album-view-bg-base" id="albumViewBgBase"></div>
          <div class="album-view-bg-played" id="albumViewBgPlayed"></div>
        </div>

        <div class="album-view-progress-line" id="albumViewProgressLine" aria-hidden="true"></div>

        <div class="album-view-ui">
          <div class="album-view-top">
            <button class="album-view-more" id="albumViewMoreBtn" type="button">MORE BEATS</button>

            <div class="album-view-player-row">
              <div class="album-view-time album-view-time-current" id="albumViewCurrent">00:00</div>

              <button class="album-view-play" id="albumViewPlayBtn" type="button" aria-label="Play or pause">
                ▶
              </button>

              <div class="album-view-time album-view-time-duration" id="albumViewDuration">01:24</div>
            </div>

            <button class="album-view-sound" id="albumViewSoundBtn" type="button">SOUND OFF</button>
          </div>

          <div class="album-view-block2">
            <h2 class="album-view-title" id="albumViewTitle">GUNS</h2>

            <div class="album-view-center">
              <p class="album-view-desc" id="albumViewDesc">
                LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT.
              </p>

              <button class="album-view-buy" id="albumViewBuyBtn" type="button">BUY NOW</button>
            </div>

            <div class="album-view-details-side">
              <h3 class="album-view-details-title">DETAILS</h3>
              <div class="album-view-details-text" id="albumViewDetails">
                12/09/2026 / 19:07:29

                BY KSHAH &amp; PSYESH / BOOM BAP

                84 BPM / E#m KEY
              </div>
            </div>
          </div>

          <audio id="albumViewAudio" preload="metadata"></audio>
        </div>
      </section>
      </div>
    </main>
  `;
}

function getAppMarkup() {
  return IS_MOBILE ? getAppMarkupMobile() : getAppMarkupDesktop();
}

function mountAppShell() {
  const app = document.querySelector("#app");
  if (!app) return;

  app.insertAdjacentHTML("beforeend", getAppMarkup());
}

/* =========================
   DESKTOP ONLY
========================= */
async function preloadAssetsDesktop(onProgress) {
  let loaded = 0;

  const tick = () => {
    loaded++;
    if (onProgress) onProgress(Math.min(1, loaded / PRELOAD_ASSETS.length));
  };

  const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

  const jobs = PRELOAD_ASSETS.map((url) => {
    if (url.endsWith(".glb")) {
      return new Promise((resolve) => {
        gltfLoader.load(
          url,
          () => {
            tick();
            resolve();
          },
          undefined,
          () => {
            tick();
            resolve();
          }
        );
      });
    }

    return fetch(url, { cache: "force-cache" })
      .then(() => tick())
      .catch(() => tick());
  });

  await Promise.all(jobs);
}

function ensureFinalTextDesktop(el) {
  if (!el.dataset.final) el.dataset.final = el.textContent;
  return el.dataset.final;
}

function scrambleOnceDesktop(el, { duration = 0.28, delay = 0 } = {}) {
  const original = ensureFinalTextDesktop(el);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  const total = Math.max(6, Math.floor(duration * 60));
  let frame = 0;
  const startAt = performance.now() + delay * 1000;

  function tick(now) {
    if (now < startAt) return requestAnimationFrame(tick);

    frame++;
    const p = frame / total;

    const out = original
      .split("")
      .map((c, i) => {
        if (c === " ") return " ";
        const lock = i / original.length < p;
        return lock ? c : chars[(Math.random() * chars.length) | 0];
      })
      .join("");

    el.textContent = out;

    if (frame < total) requestAnimationFrame(tick);
    else el.textContent = original;
  }

  requestAnimationFrame(tick);
}

function attachHoverScrambleDesktop(el, { duration = 0.28, fps = 30 } = {}) {
  const original = ensureFinalTextDesktop(el);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  let tween = null;

  function frame() {
    el.textContent = original
      .split("")
      .map((c) => (c === " " ? " " : chars[(Math.random() * chars.length) | 0]))
      .join("");
  }

  function stop() {
    if (tween) tween.kill();
    tween = null;
    el.textContent = original;
  }

  function playOnce() {
    if (tween) return;

    const step = 1 / fps;
    let last = -999;

    tween = gsap.to(
      {},
      {
        duration,
        ease: "none",
        onUpdate: function () {
          const t = this.time();
          if (t - last >= step) {
            last = t;
            frame();
          }
        },
        onComplete: () => {
          tween = null;
          el.textContent = original;
        },
      }
    );
  }

  el.addEventListener("mouseenter", playOnce);
  el.addEventListener("mouseleave", stop);
}



function maskRevealDesktop(wrapperEl, { duration = 0.6, delay = 0 } = {}) {
  if (!wrapperEl) return;
  const inner = wrapperEl.querySelector(".reveal__inner");
  if (!inner) return;

  gsap.fromTo(
    inner,
    { yPercent: 120 },
    { yPercent: 0, duration, ease: "power4.out", delay }
  );
}

function startNavIntroDesktop() {
  const nav = document.querySelector(".nav");
  const items = Array.from(document.querySelectorAll(".nav .nav-item"));
  if (!nav || !items.length) return;

  gsap.set(nav, { autoAlpha: 1, pointerEvents: "auto" });

  items.forEach((el) => {
    ensureFinalTextDesktop(el);
    gsap.set(el, { autoAlpha: 0 });
  });

  items.forEach((el, i) => {
    const d = 0.3 + i * 0.08;
    gsap.to(el, { autoAlpha: 1, duration: 0.12, ease: "power1.out", delay: d });
    scrambleOnceDesktop(el, { duration: 3.0, delay: d });
  });

  document.querySelectorAll(".hover-scramble").forEach((el) => {
    attachHoverScrambleDesktop(el, { duration: 0.28, fps: 30 });
  });
}

function startLandingIntroDesktop() {
  const heroReveal = document.querySelector(".left-block .hero-logo");
  const metaReveals = Array.from(document.querySelectorAll(".left-block .meta-reveal"));
  const descReveals = Array.from(document.querySelectorAll(".left-block .desc .reveal"));
  const latestReveal = document.querySelector(".right-block .latest-reveal");
  const dropReveal = document.querySelector(".right-block .drop-reveal");

  gsap.set(".reveal__inner", { yPercent: 120 });
  gsap.set(".scene-composite", { y: 160, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.add(() => {
    metaReveals.forEach((w, i) => {
      maskRevealDesktop(w, { duration: 0.6, delay: i * 0.06 });
    });
  }, 0);

  tl.add(() => {
    maskRevealDesktop(heroReveal, { duration: 1.8, delay: 0 });
  }, 0.1);

  tl.to(
    ".scene-composite",
    {
      y: 0,
      opacity: 1,
      duration: 1.5,
      ease: "power3.out",
    },
    0.2
  );

  tl.add(() => {
    if (descReveals[0]) maskRevealDesktop(descReveals[0], { duration: 0.7, delay: 0 });
    if (descReveals[1]) maskRevealDesktop(descReveals[1], { duration: 0.7, delay: 0.18 });
  }, 0.8);

  tl.add(() => {
    maskRevealDesktop(latestReveal, { duration: 0.7, delay: 0 });
  }, 1.35);

  tl.add(() => {
    maskRevealDesktop(dropReveal, { duration: 0.7, delay: 0 });
  }, 1.75);

  return tl;
}

function initAlbumViewDesktop() {
  const view = document.getElementById("album-view");
  const bgBase = document.getElementById("albumViewBgBase");
  const bgPlayed = document.getElementById("albumViewBgPlayed");

  const moreBtn = document.getElementById("albumViewMoreBtn");
  const playBtn = document.getElementById("albumViewPlayBtn");
  const soundBtn = document.getElementById("albumViewSoundBtn");
  const progressLine = document.getElementById("albumViewProgressLine");

  const currentEl = document.getElementById("albumViewCurrent");
  const durationEl = document.getElementById("albumViewDuration");

  const titleEl = document.getElementById("albumViewTitle");
  const descEl = document.getElementById("albumViewDesc");
  const detailsEl = document.getElementById("albumViewDetails");
  const buyBtn = document.getElementById("albumViewBuyBtn");

  const audio = document.getElementById("albumViewAudio");

  let activeIndex = 0;
  let activeList = BEATS;
  let isMuted = false;
  let isScrubbing = false;
  let wasPlayingBeforeScrub = false;

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const r = String(s % 60).padStart(2, "0");
    return `${String(m).padStart(2, "0")}:${r}`;
  }

  function setPlayedProgress(progress01) {
    const p = Math.max(0, Math.min(1, progress01 || 0));
    bgPlayed.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
    gsap.set(progressLine, { x: window.innerWidth * p });
  }

  function getProgressFromClientX(clientX) {
    const x = Math.max(0, Math.min(window.innerWidth, clientX));
    return x / window.innerWidth;
  }

  function scrubToClientX(clientX) {
    const p = getProgressFromClientX(clientX);
    setPlayedProgress(p);

    if (audio.duration) {
      const nextTime = p * audio.duration;
      audio.currentTime = nextTime;
      currentEl.textContent = formatTime(nextTime);
    }
  }

  function setPlayStateUI(isPlaying) {
    playBtn.textContent = isPlaying ? "❚❚" : "▶";
  }

  function setMuteUI() {
    soundBtn.textContent = isMuted ? "SOUND ON" : "SOUND OFF";
  }

  function setTitleAlignment(title) {
    titleEl.classList.remove("is-single-line");
    titleEl.textContent = title;

    requestAnimationFrame(() => {
      const isSingleLine = titleEl.scrollHeight <= 42;
      titleEl.classList.toggle("is-single-line", isSingleLine);
    });
  }

  function loadBeat(index, list = activeList) {
    const beat = list[index];
    if (!beat) return;

    activeIndex = index;
    activeList = list;

    bgBase.style.backgroundImage = `url("${beat.art}")`;
    bgPlayed.style.backgroundImage = `url("${beat.art}")`;

    setTitleAlignment(beat.title);
    descEl.textContent = beat.description;
    detailsEl.textContent = beat.details;
    durationEl.textContent = beat.duration || "00:00";

    audio.src = beat.preview;
    audio.currentTime = 0;
    audio.load();

    buyBtn.onclick = () => {
      window.open(beat.buyUrl, "_blank");
    };

    currentEl.textContent = "00:00";
    setPlayedProgress(0);
  }

  function open(index, list = BEATS) {
    loadBeat(index, list);

    view.classList.add("is-open");
    view.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    gsap.killTweensOf(view);
    gsap.killTweensOf(".album-view-bg-base, .album-view-bg-played, .album-view-ui");

    gsap.set(view, { autoAlpha: 1 });

    gsap.fromTo([bgBase, bgPlayed], { scale: 1.06 }, { scale: 1, duration: 0.55, ease: "power3.out" });

    gsap.fromTo(
      ".album-view-ui",
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.1, ease: "power2.out" }
    );

    audio.currentTime = 0;
    audio.play().catch(() => {});
    setPlayStateUI(true);
  }

  function close() {
    audio.pause();
    audio.currentTime = 0;
    currentEl.textContent = "00:00";
    setPlayedProgress(0);

    gsap.to(".album-view-ui", {
      autoAlpha: 0,
      y: 10,
      duration: 0.2,
      ease: "power2.out",
    });

    gsap.to(view, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power2.out",
      onComplete: () => {
        view.classList.remove("is-open");
        view.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      },
    });
  }

  playBtn.addEventListener("click", () => {
    if (!audio.src) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  soundBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    setMuteUI();
  });

  moreBtn.addEventListener("click", close);

  audio.addEventListener("play", () => setPlayStateUI(true));
  audio.addEventListener("pause", () => setPlayStateUI(false));
  audio.addEventListener("ended", () => {
    setPlayStateUI(false);
    currentEl.textContent = "00:00";
    setPlayedProgress(0);
    audio.currentTime = 0;
  });

  audio.addEventListener("loadedmetadata", () => {
    if (!isNaN(audio.duration)) durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isScrubbing) return;
    currentEl.textContent = formatTime(audio.currentTime);
    setPlayedProgress(audio.currentTime / audio.duration);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && view.classList.contains("is-open")) close();
  });

  view.addEventListener("click", (e) => {
    if (e.target === view) close();
  });

  window.addEventListener("resize", () => {
    if (audio.duration) setPlayedProgress(audio.currentTime / audio.duration);
    else setPlayedProgress(0);
  });

  setMuteUI();

  view.addEventListener("pointerdown", (e) => {
    if (
      e.target.closest(".album-view-more") ||
      e.target.closest(".album-view-play") ||
      e.target.closest(".album-view-sound") ||
      e.target.closest(".album-view-buy")
    ) {
      return;
    }

    isScrubbing = true;
    wasPlayingBeforeScrub = !audio.paused;

    if (wasPlayingBeforeScrub) audio.pause();
    scrubToClientX(e.clientX);
  });

  window.addEventListener("pointermove", (e) => {
    if (!isScrubbing) return;
    scrubToClientX(e.clientX);
  });

  window.addEventListener("pointerup", () => {
    if (!isScrubbing) return;
    isScrubbing = false;
    if (wasPlayingBeforeScrub) audio.play().catch(() => {});
  });

  return {
    open,
    close,
    loadBeat,
    getActiveIndex: () => activeIndex,
    getActiveList: () => activeList,
  };
}

function createAlbumArcWidgetDesktop({
  root,
  titleSelector = ".arc-title",
  itemSelector = ".bs-arc-item",
  data = BEATS,
}) {
  if (!root) return null;

  const titleEl = root.querySelector(titleSelector);
  const items = gsap.utils.toArray(root.querySelectorAll(itemSelector));

  if (!titleEl || items.length < 1) return null;

  const H = 134;
  const GAP_Y = 12;
  const STEP_X = 112;
  const STEP_Y = H + GAP_Y;

  const SLOTS = [
    { x: STEP_X * 2, y: STEP_Y * 2, opacity: 0.35 },
    { x: STEP_X * 1, y: STEP_Y * 1, opacity: 0.55 },
    { x: 0, y: 0, opacity: 1.0 },
  ];

  const maxStep = items.length - 1;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setTitleForStep(step) {
    const safeStep = Math.max(0, Math.min(maxStep, step));
    titleEl.textContent = data[safeStep]?.title || items[safeStep]?.dataset?.title || "";
  }

  function layoutProgress(progressStep) {
    const s = Math.max(0, Math.min(maxStep, progressStep));
    const i = Math.floor(s);
    const f = s - i;

    const A0 = i;
    const A1 = i + 1;
    const A2 = i + 2;

    items.forEach((el) => {
      el.style.pointerEvents = "none";
      el.style.zIndex = 0;
      gsap.set(el, { autoAlpha: 0 });
    });

    function place(idx, slotFrom, slotTo, z) {
      const el = items[idx];
      if (!el) return;

      el.style.pointerEvents = "auto";
      el.style.zIndex = z;

      gsap.set(el, {
        x: lerp(slotFrom.x, slotTo.x, f),
        y: lerp(slotFrom.y, slotTo.y, f),
        autoAlpha: lerp(slotFrom.opacity, slotTo.opacity, f),
      });
    }

    const EXIT = {
      x: SLOTS[2].x,
      y: SLOTS[2].y - STEP_Y * 0.9,
      opacity: 0,
    };

    place(A0, SLOTS[2], EXIT, 30);
    place(A1, SLOTS[1], SLOTS[2], 40);
    place(A2, SLOTS[0], SLOTS[1], 20);

    const A3 = i + 3;
    const el3 = items[A3];
    if (el3) {
      el3.style.pointerEvents = "auto";
      el3.style.zIndex = 10;

      gsap.set(el3, {
        x: SLOTS[0].x,
        y: SLOTS[0].y + lerp(24, 0, f),
        autoAlpha: lerp(0, SLOTS[0].opacity, f),
      });
    }

    const focusedIndex = f < 0.5 ? i : Math.min(i + 1, maxStep);
    titleEl.textContent =
      data[focusedIndex]?.title ||
      items[focusedIndex]?.dataset?.title ||
      "";
  }

  function snap(step) {
    step = Math.max(0, Math.min(maxStep, step));

    const A0 = items[step];
    const A1 = items[step + 1];
    const A2 = items[step + 2];

    items.forEach((el) => {
      el.style.pointerEvents = "none";
      el.style.zIndex = 0;
      gsap.set(el, { autoAlpha: 0 });
    });

    function setAt(el, slot, z) {
      if (!el) return;
      el.style.pointerEvents = "auto";
      el.style.zIndex = z;
      gsap.set(el, { x: slot.x, y: slot.y, autoAlpha: slot.opacity });
    }

    setAt(A0, SLOTS[2], 40);
    setAt(A1, SLOTS[1], 30);
    setAt(A2, SLOTS[0], 20);

    setTitleForStep(step);
  }

  snap(0);

  items.forEach((btn, idx) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.__albumViewDesktop) window.__albumViewDesktop.open(idx, data);
    });
  });

  return { layoutProgress, snap, maxStep, root, data };
}

function createBoxViewerDesktop(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 2000);
  camera.position.set(0, 0, 4);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);

  const group = new THREE.Group();
  scene.add(group);

  let t = 0;
  let targetRX = 0;
  let targetRY = 0;
  let hoverLock = false;

  function resetRotation() {
    targetRX = 0;
    targetRY = 0;
    group.rotation.set(0, 0, 0);
  }

  const boxEl = canvas.closest(".bs-box");

  if (boxEl) {
    boxEl.addEventListener("pointerenter", () => {
      hoverLock = true;
      resetRotation();
    });

    boxEl.addEventListener("pointermove", (e) => {
      if (hoverLock) return;
      if (!boxEl.classList.contains("bs-aim")) return;

      const r = boxEl.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;

      targetRY = nx * 0.6;
      targetRX = -ny * 0.35;
    });

    boxEl.addEventListener("pointerleave", () => {
      hoverLock = false;
      targetRX = 0;
      targetRY = 0;
    });
  }

  function fitCameraToObject(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const radius = Math.max(0.001, sphere.radius);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const dist = radius / Math.sin(fov / 2);

    camera.position.set(0, radius * 0.15, dist * 1.15);
    camera.lookAt(0, 0, 0);
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();

  return {
    renderer,
    scene,
    camera,
    group,

    load: (url) =>
      new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        loader.load(
          url,
          (gltf) => {
            const modelRoot = gltf.scene;

            const fileName = decodeURIComponent(url).split("/").pop().split("?")[0];
const fix = ROT_FIX[fileName] ?? { x: 0, y: 0, z: 0 };
            modelRoot.rotation.set(fix.x, fix.y, fix.z);

            group.add(modelRoot);

            const box = new THREE.Box3().setFromObject(modelRoot);
            const center = new THREE.Vector3();
            box.getCenter(center);
            modelRoot.position.sub(center);

            fitCameraToObject(group);
            resolve();
          },
          undefined,
          reject
        );
      }),

    tick: (dt) => {
      t += dt;

      const idleRot = 0.25 * t;
      const idleBob = Math.sin(t * 0) * 0.03;

      if (hoverLock) {
        group.rotation.y += (0 - group.rotation.y) * 0.15;
        group.rotation.x += (0 - group.rotation.x) * 0.15;
      } else {
        group.rotation.y += (idleRot + targetRY - group.rotation.y) * 0.08;
        group.rotation.x += (targetRX - group.rotation.x) * 0.08;
      }

      group.position.y += (idleBob - group.position.y) * 0.08;
      renderer.render(scene, camera);
    },

    resize,
    resetRotation,
  };
}

function initBeatStoreModelsDesktop() {
  const boxViewers = [];
  const canvases = Array.from(document.querySelectorAll(".bs-canvas"));

  canvases.forEach((c) => {
    const viewer = createBoxViewerDesktop(c);
    boxViewers.push(viewer);

    const url = c.getAttribute("data-model");
    viewer.load(url).catch((err) => {
      console.error("BeatStore GLB load failed:", url, err);
    });
  });

  function resetViewerForBox(boxEl) {
    const c = boxEl.querySelector(".bs-canvas");
    if (!c) return;

    const all = Array.from(document.querySelectorAll(".bs-canvas"));
    const idx = all.indexOf(c);

    if (idx >= 0 && boxViewers[idx]) boxViewers[idx].resetRotation();
  }

  const bsBoxes = gsap.utils.toArray(".bs-grid .bs-box");
  let activeBox = document.querySelector('.bs-grid .bs-box[data-grid="img-1"]');

  function scheduleViewersResize() {
    if (scheduleViewersResize._raf) return;

    scheduleViewersResize._raf = requestAnimationFrame(() => {
      scheduleViewersResize._raf = null;
      for (const v of boxViewers) v.resize();
    });
  }

  bsBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      if (box === activeBox) return;

      const state = Flip.getState(bsBoxes);
      const nextGrid = box.dataset.grid;

      activeBox.dataset.grid = nextGrid;
      box.dataset.grid = "img-1";

      activeBox.classList.remove("bs-aim");
      box.classList.add("bs-aim");

      activeBox = box;

      resetViewerForBox(activeBox);

      Flip.from(state, {
        duration: 0.3,
        ease: "power1.inOut",
        absolute: true,
        onUpdate: scheduleViewersResize,
        onComplete: scheduleViewersResize,
      });
    });
  });

  window.addEventListener("resize", () => {
    for (const v of boxViewers) v.resize();
  });

  setTimeout(() => {
    for (const v of boxViewers) v.resize();
  }, 150);
}

function initRevolverDesktop(onReady) {
  const canvas = document.querySelector(".webgl");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.01,
    2000
  );
  camera.position.set(0, 0, 8);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(6, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 1.0);
  rim.position.set(-10, 4, -6);
  scene.add(rim);

  const gunGroup = new THREE.Group();
  scene.add(gunGroup);

  const MODEL_URL = "/models/revolver.optimized.glb";
  const baseQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, Math.PI, 0)
  );

  const aimPoint = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();
  const mouse = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

loader.load(
    MODEL_URL,
    (gltf) => {
      const gunRoot = gltf.scene;
      gunGroup.add(gunRoot);

      const box = new THREE.Box3().setFromObject(gunRoot);
      const center = new THREE.Vector3();
      box.getCenter(center);
      gunRoot.position.sub(center);

      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);

      const radius = sphere.radius || 1;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = radius / Math.sin(fov / 2);

      camera.position.set(0, radius * 0.2, dist * 1.1);
      camera.lookAt(0, 0, 0);

      gunGroup.quaternion.copy(baseQuat);

      if (onReady) onReady();
    },
    undefined,
    (err) => console.error("GLB load failed", err)
  );

  function renderRevolverFrame() {
  const targetRotX = THREE.MathUtils.degToRad(
    THREE.MathUtils.clamp((gyroBeta - 45) * 0.12, -10, 10)
  );

  const targetRotY = THREE.MathUtils.degToRad(
    THREE.MathUtils.clamp(gyroGamma * 0.35, -20, 20)
  );

  const targetQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(targetRotX, targetRotY, 0)
  );

  targetQuat.premultiply(baseQuat);
  gunGroup.quaternion.slerp(targetQuat, 0.08);

  renderer.render(scene, camera);
}

function startRevolverMobile() {
  if (mobileRevolverRunning) return;
  mobileRevolverRunning = true;

  const loop = () => {
    if (!mobileRevolverRunning) return;
    renderRevolverFrame();
    mobileRevolverRaf = requestAnimationFrame(loop);
  };

  mobileRevolverRaf = requestAnimationFrame(loop);
}

function stopRevolverMobile() {
  mobileRevolverRunning = false;

  if (mobileRevolverRaf) {
    cancelAnimationFrame(mobileRevolverRaf);
    mobileRevolverRaf = null;
  }
}

mobileRevolverRenderer = {
  start: startRevolverMobile,
  stop: stopRevolverMobile,
  renderOnce: renderRevolverFrame,
};

startRevolverMobile();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
}

function initCinematicScrollDesktop() {
  const existing = ScrollTrigger.getById("cinematicScrollDesktop");
  if (existing) existing.kill(true);

  const landing = document.querySelector("#home");
  const sceneComposite = landing?.querySelector(".scene-composite");
  const beatStore = document.querySelector("#beat-store");

  if (!landing || !sceneComposite || !beatStore) return;

  const beatStoreArcRoot = document.querySelector("#bs-arc");
  const arc = createAlbumArcWidgetDesktop({
    root: beatStoreArcRoot,
    titleSelector: ".arc-title",
    itemSelector: ".bs-arc-item",
    data: BEATS,
  });

  const musicArc = window.__musicArcDesktop;

  const bsTitle = beatStore.querySelector(".bs-title");
  const bsCopy = beatStore.querySelector(".bs-copy");
  const bsBtn = beatStore.querySelector(".bs-btn");
  const bsGrid = beatStore.querySelector(".bs-grid");
  const bsArc = beatStore.querySelector("#bs-arc");

  const musicLeft = beatStore.querySelector("#bsMusicLeft");
  const musicArcOverlay = beatStore.querySelector("#music-arc-overlay");

  const bsTitleReveal = beatStore.querySelector(".bs-title-reveal");
  const bsCopyReveal = beatStore.querySelector(".bs-copy-reveal");

  const musicTitleReveal = musicLeft?.querySelector(".bs-music-title-reveal");
  const musicCopyReveal = musicLeft?.querySelector(".bs-music-copy-reveal");

  const aboutTransitionMap = document.querySelector("#aboutTransitionMap");
  const aboutTransitionImg = aboutTransitionMap?.querySelector("img");

  const aboutSection = document.querySelector("#about");
  const aboutMapWrap = aboutSection?.querySelector("#aboutMapWrap");
  const aboutTitleReveal = aboutSection?.querySelector(".about-title-reveal");
  const aboutCopyReveal = aboutSection?.querySelector(".about-copy-reveal");
  const aboutBtnReveal = aboutSection?.querySelector(".about-btn-reveal");
  const aboutLinks = aboutSection?.querySelector(".about-links");

  const nav = document.querySelector(".nav");
  const navHome = nav ? { parent: nav.parentNode, next: nav.nextSibling } : null;

  function moveNavToBodyDesktop(on) {
    if (!nav || !navHome) return;

    if (on) {
      if (nav.parentNode !== document.body) document.body.appendChild(nav);

      gsap.set(nav, { autoAlpha: 1 });

      nav.style.position = "fixed";
      nav.style.top = "0";
      nav.style.left = "0";
      nav.style.width = "100%";
      nav.style.zIndex = "999999";
      nav.style.pointerEvents = "auto";
    } else {
      nav.style.position = "";
      nav.style.top = "";
      nav.style.left = "";
      nav.style.width = "";
      nav.style.zIndex = "";
      nav.style.pointerEvents = "";

      if (navHome.next && navHome.next.parentNode === navHome.parent) {
        navHome.parent.insertBefore(nav, navHome.next);
      } else {
        navHome.parent.appendChild(nav);
      }
    }
  }

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  const END_DIST = 1600;

  gsap.set(sceneComposite, {
    transformOrigin: "51.9% 66.5%",
    xPercent: -50,
    x: 0,
    y: 0,
    scale: 1,
    willChange: "transform",
  });

  const beatBg = beatStore.querySelector(".beat-store-bg");
  const beatContent = beatStore.querySelector(".beat-store-content");

  gsap.set(beatStore, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: 20,
    autoAlpha: 0,
    pointerEvents: "none",
  });

  gsap.set(beatContent, { autoAlpha: 0 });

  let spacer = document.querySelector(".beat-store-spacer");

  if (!spacer) {
    spacer = document.createElement("div");
    spacer.className = "beat-store-spacer";
    spacer.style.display = "none";
    beatStore.insertAdjacentElement("afterend", spacer);
  }

  function setSpacerDesktop(on) {
    if (!spacer) return;
    spacer.style.display = on ? "block" : "none";
    spacer.style.height = on ? "100vh" : "0px";
    spacer.style.pointerEvents = "none";
  }

  function setBeatStoreFixedDesktop(on) {
    setSpacerDesktop(on);

    if (on) {
      moveNavToBodyDesktop(true);

      gsap.set(beatStore, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 20,
      });
    } else {
      moveNavToBodyDesktop(false);

      gsap.set(beatStore, {
        clearProps: "position,top,left,width,height,zIndex",
      });
    }
  }

  function setAboutOverlayModeDesktop(on) {
    if (!aboutSection) return;

    if (on) {
      gsap.set(aboutSection, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 25,
      });

      if (aboutTransitionMap) {
        gsap.set(aboutTransitionMap, {
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 40,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });
      }
    } else {
      gsap.set(aboutSection, {
        clearProps: "position,top,left,width,height,zIndex",
      });

      if (aboutTransitionMap) {
        gsap.set(aboutTransitionMap, {
          clearProps:
            "position,inset,width,height,zIndex,pointerEvents,display,alignItems,justifyContent",
        });
      }
    }
  }

  const beatItems = gsap.utils.toArray(bsArc.querySelectorAll(".bs-arc-item"));
  const musicItems = gsap.utils.toArray(
    musicArcOverlay.querySelectorAll(".bs-arc-item")
  );
  const musicTitleEl = musicArcOverlay.querySelector(".arc-title");
  const musicPointerEl = musicArcOverlay.querySelector(".arc-pointer");

  function clamp01Desktop(v) {
    return Math.max(0, Math.min(1, v));
  }

  function lerpDesktop(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubicDesktop(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setBeatStoreStateDesktop() {
    gsap.set(bsTitle, { autoAlpha: 1, y: 0, clearProps: "display" });
    gsap.set(bsCopy, { autoAlpha: 1, y: 0, clearProps: "display" });
    gsap.set(bsBtn, { autoAlpha: 1, y: 0, clearProps: "display" });
    gsap.set(bsGrid, { autoAlpha: 1, clearProps: "display" });
    gsap.set(bsArc, { autoAlpha: 1, pointerEvents: "auto" });

    if (bsTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsTitleReveal.querySelector(".reveal__inner"), { yPercent: 0 });
    }

    if (bsCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsCopyReveal.querySelector(".reveal__inner"), { yPercent: 0 });
    }

    gsap.set(musicLeft, { autoAlpha: 0, visibility: "hidden" });
    gsap.set(musicArcOverlay, {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    });
    gsap.set(musicTitleEl, { autoAlpha: 0 });
    gsap.set(musicPointerEl, { autoAlpha: 0 });

    if (musicTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(musicTitleReveal.querySelector(".reveal__inner"), {
        yPercent: 120,
      });
    }

    if (musicCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(musicCopyReveal.querySelector(".reveal__inner"), {
        yPercent: 120,
      });
    }

    musicItems.forEach((el, i) => {
      gsap.set(el, {
        x: 180 + i * 26,
        y: 250 + i * 16,
        autoAlpha: 0,
      });
      el.style.pointerEvents = "none";
    });
  }

  function setMusicStateDesktop() {
    gsap.set(bsTitle, { autoAlpha: 0, y: -20 });
    gsap.set(bsCopy, { autoAlpha: 0, y: -20 });
    gsap.set(bsBtn, { autoAlpha: 0, y: -10 });
    gsap.set(bsGrid, { autoAlpha: 0 });
    gsap.set(bsArc, { autoAlpha: 0, pointerEvents: "none" });

    if (bsTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsTitleReveal.querySelector(".reveal__inner"), { yPercent: -110 });
    }

    if (bsCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsCopyReveal.querySelector(".reveal__inner"), { yPercent: -110 });
    }

    gsap.set(musicLeft, { autoAlpha: 1, visibility: "visible" });
    gsap.set(musicArcOverlay, {
      autoAlpha: 1,
      visibility: "visible",
      pointerEvents: "auto",
    });
    gsap.set(musicTitleEl, { autoAlpha: 1 });
    gsap.set(musicPointerEl, { autoAlpha: 1 });

    if (musicTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(musicTitleReveal.querySelector(".reveal__inner"), { yPercent: 0 });
    }

    if (musicCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(musicCopyReveal.querySelector(".reveal__inner"), { yPercent: 0 });
    }
  }

  function setHandoffProgressDesktop(rawT) {
    const t = clamp01Desktop(rawT);
    const e = easeOutCubicDesktop(t);

    gsap.set(musicLeft, {
      autoAlpha: 1 - e,
      visibility: 1 - e > 0.001 ? "visible" : "hidden",
    });

    gsap.set(musicArcOverlay, {
      autoAlpha: 1 - e,
      visibility: 1 - e > 0.001 ? "visible" : "hidden",
      pointerEvents: "none",
    });

    gsap.set(musicTitleEl, { autoAlpha: 1 - e });
    gsap.set(musicPointerEl, { autoAlpha: 1 - e });

    if (musicTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(musicTitleReveal.querySelector(".reveal__inner"), {
        yPercent: -110 * e,
      });
    }

    if (musicCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(musicCopyReveal.querySelector(".reveal__inner"), {
        yPercent: -110 * e,
      });
    }

    if (musicItems[0]) {
      gsap.set(musicItems[0], {
        x: lerpDesktop(0, -84, e),
        y: lerpDesktop(0, -120, e),
        autoAlpha: 1 - e,
      });
    }

    if (musicItems[1]) {
      gsap.set(musicItems[1], {
        x: lerpDesktop(112, 52, e),
        y: lerpDesktop(146, 18, e),
        autoAlpha: lerpDesktop(0.55, 0, e),
      });
    }

    if (musicItems[2]) {
      gsap.set(musicItems[2], {
        x: lerpDesktop(224, 188, e),
        y: lerpDesktop(292, 172, e),
        autoAlpha: lerpDesktop(0.35, 0, e),
      });
    }

    if (musicItems[3]) {
      gsap.set(musicItems[3], {
        x: lerpDesktop(336, 286, e),
        y: lerpDesktop(438, 280, e),
        autoAlpha: 0,
      });
    }

    musicItems.forEach((el) => {
      el.style.pointerEvents = "none";
    });

    gsap.set(bsTitle, {
      autoAlpha: e,
      y: 20 - 20 * e,
      clearProps: "display",
    });

    gsap.set(bsCopy, {
      autoAlpha: e,
      y: 20 - 20 * e,
      clearProps: "display",
    });

    gsap.set(bsBtn, {
      autoAlpha: e,
      y: 12 - 12 * e,
      clearProps: "display",
    });

    gsap.set(bsGrid, {
      autoAlpha: e,
      clearProps: "display",
    });

    gsap.set(bsArc, {
      autoAlpha: e,
      pointerEvents: "none",
    });

    if (bsTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsTitleReveal.querySelector(".reveal__inner"), {
        yPercent: 120 - 120 * e,
      });
    }

    if (bsCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsCopyReveal.querySelector(".reveal__inner"), {
        yPercent: 120 - 120 * e,
      });
    }

    if (beatItems[0]) {
      gsap.set(beatItems[0], {
        x: lerpDesktop(180, 0, e),
        y: lerpDesktop(250, 0, e),
        autoAlpha: lerpDesktop(0, 1, e),
      });
    }

    if (beatItems[1]) {
      gsap.set(beatItems[1], {
        x: lerpDesktop(206, 112, e),
        y: lerpDesktop(266, 146, e),
        autoAlpha: lerpDesktop(0, 0.55, e),
      });
    }

    if (beatItems[2]) {
      gsap.set(beatItems[2], {
        x: lerpDesktop(232, 224, e),
        y: lerpDesktop(282, 292, e),
        autoAlpha: lerpDesktop(0, 0.35, e),
      });
    }

    if (beatItems[3]) {
      gsap.set(beatItems[3], {
        x: lerpDesktop(258, 336, e),
        y: lerpDesktop(298, 438, e),
        autoAlpha: 0,
      });
    }

    beatItems.forEach((el) => {
      el.style.pointerEvents = "none";
    });
  }

  function getRevealInnerDesktop(el) {
    return el?.querySelector(".reveal__inner") || null;
  }

  function getAboutTargetTransformDesktop() {
    if (!aboutTransitionImg || !aboutMapWrap) {
      return { x: 0, y: 0, scale: 1 };
    }

    const targetRect = aboutMapWrap.getBoundingClientRect();
    const viewportCX = window.innerWidth / 2;
    const viewportCY = window.innerHeight / 2;

    const targetCX = targetRect.left + targetRect.width / 2;
    const targetCY = targetRect.top + targetRect.height / 2;

    const naturalWidth =
      aboutTransitionImg.naturalWidth || aboutTransitionImg.clientWidth || 1;
    const naturalHeight =
      aboutTransitionImg.naturalHeight || aboutTransitionImg.clientHeight || 1;

    const fitScale = Math.min(
      (window.innerWidth * 0.78) / naturalWidth,
      (window.innerHeight * 0.78) / naturalHeight
    );

    const targetScale = targetRect.width / naturalWidth;

    return {
      x: targetCX - viewportCX,
      y: targetCY - viewportCY,
      startScale: fitScale * 3.4,
      endScale: targetScale,
    };
  }

  function setAboutHiddenStateDesktop() {
    setAboutOverlayModeDesktop(false);

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(aboutTransitionMap, {
      autoAlpha: 0,
    });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        x: 0,
        y: 0,
        scale: 3.4,
        autoAlpha: 1,
        transformOrigin: "50% 50%",
      });
    }

    if (aboutTitleReveal) {
      const inner = getRevealInnerDesktop(aboutTitleReveal);
      if (inner) gsap.set(inner, { yPercent: 120 });
    }

    if (aboutCopyReveal) {
      const inner = getRevealInnerDesktop(aboutCopyReveal);
      if (inner) gsap.set(inner, { yPercent: 120 });
    }

    if (aboutBtnReveal) {
      const inner = getRevealInnerDesktop(aboutBtnReveal);
      if (inner) gsap.set(inner, { yPercent: 120 });
    }

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: 0,
        y: 20,
      });
    }

    if (aboutMapWrap) {
      gsap.set(aboutMapWrap, { autoAlpha: 0 });
    }
  }

  function setAboutTransitionProgressDesktop(rawT) {
    const t = clamp01Desktop(rawT);
    const e = easeOutCubicDesktop(t);
    const tf = getAboutTargetTransformDesktop();

    if (arc) arc.snap(arc.maxStep);
    setAboutOverlayModeDesktop(true);

    const storeFade = clamp01Desktop(1 - t * 1.25);
    const focusedBeat = beatItems[beatItems.length - 1];

    gsap.set(bsTitle, { autoAlpha: storeFade, y: -20 * t, clearProps: "display" });
    gsap.set(bsCopy, { autoAlpha: storeFade, y: -20 * t, clearProps: "display" });
    gsap.set(bsBtn, { autoAlpha: storeFade, y: -10 * t, clearProps: "display" });
    gsap.set(bsGrid, { autoAlpha: storeFade, clearProps: "display" });
    gsap.set(bsArc, { autoAlpha: storeFade, pointerEvents: "none" });

    if (bsTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsTitleReveal.querySelector(".reveal__inner"), { yPercent: -110 * t });
    }

    if (bsCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsCopyReveal.querySelector(".reveal__inner"), { yPercent: -110 * t });
    }

    if (focusedBeat) {
      gsap.set(focusedBeat, {
        y: -140 * t,
        autoAlpha: storeFade,
      });
    }

    if (musicLeft) {
      gsap.set(musicLeft, {
        autoAlpha: 0,
        visibility: "hidden",
      });
    }

    if (musicArcOverlay) {
      gsap.set(musicArcOverlay, {
        autoAlpha: 0,
        visibility: "hidden",
        pointerEvents: "none",
      });
    }

    if (beatBg) gsap.set(beatBg, { autoAlpha: 1 - e });

    gsap.set(aboutSection, {
      autoAlpha: 1,
      pointerEvents: "none",
    });

    gsap.set(aboutTransitionMap, { autoAlpha: 1 });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        transformOrigin: "50% 50%",
        x: lerpDesktop(0, tf.x, e),
        y: lerpDesktop(0, tf.y, e),
        scale: lerpDesktop(tf.startScale, tf.endScale, e),
        autoAlpha: 1,
      });
    }

    const titleT = clamp01Desktop((t - 0.48) / 0.18);
    const copyT = clamp01Desktop((t - 0.58) / 0.18);
    const btnT = clamp01Desktop((t - 0.7) / 0.14);
    const linksT = clamp01Desktop((t - 0.64) / 0.16);

    const aboutTitleInner = getRevealInnerDesktop(aboutTitleReveal);
    const aboutCopyInner = getRevealInnerDesktop(aboutCopyReveal);
    const aboutBtnInner = getRevealInnerDesktop(aboutBtnReveal);

    if (aboutTitleInner) gsap.set(aboutTitleInner, { yPercent: 120 - 120 * titleT });
    if (aboutCopyInner) gsap.set(aboutCopyInner, { yPercent: 120 - 120 * copyT });
    if (aboutBtnInner) gsap.set(aboutBtnInner, { yPercent: 120 - 120 * btnT });

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: linksT,
        y: 20 - 20 * linksT,
      });
    }

    if (aboutMapWrap) {
      gsap.set(aboutMapWrap, {
        autoAlpha: clamp01Desktop((t - 0.55) / 0.3),
      });
    }
  }

  function setAboutStateDesktop() {
    setAboutOverlayModeDesktop(false);

    if (beatBg) gsap.set(beatBg, { autoAlpha: 0 });

    gsap.set(bsTitle, { autoAlpha: 0, y: -20 });
    gsap.set(bsCopy, { autoAlpha: 0, y: -20 });
    gsap.set(bsBtn, { autoAlpha: 0, y: -10 });
    gsap.set(bsGrid, { autoAlpha: 0 });
    gsap.set(bsArc, { autoAlpha: 0, pointerEvents: "none" });

    gsap.set(musicLeft, { autoAlpha: 0, visibility: "hidden" });
    gsap.set(musicArcOverlay, {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    });

    gsap.set(aboutSection, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });

    gsap.set(aboutTransitionMap, { autoAlpha: 0 });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        clearProps: "x,y,scale,opacity,transformOrigin",
      });
    }

    if (aboutMapWrap) gsap.set(aboutMapWrap, { autoAlpha: 1 });

    const aboutTitleInner = getRevealInnerDesktop(aboutTitleReveal);
    const aboutCopyInner = getRevealInnerDesktop(aboutCopyReveal);
    const aboutBtnInner = getRevealInnerDesktop(aboutBtnReveal);

    if (aboutTitleInner) gsap.set(aboutTitleInner, { yPercent: 0 });
    if (aboutCopyInner) gsap.set(aboutCopyInner, { yPercent: 0 });
    if (aboutBtnInner) gsap.set(aboutBtnInner, { yPercent: 0 });

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: 1,
        y: 0,
      });
    }
  }

  setMusicStateDesktop();
  if (musicArc) musicArc.snap(0);
  if (arc) arc.snap(0);
  setAboutHiddenStateDesktop();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const refreshHandler = () => {
        setSpacerDesktop(beatStore.classList.contains("cinematic-fixed"));
      };

      ScrollTrigger.addEventListener("refreshInit", refreshHandler);

      gsap.timeline({
        scrollTrigger: {
          id: "cinematicScrollDesktop",
          trigger: landing,
          start: "top top",
          end: `+=${END_DIST}%`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,

          onUpdate: (self) => {
            if (!arc) return;

            const p = self.progress;

            const MUSIC_START = 0.38;
const MUSIC_HOLD_END = 0.42;
const MUSIC_END = 0.58;

const HANDOFF_START = 0.58;
const HANDOFF_END = 0.66;

const BEATSTORE_START = 0.66;
const BEATSTORE_HOLD_END = 0.70;
const BEATSTORE_END = 0.86;

const ABOUT_START = 0.86;
const ABOUT_END = 1;

            if (p <= MUSIC_START) {
              if (musicArc) musicArc.snap(0);
              setMusicStateDesktop();
              setAboutHiddenStateDesktop();
              return;
            }

            if (p < MUSIC_END) {
              setMusicStateDesktop();
              setAboutHiddenStateDesktop();

              if (musicArc) {
                const mt = (p - MUSIC_START) / (MUSIC_END - MUSIC_START);
                const mu = Math.max(0, Math.min(1, mt));
                const mRaw = mu * musicArc.maxStep;
                musicArc.layoutProgress(mRaw);
              }

              return;
            }

            if (p < HANDOFF_START) {
              if (musicArc) musicArc.snap(musicArc.maxStep);
              setMusicStateDesktop();
              setAboutHiddenStateDesktop();
              return;
            }

            if (p < HANDOFF_END) {
              if (musicArc) musicArc.snap(musicArc.maxStep);
              const handoffT = (p - HANDOFF_START) / (HANDOFF_END - HANDOFF_START);
              setHandoffProgressDesktop(handoffT);
              setAboutHiddenStateDesktop();
              return;
            }

            if (p < BEATSTORE_HOLD_END) {
  if (arc) arc.snap(0);
  setBeatStoreStateDesktop();
  setAboutHiddenStateDesktop();
  return;
}

if (p < BEATSTORE_END) {
  const t =
    (p - BEATSTORE_HOLD_END) / (BEATSTORE_END - BEATSTORE_HOLD_END);
  const u = Math.max(0, Math.min(1, t));
  const HOLD = 0.05;

  const raw = u * arc.maxStep;
  const step = Math.floor(raw);
  const frac = raw - step;

  let adjusted;
  if (frac < HOLD) adjusted = step;
  else adjusted = step + (frac - HOLD) / (1 - HOLD);

  setBeatStoreStateDesktop();
  setAboutHiddenStateDesktop();
  arc.layoutProgress(adjusted);
  return;
}

if (p < ABOUT_START) {
  if (arc) arc.snap(arc.maxStep);
  setBeatStoreStateDesktop();
  setAboutHiddenStateDesktop();
  if (beatBg) gsap.set(beatBg, { autoAlpha: 1 });
  return;
}

            if (p < ABOUT_END) {
              if (arc) arc.snap(arc.maxStep);
              const aboutT = (p - ABOUT_START) / (ABOUT_END - ABOUT_START);
              setAboutTransitionProgressDesktop(aboutT);
              return;
            }

            setAboutStateDesktop();
          },

          onEnter: () => {
            document.documentElement.classList.add("nav-blend");
            setBeatStoreFixedDesktop(true);
          },

          onEnterBack: () => {
            document.documentElement.classList.add("nav-blend");
            setBeatStoreFixedDesktop(true);

            gsap.set(beatStore, {
              autoAlpha: 1,
              pointerEvents: "none",
            });

            if (arc) arc.snap(arc.maxStep);
          },

          onLeave: (self) => {
            self.scroll(self.end - 1);
          },

          onLeaveBack: () => {
  document.documentElement.classList.remove("nav-blend");

  gsap.set(sceneComposite, {
    left: "50%",
    xPercent: -50,
    x: 0,
    y: 0,
    scale: 1,
  });

  gsap.set(textLayer, { autoAlpha: 1 });
  gsap.set(webgl, { autoAlpha: 1 });

  gsap.set(beatStore, {
    autoAlpha: 0,
    pointerEvents: "none",
  });

  gsap.set(beatContent, { autoAlpha: 0 });


  if (nav) {
    gsap.set(nav, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });
  }

  
  if (musicArc) musicArc.snap(0);
  if (arc) arc.snap(0);
},

          onKill: () => {
            ScrollTrigger.removeEventListener("refreshInit", refreshHandler);
          },
        },
      })
        .to(
          sceneComposite,
          {
            scale: 150,
            y: window.innerHeight * 0.18,
            ease: "none",
          },
          0
        )
        .duration(0.1)
        .to(
          [".text-layer", ".webgl"],
          {
            autoAlpha: 0,
            ease: "none",
          },
          0.08
        )
        .to(beatStore, { autoAlpha: 1, ease: "none" }, 0.1)
        .fromTo(
          ".beat-store-content",
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: "none" },
          0.22
        )
        .to(beatStore, { pointerEvents: "auto", duration: 0 }, 0.34)
        .to({}, { duration: 1.2, ease: "none" });

      ScrollTrigger.refresh();
    });
  });
}

function setupDesktopPhaseNav() {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  if (!links.length) return;

  function scrollToDesktopProgress(progress) {
    const st = ScrollTrigger.getById("cinematicScrollDesktop");
    if (!st) return;

    const p = Math.max(0, Math.min(1, progress));
    const y = st.start + (st.end - st.start) * p;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const href = link.getAttribute("href");

      // Desktop nav maps to cinematic phases, not normal anchors
      if (href === "#home") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      if (href === "#music") {
        scrollToDesktopProgress(0.38);
        return;
      }

      if (href === "#beat-store") {
        scrollToDesktopProgress(0.68);
        return;
      }

      if (href === "#about") {
        scrollToDesktopProgress(0.99);
        return;
      }

      // Updates doesn't exist yet on desktop
      if (href === "#updates") {
        return;
      }
    });
  });
}

function initDesktopApp() {
  gsap.set("#beat-store", { autoAlpha: 0, pointerEvents: "none" });
  gsap.set("#beat-store .beat-store-content", { autoAlpha: 0 });

  document.querySelectorAll(".nav .nav-item").forEach(ensureFinalTextDesktop);

  const albumViewDesktop = initAlbumViewDesktop();
  window.__albumViewDesktop = albumViewDesktop;

  const musicArcRootDesktop = document.querySelector("#music-arc-overlay");
  window.__musicArcDesktop = createAlbumArcWidgetDesktop({
    root: musicArcRootDesktop,
    titleSelector: ".arc-title",
    itemSelector: ".bs-arc-item",
    data: MUSIC_BEATS,
  });

  gsap.set("#bsMusicLeft", { autoAlpha: 0, visibility: "hidden" });
  gsap.set("#music-arc-overlay", { autoAlpha: 0, visibility: "hidden" });
  gsap.set("#music-arc-overlay .bs-arc-item", { autoAlpha: 0 });
  gsap.set("#music-arc-overlay .arc-title", { autoAlpha: 0 });
  gsap.set("#music-arc-overlay .arc-pointer", { autoAlpha: 0 });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#beat-store" || id === "#music") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.body.style.overflow = "hidden";

  initBeatStoreModelsDesktop();

  initRevolverDesktop(() => {
    const landing = document.querySelector(".landing");

    startNavIntroDesktop();

    setTimeout(() => {
      landing?.classList.remove("revolver-only");
      document.body.style.overflow = "hidden";

      const introTl = startLandingIntroDesktop();

      introTl.eventCallback("onComplete", () => {
  document.body.style.overflow = "";
  initCinematicScrollDesktop();
  setupDesktopPhaseNav();
});
    }, 100);
  });
}

/* =========================
   MOBILE ONLY
========================= */
async function preloadAssetsMobile(onProgress) {
  let loaded = 0;

  const tick = () => {
    loaded++;
    if (onProgress) onProgress(Math.min(1, loaded / PRELOAD_ASSETS_MOBILE.length));
  };

  const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

  const jobs = PRELOAD_ASSETS_MOBILE.map((url) => {
    if (url.endsWith(".glb")) {
      return new Promise((resolve) => {
        gltfLoader.load(
          url,
          () => {
            tick();
            resolve();
          },
          undefined,
          () => {
            tick();
            resolve();
          }
        );
      });
    }

    return fetch(url, { cache: "force-cache" })
      .then(() => tick())
      .catch(() => tick());
  });

  await Promise.all(jobs);
}

function ensureFinalTextMobile(el) {
  if (!el.dataset.finalMobile) el.dataset.finalMobile = el.textContent;
  return el.dataset.finalMobile;
}

function scrambleOnceMobile(el, { duration = 0.22, delay = 0 } = {}) {
  const original = ensureFinalTextMobile(el);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  const total = Math.max(6, Math.floor(duration * 60));
  let frame = 0;
  const startAt = performance.now() + delay * 1000;

  function tick(now) {
    if (now < startAt) return requestAnimationFrame(tick);

    frame++;
    const p = frame / total;

    const out = original
      .split("")
      .map((c, i) => {
        if (c === " ") return " ";
        const lock = i / original.length < p;
        return lock ? c : chars[(Math.random() * chars.length) | 0];
      })
      .join("");

    el.textContent = out;

    if (frame < total) requestAnimationFrame(tick);
    else el.textContent = original;
  }

  requestAnimationFrame(tick);
}

function attachHoverScrambleMobile(el, { duration = 0.2, fps = 24 } = {}) {
  const original = ensureFinalTextMobile(el);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  let tween = null;

  function frame() {
    el.textContent = original
      .split("")
      .map((c) => (c === " " ? " " : chars[(Math.random() * chars.length) | 0]))
      .join("");
  }

  function stop() {
    if (tween) tween.kill();
    tween = null;
    el.textContent = original;
  }

  function playOnce() {
    if (tween) return;

    const step = 1 / fps;
    let last = -999;

    tween = gsap.to(
      {},
      {
        duration,
        ease: "none",
        onUpdate: function () {
          const t = this.time();
          if (t - last >= step) {
            last = t;
            frame();
          }
        },
        onComplete: () => {
          tween = null;
          el.textContent = original;
        },
      }
    );
  }

  el.addEventListener("mouseenter", playOnce);
  el.addEventListener("mouseleave", stop);
  el.addEventListener("touchstart", playOnce, { passive: true });
}

function maskRevealMobile(wrapperEl, { duration = 0.55, delay = 0 } = {}) {
  if (!wrapperEl) return;
  const inner = wrapperEl.querySelector(".reveal__inner");
  if (!inner) return;

  gsap.fromTo(
    inner,
    { yPercent: 120 },
    { yPercent: 0, duration, ease: "power3.out", delay }
  );
}

function startNavIntroMobile() {
  const nav = document.querySelector(".nav");
  const items = Array.from(document.querySelectorAll(".nav .nav-item"));
  if (!nav || !items.length) return;

  gsap.set(nav, { autoAlpha: 1, pointerEvents: "auto" });

  items.forEach((el) => {
    ensureFinalTextMobile(el);
    gsap.set(el, { autoAlpha: 0 });
  });

  items.forEach((el, i) => {
    const d = 0.15 + i * 0.05;
    gsap.to(el, { autoAlpha: 1, duration: 0.14, ease: "power1.out", delay: d });
    scrambleOnceMobile(el, { duration: 1.4, delay: d });
  });

  document.querySelectorAll(".hover-scramble").forEach((el) => {
    attachHoverScrambleMobile(el, { duration: 0.2, fps: 24 });
  });
}

function startLandingIntroMobile() {
  const heroReveal = document.querySelector(".left-block .hero-logo");
  const metaReveals = Array.from(document.querySelectorAll(".left-block .meta-reveal"));
  const descReveals = Array.from(document.querySelectorAll(".left-block .desc .reveal"));
  const latestReveal = document.querySelector(".right-block .latest-reveal");
  const dropReveal = document.querySelector(".right-block .drop-reveal");
  const sceneComposite = document.querySelector(".scene-composite");

  gsap.set(".reveal__inner", { yPercent: 120 });
  gsap.set(".webgl", { autoAlpha: 1 });

gsap.set(sceneComposite, {
  left: "50%",
  bottom: 0,
  xPercent: -50,
  x: 0,
  y: 40,
  scale: 1,
  autoAlpha: 0,
  transformOrigin: "51.9% 66.5%",
  force3D: true,
});

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.add(() => {
    metaReveals.forEach((w, i) => {
      maskRevealMobile(w, { duration: 0.45, delay: i * 0.05 });
    });
  }, 0);

  tl.add(() => {
    maskRevealMobile(heroReveal, { duration: 1.0, delay: 0 });
  }, 0.08);

  tl.to(
    sceneComposite,
    {
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: "power2.out",
    },
    0.12
  );

  tl.add(() => {
    if (descReveals[0]) maskRevealMobile(descReveals[0], { duration: 0.55, delay: 0 });
    if (descReveals[1]) maskRevealMobile(descReveals[1], { duration: 0.55, delay: 0.1 });
  }, 0.42);

  tl.add(() => {
    maskRevealMobile(latestReveal, { duration: 0.5, delay: 0 });
  }, 0.7);

  tl.add(() => {
    maskRevealMobile(dropReveal, { duration: 0.5, delay: 0 });
  }, 0.92);

  return tl;
}

function initAlbumViewMobile() {
  const view = document.getElementById("album-view");
  const bgBase = document.getElementById("albumViewBgBase");
  const bgPlayed = document.getElementById("albumViewBgPlayed");

  const moreBtn = document.getElementById("albumViewMoreBtn");
  const playBtn = document.getElementById("albumViewPlayBtn");
  const soundBtn = document.getElementById("albumViewSoundBtn");
  const progressLine = document.getElementById("albumViewProgressLine");

  const currentEl = document.getElementById("albumViewCurrent");
  const durationEl = document.getElementById("albumViewDuration");

  const titleEl = document.getElementById("albumViewTitle");
  const descEl = document.getElementById("albumViewDesc");
  const detailsEl = document.getElementById("albumViewDetails");
  const buyBtn = document.getElementById("albumViewBuyBtn");

  const audio = document.getElementById("albumViewAudio");

  let activeIndex = 0;
  let activeList = BEATS;
  let isMuted = false;
  let isScrubbing = false;
  let wasPlayingBeforeScrub = false;

  function formatTimeMobile(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const r = String(s % 60).padStart(2, "0");
    return `${String(m).padStart(2, "0")}:${r}`;
  }

  function setPlayedProgressMobile(progress01) {
    const p = Math.max(0, Math.min(1, progress01 || 0));
    bgPlayed.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
    gsap.set(progressLine, { x: window.innerWidth * p });
  }

  function getProgressFromClientXMobile(clientX) {
    const x = Math.max(0, Math.min(window.innerWidth, clientX));
    return x / window.innerWidth;
  }

  function scrubToClientXMobile(clientX) {
    const p = getProgressFromClientXMobile(clientX);
    setPlayedProgressMobile(p);

    if (audio.duration) {
      const nextTime = p * audio.duration;
      audio.currentTime = nextTime;
      currentEl.textContent = formatTimeMobile(nextTime);
    }
  }

  function setPlayStateUIMobile(isPlaying) {
    playBtn.textContent = isPlaying ? "❚❚" : "▶";
  }

  function setMuteUIMobile() {
    soundBtn.textContent = isMuted ? "SOUND ON" : "SOUND OFF";
  }

  function setTitleAlignmentMobile(title) {
    titleEl.classList.remove("is-single-line");
    titleEl.textContent = title;

    requestAnimationFrame(() => {
      const isSingleLine = titleEl.scrollHeight <= 42;
      titleEl.classList.toggle("is-single-line", isSingleLine);
    });
  }

  function loadBeat(index, list = activeList) {
    const beat = list[index];
    if (!beat) return;

    activeIndex = index;
    activeList = list;

    bgBase.style.backgroundImage = `url("${beat.art}")`;
    bgPlayed.style.backgroundImage = `url("${beat.art}")`;

    setTitleAlignmentMobile(beat.title);
    descEl.textContent = beat.description;
    detailsEl.textContent = beat.details;
    durationEl.textContent = beat.duration || "00:00";

    audio.src = beat.preview;
    audio.currentTime = 0;
    audio.load();

    buyBtn.onclick = () => {
      window.open(beat.buyUrl, "_blank");
    };

    currentEl.textContent = "00:00";
    setPlayedProgressMobile(0);
  }

  let albumViewScrollY = 0;

function lockAlbumViewScrollMobile() {
  albumViewScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.classList.add("album-view-lock");
  document.body.style.top = `-${albumViewScrollY}px`;
}

function unlockAlbumViewScrollMobile() {
  const y = Math.abs(parseInt(document.body.style.top || "0", 10)) || 0;
  document.body.classList.remove("album-view-lock");
  document.body.style.top = "";
  window.scrollTo(0, y);
}

  function open(index, list = BEATS) {
  loadBeat(index, list);

  view.classList.add("is-open");
  view.setAttribute("aria-hidden", "false");

  setMobileViewportVars();
  lockAlbumViewScrollMobile();

  gsap.killTweensOf(view);
    gsap.killTweensOf(".album-view-bg-base, .album-view-bg-played, .album-view-ui");

    gsap.set(view, { autoAlpha: 1 });

    gsap.fromTo([bgBase, bgPlayed], { scale: 1.04 }, { scale: 1, duration: 0.4, ease: "power2.out" });

    gsap.fromTo(
      ".album-view-ui",
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.28, delay: 0.05, ease: "power2.out" }
    );

    audio.currentTime = 0;
    audio.play().catch(() => {});
    setPlayStateUIMobile(true);
  }

  function close() {
    audio.pause();
    audio.currentTime = 0;
    currentEl.textContent = "00:00";
    setPlayedProgressMobile(0);

    gsap.to(".album-view-ui", {
      autoAlpha: 0,
      y: 8,
      duration: 0.18,
      ease: "power2.out",
    });

    gsap.to(view, {
      autoAlpha: 0,
      duration: 0.22,
      ease: "power2.out",
      onComplete: () => {
  view.classList.remove("is-open");
  view.setAttribute("aria-hidden", "true");
  unlockAlbumViewScrollMobile();
},
    });
  }

  playBtn.addEventListener("click", () => {
    if (!audio.src) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  soundBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    setMuteUIMobile();
  });

  moreBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  close();
});

  audio.addEventListener("play", () => setPlayStateUIMobile(true));
  audio.addEventListener("pause", () => setPlayStateUIMobile(false));
  audio.addEventListener("ended", () => {
    setPlayStateUIMobile(false);
    currentEl.textContent = "00:00";
    setPlayedProgressMobile(0);
    audio.currentTime = 0;
  });

  audio.addEventListener("loadedmetadata", () => {
    if (!isNaN(audio.duration)) durationEl.textContent = formatTimeMobile(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isScrubbing) return;
    currentEl.textContent = formatTimeMobile(audio.currentTime);
    setPlayedProgressMobile(audio.currentTime / audio.duration);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && view.classList.contains("is-open")) close();
  });

  view.addEventListener("click", (e) => {
    if (e.target === view) close();
  });

  const blockAlbumScroll = (e) => {
  if (view.classList.contains("is-open")) {
    e.preventDefault();
  }
};

view.addEventListener("touchmove", blockAlbumScroll, { passive: false });
view.addEventListener("wheel", blockAlbumScroll, { passive: false });

  window.addEventListener("resize", () => {
    if (audio.duration) setPlayedProgressMobile(audio.currentTime / audio.duration);
    else setPlayedProgressMobile(0);
  });

  setMuteUIMobile();

  view.addEventListener("pointerdown", (e) => {
    if (
      e.target.closest(".album-view-more") ||
      e.target.closest(".album-view-play") ||
      e.target.closest(".album-view-sound") ||
      e.target.closest(".album-view-buy")
    ) {
      return;
    }

    isScrubbing = true;
    wasPlayingBeforeScrub = !audio.paused;

    if (wasPlayingBeforeScrub) audio.pause();
    scrubToClientXMobile(e.clientX);
  });

  window.addEventListener("pointermove", (e) => {
    if (!isScrubbing) return;
    scrubToClientXMobile(e.clientX);
  });

  window.addEventListener("pointerup", () => {
    if (!isScrubbing) return;
    isScrubbing = false;
    if (wasPlayingBeforeScrub) audio.play().catch(() => {});
  });

  return {
    open,
    close,
    loadBeat,
    getActiveIndex: () => activeIndex,
    getActiveList: () => activeList,
  };
}

function createAlbumArcWidgetMobile({
  root,
  titleSelector = ".arc-title",
  itemSelector = ".bs-arc-item",
  data = BEATS,
}) {
  if (!root) return null;

  const titleEl = root.querySelector(titleSelector);
  const items = gsap.utils.toArray(root.querySelectorAll(itemSelector));

  if (!titleEl || items.length < 1) return null;

  const H = 86;
  const GAP_Y = 32;
  const STEP_X = 72;
  const STEP_Y = H * 0.7 + GAP_Y;

  const SLOTS = [
    { x: STEP_X * 2, y: STEP_Y * 2, opacity: 0.2, scale: 0.8 },
    { x: STEP_X * 1, y: STEP_Y * 1, opacity: 0.5, scale: 0.9 },
    { x: 0, y: 0, opacity: 1.0, scale: 1.0 },
  ];

  const maxStep = items.length - 1;

  function lerpMobile(a, b, t) {
    return a + (b - a) * t;
  }

  function setTitleForStepMobile(step) {
    const safeStep = Math.max(0, Math.min(maxStep, step));
    titleEl.textContent = data[safeStep]?.title || items[safeStep]?.dataset?.title || "";
  }

  function layoutProgress(progressStep) {
    const s = Math.max(0, Math.min(maxStep, progressStep));
    const i = Math.floor(s);
    const f = s - i;

    const A0 = i;
    const A1 = i + 1;
    const A2 = i + 2;

    items.forEach((el) => {
      el.style.pointerEvents = "none";
      el.style.zIndex = 0;
      gsap.set(el, { autoAlpha: 0 });
    });

    function place(idx, slotFrom, slotTo, z) {
      const el = items[idx];
      if (!el) return;

      el.style.pointerEvents = "auto";
      el.style.zIndex = z;

      gsap.set(el, {
        x: lerpMobile(slotFrom.x, slotTo.x, f),
        y: lerpMobile(slotFrom.y, slotTo.y, f),
        scale: lerpMobile(slotFrom.scale, slotTo.scale, f),
        autoAlpha: lerpMobile(slotFrom.opacity, slotTo.opacity, f),
      });
    }

    const EXIT = {
      x: SLOTS[2].x,
      y: SLOTS[2].y - STEP_Y * 0.75,
      opacity: 0,
      scale: 1.04,
    };

    place(A0, SLOTS[2], EXIT, 30);
    place(A1, SLOTS[1], SLOTS[2], 40);
    place(A2, SLOTS[0], SLOTS[1], 20);

    const A3 = i + 3;
    const el3 = items[A3];
    if (el3) {
      el3.style.pointerEvents = "auto";
      el3.style.zIndex = 10;

      gsap.set(el3, {
        x: SLOTS[0].x,
        y: SLOTS[0].y + lerpMobile(18, 0, f),
        scale: lerpMobile(0.72, SLOTS[0].scale, f),
        autoAlpha: lerpMobile(0, SLOTS[0].opacity, f),
      });
    }

    const focusedIndex = f < 0.5 ? i : Math.min(i + 1, maxStep);
    titleEl.textContent =
      data[focusedIndex]?.title ||
      items[focusedIndex]?.dataset?.title ||
      "";
  }

  function snap(step) {
    step = Math.max(0, Math.min(maxStep, step));

    const A0 = items[step];
    const A1 = items[step + 1];
    const A2 = items[step + 2];

    items.forEach((el) => {
      el.style.pointerEvents = "none";
      el.style.zIndex = 0;
      gsap.set(el, { autoAlpha: 0 });
    });

    function setAt(el, slot, z) {
      if (!el) return;
      el.style.pointerEvents = "auto";
      el.style.zIndex = z;
      gsap.set(el, {
        x: slot.x,
        y: slot.y,
        scale: slot.scale,
        autoAlpha: slot.opacity,
      });
    }

    setAt(A0, SLOTS[2], 40);
    setAt(A1, SLOTS[1], 30);
    setAt(A2, SLOTS[0], 20);

    setTitleForStepMobile(step);
  }

  snap(0);

  items.forEach((btn, idx) => {
  let startX = 0;
  let startY = 0;
  let moved = false;

  const openBeat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.__albumViewMobile) {
      window.__albumViewMobile.open(idx, data);
    }
  };

  btn.addEventListener("click", openBeat);

  btn.addEventListener(
    "touchstart",
    (e) => {
      const t = e.changedTouches[0];
      startX = t.clientX;
      startY = t.clientY;
      moved = false;
    },
    { passive: true }
  );

  btn.addEventListener(
    "touchmove",
    (e) => {
      const t = e.changedTouches[0];
      const dx = Math.abs(t.clientX - startX);
      const dy = Math.abs(t.clientY - startY);
      if (dx > 10 || dy > 10) moved = true;
    },
    { passive: true }
  );

  btn.addEventListener(
    "touchend",
    (e) => {
      if (moved) return;
      openBeat(e);
    },
    { passive: false }
  );
});

  return { layoutProgress, snap, maxStep, root, data };
}

function createBoxViewerMobile(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 2000);
  camera.position.set(0, 0, 4);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 6, 8);
  scene.add(key);

  const group = new THREE.Group();
  scene.add(group);

  let t = 0;

  function resetRotation() {
    group.rotation.set(0, 0, 0);
  }

    let currentModelFile = "";

  function fitCameraToObjectMobile(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const radius = Math.max(0.001, sphere.radius);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const baseDist = radius / Math.sin(fov / 2);

    const preset = MOBILE_MODEL_FIT[currentModelFile] || { y: 0, zoom: 1.2 };

    camera.position.set(0, radius * preset.y, baseDist * preset.zoom);
    camera.lookAt(0, 0, 0);
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();

  return {
    renderer,
    scene,
    camera,
    group,

    load: (url) =>
      new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        loader.load(
          url,
                    (gltf) => {
            const modelRoot = gltf.scene;

            const fileName = decodeURIComponent(url).split("/").pop().split("?")[0];

currentModelFile = fileName;

const fix = ROT_FIX[fileName] ?? { x: 0, y: 0, z: 0 };
            modelRoot.rotation.set(fix.x, fix.y, fix.z);

            group.add(modelRoot);

            const box = new THREE.Box3().setFromObject(modelRoot);
            const center = new THREE.Vector3();
            box.getCenter(center);
            modelRoot.position.sub(center);

            fitCameraToObjectMobile(group);
            resolve();
          },
          undefined,
          reject
        );
      }),

        tick: (dt) => {
      t += dt;

      const idleRotY = 0.1 * t;
      const idleRotX = -0.04;

      group.rotation.y += (idleRotY - group.rotation.y) * 0.05;
      group.rotation.x += (idleRotX - group.rotation.x) * 0.08;
      group.position.y += (0 - group.position.y) * 0.08;

      renderer.render(scene, camera);
    },

    resize,
    resetRotation,
  };
}

function initBeatStoreModelsMobile() {
  mobileBoxViewers = [];
  const canvases = Array.from(document.querySelectorAll(".bs-canvas"));

  canvases.forEach((c) => {
    const viewer = createBoxViewerMobile(c);
    mobileBoxViewers.push(viewer);

    const url = c.getAttribute("data-model");
    viewer.load(url).catch((err) => {
      console.error("BeatStore GLB load failed:", url, err);
    });
  });

  function resetViewerForBoxMobile(boxEl) {
    const c = boxEl.querySelector(".bs-canvas");
    if (!c) return;

    const all = Array.from(document.querySelectorAll(".bs-canvas"));
    const idx = all.indexOf(c);

    if (idx >= 0 && boxViewers[idx]) boxViewers[idx].resetRotation();
  }

  const bsBoxes = gsap.utils.toArray("#beat-store .bs-grid .bs-box");
  let activeBox = document.querySelector('#beat-store .bs-grid .bs-box[data-grid="img-1"]');

  function scheduleViewersResizeMobile() {
    if (scheduleViewersResizeMobile._raf) return;

    scheduleViewersResizeMobile._raf = requestAnimationFrame(() => {
      scheduleViewersResizeMobile._raf = null;
      for (const v of mobileBoxViewers) v.resize();
    });
  }

  bsBoxes.forEach((box) => {
    box.style.pointerEvents = "auto";
    box.style.touchAction = "manipulation";

    box.addEventListener("click", () => {
      if (box === activeBox) return;

      const state = Flip.getState(bsBoxes);
      const nextGrid = box.dataset.grid;

      activeBox.dataset.grid = nextGrid;
      box.dataset.grid = "img-1";

      activeBox.classList.remove("bs-aim");
      box.classList.add("bs-aim");

      activeBox = box;

      resetViewerForBoxMobile(activeBox);

      Flip.from(state, {
        duration: 0.32,
        ease: "power1.inOut",
        absolute: true,
        onUpdate: scheduleViewersResizeMobile,
        onComplete: scheduleViewersResizeMobile,
      });
    });
  });

  window.addEventListener("resize", () => {
    for (const v of mobileBoxViewers) v.resize();
  });

  setTimeout(() => {
    for (const v of mobileBoxViewers) v.resize();
  }, 150);
}

function initRevolverMobile(onReady = null) {
  const canvas = document.querySelector(".webgl");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.01,
    2000
  );
  camera.position.set(0, 0, 8);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(6, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.9);
  rim.position.set(-10, 4, -6);
  scene.add(rim);

  const gunGroup = new THREE.Group();
  scene.add(gunGroup);

  const MODEL_URL = "/models/revolver.optimized.glb";
  const baseQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, Math.PI, 0)
  );

let gyroBeta = 0;   // front/back tilt
let gyroGamma = 0;  // left/right tilt
let gyroEnabled = false;

function handleOrientation(e) {
  gyroBeta = e.beta || 0;
  gyroGamma = e.gamma || 0;
}

function enableGyro() {
  if (gyroEnabled) return;
  gyroEnabled = true;

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((state) => {
        if (state === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      })
      .catch((err) => {
        console.warn("Gyro permission denied:", err);
      });
  } else {
    window.addEventListener("deviceorientation", handleOrientation);
  }
}

  const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

loader.load(
    MODEL_URL,
    (gltf) => {
      const gunRoot = gltf.scene;
      gunGroup.add(gunRoot);

      const box = new THREE.Box3().setFromObject(gunRoot);
      const center = new THREE.Vector3();
      box.getCenter(center);
      gunRoot.position.sub(center);

      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);

      const radius = sphere.radius || 1;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = radius / Math.sin(fov / 2);

      camera.position.set(0, radius * 0.15, dist * 1.08);
      camera.lookAt(0, 0, 0);

      gunGroup.quaternion.copy(baseQuat);

window.addEventListener("click", enableGyro, { once: true });
window.addEventListener("touchstart", enableGyro, { once: true, passive: true });

if (onReady) onReady();
    },
    undefined,
    (err) => console.error("GLB load failed", err)
  );

  tick();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

function handleMobileViewportChange() {
  if (mobileViewportRaf) cancelAnimationFrame(mobileViewportRaf);

  mobileViewportRaf = requestAnimationFrame(() => {
    setMobileViewportVars();

    if (mobileResizeRefreshRaf) cancelAnimationFrame(mobileResizeRefreshRaf);

    mobileResizeRefreshRaf = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  });
}

function bindMobileViewportTracking() {
  if (mobileViewportTrackingBound) return;
  mobileViewportTrackingBound = true;

  setMobileViewportVars();

  window.addEventListener("resize", handleMobileViewportChange, { passive: true });
  window.addEventListener("orientationchange", handleMobileViewportChange, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleMobileViewportChange, {
      passive: true,
    });
  }
}

function initCinematicScrollMobile() {
  if (mobileMasterTrigger) {
    mobileMasterTrigger.kill();
    mobileMasterTrigger = null;
  }

  setMobileViewportVars();

  [
    "cinematicLandingMobile",
    "cinematicMusicMobile",
    "cinematicBeatStoreMobile",
    "cinematicMobileMaster",
  ].forEach((id) => {
    const st = ScrollTrigger.getById(id);
    if (st) st.kill(true);
  });

  const cinematicRoot = document.querySelector("#mobile-cinematic-root");
  if (!cinematicRoot) return;
  
  const landing = document.querySelector("#home");
  const musicSection = document.querySelector("#music");
  const beatStore = document.querySelector("#beat-store");
  const aboutSection = document.querySelector("#about");

  const sceneComposite = landing?.querySelector(".scene-composite");
  const textLayer = landing?.querySelector(".text-layer");
  const webgl = landing?.querySelector(".webgl");

  const mobileMusicLeft = document.querySelector("#mobileMusicLeftStatic");
  const mobileMusicArcRoot = document.querySelector("#mobile-music-arc");

  const beatContent = beatStore?.querySelector(".beat-store-content");
  const beatBg = beatStore?.querySelector(".beat-store-bg");
  const bsTitle = beatStore?.querySelector(".bs-title");
  const bsCopy = beatStore?.querySelector(".bs-copy");
  const bsBtn = beatStore?.querySelector(".bs-btn");
  const bsGrid = beatStore?.querySelector(".bs-grid");
  const bsArc = beatStore?.querySelector("#bs-arc");

    const bsTitleReveal = beatStore?.querySelector(".bs-title-reveal");
  const bsCopyReveal = beatStore?.querySelector(".bs-copy-reveal");

  let mobilePhase = "";

  const aboutTransitionMap = document.querySelector("#aboutTransitionMap");
  const aboutTransitionImg = aboutTransitionMap?.querySelector("img");
  const aboutMapWrap = aboutSection?.querySelector("#aboutMapWrap");
  const aboutTitleReveal = aboutSection?.querySelector(".about-title-reveal");
  const aboutCopyReveal = aboutSection?.querySelector(".about-copy-reveal");
  const aboutBtnReveal = aboutSection?.querySelector(".about-btn-reveal");
  const aboutLinks = aboutSection?.querySelector(".about-links");

  const nav = document.querySelector(".nav");
const menuBtn = document.querySelector(".menu-btn");

const navHome = nav ? { parent: nav.parentNode, next: nav.nextSibling } : null;
const menuHome = menuBtn
  ? { parent: menuBtn.parentNode, next: menuBtn.nextSibling }
  : null;

function moveNavToBodyMobile(on) {
  if (!nav || !navHome) return;

  if (on) {
    // NAV
    if (nav.parentNode !== document.body) {
      document.body.appendChild(nav);
    }

    // MENU BUTTON
    if (menuBtn && menuBtn.parentNode !== document.body) {
      document.body.appendChild(menuBtn);
    }

    gsap.set(nav, { autoAlpha: 1, pointerEvents: "none" });
    if (menuBtn) gsap.set(menuBtn, { autoAlpha: 1 });

    nav.style.position = "fixed";
    nav.style.top = "0";
    nav.style.left = "0";
    nav.style.width = "100%";
    nav.style.zIndex = "999998";

    if (menuBtn) {
      menuBtn.style.position = "fixed";
      menuBtn.style.zIndex = "1000000";
    }

  } else {
    // restore NAV
    nav.style.position = "";
    nav.style.top = "";
    nav.style.left = "";
    nav.style.width = "";
    nav.style.zIndex = "";

    if (navHome.next && navHome.next.parentNode === navHome.parent) {
      navHome.parent.insertBefore(nav, navHome.next);
    } else {
      navHome.parent.appendChild(nav);
    }

    // restore MENU
    if (menuBtn && menuHome) {
      menuBtn.style.position = "";
      menuBtn.style.zIndex = "";

      if (menuHome.next && menuHome.next.parentNode === menuHome.parent) {
        menuHome.parent.insertBefore(menuBtn, menuHome.next);
      } else {
        menuHome.parent.appendChild(menuBtn);
      }
    }
  }
}

  if (
    !landing ||
    !musicSection ||
    !beatStore ||
    !aboutSection ||
    !sceneComposite ||
    !textLayer ||
    !webgl ||
    !mobileMusicLeft ||
    !mobileMusicArcRoot ||
    !beatContent ||
    !bsTitle ||
    !bsCopy ||
    !bsBtn ||
    !bsGrid ||
    !bsArc
  ) {
    return;
  }

  gsap.set(sceneComposite, { transformOrigin: "51.9% 66.5%" });

  const musicArc =
    window.__musicArcMobile ||
    createAlbumArcWidgetMobile({
      root: mobileMusicArcRoot,
      titleSelector: ".arc-title",
      itemSelector: ".bs-arc-item",
      data: MUSIC_BEATS,
    });

  const beatArc = createAlbumArcWidgetMobile({
    root: bsArc,
    titleSelector: ".arc-title",
    itemSelector: ".bs-arc-item",
    data: BEATS,
  });

    const beatArcItems = gsap.utils.toArray(bsArc.querySelectorAll(".bs-arc-item"));
  const beatArcTitle = bsArc.querySelector(".arc-title");
  const beatArcPointer = bsArc.querySelector(".arc-pointer");

  const ARC_H_MOBILE = 86;
  const ARC_GAP_Y_MOBILE = 32;
  const ARC_STEP_X_MOBILE = 72;
  const ARC_STEP_Y_MOBILE = ARC_H_MOBILE * 0.7 + ARC_GAP_Y_MOBILE;

  const ARC_SLOT_0_MOBILE = {
    x: ARC_STEP_X_MOBILE * 2,
    y: ARC_STEP_Y_MOBILE * 2,
    opacity: 0.2,
    scale: 0.8,
  };

  const ARC_SLOT_1_MOBILE = {
    x: ARC_STEP_X_MOBILE * 1,
    y: ARC_STEP_Y_MOBILE * 1,
    opacity: 0.5,
    scale: 0.9,
  };

  const ARC_SLOT_2_MOBILE = {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
  };

  function setBeatStoreArcIntroProgressMobile(rawT) {
    const t = clamp01Mobile(rawT);
    const e = easeOutCubicMobile(t);

    setBeatStoreArcStateMobile();

    // keep later arc items hidden during intro
    beatArcItems.forEach((el, i) => {
      el.style.pointerEvents = "none";
      el.style.zIndex = 0;
      gsap.set(el, { autoAlpha: 0 });
    });

    // title/pointer reveal slightly after items begin moving
    const labelT = clamp01Mobile((t - 0.18) / 0.42);

    if (beatArcTitle) gsap.set(beatArcTitle, { autoAlpha: labelT });
    if (beatArcPointer) gsap.set(beatArcPointer, { autoAlpha: labelT });

    // item 1 : slot[0] -> slot[2]
    if (beatArcItems[0]) {
      beatArcItems[0].style.zIndex = 40;
      gsap.set(beatArcItems[0], {
        x: lerpMobile(ARC_SLOT_0_MOBILE.x, ARC_SLOT_2_MOBILE.x, e),
        y: lerpMobile(ARC_SLOT_0_MOBILE.y, ARC_SLOT_2_MOBILE.y, e),
        scale: lerpMobile(ARC_SLOT_0_MOBILE.scale, ARC_SLOT_2_MOBILE.scale, e),
        autoAlpha: lerpMobile(0, ARC_SLOT_2_MOBILE.opacity, e),
      });
    }

    // item 2 : slot[0] -> slot[1]
    if (beatArcItems[1]) {
      beatArcItems[1].style.zIndex = 30;
      gsap.set(beatArcItems[1], {
        x: lerpMobile(ARC_SLOT_0_MOBILE.x, ARC_SLOT_1_MOBILE.x, e),
        y: lerpMobile(ARC_SLOT_0_MOBILE.y, ARC_SLOT_1_MOBILE.y, e),
        scale: lerpMobile(ARC_SLOT_0_MOBILE.scale, ARC_SLOT_1_MOBILE.scale, e),
        autoAlpha: lerpMobile(0, ARC_SLOT_1_MOBILE.opacity, e),
      });
    }

    // item 3 : settles into slot[0]
    if (beatArcItems[2]) {
      beatArcItems[2].style.zIndex = 20;
      gsap.set(beatArcItems[2], {
        x: ARC_SLOT_0_MOBILE.x,
        y: lerpMobile(ARC_SLOT_0_MOBILE.y + 22, ARC_SLOT_0_MOBILE.y, e),
        scale: lerpMobile(0.72, ARC_SLOT_0_MOBILE.scale, e),
        autoAlpha: lerpMobile(0, ARC_SLOT_0_MOBILE.opacity, e),
      });
    }
  }

  function clamp01Mobile(v) {
    return Math.max(0, Math.min(1, v));
  }

  function lerpMobile(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubicMobile(t) {
    return 1 - Math.pow(1 - t, 3);
  }

    const MOBILE_LANDING_SCENE_SCALE = 12;

function measureLandingZoomScaleMobile() {
  return MOBILE_LANDING_SCENE_SCALE;
}

  function getRevealInnerMobile(el) {
    return el?.querySelector(".reveal__inner") || null;
  }

  function setLandingStateMobile() {

    mobileRevolverRenderer?.start();
    stopBoxViewersMobile();

    gsap.set(landing, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 5,
    });

gsap.set(sceneComposite, {
  left: "50%",
  bottom: 0,
  xPercent: -50,
  x: 0,
  y: 0,
  scale: 1,
  autoAlpha: 1,
  transformOrigin: "51.9% 66.5%",
  force3D: true,
});

    gsap.set(textLayer, { autoAlpha: 1 });
    gsap.set(webgl, { autoAlpha: 1 });

    gsap.set(musicSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 10,
    });

    gsap.set(beatStore, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 20,
    });

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 30,
    });
  }

    function setLandingToMusicProgressMobile(rawT) {
  const t = clamp01Mobile(rawT);
  const e = easeOutCubicMobile(t);

  const textFade = clamp01Mobile((t - 0.08) / 0.16);
  const sceneFade = clamp01Mobile((t - 0.42) / 0.18);
  const musicFade = clamp01Mobile((t - 0.36) / 0.4);

  gsap.set(landing, {
    autoAlpha: 1,
    pointerEvents: "none",
    zIndex: 10,
  });

  gsap.set(sceneComposite, {
    left: "50%",
    bottom: 0,
    xPercent: -50,
    x: 0,
    y: lerpMobile(0, getMobileViewportHeight() * 0.035, e),
    scale: lerpMobile(1, 9.2, e),
    autoAlpha: 1 - sceneFade,
    transformOrigin: "51.9% 66.5%",
    force3D: true,
  });

  gsap.set(textLayer, {
    autoAlpha: 1 - textFade,
  });

  gsap.set(webgl, {
    autoAlpha: 1 - textFade,
  });

  gsap.set(musicSection, {
  autoAlpha: musicFade,
  pointerEvents: musicFade > 0.05 ? "auto" : "none",
  zIndex: 20,
});

  gsap.set(mobileMusicLeft, {
    autoAlpha: musicFade,
    y: 16 - 16 * musicFade,
    visibility: musicFade > 0.001 ? "visible" : "hidden",
    pointerEvents: "none",
  });

  const mobileMusicTitleInner = mobileMusicLeft?.querySelector(".bs-music-title-reveal .reveal__inner");
const mobileMusicCopyInner = mobileMusicLeft?.querySelector(".bs-music-copy-reveal .reveal__inner");

if (mobileMusicTitleInner) gsap.set(mobileMusicTitleInner, { yPercent: 0 });
if (mobileMusicCopyInner) gsap.set(mobileMusicCopyInner, { yPercent: 0 });

  gsap.set(mobileMusicArcRoot, {
  autoAlpha: musicFade,
  y: 18 - 18 * musicFade,
  visibility: musicFade > 0.001 ? "visible" : "hidden",
  pointerEvents: musicFade > 0.05 ? "auto" : "none",
});

  gsap.set(beatStore, {
    autoAlpha: 0,
    pointerEvents: "none",
    zIndex: 30,
  });

  gsap.set(beatContent, { autoAlpha: 0 });

  gsap.set(aboutSection, {
    autoAlpha: 0,
    pointerEvents: "none",
    zIndex: 40,
  });

  gsap.set([
  ".landing .scene-layer",
  ".landing .text-layer",
  ".landing .bg-layer",
  ".landing .webgl"
], {
  pointerEvents: "none"
});

gsap.set("#mobile-music", {
  pointerEvents: "auto",
  zIndex: 30
});

gsap.set("#mobile-music-arc", {
  pointerEvents: "auto",
  zIndex: 31
});

gsap.set(".bs-mobile-grid-stage", {
  autoAlpha: 0,
  visibility: "hidden",
  pointerEvents: "none",
});

gsap.set("#beat-store .bs-mobile-visual", {
  pointerEvents: "none",
});


}

function setMusicBaseStateMobile() {
  
  mobileRevolverRenderer?.stop();
  stopBoxViewersMobile();

  gsap.set(landing, {
    autoAlpha: 0,
    pointerEvents: "none",
  });

  gsap.set(musicSection, {
    autoAlpha: 1,
    pointerEvents: "auto",
    zIndex: 10,
  });

  gsap.set(mobileMusicLeft, {
    autoAlpha: 1,
    visibility: "visible",
    pointerEvents: "none",
  });

  gsap.set(mobileMusicArcRoot, {
    autoAlpha: 1,
    visibility: "visible",
    pointerEvents: "auto",
  });

  gsap.set(".bs-mobile-grid-stage", {
  autoAlpha: 0,
  visibility: "hidden",
  pointerEvents: "none",
});

gsap.set("#beat-store .bs-mobile-visual", {
  pointerEvents: "none",
});

  const mobileMusicTitleInner = mobileMusicLeft?.querySelector(".bs-music-title-reveal .reveal__inner");
  const mobileMusicCopyInner = mobileMusicLeft?.querySelector(".bs-music-copy-reveal .reveal__inner");

  if (mobileMusicTitleInner) gsap.set(mobileMusicTitleInner, { yPercent: 0 });
  if (mobileMusicCopyInner) gsap.set(mobileMusicCopyInner, { yPercent: 0 });

  gsap.set(beatStore, {
    autoAlpha: 0,
    pointerEvents: "none",
    zIndex: 20,
  });

  gsap.set(beatContent, { autoAlpha: 0 });

  gsap.set(aboutSection, {
    autoAlpha: 0,
    pointerEvents: "none",
    zIndex: 30,
  });
}

  function setBeatStoreBaseStateMobile() {
    setBeatStoreGridStateMobile();
  }

    function setBeatStoreGridStateMobile() {

      mobileRevolverRenderer?.stop();

      ensureBeatStoreModelsMobile();
startBoxViewersMobile();

    gsap.set(landing, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(musicSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 10,
    });

    gsap.set(beatStore, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 20,
    });

    gsap.set(beatContent, { autoAlpha: 1 });

    gsap.set(bsTitle, { autoAlpha: 1, y: 0 });
    gsap.set(bsCopy, { autoAlpha: 1, y: 0 });
    gsap.set(bsBtn, { autoAlpha: 1, y: 0 });

    const bsTitleInner = getRevealInnerMobile(bsTitleReveal);
    const bsCopyInner = getRevealInnerMobile(bsCopyReveal);

    if (bsTitleInner) gsap.set(bsTitleInner, { yPercent: 0 });
    if (bsCopyInner) gsap.set(bsCopyInner, { yPercent: 0 });

    gsap.set(".bs-mobile-grid-stage", {
      autoAlpha: 1,
      visibility: "visible",
      pointerEvents: "auto",
    });

    gsap.set(".bs-mobile-arc-stage", {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    });

    gsap.set(".bs-mobile-grid-stage", {
  autoAlpha: 1,
  visibility: "visible",
  pointerEvents: "auto",
});

gsap.set("#beat-store .bs-mobile-visual", {
  pointerEvents: "auto",
});

    gsap.set(bsGrid, { autoAlpha: 1 });
    gsap.set(bsArc, { autoAlpha: 1, pointerEvents: "none" });

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 30,
    });
  }

  function setBeatStoreArcStateMobile() {

    stopBoxViewersMobile();
    
    gsap.set(landing, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(musicSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 10,
    });

    gsap.set(beatStore, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 20,
    });

    gsap.set(beatContent, { autoAlpha: 1 });

    gsap.set(bsTitle, { autoAlpha: 1, y: 0 });
    gsap.set(bsCopy, { autoAlpha: 1, y: 0 });
    gsap.set(bsBtn, { autoAlpha: 1, y: 0 });

    const bsTitleInner = getRevealInnerMobile(bsTitleReveal);
    const bsCopyInner = getRevealInnerMobile(bsCopyReveal);

    if (bsTitleInner) gsap.set(bsTitleInner, { yPercent: 0 });
    if (bsCopyInner) gsap.set(bsCopyInner, { yPercent: 0 });

    gsap.set(".bs-mobile-grid-stage", {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    });

    gsap.set(".bs-mobile-arc-stage", {
      autoAlpha: 1,
      visibility: "visible",
      pointerEvents: "auto",
    });

    gsap.set(bsGrid, { autoAlpha: 1 });
    gsap.set(bsArc, { autoAlpha: 1, pointerEvents: "auto" });

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 30,
    });
  }

  function setBeatStoreArcPreIntroStateMobile() {
  setBeatStoreArcStateMobile();

  if (beatArcTitle) gsap.set(beatArcTitle, { autoAlpha: 0 });
  if (beatArcPointer) gsap.set(beatArcPointer, { autoAlpha: 0 });

  beatArcItems.forEach((el) => {
    el.style.pointerEvents = "none";
    el.style.zIndex = 0;

    gsap.set(el, {
      x: ARC_SLOT_0_MOBILE.x,
      y: ARC_SLOT_0_MOBILE.y + 22,
      scale: 0.72,
      autoAlpha: 0,
    });
  });
}

  function setBeatStoreGridToArcProgressMobile(rawT) {
    const t = clamp01Mobile(rawT);
    const e = easeOutCubicMobile(t);

    gsap.set(landing, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(musicSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 10,
    });

    gsap.set(beatStore, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 20,
    });

    gsap.set(beatContent, { autoAlpha: 1 });

    gsap.set(bsTitle, { autoAlpha: 1, y: 0 });
    gsap.set(bsCopy, { autoAlpha: 1, y: 0 });
    gsap.set(bsBtn, { autoAlpha: 1, y: 0 });

    const bsTitleInner = getRevealInnerMobile(bsTitleReveal);
    const bsCopyInner = getRevealInnerMobile(bsCopyReveal);

    if (bsTitleInner) gsap.set(bsTitleInner, { yPercent: 0 });
    if (bsCopyInner) gsap.set(bsCopyInner, { yPercent: 0 });

    gsap.set(".bs-mobile-grid-stage", {
      autoAlpha: 1 - e,
      visibility: 1 - e > 0.001 ? "visible" : "hidden",
      pointerEvents: "none",
    });

    gsap.set(".bs-mobile-arc-stage", {
      autoAlpha: e,
      visibility: e > 0.001 ? "visible" : "hidden",
      pointerEvents: e > 0.85 ? "auto" : "none",
    });

    gsap.set(bsGrid, { autoAlpha: 1 });
    gsap.set(bsArc, { autoAlpha: 1, pointerEvents: e > 0.85 ? "auto" : "none" });

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 30,
    });
  }

  function setMusicToBeatHandoffMobile(rawT) {
    const t = clamp01Mobile(rawT);
    const e = easeOutCubicMobile(t);

    gsap.set(landing, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(musicSection, {
      autoAlpha: 1 - e,
      pointerEvents: "none",
      zIndex: 10,
    });

    gsap.set(mobileMusicLeft, {
      autoAlpha: 1 - e,
      visibility: 1 - e > 0.001 ? "visible" : "hidden",
      pointerEvents: "none",
    });

    gsap.set(mobileMusicArcRoot, {
      autoAlpha: 1 - e,
      visibility: 1 - e > 0.001 ? "visible" : "hidden",
      pointerEvents: "none",
    });

    const show = e > 0.2 ? 1 : 0;

gsap.set(beatStore, {
  autoAlpha: show,
  pointerEvents: show ? "auto" : "none",
  zIndex: 20,
});

    gsap.set(beatContent, { autoAlpha: 1 });

    gsap.set(bsTitle, {
      autoAlpha: e,
      y: 20 - 20 * e,
    });

    gsap.set(bsCopy, {
      autoAlpha: e,
      y: 20 - 20 * e,
    });

    gsap.set(bsBtn, {
      autoAlpha: e,
      y: 12 - 12 * e,
    });

    gsap.set(bsGrid, {
      autoAlpha: e,
    });

    gsap.set(bsArc, {
      autoAlpha: e,
      pointerEvents: "none",
    });

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 30,
    });
  }

  function setAboutOverlayModeMobile(on) {
  if (!aboutSection) return;

  const liveH = getLiveViewportHeightMobile();

  if (on) {
    gsap.set(aboutSection, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: liveH,
      zIndex: 30,
    });

    if (aboutTransitionMap) {
      gsap.set(aboutTransitionMap, {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: liveH,
        zIndex: 40,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
    }
  } else {
    gsap.set(aboutSection, {
      clearProps: "position,top,left,width,height,zIndex",
    });

    if (aboutTransitionMap) {
      gsap.set(aboutTransitionMap, {
        clearProps:
          "position,inset,width,height,zIndex,pointerEvents,display,alignItems,justifyContent",
      });
    }
  }
}

  function getAboutTargetTransformMobile() {
    if (!aboutTransitionImg || !aboutMapWrap) {
      return { x: 0, y: 0, startScale: 3.2, endScale: 1 };
    }

    const targetRect = aboutMapWrap.getBoundingClientRect();
    const viewportCX = window.innerWidth / 2;
    const viewportCY = getLiveViewportHeightMobile() / 2;

    const targetCX = targetRect.left + targetRect.width / 2;
    const targetCY = targetRect.top + targetRect.height / 2;

    const naturalWidth =
      aboutTransitionImg.naturalWidth || aboutTransitionImg.clientWidth || 1;
    const naturalHeight =
      aboutTransitionImg.naturalHeight || aboutTransitionImg.clientHeight || 1;

    const fitScale = Math.min(
      (window.innerWidth * 0.82) / naturalWidth,
      (getLiveViewportHeightMobile() * 0.82) / naturalHeight
    );

    const targetScale = targetRect.width / naturalWidth;

    return {
      x: targetCX - viewportCX,
      y: targetCY - viewportCY,
      startScale: fitScale * 3.2,
      endScale: targetScale,
    };
  }

  function setAboutHiddenStateMobile() {
    setAboutOverlayModeMobile(false);

    gsap.set(aboutSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 30,
    });

    gsap.set(aboutTransitionMap, {
      autoAlpha: 0,
    });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        x: 0,
        y: 0,
        scale: 3.2,
        autoAlpha: 1,
        transformOrigin: "50% 50%",
      });
    }

    const aboutTitleInner = getRevealInnerMobile(aboutTitleReveal);
    const aboutCopyInner = getRevealInnerMobile(aboutCopyReveal);
    const aboutBtnInner = getRevealInnerMobile(aboutBtnReveal);

    if (aboutTitleInner) gsap.set(aboutTitleInner, { yPercent: 120 });
    if (aboutCopyInner) gsap.set(aboutCopyInner, { yPercent: 120 });
    if (aboutBtnInner) gsap.set(aboutBtnInner, { yPercent: 120 });

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: 0,
        y: 20,
      });
    }

    if (aboutMapWrap) {
      gsap.set(aboutMapWrap, { autoAlpha: 0 });
    }
  }

  function setAboutTransitionProgressMobile(rawT) {
    const t = clamp01Mobile(rawT);
    const e = easeOutCubicMobile(t);
    const tf = getAboutTargetTransformMobile();

    if (beatArc) beatArc.snap(beatArc.maxStep);
    setAboutOverlayModeMobile(true);

    gsap.set(landing, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(musicSection, {
      autoAlpha: 0,
      pointerEvents: "none",
      zIndex: 10,
    });

    gsap.set(beatStore, {
      autoAlpha: 1,
      pointerEvents: "none",
      zIndex: 20,
    });

    const storeFade = clamp01Mobile(1 - t * 1.25);

    gsap.set(bsTitle, { autoAlpha: storeFade, y: -20 * t });
    gsap.set(bsCopy, { autoAlpha: storeFade, y: -20 * t });
    gsap.set(bsBtn, { autoAlpha: storeFade, y: -10 * t });

    const bsTitleInner = getRevealInnerMobile(bsTitleReveal);
    const bsCopyInner = getRevealInnerMobile(bsCopyReveal);

    if (bsTitleInner) gsap.set(bsTitleInner, { yPercent: -110 * t });
    if (bsCopyInner) gsap.set(bsCopyInner, { yPercent: -110 * t });

    gsap.set(".bs-mobile-grid-stage", {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    });

    gsap.set(".bs-mobile-arc-stage", {
      autoAlpha: storeFade,
      visibility: storeFade > 0.001 ? "visible" : "hidden",
      pointerEvents: "none",
    });

    gsap.set(bsGrid, { autoAlpha: 1 });
    gsap.set(bsArc, { autoAlpha: 1, pointerEvents: "none" });

    if (beatBg) gsap.set(beatBg, { autoAlpha: 1 - e });

    gsap.set(aboutSection, {
      autoAlpha: 1,
      pointerEvents: "none",
      zIndex: 30,
    });

    gsap.set(aboutTransitionMap, { autoAlpha: 1 });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        transformOrigin: "50% 50%",
        x: lerpMobile(0, tf.x, e),
        y: lerpMobile(0, tf.y, e),
        scale: lerpMobile(tf.startScale, tf.endScale, e),
        autoAlpha: 1,
      });
    }

    const titleT = clamp01Mobile((t - 0.48) / 0.18);
    const copyT = clamp01Mobile((t - 0.58) / 0.18);
    const btnT = clamp01Mobile((t - 0.7) / 0.14);
    const linksT = clamp01Mobile((t - 0.64) / 0.16);

    const aboutTitleInner = getRevealInnerMobile(aboutTitleReveal);
    const aboutCopyInner = getRevealInnerMobile(aboutCopyReveal);
    const aboutBtnInner = getRevealInnerMobile(aboutBtnReveal);

    if (aboutTitleInner) gsap.set(aboutTitleInner, { yPercent: 120 - 120 * titleT });
    if (aboutCopyInner) gsap.set(aboutCopyInner, { yPercent: 120 - 120 * copyT });
    if (aboutBtnInner) gsap.set(aboutBtnInner, { yPercent: 120 - 120 * btnT });

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: linksT,
        y: 20 - 20 * linksT,
      });
    }

    if (aboutMapWrap) {
      gsap.set(aboutMapWrap, {
        autoAlpha: clamp01Mobile((t - 0.55) / 0.3),
      });
    }
  }

  function setAboutStateMobile() {

    mobileRevolverRenderer?.stop();

    stopBoxViewersMobile();
    setAboutOverlayModeMobile(false);

    if (beatBg) gsap.set(beatBg, { autoAlpha: 0 });

    gsap.set(landing, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(musicSection, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(beatStore, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(aboutSection, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 30,
    });

    gsap.set(aboutTransitionMap, { autoAlpha: 0 });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        clearProps: "x,y,scale,opacity,transformOrigin",
      });
    }

    if (aboutMapWrap) gsap.set(aboutMapWrap, { autoAlpha: 1 });

    const aboutTitleInner = getRevealInnerMobile(aboutTitleReveal);
    const aboutCopyInner = getRevealInnerMobile(aboutCopyReveal);
    const aboutBtnInner = getRevealInnerMobile(aboutBtnReveal);

    if (aboutTitleInner) gsap.set(aboutTitleInner, { yPercent: 0 });
    if (aboutCopyInner) gsap.set(aboutCopyInner, { yPercent: 0 });
    if (aboutBtnInner) gsap.set(aboutBtnInner, { yPercent: 0 });

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: 1,
        y: 0,
      });
    }
  }

  function setMobilePhase(nextPhase) {
  if (mobilePhase === nextPhase) return false;
  mobilePhase = nextPhase;
  return true;
}

  setLandingStateMobile();
  if (musicArc) musicArc.snap(0);
  if (beatArc) beatArc.snap(0);
  setAboutHiddenStateMobile();
  gsap.set(beatContent, { autoAlpha: 0 });
  

  mobileMasterTrigger = ScrollTrigger.create({
  id: "cinematicMobileMaster",
  trigger: cinematicRoot,
  start: "top top",
  end: "+=420%",
  pin: true,
  pinSpacing: true,
  scrub: 0.18,
  anticipatePin: 1,
  invalidateOnRefresh: true,
  fastScrollEnd: false,


    onEnter: () => {
  document.documentElement.classList.add("nav-blend");
  moveNavToBodyMobile(true);
},

    onEnterBack: () => {
  document.documentElement.classList.add("nav-blend");
  moveNavToBodyMobile(true);
},

        onUpdate: (self) => {
      const p = self.progress;

      if (p > 0.42) {
        ensureBeatStoreModelsMobile();
      }

      const LANDING_END = 0.22;
      const MUSIC_END = 0.44;
      const HANDOFF_END = 0.46;
      const BEAT_GRID_END = 0.56;
      const BEAT_ARC_END = 0.90;
      const ABOUT_END = 0.94;

      if (p <= LANDING_END) {
        if (setMobilePhase("landing")) {
          mobileRevolverRenderer?.start();
          setAboutHiddenStateMobile();
        }

        const local = clamp01Mobile(p / LANDING_END);
        setLandingToMusicProgressMobile(local);
        return;
      }

      if (p <= MUSIC_END) {
        if (setMobilePhase("music")) {
          mobileRevolverRenderer?.stop();
          setMusicBaseStateMobile();
          setAboutHiddenStateMobile();
        }

        const local = clamp01Mobile((p - LANDING_END) / (MUSIC_END - LANDING_END));

        if (musicArc) {
          musicArc.layoutProgress(local * musicArc.maxStep);
        }

        return;
      }

      if (p <= HANDOFF_END) {
        if (setMobilePhase("handoff")) {
          mobileRevolverRenderer?.stop();
          if (musicArc) musicArc.snap(musicArc.maxStep);
          setAboutHiddenStateMobile();
        }

        const local = clamp01Mobile((p - MUSIC_END) / (HANDOFF_END - MUSIC_END));
        setMusicToBeatHandoffMobile(local);
        return;
      }

      if (p <= BEAT_GRID_END) {
        if (setMobilePhase("beat-grid")) {
          mobileRevolverRenderer?.stop();
          setBeatStoreGridStateMobile();
          setAboutHiddenStateMobile();
          startBoxViewersMobile();
        }
        return;
      }

      if (p <= BEAT_ARC_END) {
        const local = clamp01Mobile((p - BEAT_GRID_END) / (BEAT_ARC_END - BEAT_GRID_END));

        const FADE_PORTION = 0.18;
        const INTRO_PORTION = 0.28;

        if (local <= FADE_PORTION) {
          if (setMobilePhase("beat-arc-fade")) {
            mobileRevolverRenderer?.stop();
            setAboutHiddenStateMobile();
            stopBoxViewersMobile();
          }

          const fadeT = local / FADE_PORTION;
          setBeatStoreGridToArcProgressMobile(fadeT);
          setBeatStoreArcPreIntroStateMobile();
          return;
        }

        if (local <= FADE_PORTION + INTRO_PORTION) {
          if (setMobilePhase("beat-arc-intro")) {
            mobileRevolverRenderer?.stop();
            setAboutHiddenStateMobile();
            stopBoxViewersMobile();
          }

          const introT = (local - FADE_PORTION) / INTRO_PORTION;
          setBeatStoreArcIntroProgressMobile(introT);
          return;
        }

        if (setMobilePhase("beat-arc")) {
          mobileRevolverRenderer?.stop();
          setAboutHiddenStateMobile();
          stopBoxViewersMobile();
          setBeatStoreArcStateMobile();
        }

        const arcT =
          (local - FADE_PORTION - INTRO_PORTION) / (1 - FADE_PORTION - INTRO_PORTION);

        const arcProgress = clamp01Mobile(arcT);

        if (beatArc) {
          beatArc.layoutProgress(arcProgress * beatArc.maxStep);
        }

        return;
      }

      if (p <= ABOUT_END) {
        if (setMobilePhase("about-transition")) {
          mobileRevolverRenderer?.stop();
          stopBoxViewersMobile();
          if (beatArc) beatArc.snap(beatArc.maxStep);
          setBeatStoreArcStateMobile();
        }

        const local = clamp01Mobile((p - BEAT_ARC_END) / (ABOUT_END - BEAT_ARC_END));
        setAboutTransitionProgressMobile(local);
        return;
      }

      if (setMobilePhase("about")) {
        mobileRevolverRenderer?.stop();
        stopBoxViewersMobile();
        setAboutStateMobile();
      }
    },

    onLeave: (self) => {
      self.scroll(self.end - 1);
    },

        onLeaveBack: () => {
      document.documentElement.classList.remove("nav-blend");
      moveNavToBodyMobile(false);

      mobilePhase = "";
      mobileRevolverRenderer?.start();
      stopBoxViewersMobile();

      setLandingStateMobile();
      if (musicArc) musicArc.snap(0);
      if (beatArc) beatArc.snap(0);
      setAboutHiddenStateMobile();
      gsap.set(beatContent, { autoAlpha: 0 });

      gsap.set(".bs-mobile-grid-stage", { autoAlpha: 1, visibility: "visible", pointerEvents: "auto" });
      gsap.set(".bs-mobile-arc-stage", { autoAlpha: 0, visibility: "hidden", pointerEvents: "none" });
    },
  });

  ScrollTrigger.refresh(true);
}

function initMobileApp() {
  bindMobileViewportTracking();
  document.body.classList.add("mobile-cinematic-lock");

  gsap.set("#beat-store", {
    autoAlpha: 0,
    pointerEvents: "none",
  });

  gsap.set("#beat-store .beat-store-content", { autoAlpha: 0 });

  document.querySelectorAll(".nav .nav-item").forEach(ensureFinalTextMobile);

  const albumViewMobile = initAlbumViewMobile();
  window.__albumViewMobile = albumViewMobile;

  const mobileMusicArcRoot = document.querySelector("#mobile-music-arc");
  window.__musicArcMobile = createAlbumArcWidgetMobile({
    root: mobileMusicArcRoot,
    titleSelector: ".arc-title",
    itemSelector: ".bs-arc-item",
    data: MUSIC_BEATS,
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  setMobileViewportVars();

  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";

  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.touchAction = "none";

  const mobileSceneComposite = document.querySelector(".scene-composite");

  if (mobileSceneComposite) {
    gsap.set(mobileSceneComposite, {
      left: "50%",
      bottom: 0,
      xPercent: -50,
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 0,
      transformOrigin: "51.9% 66.5%",
      force3D: true,
    });
  }

  const landing = document.querySelector(".landing");
  startNavIntroMobile();

  setTimeout(() => {
    landing?.classList.remove("revolver-only");

    const introTl = startLandingIntroMobile();

    introTl.eventCallback("onComplete", () => {
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "hidden";

      document.documentElement.style.overflow = "auto";
      document.documentElement.style.overflowY = "auto";
      document.documentElement.style.overflowX = "hidden";

      document.body.style.touchAction = "pan-y";
      document.documentElement.style.touchAction = "pan-y";

      const app = document.querySelector(".app");
      if (app) {
        app.style.overflow = "visible";
      }

      window.scrollTo(0, 0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initCinematicScrollMobile();
          ScrollTrigger.refresh(true);
        });
      });
    });
  }, 60);

  // Load revolver in parallel, do not block landing reveal
  initRevolverMobile();
}

/* =========================
   BOOT
========================= */
(async function boot() {
  mountLoader();

  gsap.to(".loader__text", {
    opacity: 0.6,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });

  const driver = createLoaderDriver();

  const MIN_TIME_MS = IS_MOBILE ? 900 : 2600;
  const start = performance.now();

  const pctTween = driver.startPercent(MIN_TIME_MS / 1000);

  if (!IS_MOBILE) {
  await preloadAssetsDesktop(() => {});
}

  const elapsed = performance.now() - start;
  const remaining = Math.max(0, MIN_TIME_MS - elapsed);

  setTimeout(() => {
    pctTween.progress(1);

    driver.finish().then(async () => {
      await new Promise((r) => setTimeout(r, IS_MOBILE ? 120 : 800));

      gsap.to("#loaderChamber", {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.25,
        ease: "power2.out",
      });

      gsap.to(".loader__text, .loader__pct", {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.out",
      });

      const blood = document.querySelector(".loader__blood");
      if (blood) {
        blood.style.webkitMaskSize = "0% 0%";
        blood.style.maskSize = "0% 0%";

        gsap.to(
          { v: 0 },
          {
            v: 1,
            duration: 2.5,
            ease: "power2.out",
            onUpdate: function () {
              const pct = 260 * this.targets()[0].v;
              blood.style.webkitMaskSize = `${pct}% ${pct}%`;
              blood.style.maskSize = `${pct}% ${pct}%`;
            },
          }
        );
      }

      setTimeout(() => {
        mountAppShell();
        unmountLoader();

        if (IS_MOBILE) {
          initMobileApp();
        } else {
          initDesktopApp();
        }
      }, IS_MOBILE ? 120 : 650);
    });
  }, remaining);
})();