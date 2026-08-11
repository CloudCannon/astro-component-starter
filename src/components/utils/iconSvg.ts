/**
 * Normalize a raw SVG file into the pieces `Icon.astro` renders:
 *
 *   - sized `1em` square, so Icon's `.size-*` scale can drive it with font-size
 *   - the source's own `width`/`height` dropped, so it can't force a pixel size
 *   - root paint attributes kept, so outline icons don't become silhouettes
 *   - `fill="currentColor"` when the artwork declares no paint of its own
 */

export interface NormalizedIcon {
  /** Attributes for the emitted root `<svg>`, in render order. */
  attributes: Record<string, string>;
  /** The artwork, to be injected with `set:html`. */
  body: string;
}

/** The root `<svg>` and its contents, after an optional prolog and comments. */
const ROOT_ELEMENT =
  /^\s*(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b([^>]*?)\s*(?:\/>|>([\s\S]*)<\/svg>)\s*$/;

const ATTRIBUTE = /([^\s=/]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * Root attributes replaced or dropped below: sizing is re-derived, `xmlns` is
 * implicit inline, `aria-hidden` is re-added as policy, and the rest is export
 * residue.
 */
const DROPPED_ROOT_ATTRIBUTES = new Set([
  "xmlns",
  "xmlns:xlink",
  "width",
  "height",
  "viewBox",
  "aria-hidden",
  "data-slot",
  "class",
  "id",
]);

/**
 * Whether the artwork paints itself anywhere — including on a child, and not
 * counting `fill-rule` / `stroke-width`.
 */
function declaresPaint(source: string): boolean {
  return /\b(?:fill|stroke)\s*=/.test(source);
}

function parseAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const match of raw.matchAll(ATTRIBUTE)) {
    attributes[match[1]] = match[2] ?? match[3] ?? "";
  }

  return attributes;
}

/**
 * Reconstruct a `viewBox` from the declared dimensions. Without one the 1em
 * sizing has nothing to scale against and the icon renders clipped.
 */
function deriveViewBox(attributes: Record<string, string>): string | null {
  const width = Number.parseFloat(attributes.width);
  const height = Number.parseFloat(attributes.height);

  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

  return `0 0 ${width} ${height}`;
}

/**
 * @param source the contents of an `.svg` file.
 * @param name the icon's id, used for `data-icon` and in error messages.
 */
export function normalizeIconSvg(source: string, name: string): NormalizedIcon {
  const root = ROOT_ELEMENT.exec(source);

  if (!root) {
    throw new Error(`Icon "${name}" is not a single parseable <svg> document.`);
  }

  const sourceAttributes = parseAttributes(root[1]);
  const viewBox = sourceAttributes.viewBox ?? deriveViewBox(sourceAttributes);

  if (!viewBox) {
    throw new Error(
      `Icon "${name}" has neither a viewBox nor numeric width/height, so it cannot be scaled.`
    );
  }

  // Insertion order is render order: sizing, the artwork's own paint, then ours.
  const attributes: Record<string, string> = { width: "1em", height: "1em", viewBox };

  for (const [attribute, value] of Object.entries(sourceAttributes)) {
    if (!DROPPED_ROOT_ATTRIBUTES.has(attribute)) attributes[attribute] = value;
  }

  if (!declaresPaint(source)) attributes.fill = "currentColor";

  // Icons are decorative here; call sites label the surrounding control.
  attributes["aria-hidden"] = "true";
  attributes["data-icon"] = name;

  // Whitespace between elements is insignificant in SVG, so collapse it.
  const body = (root[2] ?? "").replace(/>\s+</g, "><").trim();

  return { attributes, body };
}
