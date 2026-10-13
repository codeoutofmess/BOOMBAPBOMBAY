/* Reels 05–06 and the reveals every reel shares. */
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { LINKS, CONTACT_EMAIL } from "../data.js";
import { REDUCED } from "../ui/scroll.js";

gsap.registerPlugin(SplitText);

export function initReveals() {
  if (REDUCED) return;

  // Big headings rise out of a mask, line by line, once.
  document.querySelectorAll(".lineup__title, .arsenal__title, .end__title").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.1,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }),
    });
  });

  // Copy and controls fade up, never anything you'd have to wait for twice.
  gsap.utils.toArray(".lineup__copy, .arsenal__copy, .arsenal__intro .btn, .mpc, .exhibit, .city__copy, .end__cta .btn, .end__links").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });
}

export function initOutro() {
  // Mumbai surfaces from the south tip upward.
  const map = document.querySelector("#cityMap img");
  if (!REDUCED) {
    gsap.fromTo(
      map,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: { trigger: "#cityMap", start: "top 85%", end: "center 50%", scrub: 0.6 },
      }
    );
    gsap.from(".city__pin, .city__pin-label", {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(2)",
      scrollTrigger: { trigger: "#cityMap", start: "center 55%", once: true },
    });

    // The closing title card wipes on like the last frame of a reel.
    gsap.fromTo(
      ".samapt",
      { clipPath: "inset(0% 100% 0% 0%)", scale: 1.08 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: ".end__samapt", start: "top 95%", end: "center 60%", scrub: 0.6 },
      }
    );
  }

  document.getElementById("links").innerHTML = LINKS.map(
    (l) => `<li><a href="${l.href}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>[ ${l.label} ]</a></li>`
  ).join("");

  document.getElementById("contactBtn").href = `mailto:${CONTACT_EMAIL}`;
}
