import "./style.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip.js";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Flip);

const ROT_FIX = {
  "WAVES.glb": { x: Math.PI / 2, y: 0, z: 0 },
  "arturia_minilab_mkii_model.glb": { x: Math.PI / 2, y: 0, z: 0 },
  "mpc_one.glb": { x: Math.PI / 2, y: 0, z: 0 },
};

const BEATS = [
  {
    title: "GUNS",
    artist: "KSHAH",
    key: "Em",
    bpm: "94 BPM",
    date: "02/03/2026",
    time: "19:07:29",
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "12/09/2026 / 19:07:29\n\nBY KSHAH & PSYESH / BOOM BAP\n\n84 BPM / E#m KEY",
    art: "/assets/album-art1.svg",
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
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "14/03/2026 / 21:32:56\n\nBY KSHAH / BOOM BAP\n\n67 BPM / F# KEY",
    art: "/assets/album-art2.svg",
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
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art3.svg",
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
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "14/03/2026 / 21:32:56\n\nBY KSHAH / BOOM BAP\n\n67 BPM / F# KEY",
    art: "/assets/album-art4.svg",
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
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art5.svg",
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
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art6.svg",
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
    description: "LOREM IPSUM DOLOR SIT AMET CONSETCTETUR ADIPISICING ELIT. QUISQUE FAUCIBUS EX SAPIEN VITAE PELLENTESQUE SEM PLACERAT. IN ID CURSUS MI PRETIUM TELLUS DUIS CONVALLIS. TEMPUS LEO EU AENEAN SED DIAM URNA TEMPOR. PULVINAR VIVAMUS FRINGILLA LACUS NEC METUS BIBENDUM EGESTAS. IACULIS MASSA NISL MALESUADA LACINIA INTEGER NUNC POSUERE.",
    details:
      "03/12/2026 / 05:37:13\n\nBY KSHAH / BOOM BAP\n\n93 BPM / B KEY",
    art: "/assets/album-art7.svg",
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
    details:
      "12/09/2026 / 19:07:29\n\nBY KSHAH / MUSIC\n\n94 BPM / Em KEY",
    art: "/assets/music-art1.svg",
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
    details:
      "14/03/2026 / 21:32:56\n\nBY KSHAH / MUSIC\n\n88 BPM / Dm KEY",
    art: "/assets/music-art2.svg",
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
    details:
      "03/12/2026 / 05:37:13\n\nBY KSHAH / MUSIC\n\n140 BPM / C#m KEY",
    art: "/assets/music-art3.svg",
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
    description:
      "LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISICING ELIT.",
    details:
      "14/03/2026 / 21:32:56\n\nBY KSHAH / MUSIC\n\n102 BPM / Fm KEY",
    art: "/assets/music-art4.svg",
    preview: "/assets/previews/beat4.mp3",
    buyUrl: "https://www.beatstars.com/",
    duration: "02:58",
  },
];

