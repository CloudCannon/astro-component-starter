import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { siteFonts } from "../../../site-fonts.mjs";

/**
 * Fonts for the share cards, derived from `site-fonts.mjs` so swapping the site
 * typeface swaps the card typeface.
 *
 * Two Takumi behaviours make this file fussier than it looks, and both fail
 * silently:
 *
 *   - A weight with no registered face gets SYNTHETIC bold of the nearest face,
 *     not an error. So the weights here must be exactly the ones
 *     `template.ts` asks for.
 *   - Several files registered under one `name` at one weight overwrite each
 *     other. A coverage subset needs a unique `name` plus a shared `subsetOf`,
 *     which `font-family: <subsetOf>` then expands across.
 */

const require = createRequire(import.meta.url);

/** Weights the card template uses. Changing one means changing the template. */
export const BODY_WEIGHT = 400;
export const BODY_STRONG_WEIGHT = 600;
export const HEADING_WEIGHT = 700;

export const EMOJI_FAMILY = "CardEmoji";

/**
 * Resolved against the project root, not `import.meta.url`: Vite bundles this
 * module into `dist/.prerender/`, so a module-relative path points at a
 * directory the font was never copied to. Must track the file's real location.
 */
const EMOJI_FONT_PATH = "src/utils/og/fonts/twemoji.woff2";

export interface CardFont {
  name: string;
  data: Buffer;
  weight: number;
  subsetOf?: string;
  generic?: "emoji";
}

export interface CardFontFamilies {
  /** Family name for headings, from the `--font-headings` entry. */
  heading: string;
  /** Family name for body copy, from the `--font-body` entry. */
  body: string;
}

const kebab = (name: string) => name.trim().toLowerCase().replace(/\s+/g, "-");

function familyFor(cssVariable: string): string {
  const entry = siteFonts.find((font) => font.cssVariable === cssVariable);

  if (!entry) {
    throw new Error(
      `[og] site-fonts.mjs has no entry for "${cssVariable}". Share cards read the ` +
        `families registered there; add one or remove the card role that needs it.`
    );
  }

  return entry.name;
}

/**
 * Fontsource path for one static face. The card renderer needs real bytes, so
 * it cannot use the variable-weight files Astro's font pipeline prefers.
 */
function fontsourceFace(family: string, weight: number): Buffer {
  const slug = kebab(family);
  const specifier = `@fontsource/${slug}/files/${slug}-latin-${weight}-normal.woff2`;

  try {
    return readFileSync(require.resolve(specifier));
  } catch {
    throw new Error(
      `[og] Share cards need ${family} ${weight} but ${specifier} is not installed. ` +
        `Run "npm i @fontsource/${slug}" (then "npm run deps:sync"), or change the ` +
        `family in site-fonts.mjs. Without it the text renders in a fallback face.`
    );
  }
}

export function cardFontFamilies(): CardFontFamilies {
  return {
    heading: familyFor("--font-headings"),
    body: familyFor("--font-body"),
  };
}

export function cardFonts(root: string): CardFont[] {
  const { heading, body } = cardFontFamilies();

  return [
    { name: body, data: fontsourceFace(body, BODY_WEIGHT), weight: BODY_WEIGHT },
    { name: body, data: fontsourceFace(body, BODY_STRONG_WEIGHT), weight: BODY_STRONG_WEIGHT },
    { name: heading, data: fontsourceFace(heading, HEADING_WEIGHT), weight: HEADING_WEIGHT },
    // Last, so it only serves codepoints the text faces do not cover. COLR, not
    // a bitmap font: Takumi silently draws nothing for CBDT/CBLC.
    {
      name: `${EMOJI_FAMILY}-twemoji`,
      data: readFileSync(path.join(root, EMOJI_FONT_PATH)),
      weight: BODY_WEIGHT,
      subsetOf: EMOJI_FAMILY,
      generic: "emoji",
    },
  ];
}

/** CSS `font-family` stacks, emoji last so text faces win where both cover. */
export function cardFontStacks(): { heading: string; body: string } {
  const { heading, body } = cardFontFamilies();

  return {
    heading: `${heading}, ${EMOJI_FAMILY}`,
    body: `${body}, ${EMOJI_FAMILY}`,
  };
}
