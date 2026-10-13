"""Builds design/samapt-print/samapt-print.svg (then run raster.mjs): a seamless, dense Mughal-carpet field
used inside the समाप्त end card. Muted palette only. Run: python3 build.py"""
import math, random, os

S = 480            # tile size (user units)
C = S / 2
rnd = random.Random(11)

# Antique carpet palette: low contrast, nothing bright.
GROUND = "#7e1c14"  # madder ground
DR    = "#5c120d"   # deep madder
BR    = "#3a1610"   # dark brown outline
RUST  = "#9a3b25"   # faded rust
BONE  = "#b9a07a"   # wool tan
BONE2 = "#97805c"   # darker tan
SLATE = "#2f3a37"   # slate
TEAL  = "#3e4d48"   # dull slate-teal (leaves)

f = lambda n: f"{n:.1f}"
pol = lambda cx, cy, r, a: (cx + r * math.cos(a), cy + r * math.sin(a))
out = []
add = out.append

def wrap(x, y, draw, reach=70):
    """Draw at (x,y) and at each tile-wrapped copy that pokes into the tile."""
    for dx in (-S, 0, S):
        for dy in (-S, 0, S):
            px, py = x + dx, y + dy
            if -reach <= px <= S + reach and -reach <= py <= S + reach:
                draw(px, py)

def petal(cx, cy, a, r0, r1, w, fill, stroke=BR, sw=1.4, extra=""):
    x0, y0 = pol(cx, cy, r0, a)
    xt, yt = pol(cx, cy, r1, a)
    m = r0 + (r1 - r0) * 0.5
    c1 = pol(cx, cy, m, a - w)
    c2 = pol(cx, cy, m, a + w)
    add(f'<path d="M{f(x0)} {f(y0)}Q{f(c1[0])} {f(c1[1])} {f(xt)} {f(yt)}Q{f(c2[0])} {f(c2[1])} {f(x0)} {f(y0)}Z" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

def ring_dots(cx, cy, r, n, size, fill, off=0):
    for i in range(n):
        x, y = pol(cx, cy, r, off + i * 2 * math.pi / n)
        add(f'<circle cx="{f(x)}" cy="{f(y)}" r="{size}" fill="{fill}"/>')

def star(cx, cy, n, ro, ri, fill, rot=-math.pi / 2):
    pts = []
    for i in range(n * 2):
        r = ro if i % 2 == 0 else ri
        x, y = pol(cx, cy, r, rot + i * math.pi / n)
        pts.append(f"{f(x)},{f(y)}")
    add(f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{BR}" stroke-width="1.2"/>')

def medallion(cx, cy, k=1.0):
    # scalloped rim
    for i in range(28):
        x, y = pol(cx, cy, 104 * k, i * 2 * math.pi / 28)
        add(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(11*k)}" fill="{BONE2}" stroke="{BR}" stroke-width="1.2"/>')
    add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(100*k)}" fill="{RUST}" stroke="{BR}" stroke-width="1.6"/>')
    ring_dots(cx, cy, 94 * k, 56, 1.6 * k, BONE)
    # 16 outer petals with a bone vein
    for i in range(16):
        a = i * 2 * math.pi / 16
        petal(cx, cy, a, 44 * k, 90 * k, 0.2, DR)
        x0, y0 = pol(cx, cy, 52 * k, a); x1, y1 = pol(cx, cy, 82 * k, a)
        add(f'<path d="M{f(x0)} {f(y0)}L{f(x1)} {f(y1)}" stroke="{BONE}" stroke-width="1.1" opacity=".75"/>')
    # interleaved small petals
    for i in range(16):
        a = (i + 0.5) * 2 * math.pi / 16
        petal(cx, cy, a, 50 * k, 74 * k, 0.12, SLATE, sw=1)
    add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(46*k)}" fill="{BONE2}" stroke="{BR}" stroke-width="1.4"/>')
    ring_dots(cx, cy, 41 * k, 32, 1.8 * k, DR)
    for i in range(8):
        a = i * 2 * math.pi / 8 + math.pi / 8
        petal(cx, cy, a, 14 * k, 38 * k, 0.32, TEAL)
        x0, y0 = pol(cx, cy, 18 * k, a); x1, y1 = pol(cx, cy, 33 * k, a)
        add(f'<path d="M{f(x0)} {f(y0)}L{f(x1)} {f(y1)}" stroke="{BONE}" stroke-width="1" opacity=".8"/>')
    star(cx, cy, 8, 18 * k, 10 * k, BONE)
    add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(6*k)}" fill="{DR}" stroke="{BR}"/>')
    add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(2.2*k)}" fill="{BONE}"/>')

