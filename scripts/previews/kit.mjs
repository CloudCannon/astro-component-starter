/**
 * Component-preview kit — the authoring API for `*.preview.mjs` recipe files.
 *
 * A recipe is a small, semantic layout tree (stacks, rows, and primitives like
 * headings/buttons/images). This kit turns that tree into a polished, uniform
 * light-mockup SVG thumbnail, written by `scripts/previews/build.mjs` to
 * `public/component-previews/<component>.svg`.
 *
 * The build is deterministic and browser-free: the same recipe always produces
 * the same SVG, so CI can rebuild and `git diff --exit-code` to catch drift.
 * A real screenshot of the component (see `scripts/previews/screenshot.mjs`) is
 * only an authoring reference — never an input to the output.
 *
 * Design goals:
 *   - Recipes think in layout, not pixels. The engine measures + positions.
 *   - One token set → one global restyle re-skins all previews.
 *   - Everything fits + centers into a single 16:10 canvas, so a picker grid
 *     stays even regardless of how tall a recipe is.
 */

// ---------------------------------------------------------------------------
// Tokens. Colors come from the starter's real default theme (light):
// `--color-brand: var(--gray-12)` is the primary button, so previews use a
// dark neutral pill — faithful to what the default components actually render.
// Softened one step to gray-11 so pure black doesn't dominate a tiny thumbnail.
// ---------------------------------------------------------------------------

export const T = {
  // Canvas — uniform 16:10 landscape.
  W: 1280,
  H: 800,
  // How much breathing room to leave around fitted content, in canvas px.
  margin: 64,

  radius: 8,
  radiusPill: 999,

  // Surfaces
  page: "#f4f3f0", // letterbox bars / behind the section
  frame: "#ffffff", // the section surface
  frameAlt: "#faf9f7", // a subtly-tinted section (e.g. "surface"/"muted" bg)
  border: "#e7e5e0",
  borderStrong: "#d9d6cf",

  // Text bars — heading is visibly stronger than body copy.
  heading: "#c2beb5",
  text: "#dcd9d2",
  eyebrow: "#d0ccc3",

  // Brand primary (from --color-brand / gray-12, softened to gray-11).
  primary: "#151515",
  primaryOn: "#ffffff", // a faint bar drawn inside a primary pill
  // Secondary / ghost control.
  control: "#ffffff",
  controlBorder: "#cfccc4",

  // Media / image placeholder.
  media: "#e8e6e0",
  mediaGlyph: "#cbc7bf",

  // Accent seam — intentionally UNUSED by the default kit. The default brand is
  // a dark neutral, so nothing here is colored. If you want a colored preset
  // baked into previews, set primary/eyebrow to an accent and rebuild all SVGs.
  accent: "#2563eb",
};

// Default intrinsic sizes for primitives (canvas px). Recipes override via props.
const D = {
  headingH: 28,
  textH: 12,
  textGap: 12,
  eyebrowH: 12,
  eyebrowW: 120,
  buttonW: 128,
  buttonH: 44,
  chipW: 72,
  chipH: 24,
  avatar: 48,
  iconD: 40,
  imageW: 520,
  imageH: 320,
  cardPad: 28,
};

// ---------------------------------------------------------------------------
// Node constructors. Each returns a plain object the engine measures + lays out.
//
// Leaf nodes carry an intrinsic { w, h }. Container nodes (stack/row/grid/card/
// frame) compute their size from children + gap + pad. `align`/`justify` follow
// flexbox naming. Any node may set `w`/`h`/`grow` to override.
// ---------------------------------------------------------------------------

/** @param {object} props @param {string} type */
function node(type, props = {}, children = []) {
  return { type, ...props, children };
}

/** Root section surface. Fills the canvas; centers its single child subtree. */
export function frame(childOrProps, maybeChild) {
  const [props, child] = isNode(childOrProps)
    ? [{}, childOrProps]
    : [childOrProps ?? {}, maybeChild];

  return node("frame", { bg: props.bg ?? T.frame, pad: props.pad ?? T.margin }, toArray(child));
}

/** Vertical layout. props: { gap, align: start|center|end|stretch, pad } */
export function stack(props = {}, children = []) {
  const [p, kids] = normalizeContainer(props, children);

  return node(
    "stack",
    { gap: p.gap ?? 20, align: p.align ?? "start", pad: p.pad ?? 0, w: p.w, h: p.h },
    kids
  );
}

