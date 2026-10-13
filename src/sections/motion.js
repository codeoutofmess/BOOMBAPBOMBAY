/* Scroll-linked motion shared across the reels: things drift, lean and
   settle as you move, and the City statement lights up word by word as you
   read down it. */
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { REDUCED } from "../ui/scroll.js";

gsap.registerPlugin(SplitText);

const scrub = (trigger, start = "top bottom", end = "bottom top") => ({ trigger, start, end, scrub: true });

export function initMotion() {
  if (REDUCED) return;

  // City: each word comes up from dim as it passes the reading line.
  const statement = document.querySelector(".city__statement");
  if (statement) {
    SplitText.create(statement, {
      type: "words",
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.16 },
          { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: scrub(statement, "top 85%", "bottom 45%") }
        ),
    });
  }

  // Big titles slide a little against the scroll, for depth.
  gsap.utils.toArray(".arsenal__title, .end__title").forEach((el) => {
    gsap.fromTo(el, { xPercent: 6 }, { xPercent: -3, ease: "none", scrollTrigger: scrub(el) });
  });

  // Gear exhibits rise at different speeds, like objects on a shelf.
  gsap.utils.toArray(".exhibit__img").forEach((el, i) => {
    gsap.fromTo(el, { y: 40 + i * 25 }, { y: -10, ease: "none", scrollTrigger: scrub(el, "top bottom", "center 40%") });
  });
}
