/* Reel 02: the crate, full screen. The record in front, the rest stepping
   down and away off the edge. Scroll deals the next record; every cover and
   index entry is a way in. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RECORDS } from "../data.js";
import { formatInr } from "../commerce/config.js";
import { startRazorpayCheckout } from "../commerce/checkout.js";
import { addItemToCart } from "../commerce/cart-ui.js";
import { toggleTrack, isPlaying } from "../ui/player.js";
import { REDUCED, scrollToY } from "../ui/scroll.js";

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

const trackFor = (rec) => ({
  id: rec.product.id,
  title: rec.title,
  sub: `KSHAH — ${rec.format}`,
  art: rec.art.srcSmall,
  src: rec.preview,
});

/* Where a cover sits when it is k places behind the front one (k < 0 means
   it has already been dealt away). All offsets scale with the cover size. */
function slot(k, size) {
  if (k < 0) {
    const t = Math.min(1, -k);
    return { x: -size * 0.35 * t, y: -size * 0.85 * t, scale: 1 + 0.06 * t, rotate: -6 * t, opacity: 1 - t, z: 60 };
  }
  const fade = k <= 2 ? 1 - 0.3 * k : Math.max(0, 0.4 - (k - 2) * 0.4);
  // Phones have the details underneath, so the cascade runs flatter.
  const phone = innerWidth <= 760;
  return {
    x: size * (phone ? 0.56 : 0.52) * k,
    y: size * (phone ? 0.28 : 0.46) * k,
    scale: Math.max(0.35, 1 - 0.2 * k),
    rotate: 0,
    opacity: fade,
    z: 50 - Math.round(k * 10),
  };
}

