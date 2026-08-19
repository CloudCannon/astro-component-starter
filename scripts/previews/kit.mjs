/**
 * Component-preview kit — the authoring API for `*.preview.mjs` recipe files.
 *
 * A recipe declares a content `width` and drawing primitives in absolute canvas
 * coordinates; `compile()` centres the bounding box on (640, 360) and asserts it
 * matches the declared width. Deterministic and browser-free, so CI rebuilds and
 * diffs to catch drift. Screenshots (`screenshot.mjs`) are an authoring reference
 * only, never an input.
 *
 * The five rules that keep 55 previews looking like one family:
 *
 *   1. NINE COLOUR ROLES, no raw hex — see the glossary below. Re-skin and
 *      dark-mode the whole set from one place.
 *   2. A FIVE-STEP TYPE SCALE (display/heading/label/body/micro). `bar()` takes
 *      a scale step, not a pixel height, so no recipe can add a sixth size.
 *   3. A THREE-STEP STROKE SCALE (control 2 / field 3 / active 4).
 *   4. FOUR CONTENT WIDTH BANDS (560 / 760 / 960 / 1120), asserted at build
 *      time. Components that would read as distorted set `exempt: true`.
 *   5. EVERYTHING CENTRES on (640, 360) — `compile()` emits the offset, so a
 *      picker grid stays even regardless of composition height.
 *
 * Geometry is integer throughout. Prefer the composites (`pill`, `field`,
 * `media`, `navButton`, …) over raw shapes: they carry the on-system weights,
 * radii and insets. Absolute y values are arbitrary; start at 0 and work down.
 */

// Canvas — 16:9, matching CloudCannon's structure-picker gallery
// (`.c-card__preview` is ~286×160). `gallery.fit: cover` absorbs the leftover
// sub-pixel when the card width isn't an exact 16:9.

export const W = 1280;
export const H = 720;
export const CX = W / 2;
export const CY = H / 2;

// Colour roles. Nine variables cover every preview. Light values are inlined as
// the `var()` fallback so a preview loaded as `<img>` — an isolated document
// page CSS cannot reach into — still renders correctly. The dark values are
// injected as an in-document `@media` block by `compile()`, which is the only
// way an `<img>`-loaded SVG can follow the viewer's colour scheme.
//
//   paper    the page behind everything
//   panel    a subtly-tinted panel (mobile menu, side nav, chevron chips)
//   surface  a filled media / card surface, one step stronger than panel
//   line     a faint hairline border or rule
//   glyph    a placeholder mark: inactive control, dropdown copy, media glyph
//   body     body-copy text bars
//   subject  the component's SUBJECT — headings, active marks, nav labels.
//            This role carries the visual hierarchy; use it for whatever the
//            preview is actually about.
//   ink      the brand primary (a dark neutral by default): filled buttons
//   on-ink   a faint label bar drawn inside an `ink` fill

const LIGHT = {
  paper: "#FFFFFF",
  panel: "#F7F6F3",
  surface: "#EBE9E3",
  line: "#E4E1DA",
  glyph: "#CFCBC2",
  body: "#DAD7D0",
  subject: "#A8A398",
  ink: "#151515",
  "on-ink": "#9A9A9A",
};

const DARK = {
  paper: "#151515",
  panel: "#1D1D1B",
  surface: "#232320",
  line: "#2E2D29",
  glyph: "#45443E",
  body: "#3A3934",
  subject: "#6E6A62",
  ink: "#F5F3EE",
  "on-ink": "#6B6B6B",
};

const role = (name) => `var(--pv-${name}, ${LIGHT[name]})`;

export const paper = role("paper");
export const panel = role("panel");
export const surface = role("surface");
export const line = role("line");
export const glyph = role("glyph");
export const body = role("body");
export const subject = role("subject");
export const ink = role("ink");
export const onInk = role("on-ink");

// Scales

/** Type scale. Text is a fully-rounded bar at one of these five heights. */
export const TYPE = {
  display: 40,
  heading: 26,
  label: 16,
  body: 12,
  micro: 8,
};

/** Default role per type step — body copy is quieter than a heading. */
const TYPE_FILL = {
  display: subject,
  heading: subject,
  label: subject,
  body,
  micro: onInk,
};

/** Stroke scale. `control` = button/segment outline, `field` = form input, `active` = selected. */
export const STROKE = { control: 2, field: 3, active: 4 };

/** Corner radii. `box` is the universal soft corner; `tile` is the big icon plate. */
export const R = { box: 10, tile: 44 };