def palmette(cx, cy, rot, k=1.0):
    """Shah-abbasi palmette pointing along rot."""
    g = []
    def P(d, fill, sw=1.3, op=""):
        g.append(f'<path d="{d}" fill="{fill}" stroke="{BR}" stroke-width="{sw}" {op}/>')
    # fan of seven lobes
    for i in range(7):
        a = math.radians(-75 + i * 25)
        x, y = 0 + 46 * k * math.sin(a), -46 * k * math.cos(a)
        g.append(f'<ellipse cx="{f(x*0.62)}" cy="{f(y*0.62)}" rx="{f(9*k)}" ry="{f(21*k)}" transform="rotate({math.degrees(a):.1f} {f(x*0.62)} {f(y*0.62)})" fill="{DR if i%2 else RUST}" stroke="{BR}" stroke-width="1.2"/>')
    P(f"M{f(-26*k)} 0C{f(-30*k)} {f(-30*k)} {f(-8*k)} {f(-44*k)} 0 {f(-50*k)}C{f(8*k)} {f(-44*k)} {f(30*k)} {f(-30*k)} {f(26*k)} 0Z", BONE2)
    P(f"M{f(-15*k)} {f(-2*k)}C{f(-16*k)} {f(-20*k)} {f(-5*k)} {f(-30*k)} 0 {f(-34*k)}C{f(5*k)} {f(-30*k)} {f(16*k)} {f(-20*k)} {f(15*k)} {f(-2*k)}Z", TEAL)
    for j in range(5):
        y = -6 * k - j * 5.5 * k
        g.append(f'<circle cx="0" cy="{f(y)}" r="{f(1.8*k)}" fill="{BONE}"/>')
    P(f"M{f(-22*k)} 0Q0 {f(14*k)} {f(22*k)} 0Z", SLATE)
    add(f'<g transform="translate({f(cx)} {f(cy)}) rotate({rot:.1f})">' + "".join(g) + "</g>")

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
            u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])

def vine(p0, p1, p2, p3):
    d = f"M{f(p0[0])} {f(p0[1])}C{f(p1[0])} {f(p1[1])} {f(p2[0])} {f(p2[1])} {f(p3[0])} {f(p3[1])}"
    add(f'<path d="{d}" fill="none" stroke="{BR}" stroke-width="7.5" stroke-linecap="round"/>')
    add(f'<path d="{d}" fill="none" stroke="{SLATE}" stroke-width="4.6" stroke-linecap="round"/>')
    add(f'<path d="{d}" fill="none" stroke="{BONE2}" stroke-width="1" stroke-dasharray="2 5" stroke-linecap="round" opacity=".7"/>')
    # leaves, tendrils and buds along the vine
    for i, t in enumerate([0.14, 0.28, 0.42, 0.58, 0.72, 0.86]):
        x, y = bez(p0, p1, p2, p3, t)
        x2, y2 = bez(p0, p1, p2, p3, min(1, t + 0.02))
        ang = math.atan2(y2 - y, x2 - x)
        side = 1 if i % 2 else -1
        la = ang + side * 1.1
        lx, ly = pol(x, y, 13, la)
        add(f'<ellipse cx="{f(lx)}" cy="{f(ly)}" rx="4.4" ry="12" transform="rotate({math.degrees(la)+90:.1f} {f(lx)} {f(ly)})" fill="{TEAL}" stroke="{BR}" stroke-width="1"/>')
        mx, my = pol(x, y, 21, la)
        add(f'<path d="M{f(x)} {f(y)}L{f(mx)} {f(my)}" stroke="{BONE}" stroke-width=".8" opacity=".75"/>')
        if i % 3 == 1:
            # spiral tendril ending in a bud
            ta = ang - side * 1.2
            pts = []
            for s in range(14):
                r = 3 + s * 1.5
                a2 = ta + side * s * 0.42
                pts.append(pol(x + 22 * math.cos(ta), y + 22 * math.sin(ta), 22 - r, a2))
            d2 = f"M{f(x)} {f(y)}" + "".join(f"L{f(px)} {f(py)}" for px, py in pts)
            add(f'<path d="{d2}" fill="none" stroke="{SLATE}" stroke-width="1.6" stroke-linecap="round"/>')
            bx, by = pts[-1]
            add(f'<circle cx="{f(bx)}" cy="{f(by)}" r="3.6" fill="{BONE2}" stroke="{BR}" stroke-width="1"/>')

