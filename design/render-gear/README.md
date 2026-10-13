# Gear stills

`public/img/gear/*.webp` are stills rendered from the GLB models in `design/models/`
with `render-gear.js` (three.js, run in a browser via the Vite dev server). The page
POSTs each PNG to a temporary `/__save` dev middleware; add one to `vite.config.js`
while rendering, then trim and convert with sharp.

`mpc-top` is an orthographic top-down render. The pad and screen rectangles in
`src/sections/arsenal.js` and `.mpc__screen` are measured from that image, so
re-measure them if the render changes.