/** The four content width bands. */
export const BANDS = [560, 760, 960, 1120];

/**
 * A content band: its width plus the canvas edges it centres to. Recipes read
 * `B.left` / `B.right` / `B.cx` instead of doing arithmetic.
 *
 * @param {number} w One of BANDS, or any width when the recipe is `exempt`.
 */
export function band(w) {
  const left = Math.round((W - w) / 2);

  return { w, left, right: left + w, cx: CX };
}

// Core primitives. Every one returns a plain element object (or an array of
// them) in absolute canvas coordinates. Recipes nest arrays freely; `compile()`
// flattens. Draw order is array order.

const num = (v) => Math.round(v);

/**
 * Rounded rectangle — the workhorse.
 * @param {object} [o] { fill, stroke, sw, r, dash, opacity }
 */
export function box(x, y, w, h, o = {}) {
  return {
    k: "rect",
    x: num(x),
    y: num(y),
    w: num(w),
    h: num(h),
    r: o.r ?? R.box,
    fill: o.fill ?? surface,
    stroke: o.stroke ?? null,
    sw: o.sw ?? (o.stroke ? STROKE.control : null),
    dash: o.dash ?? null,
    opacity: o.opacity ?? null,
  };
}

/**
 * A text bar: fully rounded, height from the type scale.
 * @param {"display"|"heading"|"label"|"body"|"micro"} size
 * @param {object} [o] { fill, opacity }
 */
export function bar(x, y, w, size = "body", o = {}) {
  const h = TYPE[size];

  if (!h) throw new Error(`bar(): unknown type step "${size}"`);

  return box(x, y, w, h, {
    r: h / 2,
    fill: o.fill ?? TYPE_FILL[size],
    opacity: o.opacity,
  });
}

/** Filled circle. @param {object} [o] { fill, opacity } */
export function dot(cx, cy, r, o = {}) {
  return {
    k: "circle",
    cx: num(cx),
    cy: num(cy),
    r: num(r),
    fill: o.fill ?? glyph,
    stroke: o.stroke ?? null,
    sw: o.sw ?? (o.stroke ? STROKE.control : null),
    opacity: o.opacity ?? null,
  };
}

/**
 * Polygon. @param {Array<[number, number]>} pts @param {object} [o] { fill, opacity, round }
 *
 * `round` is a corner radius: the shape is drawn with a round-joined stroke of
 * that radius, and the vertices are inset along their angle bisectors so the
 * stroked outline lands exactly on the given points — same footprint, soft
 * corners. Convex shapes only (all the kit's triangles are).
 */
export function poly(pts, o = {}) {
  const round = o.round >= 1 ? Math.round(o.round) : null;

  return {
    k: "poly",
    pts: (round ? insetVertices(pts, round) : pts).map(([x, y]) => [num(x), num(y)]),
    fill: o.fill ?? glyph,
    round,
    opacity: o.opacity ?? null,
  };
}

/** Move each vertex toward the polygon interior so a stroke of radius `r` restores the original outline. */
function insetVertices(pts, r) {
  const n = pts.length;

  return pts.map(([x, y], i) => {
    const [px, py] = pts[(i + n - 1) % n];
    const [nx, ny] = pts[(i + 1) % n];
    const unit = (dx, dy) => {
      const len = Math.hypot(dx, dy) || 1;

      return [dx / len, dy / len];
    };
    const [ax, ay] = unit(px - x, py - y);
    const [bx, by] = unit(nx - x, ny - y);
    const sinHalf = Math.sqrt(Math.max(0, (1 - (ax * bx + ay * by)) / 2));

    if (!sinHalf) return [x, y];
    const [cx2, cy2] = unit(ax + bx, ay + by);

    return [x + (cx2 * r) / sinHalf, y + (cy2 * r) / sinHalf];
  });
}

/** A hairline rule. */
export function rule(x, y, w, o = {}) {
  return box(x, y, w, o.h ?? 2, { r: 1, fill: o.fill ?? line });
}

// Layout helpers — for composing without hand-computing every coordinate.

/** Flatten arbitrarily-nested element arrays, dropping null/false/undefined. */
export function flatten(els) {
  const out = [];
  const walk = (v) => {
    if (v == null || v === false) return;
    if (Array.isArray(v)) return v.forEach(walk);
    out.push(v);
  };

  walk(els);
  return out;
}