def scroll(cx, cy, r, a0, turns, side=1):
    """Islimi scroll: a spiral vine curling inward, leaves on its outer edge."""
    pts = []
    n = 46
    for i in range(n):
        t = i / (n - 1)
        a = a0 + side * t * turns * 2 * math.pi
        rr = r * (1 - 0.82 * t)
        pts.append(pol(cx, cy, rr, a))
    d = smooth(pts)
    add(f'<path d="{d}" fill="none" stroke="{BR}" stroke-width="5" stroke-linecap="round"/>')
    add(f'<path d="{d}" fill="none" stroke="{SLATE}" stroke-width="2.8" stroke-linecap="round"/>')
    for i in range(4, n - 6, 6):
        x, y = pts[i]
        a = math.atan2(y - cy, x - cx)
        lx, ly = pol(x, y, 7, a)
        add(f'<ellipse cx="{f(lx)}" cy="{f(ly)}" rx="3" ry="8" transform="rotate({math.degrees(a)+90:.1f} {f(lx)} {f(ly)})" fill="{TEAL if i % 12 else RUST}" stroke="{BR}" stroke-width=".9"/>')
    ex, ey = pts[-1]
    floret(ex, ey, 3.4, BONE2, DR)

def rosette(cx, cy, k=1.0):
    for i in range(12):
        a = i * 2 * math.pi / 12
        petal(cx, cy, a, 9 * k, 26 * k, 0.26, DR if i % 2 else RUST, sw=1.1)
    ring_dots(cx, cy, 30 * k, 18, 1.5 * k, BONE)
    add(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(9*k)}" fill="{BONE2}" stroke="{BR}" stroke-width="1.1"/>')
    star(cx, cy, 6, 7 * k, 3.6 * k, SLATE)
    for i in range(8):
        x, y = pol(cx, cy, 40 * k, i * 2 * math.pi / 8 + math.pi / 8)
        floret(x, y, 3.2 * k, BONE if i % 2 else BONE2, SLATE)

def floret(x, y, r, fill=BONE, core=DR):
    for i in range(5):
        px, py = pol(x, y, r, i * 2 * math.pi / 5 - math.pi / 2)
        add(f'<circle cx="{f(px)}" cy="{f(py)}" r="{f(r*0.72)}" fill="{fill}" stroke="{BR}" stroke-width=".8"/>')
    add(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r*0.55)}" fill="{core}"/>')

