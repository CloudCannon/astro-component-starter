import { Renderer } from "@takumi-rs/core";
import { fromHtml } from "@takumi-rs/helpers/html";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { cacheKey, readCache, writeCache } from "./cache.mjs";
import { coverageWarning, fontsourceCoverage, uncoveredCharacters } from "./coverage.js";
import {
  BODY_WEIGHT,
  HEADING_WEIGHT,
  cardFontFamilies,
  cardFontStacks,
  cardFonts,
} from "./fonts.js";
import { CARD_HEIGHT, CARD_WIDTH, TEMPLATE_SOURCE_PATH, cardHtml } from "./template.js";
import { type CardTheme, resolveCardColors } from "./theme.js";

/**
 * The only module that touches Takumi. Everything else goes through
 * `renderCard`, so swapping the engine is a change to this file alone.
 */

const require = createRequire(import.meta.url);

const MIME_BY_EXTENSION: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export interface CardRequest {
  title: string;
  description?: string | null;
  siteName: string;
  siteUrl: string;
  logoSource?: string | null;
  theme?: CardTheme;
}

interface Prepared {
  renderer: Renderer;
  colors: ReturnType<typeof resolveCardColors>["colors"];
  fontStacks: { heading: string; body: string };
  coverage: { from: number; to: number }[];
  fingerprint: string;
}

const prepared = new Map<CardTheme, Promise<Prepared>>();

const digest = (data: Buffer | string) =>
  createHash("sha256").update(data).digest("hex").slice(0, 16);

function takumiVersion(): string {
  try {
    return require("@takumi-rs/core/package.json").version as string;
  } catch {
    return "unknown";
  }
}

/**
 * Logo bytes inlined as a data URI. Read from disk only: a build must not
 * depend on the network, so a remote `logoSource` is dropped rather than
 * fetched.
 */
function logoDataUri(root: string, source?: string | null): string | null {
  if (!source || !source.startsWith("/src/")) return null;

  const extension = path.extname(source).toLowerCase();
  const mime = MIME_BY_EXTENSION[extension];

  if (!mime) return null;

  try {
    const bytes = readFileSync(path.join(root, source.slice(1)));

    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function prepare(root: string, theme: CardTheme): Promise<Prepared> {
  const existing = prepared.get(theme);

  if (existing) return existing;

  const pending = (async () => {
    const renderer = new Renderer();
    const fonts = cardFonts(root);

    for (const { data, ...descriptor } of fonts) {
      await renderer.registerFont({ ...descriptor, data });
    }

    const { colors, unresolved } = resolveCardColors(root, theme);

    if (unresolved.length > 0) {
      console.warn(
        `[og] Could not resolve ${unresolved.join(", ")} to a literal colour; share cards ` +
          `fall back to the default ${theme} palette. Check src/styles/themes/_${theme}.css.`
      );
    }

    const families = cardFontFamilies();
    const coverage = [
      ...fontsourceCoverage(families.body, BODY_WEIGHT),
      ...fontsourceCoverage(families.heading, HEADING_WEIGHT),
    ];

    return {
      renderer,
      colors,
      fontStacks: cardFontStacks(),
      coverage,
      fingerprint: digest(
        [
          takumiVersion(),
          // The template's own source, so a visual edit invalidates every
          // cached card with nothing to remember to bump.
          digest(readFileSync(path.join(root, TEMPLATE_SOURCE_PATH))),
          JSON.stringify(colors),
          ...fonts.map(({ name, weight, data }) => `${name}:${weight}:${digest(data)}`),
        ].join("|")
      ),
    };
  })();

  prepared.set(theme, pending);

  return pending;
}

const warnedCoverage = new Set<string>();

export async function renderCard(request: CardRequest, root = process.cwd()): Promise<Buffer> {
  const { renderer, colors, fontStacks, coverage, fingerprint } = await prepare(
    root,
    request.theme ?? "light"
  );
  const logo = logoDataUri(root, request.logoSource);

  const key = cacheKey([
    fingerprint,
    request.title,
    request.description ?? "",
    request.siteName,
    request.siteUrl,
    logo ? digest(logo) : "",
  ]);

  const cached = readCache(root, key);

  if (cached) return cached;

  if (coverage.length > 0) {
    const { missing } = uncoveredCharacters(
      [request.title, request.description ?? "", request.siteName],
      coverage
    );
    const signature = missing.join("");

    if (missing.length > 0 && !warnedCoverage.has(signature)) {
      warnedCoverage.add(signature);
      console.warn(coverageWarning(missing));
    }
  }

  const { node, css } = fromHtml(
    cardHtml({
      title: request.title,
      description: request.description,
      siteName: request.siteName,
      siteUrl: request.siteUrl,
      logoDataUri: logo,
      colors,
      fontStacks,
    })
  );

  const png = await renderer.render(node, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    format: "png",
    css,
  });

  writeCache(root, key, png);

  return png;
}