/* =========================
   LOADER (mount/unmount)
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

  // spin: slow -> fast -> slow (loop)
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

async function preloadAssets(onProgress) {
  const IS_MOBILE = window.innerWidth <= 768;

const assets = IS_MOBILE
  ? [
      "/assets/noise.svg",
      "/assets/scene-composite.svg",
      "/assets/revolver_load.svg",
      "/assets/blood-splatter.png",
      "/models/revolver.glb",
    ]
  : [
      "/assets/noise.svg",
      "/assets/beat-store-bg.svg",
      "/assets/scene-composite.svg",
      "/assets/revolver_load.svg",
      "/assets/blood-splatter.png",
      "/models/revolver.glb",
      "/models/WAVES.glb",
      "/models/fl_studio_logo.glb",
      "/models/arturia_minilab_mkii_model.glb",
      "/models/mpc_one.glb",
    ];

  let loaded = 0;

  const tick = () => {
    loaded++;
    onProgress(Math.min(1, loaded / assets.length));
  };

  const gltfLoader = new GLTFLoader();

  const jobs = assets.map((url) => {
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

function initCinematicScroll() {
  const existing = ScrollTrigger.getById("cinematicScroll");
  if (existing) existing.kill(true);

  const landing = document.querySelector("#home");
  const sceneComposite = landing?.querySelector(".scene-composite");
  const beatStore = document.querySelector("#beat-store");

  if (!landing || !sceneComposite || !beatStore) return;

  const beatStoreArcRoot = document.querySelector("#bs-arc");
  const arc = createAlbumArcWidget({
    root: beatStoreArcRoot,
    titleSelector: ".arc-title",
    itemSelector: ".bs-arc-item",
    data: BEATS,
  });

  const musicArc = window.__musicArc;

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

  function moveNavToBody(on) {
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

  const IS_MOBILE = window.innerWidth <= 768;

if (IS_MOBILE) {
  gsap.set(sceneComposite, {
    x: 0,
    y: 0,
    scale: 1,
    transformOrigin: "left bottom",
    willChange: "transform"
  });
} else {
  gsap.set(sceneComposite, {
    transformOrigin: "51.9% 66.5%",
    xPercent: -50,
    x: 0,
    y: 0,
    scale: 1,
    willChange: "transform",
  });
}

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

  function setSpacer(on) {
    if (!spacer) return;
    spacer.style.display = on ? "block" : "none";
    spacer.style.height = on ? "100vh" : "0px";
    spacer.style.pointerEvents = "none";
  }

  function setBeatStoreFixed(on) {
    setSpacer(on);

    if (on) {
      moveNavToBody(true);

      gsap.set(beatStore, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 20,
      });
    } else {
      moveNavToBody(false);

      gsap.set(beatStore, {
        clearProps: "position,top,left,width,height,zIndex",
      });
    }
  }

  function setAboutOverlayMode(on) {
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

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setBeatStoreState() {
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

  function setMusicState() {
    gsap.set(bsTitle, { autoAlpha: 0, y: -20 });
    gsap.set(bsCopy, { autoAlpha: 0, y: -20 });
    gsap.set(bsBtn, { autoAlpha: 0, y: -10 });
    gsap.set(bsGrid, { autoAlpha: 0 });
    gsap.set(bsArc, { autoAlpha: 0, pointerEvents: "none" });

    if (bsTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsTitleReveal.querySelector(".reveal__inner"), {
        yPercent: -110,
      });
    }

    if (bsCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsCopyReveal.querySelector(".reveal__inner"), {
        yPercent: -110,
      });
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

  function setHandoffProgress(rawT) {
    const t = clamp01(rawT);
    const e = easeOutCubic(t);

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
        x: lerp(0, -84, e),
        y: lerp(0, -120, e),
        autoAlpha: 1 - e,
      });
    }

    if (musicItems[1]) {
      gsap.set(musicItems[1], {
        x: lerp(112, 52, e),
        y: lerp(146, 18, e),
        autoAlpha: lerp(0.55, 0, e),
      });
    }

    if (musicItems[2]) {
      gsap.set(musicItems[2], {
        x: lerp(224, 188, e),
        y: lerp(292, 172, e),
        autoAlpha: lerp(0.35, 0, e),
      });
    }

    if (musicItems[3]) {
      gsap.set(musicItems[3], {
        x: lerp(336, 286, e),
        y: lerp(438, 280, e),
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
        x: lerp(180, 0, e),
        y: lerp(250, 0, e),
        autoAlpha: lerp(0, 1, e),
      });
    }

    if (beatItems[1]) {
      gsap.set(beatItems[1], {
        x: lerp(206, 112, e),
        y: lerp(266, 146, e),
        autoAlpha: lerp(0, 0.55, e),
      });
    }

    if (beatItems[2]) {
      gsap.set(beatItems[2], {
        x: lerp(232, 224, e),
        y: lerp(282, 292, e),
        autoAlpha: lerp(0, 0.35, e),
      });
    }

    if (beatItems[3]) {
      gsap.set(beatItems[3], {
        x: lerp(258, 336, e),
        y: lerp(298, 438, e),
        autoAlpha: 0,
      });
    }

    beatItems.forEach((el) => {
      el.style.pointerEvents = "none";
    });
  }

  function getRevealInner(el) {
    return el?.querySelector(".reveal__inner") || null;
  }

  function getAboutTargetTransform() {
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

  function setAboutHiddenState() {
    setAboutOverlayMode(false);

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
      const inner = getRevealInner(aboutTitleReveal);
      if (inner) gsap.set(inner, { yPercent: 120 });
    }

    if (aboutCopyReveal) {
      const inner = getRevealInner(aboutCopyReveal);
      if (inner) gsap.set(inner, { yPercent: 120 });
    }

    if (aboutBtnReveal) {
      const inner = getRevealInner(aboutBtnReveal);
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

  function setAboutTransitionProgress(rawT) {
    const t = clamp01(rawT);
    const e = easeOutCubic(t);
    const tf = getAboutTargetTransform();

    if (arc) {
      arc.snap(arc.maxStep);
    }

    setAboutOverlayMode(true);

    const storeFade = clamp01(1 - t * 1.25);
    const focusedBeat = beatItems[beatItems.length - 1];

    gsap.set(bsTitle, {
      autoAlpha: storeFade,
      y: -20 * t,
      clearProps: "display",
    });

    gsap.set(bsCopy, {
      autoAlpha: storeFade,
      y: -20 * t,
      clearProps: "display",
    });

    gsap.set(bsBtn, {
      autoAlpha: storeFade,
      y: -10 * t,
      clearProps: "display",
    });

    gsap.set(bsGrid, {
      autoAlpha: storeFade,
      clearProps: "display",
    });

    gsap.set(bsArc, {
      autoAlpha: storeFade,
      pointerEvents: "none",
    });

    if (bsTitleReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsTitleReveal.querySelector(".reveal__inner"), {
        yPercent: -110 * t,
      });
    }

    if (bsCopyReveal?.querySelector(".reveal__inner")) {
      gsap.set(bsCopyReveal.querySelector(".reveal__inner"), {
        yPercent: -110 * t,
      });
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

    if (beatBg) {
      gsap.set(beatBg, {
        autoAlpha: 1 - e,
      });
    }

    gsap.set(aboutSection, {
      autoAlpha: 1,
      pointerEvents: "none",
    });

    gsap.set(aboutTransitionMap, {
      autoAlpha: 1,
    });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        transformOrigin: "50% 50%",
        x: lerp(0, tf.x, e),
        y: lerp(0, tf.y, e),
        scale: lerp(tf.startScale, tf.endScale, e),
        autoAlpha: 1,
      });
    }

    const titleT = clamp01((t - 0.48) / 0.18);
    const copyT = clamp01((t - 0.58) / 0.18);
    const btnT = clamp01((t - 0.70) / 0.14);
    const linksT = clamp01((t - 0.64) / 0.16);

    const aboutTitleInner = getRevealInner(aboutTitleReveal);
    const aboutCopyInner = getRevealInner(aboutCopyReveal);
    const aboutBtnInner = getRevealInner(aboutBtnReveal);

    if (aboutTitleInner) {
      gsap.set(aboutTitleInner, {
        yPercent: 120 - 120 * titleT,
      });
    }

    if (aboutCopyInner) {
      gsap.set(aboutCopyInner, {
        yPercent: 120 - 120 * copyT,
      });
    }

    if (aboutBtnInner) {
      gsap.set(aboutBtnInner, {
        yPercent: 120 - 120 * btnT,
      });
    }

    if (aboutLinks) {
      gsap.set(aboutLinks, {
        autoAlpha: linksT,
        y: 20 - 20 * linksT,
      });
    }

    if (aboutMapWrap) {
      gsap.set(aboutMapWrap, {
        autoAlpha: clamp01((t - 0.55) / 0.3),
      });
    }
  }

  function setAboutState() {
    setAboutOverlayMode(false);

    if (beatBg) {
      gsap.set(beatBg, {
        autoAlpha: 0,
      });
    }

    gsap.set(bsTitle, { autoAlpha: 0, y: -20 });
    gsap.set(bsCopy, { autoAlpha: 0, y: -20 });
    gsap.set(bsBtn, { autoAlpha: 0, y: -10 });
    gsap.set(bsGrid, { autoAlpha: 0 });
    gsap.set(bsArc, { autoAlpha: 0, pointerEvents: "none" });

    gsap.set(musicLeft, {
      autoAlpha: 0,
      visibility: "hidden",
    });

    gsap.set(musicArcOverlay, {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    });

    gsap.set(aboutSection, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });

    gsap.set(aboutTransitionMap, {
      autoAlpha: 0,
    });

    if (aboutTransitionImg) {
      gsap.set(aboutTransitionImg, {
        clearProps: "x,y,scale,opacity,transformOrigin",
      });
    }

    if (aboutMapWrap) {
      gsap.set(aboutMapWrap, { autoAlpha: 1 });
    }

    const aboutTitleInner = getRevealInner(aboutTitleReveal);
    const aboutCopyInner = getRevealInner(aboutCopyReveal);
    const aboutBtnInner = getRevealInner(aboutBtnReveal);

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

  setMusicState();
  if (musicArc) musicArc.snap(0);
  if (arc) arc.snap(0);
  setAboutHiddenState();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const refreshHandler = () => {
        setSpacer(beatStore.classList.contains("cinematic-fixed"));
      };

      ScrollTrigger.addEventListener("refreshInit", refreshHandler);

      let lastStep = -1;
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "cinematicScroll",
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
            const MUSIC_END = 0.58;

            const HANDOFF_START = 0.58;
            const HANDOFF_END = 0.66;

            const BEATSTORE_START = 0.66;
            const BEATSTORE_END = 0.86;

            const ABOUT_START = 0.86;
            const ABOUT_END = 1;

            if (p <= MUSIC_START) {
              if (musicArc) musicArc.snap(0);
              lastStep = 0;
              setMusicState();
              setAboutHiddenState();
              return;
            }

            if (p < MUSIC_END) {
              setMusicState();
              setAboutHiddenState();

              if (musicArc) {
                const mt = (p - MUSIC_START) / (MUSIC_END - MUSIC_START);
                const mu = Math.max(0, Math.min(1, mt));
                const mRaw = mu * musicArc.maxStep;
                musicArc.layoutProgress(mRaw);
                lastStep = Math.floor(mRaw);
              }

              return;
            }

            if (p < HANDOFF_START) {
              if (musicArc) musicArc.snap(musicArc.maxStep);
              setMusicState();
              setAboutHiddenState();
              return;
            }

            if (p < HANDOFF_END) {
              if (musicArc) musicArc.snap(musicArc.maxStep);
              const handoffT = (p - HANDOFF_START) / (HANDOFF_END - HANDOFF_START);
              setHandoffProgress(handoffT);
              setAboutHiddenState();
              return;
            }

            if (p < BEATSTORE_END) {
              const t = (p - BEATSTORE_START) / (BEATSTORE_END - BEATSTORE_START);
              const u = Math.max(0, Math.min(1, t));
              const HOLD = 0.05;

              const raw = u * arc.maxStep;
              const step = Math.floor(raw);
              const frac = raw - step;

              let adjusted;
              if (frac < HOLD) {
                adjusted = step;
              } else {
                adjusted = step + (frac - HOLD) / (1 - HOLD);
              }

              setBeatStoreState();
              setAboutHiddenState();
              arc.layoutProgress(adjusted);
              lastStep = Math.floor(adjusted);
              return;
            }

            if (p < ABOUT_START) {
              if (arc) arc.snap(arc.maxStep);
              setBeatStoreState();
              setAboutHiddenState();

              if (beatBg) {
                gsap.set(beatBg, { autoAlpha: 1 });
              }

              return;
            }

// 7) beat store -> about transition
if (p < ABOUT_END) {
  if (arc) arc.snap(arc.maxStep);

  const aboutT = (p - ABOUT_START) / (ABOUT_END - ABOUT_START);
  setAboutTransitionProgress(aboutT);
  return;
}

setAboutTransitionProgress(1);
return;

if (p >= ABOUT_START) {
  if (arc) arc.snap(arc.maxStep);

  const aboutT = (p - ABOUT_START) / (ABOUT_END - ABOUT_START);
  setAboutTransitionProgress(aboutT);
  return;
}
          },

          onEnter: () => {
            document.documentElement.classList.add("nav-blend");
            setBeatStoreFixed(true);
          },

          onEnterBack: () => {
            document.documentElement.classList.add("nav-blend");
            setBeatStoreFixed(true);

            gsap.set(beatStore, {
              autoAlpha: 1,
              pointerEvents: "none",
            });

            if (arc) {
              arc.snap(arc.maxStep);
            }
          },

onLeave: (self) => {
  self.scroll(self.end - 1);
},

          onLeaveBack: () => {
  document.documentElement.classList.remove("nav-blend");

  if (beatContent) gsap.set(beatContent, { autoAlpha: 0 });
  if (beatBg) gsap.set(beatBg, { autoAlpha: 1 });

  gsap.set(beatStore, {
    autoAlpha: 0,
    pointerEvents: "none",
  });

  gsap.set(aboutSection, {
    clearProps: "position,top,left,width,height,zIndex",
    autoAlpha: 0,
    pointerEvents: "none",
  });

  setAboutOverlayMode(false);

  gsap.set(nav, {
    autoAlpha: 1,
    pointerEvents: "auto",
  });

  moveNavToBody(false);
},

          onKill: () => {
            ScrollTrigger.removeEventListener("refreshInit", refreshHandler);
          },
        },
      });

      if (IS_MOBILE) {

  const PAN_DISTANCE = 600; // ~1000 - 402

  tl.to(
    sceneComposite,
    {
      x: -PAN_DISTANCE,
      ease: "none"
    },
    0
  );

} else {

  tl.to(
    sceneComposite,
    {
      scale: 200,
      y: window.innerHeight * 0.18,
      ease: "none",
    },
    0
  ).duration(0.1);

}

      tl.to(
        [".text-layer", ".webgl"],
        {
          autoAlpha: 0,
          ease: "none",
        },
        0.08
      );

      tl.to(beatStore, { autoAlpha: 1, ease: "none" }, 0.1);

      tl.fromTo(
        ".beat-store-content",
        { autoAlpha: 0 },
        { autoAlpha: 1, ease: "none" },
        0.22
      );

      tl.to(beatStore, { pointerEvents: "auto", duration: 0 }, 0.34);

      const BEATSTORE_PAD = 1.2;
      tl.to({}, { duration: BEATSTORE_PAD, ease: "none" });

      ScrollTrigger.refresh();
    });
  });
}

function createAlbumArcWidget({
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
    titleEl.textContent =
      data[safeStep]?.title || items[safeStep]?.dataset?.title || "";
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

      if (window.__albumView) {
        window.__albumView.open(idx, data);
      }
    });
  });

  return { layoutProgress, snap, maxStep, root, data };
}

/* =========================
   APP
========================= */
function mountApp() {
  document.querySelector("#app").insertAdjacentHTML("beforeend", getAppMarkup());

  // ✅ keep beat-store hidden until cinematic scroll reveals it
gsap.set("#beat-store", { autoAlpha: 0, pointerEvents: "none" });
gsap.set("#beat-store .beat-store-content", { autoAlpha: 0 });

  // lock nav labels BEFORE any scrambling happens
  document.querySelectorAll(".nav .nav-item").forEach(ensureFinalText);

const albumView = initAlbumView();
window.__albumView = albumView;

const musicArcRoot = document.querySelector("#music-arc-overlay");
window.__musicArc = createAlbumArcWidget({
  root: musicArcRoot,
  titleSelector: ".arc-title",
  itemSelector: ".bs-arc-item",
  data: MUSIC_BEATS,
});

gsap.set("#bsMusicLeft", { autoAlpha: 0, visibility: "hidden" });
gsap.set("#music-arc-overlay", { autoAlpha: 0, visibility: "hidden" });
gsap.set("#music-arc-overlay .bs-arc-item", { autoAlpha: 0 });
gsap.set("#music-arc-overlay .arc-title", { autoAlpha: 0 });
gsap.set("#music-arc-overlay .arc-pointer", { autoAlpha: 0 });

  function getAppMarkup() {
  return `
    <main class="app">

      <!-- SECTION 1: LANDING -->
      <section class="page landing revolver-only" id="home">
        <div class="bg-layer"></div>

        <div class="scene-layer">
        <img class="scene-composite" src="/assets/scene-composite.svg" alt="" />
        </div>

        <canvas class="webgl"></canvas>

        <nav class="nav">
          <!-- LEFT SIDE GLYPHS -->
          <img src="/assets/ब.svg" class="nav-glyph hover-scramble nav-glyph-b-left" alt="ब" />
          <img src="/assets/B.svg" class="nav-glyph hover-scramble nav-glyph-B-left" alt="B" />

          <!-- CENTER NAV ITEMS -->
          <div class="nav-center">
            <span class="nav-item hover-scramble">[ HOME ]</span>
            <a class="nav-item hover-scramble nav-link" href="#beat-store">[ BEAT STORE ]</a>
            <span class="nav-item hover-scramble">[ MUSIC ]</span>
            <span class="nav-item hover-scramble">[ ABOUT ]</span>
            <span class="nav-item hover-scramble">[ UPDATES ]</span>
          </div>

          <!-- RIGHT SIDE GLYPHS -->
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
                <span class="drop-text">1. GUNS, CARS AND BARS // BEAT TAPE</span>
                <span class="arrow-box" aria-hidden="true">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: BEAT STORE / MUSIC MORPH -->
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
                <canvas class="bs-canvas" data-model="/models/WAVES.glb"></canvas>
              </div>
        
              <div class="bs-box bs-small" data-grid="img-3">
                <canvas class="bs-canvas" data-model="/models/fl_studio_logo.glb"></canvas>
              </div>

              <div class="bs-box bs-small" data-grid="img-4">
                <canvas class="bs-canvas" data-model="/models/arturia_minilab_mkii_model.glb"></canvas>
              </div>
            </div>

            <div class="bs-box bs-big bs-aim" data-grid="img-1">
              <canvas class="bs-canvas" data-model="/models/mpc_one.glb"></canvas>
            </div>
          </div>

          <!-- BEAT STORE ARC -->
          <div id="bs-arc">
            <div id="bsArcTitle" class="arc-title">BEAT NAME</div>

            <div id="bsArcPointer" class="arc-pointer" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="bs-arc-item" data-title="GUNS">
              <img src="/assets/album-art1.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="CARS">
              <img src="/assets/album-art2.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="BARS">
              <img src="/assets/album-art3.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="GREENS">
              <img src="/assets/album-art4.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="SMOKES">
              <img src="/assets/album-art5.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="PILLS">
              <img src="/assets/album-art6.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="DRINKS">
              <img src="/assets/album-art7.svg" alt="" />
            </div>
          </div>

          <!-- MUSIC LEFT CONTENT OVERLAY -->
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

          <!-- MUSIC ARC OVERLAY -->
          <div id="music-arc-overlay" class="music-arc-overlay">
            <div id="musicArcOverlayTitle" class="arc-title">GUNS CARS AND BARS</div>

            <div class="arc-pointer" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="bs-arc-item" data-title="GUNS CARS AND BARS">
              <img src="/assets/music-art1.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="SECOND DROP">
              <img src="/assets/music-art2.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="THIRD CUT">
              <img src="/assets/music-art3.svg" alt="" />
            </div>

            <div class="bs-arc-item" data-title="FOURTH CUT">
              <img src="/assets/music-art4.svg" alt="" />
            </div>
          </div>
      
        </div>
      </section>

      <section class="page about-page" id="about">
  <div class="about-bg"></div>

  <div class="about-transition-map" id="aboutTransitionMap">
  <img src="/assets/mumbai-city.svg" />
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
      <a href="#">SPOTIFY</a>
      <a href="#">APPLE MUSIC</a>
      <a href="#">BEATSTARS</a>
      <a href="#">YOUTUBE</a>
      <a href="#">INSTAGRAM</a>
    </div>

    <div class="about-side">
      <div class="reveal about-copy-reveal">
        <p class="about-copy reveal__inner">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.

          <br /><br />

          Dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor.
        </p>
      </div>

      <div class="reveal about-btn-reveal">
        <button class="about-btn reveal__inner">GET IN TOUCH</button>
      </div>
    </div>
  </div>
</section>

      <!-- ALBUM VIEW -->
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

  function initAlbumView() {
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

  const maxX = window.innerWidth;
  gsap.set(progressLine, { x: maxX * p });
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

  gsap.fromTo(
    [bgBase, bgPlayed],
    { scale: 1.06 },
    { scale: 1, duration: 0.55, ease: "power3.out" }
  );

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
      ease: "power2.out"
    });

    gsap.to(view, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power2.out",
      onComplete: () => {
        view.classList.remove("is-open");
        view.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    });
  }

  playBtn.addEventListener("click", () => {
    if (!audio.src) return;

    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  soundBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    setMuteUI();
  });

  moreBtn.addEventListener("click", () => {
    close();
  });

  audio.addEventListener("play", () => setPlayStateUI(true));
  audio.addEventListener("pause", () => setPlayStateUI(false));
  audio.addEventListener("ended", () => {
    setPlayStateUI(false);
    currentEl.textContent = "00:00";
    setPlayedProgress(0);
    audio.currentTime = 0;
  });

  audio.addEventListener("loadedmetadata", () => {
    if (!isNaN(audio.duration)) {
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener("timeupdate", () => {
  if (!audio.duration || isScrubbing) return;
  currentEl.textContent = formatTime(audio.currentTime);
  setPlayedProgress(audio.currentTime / audio.duration);
});

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && view.classList.contains("is-open")) {
      close();
    }
  });

  view.addEventListener("click", (e) => {
    if (e.target === view) close();
  });

  window.addEventListener("resize", () => {
  if (audio.duration) {
    setPlayedProgress(audio.currentTime / audio.duration);
  } else {
    setPlayedProgress(0);
  }
});

  setMuteUI();

  view.addEventListener("pointerdown", (e) => {
  // don't start scrubbing from buttons
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

  if (wasPlayingBeforeScrub) {
    audio.pause();
  }

  scrubToClientX(e.clientX);
});

window.addEventListener("pointermove", (e) => {
  if (!isScrubbing) return;
  scrubToClientX(e.clientX);
});

window.addEventListener("pointerup", () => {
  if (!isScrubbing) return;

  isScrubbing = false;

  if (wasPlayingBeforeScrub) {
    audio.play().catch(() => {});
  }
});

  return {
  open,
  close,
  loadBeat,
  getActiveIndex: () => activeIndex,
  getActiveList: () => activeList,
};
}



  /* -------------------------
     Smooth scroll for nav link
  ------------------------- */
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

  /* -------------------------
     TEXT FX HELPERS
  ------------------------- */
  function maskReveal(wrapperEl, { duration = 0.6, delay = 0 } = {}) {
    if (!wrapperEl) return;
    const inner = wrapperEl.querySelector(".reveal__inner");
    if (!inner) return;

    gsap.fromTo(
      inner,
      { yPercent: 120 },
      { yPercent: 0, duration, ease: "power4.out", delay }
    );
  }

  function ensureFinalText(el) {
    if (!el.dataset.final) el.dataset.final = el.textContent;
    return el.dataset.final;
  }

  function scrambleOnce(el, { duration = 0.28, delay = 0 } = {}) {
    const original = ensureFinalText(el);
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

  function attachHoverScramble(el, { duration = 0.28, fps = 30 } = {}) {
    const original = ensureFinalText(el);
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

  function startNavIntro() {
    const nav = document.querySelector(".nav");
    const items = Array.from(document.querySelectorAll(".nav .nav-item"));
    if (!nav || !items.length) return;

    gsap.set(nav, { autoAlpha: 1, pointerEvents: "auto" });

    items.forEach((el) => {
      ensureFinalText(el);
      gsap.set(el, { autoAlpha: 0 });
    });

    items.forEach((el, i) => {
      const d = 0.3 + i * 0.08;
      gsap.to(el, { autoAlpha: 1, duration: 0.12, ease: "power1.out", delay: d });
      scrambleOnce(el, { duration: 3.0, delay: d });
    });

    // hover scramble (always returns to original)
    document.querySelectorAll(".hover-scramble").forEach((el) =>
      attachHoverScramble(el, { duration: 0.28, fps: 30 })
    );
  }

  /* -------------------------
     LANDING INTRO
  ------------------------- */
  document.body.style.overflow = "hidden";
  function startLandingIntro() {
    const heroReveal = document.querySelector(".left-block .hero-logo");
    const metaReveals = Array.from(document.querySelectorAll(".left-block .meta-reveal"));
    const descReveals = Array.from(document.querySelectorAll(".left-block .desc .reveal"));
    const latestReveal = document.querySelector(".right-block .latest-reveal");
    const dropReveal = document.querySelector(".right-block .drop-reveal");

    // init all reveal inners offscreen
    gsap.set(".reveal__inner", { yPercent: 120 });

    // 🔥 Scene intro setup
    // setup for all pieces EXCEPT light
    gsap.set(".scene-composite", { y: 160, opacity: 0 });

const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

tl.add(() => {
  metaReveals.forEach((w, i) =>
    maskReveal(w, { duration: 0.6, delay: i * 0.06 })
  );
}, 0);

tl.add(() => {
  maskReveal(heroReveal, { duration: 1.8, delay: 0 });
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
  if (descReveals[0]) maskReveal(descReveals[0], { duration: 0.7, delay: 0 });
  if (descReveals[1]) maskReveal(descReveals[1], { duration: 0.7, delay: 0.18 });
}, 0.8);

tl.add(() => {
  maskReveal(latestReveal, { duration: 0.7, delay: 0 });
}, 1.35);

tl.add(() => {
  maskReveal(dropReveal, { duration: 0.7, delay: 0 });
}, 1.75);

    return tl;
  }

  /* -------------------------
     THREE.JS: revolver
  ------------------------- */
  const canvas = document.querySelector(".webgl");
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

  const MODEL_URL = "/models/revolver.glb";
  const baseQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, Math.PI, 0)
  );

  const aimPoint = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();

  new GLTFLoader().load(
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

      const landing = document.querySelector(".landing");

      // NAV: after revolver is ready
      startNavIntro();

      // landing reveal after a beat
      setTimeout(() => {
  landing?.classList.remove("revolver-only");

  // lock scroll during intro
  document.body.style.overflow = "hidden";

  const introTl = startLandingIntro();

  introTl.eventCallback("onComplete", () => {
    // unlock scroll when intro finishes
    document.body.style.overflow = "";
    initCinematicScroll();
  });
}, 100);
    },
    undefined,
    (err) => console.error("GLB load failed", err)
  );

  const mouse = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function tick() {
    requestAnimationFrame(tick);

    gunGroup.position.x += (mouse.x * 1.2 - gunGroup.position.x) * 0.08;
    gunGroup.position.y += (mouse.y * 0.7 - gunGroup.position.y) * 0.08;

    tmpVec.set(mouse.x, mouse.y, 0.5).unproject(camera);
    const dir = tmpVec.sub(camera.position).normalize();

    aimPoint.copy(camera.position).add(dir.multiplyScalar(180));

    gunGroup.lookAt(aimPoint);
    gunGroup.quaternion.multiply(baseQuat);

    renderer.render(scene, camera);
  }

  tick();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  /* =========================================================
     BEAT STORE: 4 mini Three.js viewers (unchanged)
  ========================================================= */
  function createBoxViewer(canvas) {
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

          loader.load(
            url,
            (gltf) => {
              const modelRoot = gltf.scene;

              const fileName = decodeURIComponent(url)
                .split("/")
                .pop()
                .split("?")[0];

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
        const idleBob = Math.sin(t * 0) * 0.03; // keep as-is

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

  const boxViewers = [];

  function initBeatStoreModels() {
    const canvases = Array.from(document.querySelectorAll(".bs-canvas"));

    canvases.forEach((c) => {
      const viewer = createBoxViewer(c);
      boxViewers.push(viewer);

      const url = c.getAttribute("data-model");
      viewer.load(url).catch((err) =>
        console.error("BeatStore GLB load failed:", url, err)
      );
    });
  }

  function resetViewerForBox(boxEl) {
    const c = boxEl.querySelector(".bs-canvas");
    if (!c) return;

    const all = Array.from(document.querySelectorAll(".bs-canvas"));
    const idx = all.indexOf(c);

    if (idx >= 0 && boxViewers[idx]) boxViewers[idx].resetRotation();
  }

  initBeatStoreModels();

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

  let lastTime = performance.now();

  function tickBoxViewers(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    for (const v of boxViewers) v.tick(dt);

    requestAnimationFrame(tickBoxViewers);
  }

  requestAnimationFrame(tickBoxViewers);

  window.addEventListener("resize", () => {
    for (const v of boxViewers) v.resize();
  });

  setTimeout(() => {
    for (const v of boxViewers) v.resize();
  }, 150);
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

  const MIN_TIME_MS = 2600;
  const start = performance.now();

  const pctTween = driver.startPercent(MIN_TIME_MS / 1000);

  await preloadAssets(() => {});

  const elapsed = performance.now() - start;
  const remaining = Math.max(0, MIN_TIME_MS - elapsed);

  setTimeout(() => {
    pctTween.progress(1);

    driver.finish().then(async () => {
      await new Promise((r) => setTimeout(r, 800));

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

      setTimeout(() => {
        mountApp(); 
        unmountLoader();
      }, 650);
    });
  }, remaining);
})();