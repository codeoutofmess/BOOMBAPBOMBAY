/* Fixed chrome: the bracket nav, the iris menu, the reel-change cue mark,
   and colour that follows whichever scene is under it. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REELS, CONTACT_EMAIL } from "../data.js";
import { scrollToEl, REDUCED } from "./scroll.js";

const THEME_COLOR = { red: "#ab1212", ink: "#0e0c0b", bone: "#ece4d6" };

/* Old prints carried a dot in the top corner just before a reel change so
   the projectionist knew to switch. Flash one as each reel arrives. */
function flashCue() {
  if (REDUCED) return;
  gsap
    .timeline()
    .set("#cue", { opacity: 0 })
    .to("#cue", { opacity: 1, duration: 0.04 })
    .to("#cue", { opacity: 0, duration: 0.06 }, "+=0.09")
    .to("#cue", { opacity: 0.9, duration: 0.04 }, "+=0.08")
    .to("#cue", { opacity: 0, duration: 0.12 }, "+=0.09");
}

// Which bracket-nav link represents each reel (the arsenal has none).
const NAV_FOR_REEL = { home: "#home", records: "#records", lineup: "#lineup", city: "#city", end: "#end" };

/* Tracks the reel on screen: highlights its nav link and menu entry, and
   flashes the cue mark as each new reel arrives. */
function reelTracker() {
  let current = -1;
  let started = false;

  return function setReel(i) {
    if (i === current) return;
    current = i;
    document.querySelectorAll("#menuList a").forEach((a, k) => a.setAttribute("aria-current", String(k === i)));
    const href = NAV_FOR_REEL[REELS[i].id];
    document.querySelectorAll(".chrome__nav a").forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === href)));
    if (started) flashCue();
    started = true;
  };
}

function buildMenu() {
  const menu = document.getElementById("menu");
  const btn = document.querySelector(".chrome__menu");
  const list = document.getElementById("menuList");
  document.getElementById("menuMail").href = `mailto:${CONTACT_EMAIL}`;

  list.innerHTML = REELS.map(
    (r, i) => `<li><a href="#${r.id}"><span>${String(i + 1).padStart(2, "0")}</span><span>${r.label}</span></a></li>`
  ).join("");

  let open = false;
  let tween = null;
  let origin = btn; // the iris opens from whichever control was pressed

  // Iris centre on the menu button, radius out to the farthest corner.
  const iris = () => {
    const r = origin.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    return { closed: `circle(0px at ${x}px ${y}px)`, open: `circle(${Math.ceil(radius)}px at ${x}px ${y}px)` };
  };

  function setOpen(next, after) {
    if (open === next) return;
    open = next;
    btn.setAttribute("aria-expanded", String(next));
    document.body.classList.toggle("menu-open", next);
    window.dispatchEvent(new CustomEvent("bbb:lock", { detail: next }));
    const shape = iris();
    tween?.kill();

    if (next) {
      menu.hidden = false;
      tween = gsap.fromTo(
        menu,
        { clipPath: shape.closed },
        { clipPath: shape.open, duration: REDUCED ? 0 : 0.8, ease: "expo.inOut" }
      );
      gsap.fromTo(
        list.querySelectorAll("a"),
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.6, delay: REDUCED ? 0 : 0.25, ease: "expo.out" }
      );
      list.querySelector("a")?.focus({ preventScroll: true });
    } else {
      tween = gsap.to(menu, {
        clipPath: shape.closed,
        duration: REDUCED ? 0 : 0.6,
        ease: "expo.inOut",
        onComplete: () => {
          menu.hidden = true;
          after?.();
        },
      });
      origin.focus({ preventScroll: true });
    }
  }

  btn.addEventListener("click", () => {
    origin = btn;
    setOpen(!open);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });
  list.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    const target = document.querySelector(a.getAttribute("href"));
    // Jump while the iris is closed so the reel is already there when it opens.
    setOpen(false);
    scrollToEl(target, { immediate: true });
  });
}

export function initChrome() {
  const setReel = reelTracker();
  buildMenu();

  const meta = document.querySelector('meta[name="theme-color"]');
  // Defaults first; the triggers below correct them if the page opens mid-way.
  setReel(0);
  document.body.dataset.on = "red";

  const sections = [...document.querySelectorAll("[data-reel]")];

  // Read the scene under the top bar (colour) and under the middle of the
  // screen (reel) straight off the layout. No trigger bookkeeping, so pins
  // and jumps can never leave it stale.
  let theme = "";
  const sync = () => {
    const mid = innerHeight * 0.55;
    sections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 32 && r.bottom > 32 && sec.dataset.theme !== theme) {
        theme = sec.dataset.theme;
        document.body.dataset.on = theme;
        meta?.setAttribute("content", THEME_COLOR[theme]);
      }
      if (r.top <= mid && r.bottom > mid) setReel(Number(sec.dataset.reel));
    });
  };
  let queued = false;
  addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        sync();
      });
    },
    { passive: true }
  );
  addEventListener("resize", sync);
  ScrollTrigger.addEventListener("refresh", sync);
  sync();
}