/** Translate a group of elements by (dx, dy). */
export function at(dx, dy, els) {
  return flatten(els).map((e) => {
    if (e.k === "rect") return { ...e, x: e.x + num(dx), y: e.y + num(dy) };
    if (e.k === "circle") return { ...e, cx: e.cx + num(dx), cy: e.cy + num(dy) };
    return { ...e, pts: e.pts.map(([x, y]) => [x + num(dx), y + num(dy)]) };
  });
}

/** `repeat(3, i => …)` — build n groups, index-aware. */
export function repeat(n, fn) {
  return Array.from({ length: n }, (_, i) => fn(i));
}

/** The bounding box of a group of elements (stroke-agnostic, matching how bands are measured). */
export function bounds(els) {
  const list = flatten(els);

  if (!list.length) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (const e of list) {
    if (e.k === "rect") {
      x0 = Math.min(x0, e.x);
      y0 = Math.min(y0, e.y);
      x1 = Math.max(x1, e.x + e.w);
      y1 = Math.max(y1, e.y + e.h);
    } else if (e.k === "circle") {
      x0 = Math.min(x0, e.cx - e.r);
      y0 = Math.min(y0, e.cy - e.r);
      x1 = Math.max(x1, e.cx + e.r);
      y1 = Math.max(y1, e.cy + e.r);
    } else {
      for (const [x, y] of e.pts) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

/**
 * Stack groups vertically from (x, y), each offset by the previous group's
 * height plus `gap`. Groups keep their own internal x positions.
 */
export function stackY(x, y, gap, groups) {
  const out = [];
  let cy = y;

  for (const group of groups) {
    const g = flatten(group);

    if (!g.length) continue;
    const b = bounds(g);

    out.push(at(x - b.x0, cy - b.y0, g));
    cy += b.h + gap;
  }
  return out;
}

/** Lay groups out horizontally from (x, y), top-aligned. */
export function rowX(x, y, gap, groups) {
  const out = [];
  let cx = x;

  for (const group of groups) {
    const g = flatten(group);

    if (!g.length) continue;
    const b = bounds(g);

    out.push(at(cx - b.x0, y - b.y0, g));
    cx += b.w + gap;
  }
  return out;
}

/** Even columns: `columns(x, 4, 293, i => …)` places group i at x + i * pitch. */
export function columns(x, count, pitch, fn) {
  return repeat(count, (i) => at(x + i * pitch, 0, fn(i)));
}

/** Centre a group horizontally on `cx` (leaves y alone). */
export function centerX(cx, els) {
  const g = flatten(els);
  const b = bounds(g);

  return b ? at(cx - (b.x0 + b.x1) / 2, 0, g) : g;
}

/**
 * A column of body-copy bars with explicit per-line widths — the ragged right
 * edge is what makes a text block read as prose rather than a table.
 *
 * @param {number[]} widths One entry per line.
 * @param {object} [o] { size = "body", gap = 12 (leading between bars), fill,
 *   align = "left"|"center", within }
 */
export function lines(x, y, widths, o = {}) {
  const size = o.size ?? "body";
  const step = TYPE[size] + (o.gap ?? 12);
  const within = o.within ?? Math.max(...widths);

  return widths.map((w, i) => {
    const dx = o.align === "center" ? Math.round((within - w) / 2) : 0;

    return bar(x + dx, y + i * step, w, size, { fill: o.fill });
  });
}

// Composites. These carry the system's weights, radii and insets so a recipe
// does not have to remember them.

/**
 * A button. `ink` is the filled brand primary; `ghost` is an outlined control.
 * The inner label bar is centred automatically — `micro` in a short button,
 * `body` in a tall one, since an 8px bar disappears inside a 76px pill.
 *
 * @param {object} [o] { variant: "ink"|"ghost", label, labelSize, r }
 */
export function pill(x, y, w, h, o = {}) {
  const variant = o.variant ?? "ink";
  const labelSize = o.labelSize ?? (h >= 56 ? "body" : "micro");
  const labelW = o.label ?? Math.min(Math.round(w * 0.45), 112);
  const lh = TYPE[labelSize];
  const shell =
    variant === "ink"
      ? box(x, y, w, h, { r: o.r ?? R.box, fill: ink })
      : box(x, y, w, h, { r: o.r ?? R.box, fill: paper, stroke: glyph, sw: STROKE.control });

  return [
    shell,
    bar(x + Math.round((w - labelW) / 2), y + Math.round((h - lh) / 2), labelW, labelSize, {
      fill: variant === "ink" ? onInk : body,
    }),
  ];
}

/** A form field: paper plate, `field`-weight glyph outline. */
export function field(x, y, w, h, o = {}) {
  return box(x, y, w, h, {
    r: o.r ?? R.box,
    fill: o.fill ?? paper,
    stroke: o.stroke ?? glyph,
    sw: o.sw ?? STROKE.field,
    dash: o.dash,
  });
}

/** A bordered content plate: paper with a `line` hairline. Accordion rows, modals, FAQ items. */
export function plate(x, y, w, h, o = {}) {
  return box(x, y, w, h, {
    r: o.r ?? R.box,
    fill: o.fill ?? paper,
    stroke: o.stroke ?? line,
    sw: o.sw ?? STROKE.control,
  });
}

/** A filled media / card surface. No glyph — add `photoGlyph` or `playDisc` on top. */
export function media(x, y, w, h, o = {}) {
  return box(x, y, w, h, { r: o.r ?? R.box, fill: o.fill ?? surface, stroke: o.stroke, sw: o.sw });
}

/** The sun disc of a photo placeholder. */
export function sun(cx, cy, r, o = {}) {
  return dot(cx, cy, r, { fill: o.fill ?? glyph });
}

/** One mountain of a photo placeholder: base from x1..x2 at yBase, apex at (xApex, yApex). */
export function peak(x1, x2, xApex, yBase, yApex, o = {}) {
  return poly(
    [
      [x1, yBase],
      [xApex, yApex],
      [x2, yBase],
    ],
    { fill: o.fill ?? glyph, round: o.round ?? Math.max(4, Math.round((yBase - yApex) * 0.08)) }
  );
}

/**
 * The default photo placeholder glyph — sun plus two overlapping peaks, sized
 * proportionally to the media box. Use this when authoring a NEW preview; the
 * shipped set mostly carries hand-tuned `sun`/`peak` calls instead.
 */
export function photoGlyph(x, y, w, h, o = {}) {
  const fill = o.fill ?? glyph;
  const baseY = y + h * 0.78;

  return [
    sun(x + w * 0.7, y + h * 0.32, Math.max(6, Math.min(w, h) * 0.06), { fill }),
    peak(x + w * 0.18, x + w * 0.6, x + w * 0.42, baseY, y + h * 0.5, { fill }),
    peak(x + w * 0.45, x + w * 0.86, x + w * 0.66, baseY, y + h * 0.56, { fill }),
  ];
}

/**
 * A play button: filled disc with a paper triangle. `r` drives the triangle,
 * so the two always stay in proportion. The right-of-centre nudge is optical:
 * enough that the triangle doesn't read left-heavy, sized for the rounded tip
 * (which reaches ~0.11r short of the sharp point).
 */
export function playDisc(cx, cy, r, o = {}) {
  const left = cx - (o.back ?? Math.round(r * 0.32));
  const half = o.half ?? Math.round(r * 0.5278);
  const tip = cx + (o.reach ?? Math.round(r * 0.6));

  return [
    dot(cx, cy, r, { fill: o.fill ?? subject }),
    poly(
      [
        [left, cy - half],
        [left, cy + half],
        [tip, cy],
      ],
      { fill: o.tri ?? paper, round: o.round ?? Math.max(3, Math.round(r * 0.11)) }
    ),
  ];
}

/** A downward caret — the "this opens a menu" cue that separates select/date from a text input. */
export function caret(x, y, w, o = {}) {
  const h = o.h ?? Math.round(w * 0.56);

  return poly(
    [
      [x, y],
      [x + w, y],
      [x + w / 2, y + h],
    ],
    { fill: o.fill ?? subject, round: o.round ?? Math.max(2, Math.round(w * 0.12)) }
  );
}

/** A sideways chevron. `dir` is "left" or "right". */
export function chevron(x, y, w, h, dir = "right", o = {}) {
  const pts =
    dir === "right"
      ? [
          [x, y],
          [x, y + h],
          [x + w, y + h / 2],
        ]
      : [
          [x + w, y],
          [x + w, y + h],
          [x, y + h / 2],
        ];

  return poly(pts, { fill: o.fill ?? glyph });
}

/** A round carousel nav button: filled disc with a paper chevron. */
export function navButton(cx, cy, dir, o = {}) {
  const r = o.r ?? 40;
  const half = o.half ?? 18;
  const reach = o.reach ?? 10;
  const stem = o.stem ?? 9;
  const pts =
    dir === "right"
      ? [
          [cx - stem, cy - half],
          [cx - stem, cy + half],
          [cx + reach, cy],
        ]
      : [
          [cx + stem, cy - half],
          [cx + stem, cy + half],
          [cx - reach, cy],
        ];

  return [
    dot(cx, cy, r, { fill: o.fill ?? subject }),
    poly(pts, { fill: o.tri ?? paper, round: o.round ?? Math.max(3, Math.round(r * 0.11)) }),
  ];
}

/** A small square plate — icon tile, social button, avatar stand-in. */
export function tile(x, y, d, o = {}) {
  return box(x, y, d, d, { r: o.r ?? R.box, fill: o.fill ?? surface, stroke: o.stroke, sw: o.sw });
}

/**
 * Four L-shaped crop marks inside a box — the cue that reads as "embedded
 * frame" rather than "photo", which a plain surface rect cannot do.
 */
export function cropCorners(x, y, w, h, o = {}) {
  const inset = o.inset ?? 71;
  const insetY = o.insetY ?? 68;
  const arm = o.arm ?? 115;
  const t = o.thick ?? 12;
  const legT = o.legThick ?? 13;
  const legH = o.legH ?? 110;
  const fill = o.fill ?? subject;
  const l = x + inset;
  const rgt = x + w - inset - arm;
  const top = y + insetY;
  const bot = y + h - insetY - t;
  const armBar = (bx, by) => box(bx, by, arm, t, { r: t / 2, fill });
  const legBar = (bx, by) => box(bx, by, legT, legH, { r: R.box, fill });

  return [
    armBar(l, top),
    legBar(l, top),
    armBar(rgt, top),
    legBar(rgt + arm - legT, top),
    armBar(l, bot),
    legBar(l, bot - legH + t),
    armBar(rgt, bot),
    legBar(rgt + arm - legT, bot - legH + t),
  ];
}

/**
 * Carousel position dots. The active one is an elongated bar rather than a
 * bigger circle — at thumbnail size a size difference between two small discs
 * is invisible, a shape difference is not.
 */
export function dots(cx, cy, count, active = 0, o = {}) {
  const r = o.r ?? 5;
  const gap = o.gap ?? 20;
  const activeW = o.activeW ?? 31;
  const activeH = o.activeH ?? 8;
  const inactive = o.fill ?? glyph;
  const activeFill = o.activeFill ?? subject;
  const widths = repeat(count, (i) => (i === active ? activeW : r * 2));
  const total = widths.reduce((s, w) => s + w, 0) + gap * (count - 1);
  const out = [];
  let x = cx - total / 2;

  for (let i = 0; i < count; i++) {
    if (i === active) {
      out.push(box(x, cy - activeH / 2, activeW, activeH, { r: activeH / 2, fill: activeFill }));
    } else {
      out.push(dot(x + r, cy, r, { fill: inactive }));
    }
    x += widths[i] + gap;
  }
  return out;
}

/** A checkbox / radio mark. `on` fills it with ink. */
export function checkbox(x, y, d, on = false, o = {}) {
  return box(x, y, d, d, { r: o.r ?? 6, fill: on ? ink : (o.fill ?? glyph) });
}

/** A switch: ink track with a paper knob, knob side set by `on`. */
export function toggle(x, y, w, h, on = true, o = {}) {
  const kr = o.knob ?? Math.round(h / 2 - 8);
  const pad = o.pad ?? 8;
  const kx = on ? x + w - kr - pad : x + kr + pad;

  return [
    box(x, y, w, h, { r: h / 2, fill: on ? ink : glyph }),
    dot(kx, y + h / 2, kr, { fill: o.knobFill ?? paper }),
  ];
}

// preview() — the recipe wrapper.

/**
 * Declare a preview.
 *
 * @param {object} spec
 * @param {number} spec.width  Content bounding-box width. Must be one of BANDS
 *   unless `exempt` is set. Asserted against the drawn geometry at build time,
 *   so an edit that drifts off-band fails loudly instead of silently.
 * @param {boolean} [spec.exempt] Opt out of the band check — for a single small
 *   control that would read as distorted stretched to 560.
 * @param {string} [spec.title] Override the derived `<title>` text.
 * @param {Array} spec.draw Nested arrays of elements.
 */
export function preview(spec) {
  if (typeof spec?.width !== "number") {
    throw new Error("preview(): `width` is required (the content bounding-box width)");
  }
  if (!spec.exempt && !BANDS.includes(spec.width)) {
    throw new Error(
      `preview(): width ${spec.width} is not a band (${BANDS.join(" / ")}). ` +
        `Pick a band, or set \`exempt: true\` with a comment saying why.`
    );
  }
  return {
    __preview: true,
    width: spec.width,
    exempt: !!spec.exempt,
    title: spec.title,
    draw: spec.draw,
  };
}

function attrs(pairs) {
  return pairs
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
}

function emit(e) {
  if (e.k === "rect") {
    const r = e.r >= 1 ? Math.round(Math.min(e.r, e.w / 2, e.h / 2)) : null;

    return `<rect ${attrs([
      ["x", e.x],
      ["y", e.y],
      ["width", e.w],
      ["height", e.h],
      ["rx", r],
      ["fill", e.fill],
      ["stroke", e.stroke],
      ["stroke-width", e.sw],
      ["stroke-dasharray", e.dash],
      ["opacity", e.opacity],
    ])}/>`;
  }
  if (e.k === "circle") {
    return `<circle ${attrs([
      ["cx", e.cx],
      ["cy", e.cy],
      ["r", e.r],
      ["fill", e.fill],
      ["stroke", e.stroke],
      ["stroke-width", e.sw],
      ["opacity", e.opacity],
    ])}/>`;
  }
  return `<polygon ${attrs([
    ["points", e.pts.map(([x, y]) => `${x},${y}`).join(" ")],
    ["fill", e.fill],
    ["stroke", e.round ? e.fill : null],
    ["stroke-width", e.round ? e.round * 2 : null],
    ["stroke-linejoin", e.round ? "round" : null],
    ["opacity", e.opacity],
  ])}/>`;
}

/** `hero-split` -> `Hero split`. */
function titleCase(slug) {
  const words = slug.split("-").join(" ");

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The dark-mode block, injected INSIDE every SVG. An external stylesheet cannot
 * reach into an `<img>`-loaded SVG, and CloudCannon loads previews by URL — so
 * this is the only way the set follows the viewer's colour scheme.
 *
 * Scoped to `svg`, deliberately NOT `:root`: `:root` would match the host
 * `<html>` when the same file is inlined, leaking the overrides onto the page.
 */
const DARK_BLOCK = [
  "  <style>",
  "    @media (prefers-color-scheme: dark) {",
  "      svg {",
  ...Object.entries(DARK).map(([k, v]) => `        --pv-${k}: ${v};`),
  "      }",
  "    }",
  "  </style>",
].join("\n");

/**
 * Compile a recipe to an SVG string.
 *
 * @param {object} spec A `preview({...})` result.
 * @param {string} key  The component key, e.g. `page-sections/heroes/hero-split`.
 */
export function compile(spec, key = "preview") {
  if (!spec?.__preview) {
    throw new Error("compile(): recipe default export must be a preview({...}) result");
  }
  const els = flatten(spec.draw);

  if (!els.length) throw new Error("compile(): recipe drew nothing");

  const b = bounds(els);

  if (b.w !== spec.width) {
    throw new Error(
      `compile(): declared width ${spec.width} but the drawn content measures ${b.w} ` +
        `(x ${b.x0}..${b.x1}). Fix the geometry or the declared width.`
    );
  }

  // Centre the drawn box on (640, 360) — recipes never do this arithmetic.
  const dx = Math.round(CX - (b.x0 + b.x1) / 2);
  const dy = Math.round(CY - (b.y0 + b.y1) / 2);

  if (b.x0 + dx < 0 || b.x1 + dx > W || b.y0 + dy < 0 || b.y1 + dy > H) {
    throw new Error(
      `compile(): centred content overflows the ${W}×${H} canvas ` +
        `(content ${b.w}×${b.h}). Shrink the drawing or raise an exempt band.`
    );
  }

  const slug = key.split("/").pop();
  const id = `t-${slug}`;
  const title = `${spec.title ?? titleCase(slug)} component preview`;
  const open = dx === 0 && dy === 0 ? "  <g>" : `  <g transform="translate(${dx} ${dy})">`;

  return [
    // width/height alongside viewBox give the file an intrinsic size, so an
    // <img> reserves the right box before it loads. CSS can still override.
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}">`,
    `  <title id="${id}">${title}</title>`,
    DARK_BLOCK,
    `  <rect x="0" y="0" width="${W}" height="${H}" fill="${paper}"/>`,
    open,
    ...els.map((e) => `    ${emit(e)}`),
    `  </g>`,
    `</svg>`,
    ``,
  ].join("\n");
}
