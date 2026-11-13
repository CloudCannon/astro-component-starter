import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { kebab } from "./fonts.js";

// Reads `unicode-range` from the per-weight stylesheet (`400.css`); the per-subset
// file (`latin-400.css`) has none.

const require = createRequire(import.meta.url);

const FONT_FACE_SRC = /files\/([^)"']+\.woff2)/;
const UNICODE_RANGE = /unicode-range:\s*([^;}]+)/;

interface Range {
  from: number;
  to: number;
}

function parseUnicodeRange(value: string): Range[] {
  const ranges: Range[] = [];

  for (const token of value.split(",")) {
    const cleaned = token.trim().replace(/^U\+/i, "");

    if (!cleaned) continue;

    if (cleaned.includes("-")) {
      const [from, to] = cleaned.split("-").map((hex) => Number.parseInt(hex, 16));

      if (Number.isFinite(from) && Number.isFinite(to)) ranges.push({ from, to });
      continue;
    }

    if (cleaned.includes("?")) {
      const from = Number.parseInt(cleaned.replaceAll("?", "0"), 16);
      const to = Number.parseInt(cleaned.replaceAll("?", "F"), 16);

      if (Number.isFinite(from) && Number.isFinite(to)) ranges.push({ from, to });
      continue;
    }

    const single = Number.parseInt(cleaned, 16);

    if (Number.isFinite(single)) ranges.push({ from: single, to: single });
  }

  return ranges;
}

export function fontsourceCoverage(family: string, weight: number, subset = "latin"): Range[] {
  const slug = kebab(family);
  const wanted = `${slug}-${subset}-${weight}-normal.woff2`;

  let css: string;

  try {
    css = readFileSync(require.resolve(`@fontsource/${slug}/${weight}.css`), "utf8");
  } catch {
    return [];
  }

  for (const block of css.split("@font-face").slice(1)) {
    if (block.match(FONT_FACE_SRC)?.[1] !== wanted) continue;

    const range = block.match(UNICODE_RANGE)?.[1];

    return range ? parseUnicodeRange(range) : [];
  }

  return [];
}

const covers = (ranges: Range[], codepoint: number) =>
  ranges.some(({ from, to }) => codepoint >= from && codepoint <= to);

// Covered by the vendored COLR font.
function isEmojiOrSymbol(codepoint: number): boolean {
  return (
    (codepoint >= 0x1f000 && codepoint <= 0x1ffff) ||
    (codepoint >= 0x2600 && codepoint <= 0x27bf) ||
    (codepoint >= 0x2b00 && codepoint <= 0x2bff) ||
    (codepoint >= 0xe0000 && codepoint <= 0xe007f) ||
    (codepoint >= 0xfe00 && codepoint <= 0xfe0f) ||
    codepoint === 0x200d ||
    codepoint === 0x20e3
  );
}

export interface CoverageReport {
  missing: string[];
}

export function uncoveredCharacters(texts: string[], ranges: Range[]): CoverageReport {
  const missing = new Set<string>();

  for (const text of texts) {
    for (const character of text) {
      const codepoint = character.codePointAt(0);

      if (codepoint === undefined) continue;
      if (codepoint < 0x20 || isEmojiOrSymbol(codepoint)) continue;
      if (covers(ranges, codepoint)) continue;

      missing.add(character);
    }
  }

  return { missing: [...missing] };
}

export function coverageWarning(missing: string[]): string {
  const shown = missing.slice(0, 12).join(" ");
  const more = missing.length > 12 ? ` (+${missing.length - 12} more)` : "";
  const points = missing
    .slice(0, 12)
    .map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`)
    .join(" ");

  return (
    `[og] Share-card text uses characters the registered fonts do not cover: ${shown}${more} ` +
    `(${points}). Those render as empty boxes. Install a font with the coverage — e.g. ` +
    `"npm i @fontsource/noto-sans-jp" for Japanese — and register it in src/utils/og/fonts.ts ` +
    `with a unique name and a shared subsetOf.`
  );
}
