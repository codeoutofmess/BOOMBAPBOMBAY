import "./styles/main.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { isPaymentSuccessRoute, renderPaymentSuccessPage } from "./commerce/payment-success.js";
import { initCart } from "./commerce/cart-ui.js";
import { initScroll, bindAnchorLinks, scrollToEl } from "./ui/scroll.js";
import { initPlayer } from "./ui/player.js";
import { initChrome } from "./ui/chrome.js";
import { runColdOpen, primeLanding, heroIntro, initHero } from "./sections/hero.js";
import { initRevolver } from "./sections/revolver.js";
import { initRecords } from "./sections/records.js";
import { initLineup } from "./sections/lineup.js";
import { initArsenal } from "./sections/arsenal.js";
import { initSmoke } from "./sections/smoke.js";
import { initOutro, initReveals } from "./sections/outro.js";
import { initMotion } from "./sections/motion.js";

gsap.registerPlugin(ScrollTrigger);

(async function boot() {
  if (isPaymentSuccessRoute()) {
    await renderPaymentSuccessPage();
    return;
  }

  primeLanding();
  initRevolver(document.querySelector(".landing .webgl")).catch((err) => console.error("Revolver failed to load", err));

  initScroll();
  initPlayer();
  initCart();
  initChrome();
  initHero();
  initRecords();
  initLineup();
  initArsenal();
  initSmoke();
  initOutro();
  initReveals();
  initMotion();
  bindAnchorLinks();

  // Triggers were created module by module, not top to bottom; the line-up's
  // pin adds scroll length, so measure everything again in page order.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // Late font and image metrics move things; re-measure once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());

  await runColdOpen();
  heroIntro();

  if (location.hash.length > 1) {
    const target = document.querySelector(location.hash);
    if (target) requestAnimationFrame(() => scrollToEl(target, { immediate: true }));
  }
})();