/** Horizontal layout. props: { gap, justify: start|center|end|between, align } */
export function row(props = {}, children = []) {
  const [p, kids] = normalizeContainer(props, children);

  return node(
    "row",
    {
      gap: p.gap ?? 16,
      justify: p.justify ?? "start",
      align: p.align ?? "center",
      pad: p.pad ?? 0,
      w: p.w,
      h: p.h,
    },
    kids
  );
}

/** Uniform grid. props: { cols, gap, cell: () => node | node, rows } */
export function grid(props = {}) {
  const cols = props.cols ?? 3;
  const rows = props.rows ?? 1;
  const gap = props.gap ?? 20;
  const cells = [];

  for (let i = 0; i < cols * rows; i++) {
    cells.push(typeof props.cell === "function" ? props.cell(i) : cloneNode(props.cell));
  }
  return node("grid", { cols, rows, gap, w: props.w }, cells);
}

/** Bordered surface with padding — a card. props: { pad, w, bg, align, gap } */
export function card(props = {}, children = []) {
  const [p, kids] = normalizeContainer(props, children);

  return node(
    "card",
    {
      pad: p.pad ?? D.cardPad,
      gap: p.gap ?? 16,
      align: p.align ?? "start",
      bg: p.bg ?? T.frame,
      // Form controls pass `border: T.controlBorder` — the default card border is
      // deliberately faint for content cards, but too faint to read as an input
      // box at picker-thumbnail size.
      border: p.border ?? T.border,
      w: p.w,
      h: p.h,
    },
    kids
  );
}

/** Strong text bar (a title). props: { w, h } */
export function heading(props = {}) {
  return node("bar", {
    fill: T.heading,
    w: props.w ?? 360,
    h: props.h ?? D.headingH,
    r: (props.h ?? D.headingH) / 2,
  });
}

/** Short muted bar above a heading. props: { w } */
export function eyebrow(props = {}) {
  return node("bar", {
    fill: T.eyebrow,
    w: props.w ?? D.eyebrowW,
    h: D.eyebrowH,
    r: D.eyebrowH / 2,
  });
}

/** One or more body-copy line bars. props: { lines, w, gap, last, align } (last = width of final line, 0-1). */
export function text(props = {}) {
  const lines = props.lines ?? 3;
  const w = props.w ?? 480;
  const gap = props.gap ?? D.textGap;
  const last = props.last ?? 0.6;
  const align = props.align ?? "start";
  const kids = [];

  for (let i = 0; i < lines; i++) {
    const lineW = i === lines - 1 && lines > 1 ? Math.round(w * last) : w;

    kids.push(node("bar", { fill: props.fill ?? T.text, w: lineW, h: D.textH, r: D.textH / 2 }));
  }
  return node("stack", { gap, align, pad: 0, w, children: kids }, kids);
}

/** Button pill. props: { w, variant: primary|ghost, h } */
export function button(props = {}) {
  const variant = props.variant ?? "primary";
  const w = props.w ?? D.buttonW;
  const h = props.h ?? D.buttonH;

  return node("button", { variant, w, h, r: T.radius });
}

/** Media / image placeholder. props: { w, h, r, play } — `play: true` draws a play button (video) instead of the mountain glyph. */
export function image(props = {}) {
  return node("image", {
    w: props.w ?? D.imageW,
    h: props.h ?? D.imageH,
    r: props.r ?? T.radius,
    play: props.play ?? false,
  });
}

/** Circular avatar. props: { d, fill } — form recipes pass a dark `fill` for control knobs. */
export function avatar(props = {}) {
  const d = props.d ?? D.avatar;

  return node("circle", { fill: props.fill ?? T.media, d });
}

/** Small pill (tag/badge). props: { w } */
export function chip(props = {}) {
  return node("bar", {
    fill: T.frameAlt,
    stroke: T.border,
    w: props.w ?? D.chipW,
    h: D.chipH,
    r: D.chipH / 2,
  });
}

/** Square-ish icon tile. props: { d, fill } */
export function icon(props = {}) {
  const d = props.d ?? D.iconD;

  return node("bar", { fill: props.fill ?? T.media, w: d, h: d, r: T.radius });
}