def smooth(pts):
    """Quadratic spline through the midpoints: a soft, brush-like line."""
    d = f"M{f(pts[0][0])} {f(pts[0][1])}"
    for i in range(1, len(pts) - 1):
        mx, my = (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2
        d += f"Q{f(pts[i][0])} {f(pts[i][1])} {f(mx)} {f(my)}"
    return d

def cloudband(cx, cy, r, a0, span):
    pts = []
    for i in range(24):
        a = a0 + span * i / 23
        rr = r + 7 * math.sin(i * 0.55)
        pts.append(pol(cx, cy, rr, a))
    d = smooth(pts)
    add(f'<path d="{d}" fill="none" stroke="{BONE2}" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>')
    add(f'<path d="{d}" fill="none" stroke="{BR}" stroke-width="1" stroke-linecap="round" transform="translate(0 4)" opacity=".7"/>')

# ---- 1. madder ground with a faint stipple
add(f'<rect width="{S}" height="{S}" fill="{GROUND}"/>')
add(f'<rect width="{S}" height="{S}" fill="url(#stip)" opacity=".6"/>')

# ---- 2. vine lattice (centre <-> edges <-> corners), wrapped for seams
def vines_at(ox, oy):
    # centre to each edge, swinging hard either side of the straight line
    vine((ox+C, oy+C), (ox+C+60, oy+C-170), (ox+S-60, oy+C+170), (ox+S, oy+C))
    vine((ox+C, oy+C), (ox+C-60, oy+C+170), (ox+60, oy+C-170), (ox, oy+C))
    vine((ox+C, oy+C), (ox+C+170, oy+C+60), (ox+C-170, oy+S-60), (ox+C, oy+S))
    vine((ox+C, oy+C), (ox+C-170, oy+C-60), (ox+C+170, oy+60), (ox+C, oy))
    # corners into the quarter rosettes
    q = C / 2
    for (x0, y0, x1, y1) in ((0, 0, q, q), (S, 0, S - q, q), (0, S, q, S - q), (S, S, S - q, S - q)):
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        vine((ox+x0, oy+y0), (ox+mx+50, oy+my-50), (ox+mx-50, oy+my+50), (ox+x1, oy+y1))
vines_at(0, 0)

# faint diagonal diaper lattice in the ground
for i in range(-S, S * 2, 40):
    add(f'<path d="M{i} 0L{i+S} {S}M{i} {S}L{i+S} 0" stroke="{RUST}" stroke-width="1.1" opacity=".6"/>')
    add(f'<path d="M{i+20} 0L{i+20+S} {S}M{i+20} {S}L{i+20+S} 0" stroke="{BR}" stroke-width=".6" opacity=".35" stroke-dasharray="1 4"/>')

# arabesque scrolls in the open quarters, curling both ways
q = C / 2
for (x, y, a0, side) in ((q, q, 0.6, 1), (S - q, q, 2.2, -1), (q, S - q, 4.0, -1), (S - q, S - q, 5.4, 1)):
    for k, off in enumerate((0, math.pi)):
        scroll(x + 46 * math.cos(a0 + off), y + 46 * math.sin(a0 + off), 30, a0 + off, 1.4, side if k else -side)

# ---- 3. cloud bands round the medallions
for a0 in (0.3, 1.9, 3.5, 5.0):
    cloudband(C, C, 132, a0, 0.9)
for cx, cy in ((0, 0), (S, 0), (0, S), (S, S)):
    for a0 in (0.2, 1.8, 3.4, 4.9):
        cloudband(cx, cy, 122, a0, 0.8)

# ---- 4. scattered florets (kept clear of the medallions and palmettes)
centres = [(C, C, 150), (0, 0, 140), (S, 0, 140), (0, S, 140), (S, S, 140),
           (C, 0, 70), (0, C, 70), (S, C, 70), (C, S, 70),
           (C/2, C/2, 52), (S-C/2, C/2, 52), (C/2, S-C/2, 52), (S-C/2, S-C/2, 52)]
placed = 0
tries = 0
while placed < 170 and tries < 12000:
    tries += 1
    x, y = rnd.uniform(0, S), rnd.uniform(0, S)
    if any(math.hypot(x - cx, y - cy) < r for cx, cy, r in centres):
        continue
    r = rnd.choice([2.4, 3.0, 3.6, 4.4])
    wrap(x, y, lambda a, b: floret(a, b, r, BONE if placed % 3 else BONE2, DR if placed % 2 else SLATE), reach=8)
    placed += 1

# tiny three-dot clusters wherever there is still bare ground
for _ in range(260):
    x, y = rnd.uniform(0, S), rnd.uniform(0, S)
    if any(math.hypot(x - cx, y - cy) < r - 10 for cx, cy, r in centres):
        continue
    def dots3(a, b):
        for j in range(3):
            px, py = pol(a, b, 3, j * 2 * math.pi / 3)
            add(f'<circle cx="{f(px)}" cy="{f(py)}" r="1.3" fill="{BONE2}" opacity=".85"/>')
    wrap(x, y, dots3, reach=6)

# ---- 5. palmettes on the edges, pointing outward from the centre medallion
for (x, y, rot) in ((C, 0, 0), (S, C, 90), (C, S, 180), (0, C, 270)):
    wrap(x, y, lambda a, b, r=rot: palmette(a, b, r, 1.15))
    wrap(x, y, lambda a, b, r=rot: palmette(a, b, r + 180, 1.15))

for x, y in ((C/2, C/2), (S-C/2, C/2), (C/2, S-C/2), (S-C/2, S-C/2)):
    rosette(x, y, 1.0)

# ---- 6. medallions: centre and the four corners (they meet across seams)
medallion(C, C, 1.0)
for cx, cy in ((0, 0), (S, 0), (0, S), (S, S)):
    medallion(cx, cy, 0.92)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">
<defs>
  <filter id="knot" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".0208" numOctaves="2" seed="3" stitchTiles="stitch" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id="stip" width="10" height="20" patternUnits="userSpaceOnUse">
    <circle cx="0" cy="0" r="1.05" fill="{BONE2}" opacity=".45"/><circle cx="10" cy="0" r="1.05" fill="{BONE2}" opacity=".45"/>
    <circle cx="5" cy="10" r="1.05" fill="{BONE2}" opacity=".45"/><circle cx="0" cy="20" r="1.05" fill="{BONE2}" opacity=".45"/>
    <circle cx="10" cy="20" r="1.05" fill="{BONE2}" opacity=".45"/>
  </pattern>
</defs>
<g filter="url(#knot)">{"".join(out)}</g>
</svg>'''
dst = os.path.join(os.path.dirname(__file__), "samapt-print.svg")
with open(dst, "w") as fh:
    fh.write(svg)
print(len(out), "elements,", round(len(svg) / 1024), "KB")