export function initRecords() {
  const rec = $("rec");
  const stack = $("recStack");
  const index = $("recIndex");
  const n = RECORDS.length;

  $("recTotal").textContent = pad(n);

  // Build covers, blurred backdrops and the index from data.
  stack.innerHTML = RECORDS.map(
    (r, i) => `
      <button class="rec__cover" type="button" data-i="${i}" aria-label="${r.title}">
        <img src="${r.art.src}" srcset="${r.art.srcSmall} 400w, ${r.art.src} 800w" sizes="(max-width: 760px) 50vw, 36vw" alt="${r.title} cover art" width="800" height="800" ${i ? 'loading="lazy"' : ""} />
        <span class="rec__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>`
  ).join("");
  index.innerHTML = RECORDS.map(
    (r, i) => `<li><button type="button" data-i="${i}"><span><b>${pad(i + 1)}</b>${r.title}</span></button></li>`
  ).join("");

  const covers = [...stack.children];
  const tabs = [...index.querySelectorAll("button")];

  let active = -1;
  let progress = 0;

  /* ---------------------------------------------------------- details */
  function fill(i, animate) {
    const r = RECORDS[i];
    const apply = () => {
      $("recKicker").textContent = i === 0 ? `LATEST DROP — ${r.format} — ${r.year}` : `${r.format} — ${r.year}`;
      $("recTitle").innerHTML = r.display;
      $("recDesc").textContent = r.description;
      $("recSpecs").innerHTML = [
        ["FORMAT", r.tracks ? `${r.format} · ${r.tracks} TRACKS` : r.format],
        ["TEMPO", r.bpm],
        ["KEY", r.key],
        ["PRICE", formatInr(r.product.priceInr)],
      ]
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
        .join("");
      $("recBuy").textContent = `BUY — ${formatInr(r.product.priceInr)}`;
      syncPlaying();
    };

    if (!animate || REDUCED) {
      apply();
      return;
    }
    gsap.killTweensOf(["#recTitle", "#recBody", "#recKicker"]);
    gsap
      .timeline()
      .to("#recTitle", { yPercent: -105, duration: 0.22, ease: "power2.in" })
      .to(["#recBody", "#recKicker"], { opacity: 0, y: -8, duration: 0.18, ease: "power2.in" }, 0)
      .add(apply)
      .fromTo("#recTitle", { yPercent: 105 }, { yPercent: 0, duration: 0.6, ease: "expo.out" })
      .fromTo(["#recBody", "#recKicker"], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, "<0.05");
  }

  function setActive(i, animate = true) {
    if (i === active) return;
    active = i;
    $("recCount").textContent = pad(i + 1);
    tabs.forEach((t, k) => t.setAttribute("aria-current", String(k === i)));
    covers.forEach((c, k) => c.setAttribute("aria-label", k === i ? `${RECORDS[k].title} — play preview` : `Show ${RECORDS[k].title}`));
    fill(i, animate);
  }

  /* ----------------------------------------------------------- layout */
  function layout(p) {
    progress = p;
    const size = covers[0].offsetWidth || 400;
    covers.forEach((c, i) => {
      const s = slot(i - p, size);
      gsap.set(c, { x: s.x, y: s.y, scale: s.scale, rotate: s.rotate, opacity: s.opacity, zIndex: s.z });
      c.style.pointerEvents = s.opacity < 0.08 ? "none" : "auto";
      c.tabIndex = s.opacity < 0.08 ? -1 : 0;
    });
    tabs.forEach((t, i) => t.style.setProperty("--fill", `${Math.max(0, Math.min(1, p - i + 1)) * 100}%`));
    setActive(Math.min(n - 1, Math.max(0, Math.round(p))));
  }

  /* --------------------------------------------------------- playback */
  function syncPlaying() {
    const playing = active >= 0 && isPlaying(RECORDS[active].product.id);
    const btn = $("recPlay");
    btn.classList.toggle("is-playing", playing);
    btn.querySelector(".rec__play-dot").innerHTML = `<span class="play-icon${playing ? " is-pause" : ""}" aria-hidden="true"></span>`;
    btn.querySelector(".rec__play-label").textContent = playing ? "PAUSE" : "PLAY PREVIEW";
    covers.forEach((c, k) => c.classList.toggle("is-playing", isPlaying(RECORDS[k].product.id)));
  }
  window.addEventListener("bbb:audio", syncPlaying);

  $("recPlay").addEventListener("click", () => toggleTrack(trackFor(RECORDS[active])));
  $("recBuy").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const r = RECORDS[active];
    const label = btn.textContent;
    startRazorpayCheckout(r.product, r, {
      onStart: () => {
        btn.disabled = true;
        btn.textContent = "PROCESSING...";
      },
      onReset: () => {
        btn.disabled = false;
        btn.textContent = label;
      },
    });
  });
  $("recCart").addEventListener("click", (e) => {
    const r = RECORDS[active];
    addItemToCart(r.product, r);
    const btn = e.currentTarget;
    btn.textContent = "ADDED ✓";
    setTimeout(() => (btn.textContent = "ADD TO CART"), 1400);
  });

  /* ------------------------------------------------------- navigation */
  let st = null;
  const goTo = (i) => {
    if (!st) {
      gsap.to(
        { p: progress },
        {
          p: i,
          duration: REDUCED ? 0 : 0.7,
          ease: "power3.inOut",
          onUpdate() {
            layout(this.targets()[0].p);
          },
        }
      );
      return;
    }
    scrollToY(st.start + (i / (n - 1)) * (st.end - st.start));
  };

  stack.addEventListener("click", (e) => {
    const c = e.target.closest(".rec__cover");
    if (!c) return;
    const i = Number(c.dataset.i);
    if (i === active) toggleTrack(trackFor(RECORDS[i]));
    else goTo(i);
  });
  index.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (b) goTo(Number(b.dataset.i));
  });

  /* ------------------------------------------------------------ scroll */
  setActive(0, false);
  layout(0);
  addEventListener("resize", () => layout(progress));

  if (REDUCED) return;

  // The stage pins; each record gets most of a screen of scroll and snaps.
  st = ScrollTrigger.create({
    trigger: rec,
    pin: true,
    refreshPriority: 1, // measure the pin before anything that sits around it
    start: "top top",
    end: () => `+=${(n - 1) * innerHeight * (innerWidth <= 760 ? 0.6 : 0.85)}`,
    scrub: 0.6,
    invalidateOnRefresh: true,
    snap: { snapTo: 1 / (n - 1), duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: "power2.inOut" },
    onUpdate: (self) => layout(self.progress * (n - 1)),
  });
}