/** Fixed empty gap along the parent's main axis. props: { size } */
export function spacer(props = {}) {
  return node("spacer", { w: props.size ?? 24, h: props.size ?? 24 });
}

/** Horizontal rule. props: { w, h, fill } — a thicker `h` doubles as a slider track. */
export function divider(props = {}) {
  const h = props.h ?? 2;

  return node("bar", { fill: props.fill ?? T.border, w: props.w ?? 480, h, r: h / 2 });
}

/**
 * Small downward chevron — the cue that reads unmistakably as "this control
 * opens a menu". Distinguishes select/date from a plain text input, which are
 * otherwise the same silhouette. props: { w, fill }
 */
export function caret(props = {}) {
  const w = props.w ?? 18;

  return node("caret", { w, h: Math.round(w * 0.6), fill: props.fill ?? T.controlBorder });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNode(v) {
  return v && typeof v === "object" && typeof v.type === "string";
}
function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v];
}
function normalizeContainer(props, children) {
  // Support stack({gap}, [..]) and stack([..]) and stack({children:[..]}).
  if (Array.isArray(props)) return [{}, props.filter(Boolean)];
  const kids = toArray(children.length ? children : props.children);

  return [props, kids];
}
function cloneNode(n) {
  return JSON.parse(JSON.stringify(n));
}

// ---------------------------------------------------------------------------
// Measure — assign intrinsic { mw, mh } (measured width/height) to every node,
// bottom-up.
// ---------------------------------------------------------------------------

function measure(n) {
  switch (n.type) {
    case "bar":
    case "button":
    case "caret":
    case "image":
    case "spacer": {
      n.mw = n.w;
      n.mh = n.h;
      return n;
    }
    case "circle": {
      n.mw = n.d;
      n.mh = n.d;
      return n;
    }
    case "frame": {
      n.children.forEach(measure);
      n.mw = T.W;
      n.mh = T.H;
      return n;
    }
    case "stack":
    case "card": {
      n.children.forEach(measure);
      const pad = n.pad ?? 0;
      const gap = n.gap ?? 0;
      const contentW = Math.max(0, ...n.children.map((c) => c.mw));
      const contentH =
        n.children.reduce((sum, c) => sum + c.mh, 0) + gap * Math.max(0, n.children.length - 1);

      n.mw = (n.w ?? contentW) + pad * 2;
      n.mh = (n.h ?? contentH) + pad * 2;
      n._contentW = contentW;
      return n;
    }
    case "row": {
      n.children.forEach(measure);
      const pad = n.pad ?? 0;
      const gap = n.gap ?? 0;
      const contentW =
        n.children.reduce((sum, c) => sum + c.mw, 0) + gap * Math.max(0, n.children.length - 1);
      const contentH = Math.max(0, ...n.children.map((c) => c.mh));

      n.mw = (n.w ?? contentW) + pad * 2;
      n.mh = (n.h ?? contentH) + pad * 2;
      return n;
    }
    case "grid": {
      n.children.forEach(measure);
      const cellW = Math.max(0, ...n.children.map((c) => c.mw));
      const cellH = Math.max(0, ...n.children.map((c) => c.mh));

      n._cellW = cellW;
      n._cellH = cellH;
      n.mw = n.w ?? cellW * n.cols + n.gap * (n.cols - 1);
      n.mh = cellH * n.rows + n.gap * (n.rows - 1);
      return n;
    }
    default:
      n.mw = n.mw ?? 0;
      n.mh = n.mh ?? 0;
      return n;
  }
}

// ---------------------------------------------------------------------------
// Position — assign absolute { x, y, w, h } given a box to fill.
// ---------------------------------------------------------------------------

function alignOffset(mode, extra) {
  if (mode === "center") return extra / 2;
  if (mode === "end") return extra;
  return 0; // start / stretch
}

