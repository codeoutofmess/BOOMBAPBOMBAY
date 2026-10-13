/* Scrolling stays native everywhere. Lenis only adds weight to wheel and
   trackpad input on devices with a fine pointer; touch is never hijacked. */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = matchMedia("(hover: hover) and (pointer: fine)").matches;

let lenis = null;

export function initScroll() {
  if (REDUCED || !FINE_POINTER) return null;

  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.addEventListener("bbb:lock", (e) => (e.detail ? lenis.stop() : lenis.start()));
  return lenis;
}

export function scrollToEl(el, { offset = 0, immediate = false } = {}) {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  if (lenis) lenis.scrollTo(y, { immediate, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: immediate || REDUCED ? "auto" : "smooth" });
}

export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 0.9 });
  else window.scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
}

/* Any in-page link marked data-scroll, or any link to a section, glides. */
export function bindAnchorLinks(root = document) {
  root.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    history.replaceState(null, "", id === "#home" ? location.pathname : id);
  });
}
