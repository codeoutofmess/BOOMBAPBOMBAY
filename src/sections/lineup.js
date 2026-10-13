/* Reel 03: the beat store as a police line-up. On desktop the wall pins and
   the suspects walk past as you scroll; on phones it is a native swipe row
   with the next suspect always peeking in. */
import { gsap } from "gsap";
import { BEATS } from "../data.js";
import { formatInr } from "../commerce/config.js";
import { startRazorpayCheckout } from "../commerce/checkout.js";
import { addItemToCart } from "../commerce/cart-ui.js";
import { toggleTrack, isPlaying } from "../ui/player.js";
import { REDUCED } from "../ui/scroll.js";

const pad = (n) => String(n).padStart(2, "0");

function card(beat, i) {
  return `
    <li class="suspect" data-i="${i}">
      <span class="suspect__no" aria-hidden="true">${pad(i + 1)}</span>
      <div class="suspect__photo">
        <img src="${beat.art.src}" srcset="${beat.art.srcSmall} 400w, ${beat.art.src} 800w" sizes="(max-width: 760px) 76vw, 310px" alt="${beat.title} cover art" width="800" height="800" loading="lazy" />
        <button class="suspect__play" type="button" data-play="${i}" aria-label="Play ${beat.title} preview">
          <span class="play-icon" aria-hidden="true"></span>
        </button>
      </div>
      <div class="suspect__board">
        <span class="micro"><span>BBB P.S. — MUMBAI</span><span>BOOKED ${beat.booked}</span></span>
        <h3 class="suspect__name">${beat.title}</h3>
        <span class="suspect__stats">${beat.bpm} BPM · ${beat.key} · ${beat.duration}</span>
      </div>
      <p class="suspect__charge"><b>CHARGE:</b> ${beat.charge}</p>
      <div class="suspect__buy">
        <span class="suspect__price">${formatInr(beat.product.priceInr)}</span>
        <button class="btn btn--line btn--sm" type="button" data-cart="${i}" aria-label="Add ${beat.title} to cart">+ CART</button>
        <button class="btn btn--red btn--sm" type="button" data-buy="${i}">BUY</button>
      </div>
    </li>`;
}

export function initLineup() {
  const section = document.getElementById("lineup");
  const pin = section.querySelector(".lineup__pin");
  const wall = section.querySelector(".lineup__wall");
  const track = document.getElementById("lineupTrack");
  const count = document.getElementById("lineupCount");

  track.innerHTML = BEATS.map(card).join("");
  const cards = [...track.children];

  // Page wash: a faded, blurred copy of the hovered suspect's cover.
  const wash = document.createElement("div");
  wash.className = "lineup__bg";
  wash.setAttribute("aria-hidden", "true");
  wash.innerHTML = BEATS.map((b) => `<img src="${b.art.srcSmall}" alt="" loading="lazy" />`).join("");
  pin.prepend(wash);
  const washes = [...wash.children];
  let washed = -1;
  const tint = (i) => {
    if (i === washed) return;
    washed = i;
    washes.forEach((img, k) => img.classList.toggle("is-active", k === i));
    pin.classList.toggle("is-tinted", i >= 0);
  };
  cards.forEach((c, i) => {
    c.addEventListener("mouseenter", () => tint(i));
    c.addEventListener("focusin", () => tint(i));
  });
  track.addEventListener("mouseleave", () => tint(-1));
  track.addEventListener("focusout", (e) => {
    if (!track.contains(e.relatedTarget)) tint(-1);
  });

  const setCount = (i) => (count.textContent = `SUSPECT ${pad(i + 1)} / ${pad(BEATS.length)}`);

  // ---- actions
  track.addEventListener("click", (e) => {
    const play = e.target.closest("[data-play]");
    const buy = e.target.closest("[data-buy]");
    const add = e.target.closest("[data-cart]");

    if (play) {
      const b = BEATS[play.dataset.play];
      toggleTrack({ id: b.product.id, title: b.title, sub: `BEAT — ${b.bpm} BPM · ${b.key}`, art: b.art.srcSmall, src: b.preview });
    }
    if (buy) {
      const b = BEATS[buy.dataset.buy];
      startRazorpayCheckout(b.product, b, {
        onStart: () => {
          buy.disabled = true;
          buy.textContent = "…";
        },
        onReset: () => {
          buy.disabled = false;
          buy.textContent = "BUY";
        },
      });
    }
    if (add) {
      const b = BEATS[add.dataset.cart];
      addItemToCart(b.product, b);
      add.textContent = "ADDED";
      setTimeout(() => (add.textContent = "+ CART"), 1400);
    }
  });

  window.addEventListener("bbb:audio", () => {
    cards.forEach((c, i) => {
      const on = isPlaying(BEATS[i].product.id);
      c.classList.toggle("is-playing", on);
      const btn = c.querySelector(".suspect__play");
      btn.innerHTML = `<span class="play-icon${on ? " is-pause" : ""}" aria-hidden="true"></span>`;
      btn.setAttribute("aria-label", `${on ? "Pause" : "Play"} ${BEATS[i].title} preview`);
    });
  });

  // ---- motion
  const mm = gsap.matchMedia();

  // matchMedia only calls back when a condition matches, so phones need their own.
  mm.add({ desk: "(min-width: 761px)", phone: "(max-width: 760px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { desk, reduce } = ctx.conditions;

    if (desk && !reduce) {
      const distance = () => Math.max(0, track.scrollWidth - innerWidth);
      const lean = gsap.quickTo(track, "skewX", { duration: 0.6, ease: "power3.out" });
      let settle = null;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin,
          refreshPriority: 1, // measure the pin before anything that sits around it
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCount(Math.round(self.progress * (BEATS.length - 1)));
            // The cards drag behind the motion, leaning away from the way
            // they travel, and straighten when the scroll stops.
            lean(gsap.utils.clamp(-7, 7, self.getVelocity() / 250));
            settle?.kill();
            settle = gsap.delayedCall(0.12, () => lean(0));
          },
        },
      });
      return;
    }

    // Swipe row: count follows whichever card is centred.
    const onScroll = () => {
      const mid = wall.scrollLeft + wall.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setCount(best);
      // No hover on phones: the suspect centred in the row tints the page.
      tint(best);
    };
    wall.addEventListener("scroll", onScroll, { passive: true });
    return () => wall.removeEventListener("scroll", onScroll);
  });

  const step = (dir) => {
    const w = cards[0].offsetWidth + 16;
    wall.scrollBy({ left: dir * w, behavior: REDUCED ? "auto" : "smooth" });
  };
  document.getElementById("lineupPrev").addEventListener("click", () => step(-1));
  document.getElementById("lineupNext").addEventListener("click", () => step(1));
}