function place(n, x, y, boxW, boxH) {
  n.x = x;
  n.y = y;
  n.w = n.mw;
  n.h = n.mh;

  switch (n.type) {
    case "frame": {
      // Fit the (single) child subtree into the canvas minus margins, centered.
      const child = n.children[0];

      if (!child) return;
      const availW = T.W - n.pad * 2;
      const availH = T.H - n.pad * 2;
      const scale = Math.min(1, availW / child.mw, availH / child.mh);

      n._scale = scale;
      const sw = child.mw * scale;
      const sh = child.mh * scale;

      n._childX = (T.W - sw) / 2;
      n._childY = (T.H - sh) / 2;
      // Position the child in its own unscaled coordinate space; the emitter
      // wraps it in a <g transform> that scales + translates.
      place(child, 0, 0, child.mw, child.mh);
      return;
    }
    case "stack":
    case "card": {
      const pad = n.pad ?? 0;
      const gap = n.gap ?? 0;
      const innerX = x + pad;
      let cy = y + pad;
      const innerW = n.w - pad * 2;

      for (const c of n.children) {
        const extra = innerW - c.mw;
        const cx = innerX + (n.align === "stretch" ? 0 : alignOffset(n.align, extra));
        const cw = n.align === "stretch" ? innerW : c.mw;

        if (n.align === "stretch") c.mw = cw;
        place(c, cx, cy, cw, c.mh);
        cy += c.mh + gap;
      }
      return;
    }
    case "row": {
      const pad = n.pad ?? 0;
      const gap = n.gap ?? 0;
      const innerX = x + pad;
      const innerY = y + pad;
      const innerW = n.w - pad * 2;
      const innerH = n.h - pad * 2;
      const childrenW =
        n.children.reduce((s, c) => s + c.mw, 0) + gap * Math.max(0, n.children.length - 1);
      let cx =
        innerX + alignOffset(n.justify === "between" ? "start" : n.justify, innerW - childrenW);
      const between =
        n.justify === "between" && n.children.length > 1
          ? (innerW - n.children.reduce((s, c) => s + c.mw, 0)) / (n.children.length - 1)
          : gap;

      for (const c of n.children) {
        const cy = innerY + alignOffset(n.align, innerH - c.mh);

        place(c, cx, cy, c.mw, c.mh);
        cx += c.mw + between;
      }
      return;
    }
    case "grid": {
      const { cols, gap } = n;
      const cellW = n._cellW;
      const cellH = n._cellH;

      n.children.forEach((c, i) => {
        const col = i % cols;
        const rowI = Math.floor(i / cols);
        const cx = x + col * (cellW + gap) + alignOffset("center", cellW - c.mw);
        const cy = y + rowI * (cellH + gap) + alignOffset("center", cellH - c.mh);

        place(c, cx, cy, c.mw, c.mh);
      });
      return;
    }
    default:
      return;
  }
}

// ---------------------------------------------------------------------------
// Emit — walk the positioned tree, produce SVG rects.
// ---------------------------------------------------------------------------

function rnd(v) {
  return Math.round(v);
}

function rect(x, y, w, h, fill, r, stroke) {
  const attrs = [
    `x="${rnd(x)}"`,
    `y="${rnd(y)}"`,
    `width="${rnd(w)}"`,
    `height="${rnd(h)}"`,
    r >= 1 ? `rx="${rnd(Math.min(r, w / 2, h / 2))}"` : null,
    `fill="${fill}"`,
    stroke ? `stroke="${stroke}"` : null,
  ].filter(Boolean);

  return `<rect ${attrs.join(" ")}/>`;
}

