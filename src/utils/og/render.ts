import { Renderer } from "@takumi-rs/core";
import { fromHtml } from "@takumi-rs/helpers/html";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
import { cacheKey, readCache, writeCache } from "./cache.mjs";
import { coverageWarning, fontsourceCoverage, uncoveredCharacters } from "./coverage.js";
import {
  BODY_WEIGHT,
  HEADING_WEIGHT,
  cardFontFamilies,
  cardFontStacks,
  cardFonts,
} from "./fonts.js";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  PHOTO_TITLE_MAX_LINES,
  TEMPLATE_SOURCE_PATH,
  cardHtml,
  escapeHtml,
  photoTitleFontSize,
  photoTitleWidth,
} from "./template.js";
import { type CardTheme, resolveCardColors } from "./theme.js";

// The only module that touches Takumi; keep engine calls out of other files.

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
  logoAlternateSource?: string | null;
  theme?: CardTheme;
  featuredImage?: string | null;
  /** Must match the URL's extension. */
  format?: "png" | "jpeg";
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

function sourceDigest(root: string, source: string): string | null {
  try {
    return digest(readFileSync(path.join(root, source.slice(1))));
  } catch {
    return null;
  }
}

function takumiVersion(): string {
  try {
    return require("@takumi-rs/core/package.json").version as string;
  } catch {
    return "unknown";
  }
}

// Disk only: a build must not depend on the network, so a remote logo is dropped.
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

async function backgroundDataUri(root: string, source?: string | null): Promise<string | null> {
  if (!source || !source.startsWith("/src/")) return null;

  try {
    const cropped = await sharp(path.join(root, source.slice(1)))
      .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "cover" })
      .jpeg({ quality: 82 })
      .toBuffer();

    return `data:image/jpeg;base64,${cropped.toString("base64")}`;
  } catch {
    return null;
  }
}

async function wrapTitle(
  renderer: Renderer,
  title: string,
  fontStacks: { heading: string },
  css: string[]
): Promise<string[]> {
  const width = photoTitleWidth();
  const size = photoTitleFontSize(title);
  const html =
    `<div style="width:${width}px">` +
    `<p style="font-family:${fontStacks.heading};font-weight:700;font-size:${size}px;` +
    `line-height:1.3;margin:0;width:${width}px">${escapeHtml(title)}</p></div>`;

  const measured = await renderer.measure(fromHtml(html).node, { width, height: CARD_HEIGHT, css });
  const lines: string[] = [];

  const collect = (node: { runs?: { text: string }[]; children?: unknown[] }) => {
    for (const run of node.runs ?? []) lines.push(run.text.trim());
    for (const child of (node.children ?? []) as (typeof node)[]) collect(child);
  };

  collect(measured);

  if (lines.length === 0) return [title];
  if (lines.length <= PHOTO_TITLE_MAX_LINES) return lines;

  const kept = lines.slice(0, PHOTO_TITLE_MAX_LINES);

  kept[kept.length - 1] = `${kept[kept.length - 1].replace(/[,;:.\-—]$/, "")}…`;

  return kept;
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
  // The photo card's plate inverts the theme, so it takes the opposite logo.
  const onDark = logoDataUri(root, request.logoAlternateSource ?? request.logoSource);
  const onLight = logoDataUri(root, request.logoSource);
  const dark = (request.theme ?? "light") === "dark";
  const plainLogo = dark ? onDark : onLight;
  const plateLogo = dark ? onLight : onDark;

  const featured = request.featuredImage?.startsWith("/src/")
    ? sourceDigest(root, request.featuredImage)
    : null;

  const key = cacheKey([
    fingerprint,
    request.title,
    request.description ?? "",
    request.siteName,
    request.siteUrl,
    plainLogo ? digest(plainLogo) : "",
    plateLogo ? digest(plateLogo) : "",
    featured ?? "",
    request.format ?? "png",
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

  const background = featured ? await backgroundDataUri(root, request.featuredImage) : null;
  const titleLines = background
    ? await wrapTitle(renderer, request.title, fontStacks, [])
    : undefined;

  const { node, css } = fromHtml(
    cardHtml({
      title: request.title,
      description: request.description,
      siteName: request.siteName,
      siteUrl: request.siteUrl,
      logoDataUri: background ? plateLogo : plainLogo,
      colors,
      fontStacks,
      backgroundDataUri: background,
      titleLines,
    })
  );

  const format = request.format ?? "png";
  const png = await renderer.render(node, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    format,
    ...(format === "jpeg" ? { quality: 82 } : {}),
    css,
  });

  writeCache(root, key, png);

  return png;
}
