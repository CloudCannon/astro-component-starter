// Root paint attributes are kept (outline icons would become silhouettes); `fill="currentColor"`
// is added only when the artwork declares no paint anywhere.

export interface NormalizedIcon {
  attributes: Record<string, string>;
  body: string;
}

const ROOT_ELEMENT =
  /^\s*(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b([^>]*?)\s*(?:\/>|>([\s\S]*)<\/svg>)\s*$/;

const ATTRIBUTE = /([^\s=/]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

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

function deriveViewBox(attributes: Record<string, string>): string | null {
  const width = Number.parseFloat(attributes.width);
  const height = Number.parseFloat(attributes.height);

  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

  return `0 0 ${width} ${height}`;
}

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

  // Insertion order is render order.
  const attributes: Record<string, string> = { width: "1em", height: "1em", viewBox };

  for (const [attribute, value] of Object.entries(sourceAttributes)) {
    if (!DROPPED_ROOT_ATTRIBUTES.has(attribute)) attributes[attribute] = value;
  }

  if (!declaresPaint(source)) attributes.fill = "currentColor";

  attributes["aria-hidden"] = "true";
  attributes["data-icon"] = name;

  const body = (root[2] ?? "").replace(/>\s+</g, "><").trim();

  return { attributes, body };
}