function emit(n, out) {
  switch (n.type) {
    case "frame": {
      // Section surface fills the whole canvas.
      out.push(`  ${rect(0, 0, T.W, T.H, n.bg, 0, null)}`);
      const child = n.children[0];

      if (!child) return;
      const s = n._scale ?? 1;
      const inner = [];

      emit(child, inner);
      out.push(
        `  <g transform="translate(${rnd(n._childX)} ${rnd(n._childY)}) scale(${s.toFixed(4)})">`
      );
      inner.forEach((line) => out.push(`  ${line}`));
      out.push(`  </g>`);
      return;
    }
    case "stack":
    case "row": {
      n.children.forEach((c) => emit(c, out));
      return;
    }
    case "card": {
      out.push(`  ${rect(n.x, n.y, n.w, n.h, n.bg, T.radius, n.border ?? T.border)}`);
      n.children.forEach((c) => emit(c, out));
      return;
    }
    case "grid": {
      n.children.forEach((c) => emit(c, out));
      return;
    }
    case "bar": {
      out.push(`  ${rect(n.x, n.y, n.w, n.h, n.fill, n.r ?? 0, n.stroke ?? null)}`);
      return;
    }
    case "caret": {
      const points = [
        `${rnd(n.x)},${rnd(n.y)}`,
        `${rnd(n.x + n.w)},${rnd(n.y)}`,
        `${rnd(n.x + n.w / 2)},${rnd(n.y + n.h)}`,
      ].join(" ");

      out.push(`  <polygon points="${points}" fill="${n.fill}"/>`);
      return;
    }
    case "circle": {
      out.push(
        `  <circle cx="${rnd(n.x + n.d / 2)}" cy="${rnd(n.y + n.d / 2)}" r="${rnd(n.d / 2)}" fill="${n.fill}"/>`
      );
      return;
    }
    case "button": {
      const fill = n.variant === "primary" ? T.primary : T.control;
      const stroke = n.variant === "primary" ? null : T.controlBorder;

      out.push(`  ${rect(n.x, n.y, n.w, n.h, fill, n.r ?? T.radius, stroke)}`);
      // Faint label bar inside the pill.
      const lw = Math.min(n.w * 0.5, 64);
      const lh = 8;
      const labelFill = n.variant === "primary" ? "#5a5a5a" : T.text;

      out.push(
        `  ${rect(n.x + (n.w - lw) / 2, n.y + (n.h - lh) / 2, lw, lh, labelFill, lh / 2, null)}`
      );
      return;
    }
    case "image": {
      out.push(`  ${rect(n.x, n.y, n.w, n.h, T.media, n.r ?? T.radius, null)}`);
      const gx = n.x;
      const gy = n.y;
      const gw = n.w;
      const gh = n.h;

      if (n.play) {
        // Centered play button: darker disc + white triangle.
        const cx = gx + gw / 2;
        const cy = gy + gh / 2;
        const pr = Math.max(16, Math.min(gw, gh) * 0.14);
        const t = pr * 0.5;
        const tri = `${rnd(cx - t * 0.55)},${rnd(cy - t)} ${rnd(cx - t * 0.55)},${rnd(cy + t)} ${rnd(cx + t * 0.9)},${rnd(cy)}`;

        out.push(`  <circle cx="${rnd(cx)}" cy="${rnd(cy)}" r="${rnd(pr)}" fill="#a8a39a"/>`);
        out.push(`  <polygon points="${tri}" fill="#ffffff"/>`);
        return;
      }
      // Simple mountain + sun glyph, centered in the lower portion.
      const sunR = Math.max(6, Math.min(gw, gh) * 0.06);
      const sunCx = gx + gw * 0.7;
      const sunCy = gy + gh * 0.32;
      const baseY = gy + gh * 0.78;
      const p1 = `${rnd(gx + gw * 0.18)},${rnd(baseY)} ${rnd(gx + gw * 0.42)},${rnd(gy + gh * 0.5)} ${rnd(gx + gw * 0.6)},${rnd(baseY)}`;
      const p2 = `${rnd(gx + gw * 0.45)},${rnd(baseY)} ${rnd(gx + gw * 0.66)},${rnd(gy + gh * 0.56)} ${rnd(gx + gw * 0.86)},${rnd(baseY)}`;

      out.push(
        `  <circle cx="${rnd(sunCx)}" cy="${rnd(sunCy)}" r="${rnd(sunR)}" fill="${T.mediaGlyph}"/>`
      );
      out.push(`  <polygon points="${p1}" fill="${T.mediaGlyph}"/>`);
      out.push(`  <polygon points="${p2}" fill="${T.mediaGlyph}"/>`);
      return;
    }
    case "spacer":
      return;
    default:
      return;
  }
}

// ---------------------------------------------------------------------------
// Public: compile a recipe tree to an SVG string.
// ---------------------------------------------------------------------------

/** @param {object} tree A `frame(...)` root (or any node — wrapped in a frame). */
export function compile(tree) {
  const root = tree.type === "frame" ? tree : frame(tree);

  measure(root);
  place(root, 0, 0, T.W, T.H);
  const out = [];

  emit(root, out);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T.W} ${T.H}">`,
    ...out,
    `</svg>`,
    ``,
  ].join("\n");
}
