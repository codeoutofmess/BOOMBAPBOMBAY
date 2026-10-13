// Turns public/img/samapt-print.svg into a woven, worn carpet tile:
// public/img/samapt-carpet.webp. Run after build.py: node raster.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "samapt-print.svg");
const dst = path.join(here, "../../public/img/samapt-carpet.webp");

const KNOTS = 192; // knots across one tile: the coarseness of the weave
const OUT = 384;   // shipped tile size (each knot = 2px); shown small and dense

// 1. Render the motifs and resample them down to the knot grid.
const hi = await sharp(src, { density: 144 }).resize(960, 960).toBuffer();
const { data, info } = await sharp(hi).resize(KNOTS, KNOTS, { kernel: "mitchell" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

// 2. Seamless wear: low-frequency noise built from whole-period waves, so
//    the patches line up across tile edges.
let seed = 1337;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
// Waves run in every direction (signed, mixed frequencies) so the sum forms
// irregular blotches rather than stripes.
const waves = Array.from({ length: 16 }, () => {
  const sx = rnd() < 0.5 ? -1 : 1;
  const sy = rnd() < 0.5 ? -1 : 1;
  return {
    fx: sx * Math.floor(rnd() * 4),
    fy: sy * (1 + Math.floor(rnd() * 3)),
    ph: rnd() * Math.PI * 2,
    a: 0.3 + rnd() * 0.7,
  };
});
const field = (x, y) => {
  let v = 0, n = 0;
  for (const w of waves) {
    v += w.a * Math.sin(((w.fx * x + w.fy * y) / KNOTS) * Math.PI * 2 + w.ph);
    n += w.a;
  }
  return 0.5 + 0.5 * (v / n);
};
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const FOUNDATION = [203, 184, 147]; // bare warp threads where the pile is gone
const px = Buffer.from(data);
for (let y = 0; y < KNOTS; y++) {
  for (let x = 0; x < KNOTS; x++) {
    const i = (y * KNOTS + x) * 3;
    // wool: every knot dyed a touch differently
    const jitter = 1 + (rnd() - 0.5) * 0.14;
    let r = data[i] * jitter, g = data[i + 1] * jitter, b = data[i + 2] * jitter;
    // worn patches, ragged at the edges, plus scattered abrasion everywhere
    const patch = smooth(0.56, 0.74, field(x, y)) * (0.5 + 0.5 * rnd());
    const grit = rnd() < 0.05 ? 0.35 + rnd() * 0.35 : 0;
    // warp threads show as faint vertical streaks inside the worn areas
    const warp = x % 3 === 0 ? 0.12 : 0;
    const wear = Math.min(0.85, patch * 0.8 + grit + (patch > 0.2 ? warp : 0));
    r = r * (1 - wear) + FOUNDATION[0] * wear;
    g = g * (1 - wear) + FOUNDATION[1] * wear;
    b = b * (1 - wear) + FOUNDATION[2] * wear;
    px[i] = Math.min(255, Math.max(0, r));
    px[i + 1] = Math.min(255, Math.max(0, g));
    px[i + 2] = Math.min(255, Math.max(0, b));
  }
}

// 3. Blow the knots back up with hard edges, so each one reads as a knot.
await sharp(px, { raw: { width: KNOTS, height: KNOTS, channels: 3 } })
  .resize(OUT, OUT, { kernel: "nearest" })
  .webp({ quality: 88 })
  .toFile(dst);
const meta = await sharp(dst).metadata();
console.log("samapt-carpet.webp", meta.width, "x", meta.height);
