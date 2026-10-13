/* The light: a quick scroll-scrubbed beat on the seam between the City and
   the End. A hand with a cigarette reaches in from the left, a hand with a
   lighter from the right; the wheel sparks, the flame catches, the tip
   takes, the lighter goes out and both hands hold there while the smoke
   rises. Scrolling back up withdraws them.

   Painted rather than inked: forms modelled with soft gradients and lit
   edges, no outlines, under a fine paper grain. A charcoal suit sleeve with
   a shirt cuff and cufflink; a cream kurta with a red embroidered hem and an
   iron kada; a chrome lighter. */
import { gsap } from "gsap";
import { REDUCED } from "../ui/scroll.js";

// Skin is painted, not outlined: one continuous silhouette per hand, a
// light-to-shadow body gradient laid across the whole hand (so separate
// pieces meet without a seam), then soft painted shadows between fingers,
// warm knuckles, lit edges and natural nails, all under the paper grain.
const SKIN_HI = "#f3cba3";
const SKIN = "#cf9067";
const SKIN_LO = "#7e452c";
const CREASE = "#6a3622";
const soft = (d, color, w, o, blur = "smkSoft") => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${o}" filter="url(#${blur})"/>`;
const blob = (cx, cy, rx, ry, color, o, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="${color}" opacity="${o}" filter="url(#smkBlur)"/>`;
const nail = (cx, cy, w, h, rot) => `<g transform="translate(${cx} ${cy}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#smkNail)"/><path d="M${-w * 0.32} ${-h * 0.18} h${w * 0.5}" stroke="#fbeee4" stroke-width="1.1" stroke-linecap="round" opacity=".8"/></g>`;

// Left hand, pointing right, back of the hand to us; local units, wrist at
// x 0. The cigarette sits between index and middle, so the index finger is
// painted again over it.
const L_HAND = "M0 -30 C30 -36 70 -43 100 -44 C110 -40 120 -30 128 -20 C150 -16 172 -12 190 -8 C200 -6 207 -4 209 1 C211 8 206 11 199 11 C182 12 160 12 140 12 C152 15 161 19 166 25 C172 33 170 44 162 48 C153 51 143 41 134 33 C141 39 146 46 146 54 C146 62 137 64 130 58 C122 52 111 48 98 48 C70 51 34 47 0 42 Z";
const L_INDEX = "M94 -45 C120 -46 150 -44 168 -39 C181 -36 191 -33 197 -29 C204 -25 203 -16 195 -14 C179 -12 158 -15 138 -19 C124 -22 108 -26 96 -30 Z";
const L_THUMB = "M30 -31 C50 -45 72 -53 90 -55 C101 -56 105 -48 98 -43 C87 -38 68 -35 52 -30 Z";

function handLeft() {
  const stripes = Array.from({ length: 9 }, (_, k) => `<path d="M-520 ${424 + k * 19} L420 ${430 + k * 17}" stroke="#a49a92" stroke-width="1" opacity=".16"/>`).join("");
  return `
  <g id="smk-handL" class="smoke__hand" filter="url(#smkGrain)">
    <path d="M-520 404 L424 412 L430 580 L-520 596 Z" fill="url(#smkSuit)"/>
    ${stripes}
    <path d="M-520 404 L424 412 L430 580 L-520 596 Z" fill="url(#smkFoldDark)" opacity=".7"/>
    <path d="M-520 410 L422 417" stroke="#8d847d" stroke-width="3" opacity=".35" filter="url(#smkSoft)"/>
    <g transform="translate(442 470.6) scale(1.4)">
      <defs><clipPath id="smkClipL"><path d="${L_HAND}"/><path d="${L_INDEX}"/><path d="${L_THUMB}"/></clipPath></defs>
      <path d="${L_THUMB}" fill="url(#smkSkinL)"/>
      ${soft("M36 -32 C54 -44 74 -50 90 -51", SKIN_HI, 3.6, 0.6)}
      ${nail(92, -51, 9, 7, -8)}
      <path d="${L_HAND}" fill="url(#smkSkinL)"/>
      <g clip-path="url(#smkClipL)">
        ${blob(60, -10, 46, 26, SKIN_HI, 0.55)}
        ${blob(70, 36, 70, 18, SKIN_LO, 0.55)}
        ${blob(150, 40, 26, 14, SKIN_LO, 0.5)}
        ${blob(104, -6, 9, 7, "#c4664a", 0.35)}${blob(104, 18, 9, 7, "#c4664a", 0.3)}
        ${soft("M128 -18 C150 -14 175 -10 200 -6", SKIN_LO, 3, 0.45)}
        ${soft("M140 13 C150 16 158 21 163 27", CREASE, 2.4, 0.5)}
        ${soft("M134 33 C140 38 144 44 145 50", CREASE, 2.4, 0.5)}
        ${soft("M8 -28 C40 -35 74 -40 98 -42", SKIN_HI, 5, 0.55)}
        ${soft("M160 -4 q2 7 0 12 M178 -6 q2 7 0 12", CREASE, 1.2, 0.4, "smkSoft")}
      </g>
      ${nail(201, 2, 11, 9, 6)}
      <g id="smk-cig">
        <path d="M128 -20 L250 -16 L250 -8 L128 -12 Z" fill="url(#smkPaper)"/>
        <path d="M128 -20 L154 -19 L154 -11 L128 -12 Z" fill="url(#smkFilter)"/>
      </g>
      <path d="${L_INDEX}" fill="url(#smkSkinL)"/>
      <g clip-path="url(#smkClipL)">
        ${soft("M124 -42 C145 -43 165 -39 188 -33", SKIN_HI, 3.4, 0.6)}
        ${soft("M126 -21 C150 -16 172 -14 194 -15", SKIN_LO, 3, 0.55)}
        ${soft("M150 -44 q3 8 0 18 M172 -39 q3 8 0 16", CREASE, 1.2, 0.4)}
      </g>
      ${nail(193, -22, 10, 8, 10)}
    </g>
    <rect x="416" y="424" width="38" height="152" rx="9" fill="url(#smkCuff)"/>
    <path d="M420 432 V568" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" opacity=".6" filter="url(#smkSoft)"/>
    <circle cx="435" cy="502" r="7.5" fill="url(#smkSteelR)"/>
    <circle cx="435" cy="502" r="5.2" fill="url(#smkEnamel)"/>
    <circle cx="433" cy="500" r="1.5" fill="#fff" opacity=".8"/>
  </g>`;
}

// Right hand: a fist around the lighter, pointing left; wrist at x 0. The
// thumb rests over the top with its tip on the wheel.
const R_FIST = "M0 -34 C-30 -38 -66 -44 -95 -42 C-112 -42 -126 -38 -132 -28 C-137 -18 -137 -5 -131 0 C-140 6 -141 18 -131 23 C-139 29 -139 40 -129 44 C-133 49 -131 58 -119 61 C-90 67 -40 61 0 52 Z";
const R_THUMB = "M-10 -40 C-30 -57 -60 -67 -84 -67 C-97 -67 -99 -56 -90 -51 C-74 -45 -50 -41 -28 -35 Z";

function handRight() {
  return `
  <g id="smk-handR" class="smoke__hand" filter="url(#smkGrain)">
    <path d="M2120 440 L986 448 L980 660 L2120 668 Z" fill="url(#smkKurta)"/>
    <path d="M2120 440 L986 448 L980 660 L2120 668 Z" fill="url(#smkFold)" opacity=".55"/>
    <path d="M2120 604 L981 596 L980 660 L2120 668 Z" fill="url(#smkHem)"/>
    <path d="M994 606 L2120 614 M994 650 L2120 658" stroke="#e9b8a8" stroke-width="1.6" stroke-dasharray="5 5" opacity=".55"/>
    <path d="M1006 450 L1002 598 M1022 450 L1018 598" stroke="#a3131a" stroke-width="2.6" stroke-dasharray="6 5" opacity=".85"/>
    <path d="M990 452 L2120 446" stroke="#fffaf0" stroke-width="3" opacity=".5" filter="url(#smkSoft)"/>
    <g id="smk-lighter">
      <rect x="772" y="470" width="80" height="130" rx="9" fill="url(#smkSteel)"/>
      <path d="M784 486 v98" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".6" filter="url(#smkSoft)"/>
      <rect x="0" y="-30" width="74" height="30" rx="6" transform="translate(852 470) rotate(-62)" fill="url(#smkSteel)"/>
      <rect x="784" y="438" width="42" height="34" rx="3" fill="url(#smkSteel)"/>
      <g fill="#2b2622" opacity=".8"><circle cx="795" cy="449" r="3"/><circle cx="805" cy="449" r="3"/><circle cx="815" cy="449" r="3"/><circle cx="795" cy="461" r="3"/><circle cx="805" cy="461" r="3"/><circle cx="815" cy="461" r="3"/></g>
      <circle cx="834" cy="452" r="9" fill="#3a3530"/>
      <path d="M828 446 l12 12 M828 452 l9 9 M831 444 l9 9" stroke="#bdb5aa" stroke-width="1.3"/>
    </g>
    <g transform="translate(960 535) scale(1.4)">
      <defs><clipPath id="smkClipR"><path d="${R_FIST}"/></clipPath></defs>
      <path d="${R_FIST}" fill="url(#smkSkinR2)"/>
      <g clip-path="url(#smkClipR)">
        ${blob(-55, -22, 48, 18, SKIN_HI, 0.55)}
        ${blob(-60, 50, 70, 16, SKIN_LO, 0.55)}
        ${blob(-128, 20, 12, 40, SKIN_LO, 0.35)}
        ${blob(-104, -30, 10, 8, "#c4664a", 0.35)}
        ${soft("M-131 0 C-122 2 -114 2 -106 0", CREASE, 2.4, 0.55)}
        ${soft("M-131 23 C-122 25 -114 25 -106 22", CREASE, 2.4, 0.55)}
        ${soft("M-129 44 C-121 46 -113 46 -106 43", CREASE, 2.4, 0.55)}
        ${soft("M-106 -34 C-104 -10 -104 20 -108 56", SKIN_LO, 4, 0.3)}
        ${soft("M-8 -32 C-40 -38 -72 -42 -96 -40", SKIN_HI, 5, 0.5)}
        ${soft("M-133 -14 C-137 -4 -137 6 -134 12 M-136 28 C-138 34 -137 38 -134 42", SKIN_HI, 2.4, 0.45)}
      </g>
      <g id="smk-thumbR">
        <path d="${R_THUMB}" fill="url(#smkSkinR2)"/>
        ${soft("M-14 -42 C-36 -56 -62 -63 -84 -63", SKIN_HI, 3.6, 0.6)}
        ${soft("M-28 -36 C-50 -41 -72 -46 -90 -52", SKIN_LO, 3, 0.45)}
        ${nail(-86, -62, 11, 8, 4)}
      </g>
    </g>
    <rect x="956" y="462" width="24" height="178" rx="7" fill="url(#smkIron)"/>
    <path d="M962 472 V630" stroke="#b9b0a6" stroke-width="2" stroke-linecap="round" opacity=".55"/>
  </g>`;
}

const sparks = () => {
  let out = "";
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * 0.9 + (i / 10) * Math.PI * 0.8;
    const r0 = 10;
    const r1 = 22 + (i % 3) * 10;
    out += `<path d="M${834 + Math.cos(a) * r0} ${452 + Math.sin(a) * r0}L${834 + Math.cos(a) * r1} ${452 + Math.sin(a) * r1}" stroke="${i % 2 ? "#fff3c4" : "#f2a33a"}" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  return out;
};

function svg() {
  return `
  <svg class="lightup__svg" viewBox="0 360 1600 330" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <linearGradient id="smkSkinF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKIN_HI}"/><stop offset=".42" stop-color="${SKIN}"/><stop offset="1" stop-color="${SKIN_LO}"/></linearGradient>
      <radialGradient id="smkSkinR" cx=".45" cy=".35" r=".8"><stop offset="0" stop-color="${SKIN_HI}"/><stop offset=".5" stop-color="${SKIN}"/><stop offset="1" stop-color="${SKIN_LO}"/></radialGradient>
      <linearGradient id="smkSkinL" gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="60"><stop offset="0" stop-color="#ecbb92"/><stop offset=".45" stop-color="#cf9067"/><stop offset="1" stop-color="#8e5235"/></linearGradient>
      <linearGradient id="smkSkinR2" gradientUnits="userSpaceOnUse" x1="0" y1="-66" x2="0" y2="66"><stop offset="0" stop-color="#ecbb92"/><stop offset=".45" stop-color="#cf9067"/><stop offset="1" stop-color="#8e5235"/></linearGradient>
      <linearGradient id="smkNail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0cdbb"/><stop offset="1" stop-color="#c4927d"/></linearGradient>
      <linearGradient id="smkSuit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4440"/><stop offset=".45" stop-color="#2c2724"/><stop offset="1" stop-color="#121010"/></linearGradient>
      <linearGradient id="smkFoldDark" x1="0" y1="0" y2="0" x2="150" spreadMethod="repeat" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="smkCuff" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9cfbc"/><stop offset=".35" stop-color="#f6f0e4"/><stop offset="1" stop-color="#b9ad96"/></linearGradient>
      <radialGradient id="smkSteelR" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f4f0ea"/><stop offset=".6" stop-color="#9c958c"/><stop offset="1" stop-color="#4c4743"/></radialGradient>
      <radialGradient id="smkEnamel" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e2463e"/><stop offset=".6" stop-color="#ab1212"/><stop offset="1" stop-color="#5c0808"/></radialGradient>
      <linearGradient id="smkKurta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ebda"/><stop offset=".55" stop-color="#ddd0b6"/><stop offset="1" stop-color="#ab9c80"/></linearGradient>
      <linearGradient id="smkFold" x1="0" y1="0" y2="0" x2="130" spreadMethod="repeat" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#8e7f64" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="smkHem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0261f"/><stop offset="1" stop-color="#6e0c0c"/></linearGradient>
      <linearGradient id="smkIron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2623"/><stop offset=".4" stop-color="#6d665e"/><stop offset="1" stop-color="#1a1715"/></linearGradient>
      <linearGradient id="smkSteel" x1="0" x2="1"><stop offset="0" stop-color="#8f8a84"/><stop offset=".3" stop-color="#f2efea"/><stop offset=".62" stop-color="#a9a39b"/><stop offset="1" stop-color="#d6d1ca"/></linearGradient>
      <linearGradient id="smkPaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#ece3d0"/><stop offset="1" stop-color="#c9bda4"/></linearGradient>
      <linearGradient id="smkFilter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3a65e"/><stop offset="1" stop-color="#a5672c"/></linearGradient>
      <radialGradient id="smkFlameFill" cx=".5" cy=".78" r=".78"><stop offset="0" stop-color="#fffbe8"/><stop offset=".4" stop-color="#ffd36b"/><stop offset=".8" stop-color="#f07a26"/><stop offset="1" stop-color="#c8361a" stop-opacity=".9"/></radialGradient>
      <radialGradient id="smkGlow"><stop offset="0" stop-color="#ffc77a" stop-opacity=".5"/><stop offset=".5" stop-color="#e0682a" stop-opacity=".16"/><stop offset="1" stop-color="#d8361e" stop-opacity="0"/></radialGradient>
      <radialGradient id="smkEmber"><stop offset="0" stop-color="#fff0c2"/><stop offset=".4" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ab1212"/></radialGradient>
      <filter id="smkSoft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
      <filter id="smkBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      <!-- fine paper grain, multiplied into the paint and kept inside it -->
      <filter id="smkGrain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>
        <feColorMatrix in="n" type="saturate" values="0" result="m"/>
        <feComponentTransfer in="m" result="g"><feFuncR type="linear" slope=".34" intercept=".74"/><feFuncG type="linear" slope=".34" intercept=".72"/><feFuncB type="linear" slope=".34" intercept=".68"/></feComponentTransfer>
        <feBlend in="SourceGraphic" in2="g" mode="multiply" result="b"/>
        <feComposite in="b" in2="SourceGraphic" operator="in"/>
      </filter>
      <filter id="smkSmoke" x="-50%" y="-10%" width="200%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" seed="4" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="16"/>
        <feGaussianBlur stdDeviation="2"/>
      </filter>
    </defs>
    <circle id="smk-flameGlow" cx="806" cy="440" r="190" fill="url(#smkGlow)" opacity="0"/>
    ${handLeft()}
    ${handRight()}
    <g id="smk-sparks" opacity="0">${sparks()}</g>
    <g id="smk-flame">
      <g class="smoke__flicker">
        <path d="M806 474 C780 452 782 420 800 392 C804 408 812 404 810 382 C832 410 836 450 818 474 Z" fill="#f07a26" opacity=".55" filter="url(#smkBlur)"/>
        <path d="M806 471 C786 452 784 424 799 398 C803 412 811 407 809 386 C828 412 832 449 816 471 Z" fill="url(#smkFlameFill)"/>
        <path d="M806 468 C798 458 798 444 805 432 C810 444 814 456 810 468 Z" fill="#fffbe8" opacity=".95"/>
      </g>
    </g>
    <g id="smk-tip">
      <circle id="smk-emberGlow" cx="792" cy="451" r="26" fill="url(#smkGlow)" opacity="0"/>
      <circle id="smk-ember" cx="791" cy="451" r="7" fill="url(#smkEmber)" opacity="0"/>
      <g fill="none" stroke="#efe6d6" stroke-linecap="round" filter="url(#smkSmoke)">
        <path class="smoke__wisp" d="M792 444 C778 410 822 392 802 352 S776 296 798 254" stroke-width="3" opacity=".55"/>
        <path class="smoke__wisp" d="M796 446 C810 414 776 392 794 356 S826 312 808 280" stroke-width="2" opacity=".4"/>
      </g>
    </g>
  </svg>`;
}

export function initSmoke() {
  const seam = document.getElementById("lightup");
  if (!seam) return;
  seam.innerHTML = svg();

  // Phones crop in on the meeting point; the sleeves still run off the edges.
  const svgEl = seam.querySelector(".lightup__svg");
  const frame = () => svgEl.setAttribute("viewBox", innerWidth <= 760 ? "396 370 620 310" : "0 360 1600 330");
  frame();
  addEventListener("resize", frame);

  const wisps = [...seam.querySelectorAll(".smoke__wisp")];
  wisps.forEach((w) => {
    const len = w.getTotalLength();
    w.style.strokeDasharray = `${len}`;
    w.style.strokeDashoffset = `${len}`;
  });

  gsap.set("#smk-flame", { scaleY: 0, scaleX: 0.6, svgOrigin: "806 471" });

  if (REDUCED) {
    // The end state: both hands in, cigarette lit, lighter out.
    gsap.set(["#smk-ember", "#smk-emberGlow"], { opacity: 1 });
    wisps.forEach((w) => (w.style.strokeDashoffset = "0"));
    return;
  }

  const smoker = ["#smk-handL", "#smk-tip"];
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: seam,
      start: "top 88%",
      end: "center 40%",
      scrub: 0.5,
    },
  });

  tl.fromTo(smoker, { x: -1100 }, { x: 0, duration: 0.3, ease: "power3.out" }, 0)
    .fromTo("#smk-handR", { x: 1100 }, { x: 0, duration: 0.3, ease: "power3.out" }, 0)
    // the flick
    .to("#smk-thumbR", { rotate: 10, svgOrigin: "932 479", duration: 0.05 }, 0.34)
    .to("#smk-thumbR", { rotate: 0, svgOrigin: "932 479", duration: 0.05 }, 0.39)
    .fromTo("#smk-sparks", { opacity: 1, scale: 0.3, svgOrigin: "834 452" }, { opacity: 0, scale: 1.4, svgOrigin: "834 452", duration: 0.1, immediateRender: false }, 0.38)
    // the flame catches
    .to("#smk-flame", { scaleY: 1, scaleX: 1, duration: 0.08, ease: "back.out(2)" }, 0.43)
    .to("#smk-flameGlow", { opacity: 1, duration: 0.08 }, 0.43)
    // the draw: the cigarette leans into the flame, the tip takes
    .to(smoker, { x: 16, duration: 0.08 }, 0.54)
    .to(["#smk-ember", "#smk-emberGlow"], { opacity: 1, duration: 0.08 }, 0.6)
    .to(smoker, { x: 0, duration: 0.08 }, 0.66)
    // the lighter goes out; both hands stay
    .to("#smk-flame", { scaleY: 0, scaleX: 0.5, duration: 0.06 }, 0.74)
    .to("#smk-flameGlow", { opacity: 0, duration: 0.08 }, 0.74)
    .to(wisps, { strokeDashoffset: 0, duration: 0.3, stagger: 0.04 }, 0.66);
}
