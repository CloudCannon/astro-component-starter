import type { CardColors } from "./theme.js";

/**
 * Path to this file, hashed into the cache key by `render.ts` so a visual edit
 * invalidates every cached card on its own. Root-relative because Vite bundles
 * this module into `dist/.prerender/`, where `import.meta.url` no longer points
 * at the source. Must track this file's real location.
 */
export const TEMPLATE_SOURCE_PATH = "src/utils/og/template.ts";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const TITLE_LINES = 3;
const DESCRIPTION_LINES = 2;
const DESCRIPTION_LIMIT = 150;

export interface CardInput {
  title: string;
  description?: string | null;
  siteName: string;
  siteUrl: string;
  logoDataUri?: string | null;
  colors: CardColors;
  fontStacks: { heading: string; body: string };
  /** Cover-cropped featured image. Switches the card to the photo layout. */
  backgroundDataUri?: string | null;
  /** Pre-wrapped title lines, measured by `render.ts`. Photo layout only. */
  titleLines?: string[];
}

/** Text and its backing plate on a photo card, whatever the photo is doing. */
const PHOTO_INK = "#ffffff";
const PHOTO_PLATE = "#000000";

export const PHOTO_TITLE_MAX_LINES = 3;
export const PHOTO_CARD_PADDING = 64;
export const PHOTO_PLATE_PADDING_X = 16;

/** Width a title line may occupy before it wraps, inside plate and card padding. */
export const photoTitleWidth = () =>
  CARD_WIDTH - PHOTO_CARD_PADDING * 2 - PHOTO_PLATE_PADDING_X * 2;

export const photoTitleFontSize = (title: string) =>
  title.length > 90 ? 48 : title.length > 55 ? 54 : 62;

/**
 * The photo layout: the featured image full-bleed, with every run of text on
 * its own solid plate. The plate is the point — it keeps the text legible over
 * any photo, so a card never depends on the image being dark, calm, or cropped
 * a particular way. Each line gets its own plate rather than one block behind
 * all of them, which is why `render.ts` measures the wrap first.
 */
function photoCardHtml({
  titleLines,
  siteName,
  siteUrl,
  backgroundDataUri,
  logoDataUri,
  fontStacks,
  fontSize,
}: {
  titleLines: string[];
  siteName: string;
  siteUrl: string;
  backgroundDataUri: string;
  logoDataUri?: string | null;
  fontStacks: { heading: string; body: string };
  fontSize: number;
}): string {
  const line = (text: string) => `<p class="card-title-line">${escapeHtml(text)}</p>`;

  return `<div class="card">
  <style>
    .card { width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px; position: relative; background: ${PHOTO_PLATE}; }
    .card-photo { position: absolute; top: 0; left: 0; width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px; }
    .card-layer {
      position: absolute; top: 0; left: 0;
      width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px;
      box-sizing: border-box; padding: ${PHOTO_CARD_PADDING}px;
      display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start;
    }
    .card-title {
      display: flex; flex-direction: column; align-items: flex-start;
    }
    .card-title-line {
      margin: 0;
      font-family: ${fontStacks.heading}; font-weight: 700;
      font-size: ${fontSize}px; line-height: 1.3;
      color: ${PHOTO_INK}; background: ${PHOTO_PLATE};
      padding: 4px ${PHOTO_PLATE_PADDING_X}px;
    }
    .card-chip {
      display: flex; align-items: center; gap: 14px;
      font-family: ${fontStacks.body}; font-weight: 600; font-size: 24px;
      color: ${PHOTO_INK}; background: ${PHOTO_PLATE};
      padding: 6px ${PHOTO_PLATE_PADDING_X}px;
    }
    .card-chip-logo { height: 26px; }
  </style>
  <img class="card-photo" src="${backgroundDataUri}" />
  <div class="card-layer">
    <span class="card-chip">${
      logoDataUri ? `<img class="card-chip-logo" src="${logoDataUri}" />` : ""
    }${escapeHtml(siteName)}</span>
    <div class="card-title">${titleLines.map(line).join("")}</div>
    <span class="card-chip">${escapeHtml(siteUrl)}</span>
  </div>
</div>`;
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!
  );

/** Long titles step down so `TITLE_LINES` always fits the band. */
const titleFontSize = (title: string) => (title.length > 72 ? 52 : title.length > 40 ? 60 : 68);

/**
 * Truncated here rather than by the CSS clamp, which cuts mid-word and gives no
 * ellipsis. The clamp still runs as the backstop for text that wraps wider than
 * expected.
 */
export function truncate(text: string, limit = DESCRIPTION_LIMIT): string {
  const collapsed = text.replace(/\s+/g, " ").trim();

  if (collapsed.length <= limit) return collapsed;

  const cut = collapsed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-—]$/, "")}…`;
}

export function cardHtml({
  title,
  description,
  siteName,
  siteUrl,
  logoDataUri,
  colors,
  fontStacks,
  backgroundDataUri,
  titleLines,
}: CardInput): string {
  if (backgroundDataUri && titleLines?.length) {
    return photoCardHtml({
      titleLines,
      siteName,
      siteUrl,
      backgroundDataUri,
      logoDataUri,
      fontStacks,
      fontSize: photoTitleFontSize(title),
    });
  }

  const titleSize = titleFontSize(title);
  const trimmedDescription = description ? truncate(description) : "";

  return `<div class="card">
  <style>
    .card {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      box-sizing: border-box;
      padding: 72px;
      background: ${colors["--color-bg"]};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-head { display: flex; align-items: center; gap: 18px; }
    .card-logo { height: 34px; }
    .card-site {
      font-family: ${fontStacks.body};
      font-weight: 600;
      font-size: 26px;
      color: ${colors["--color-text-strong"]};
    }
    .card-title {
      margin: 0;
      font-family: ${fontStacks.heading};
      font-weight: 700;
      font-size: ${titleSize}px;
      line-height: 1.12;
      color: ${colors["--color-text-strong"]};
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${TITLE_LINES};
      overflow: hidden;
    }
    .card-rule {
      width: 88px;
      height: 5px;
      margin: 30px 0 0;
      background: ${colors["--color-brand"]};
    }
    .card-description {
      margin: 26px 0 0;
      font-family: ${fontStacks.body};
      font-weight: 400;
      font-size: 28px;
      line-height: 1.45;
      color: ${colors["--color-text-muted"]};
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${DESCRIPTION_LINES};
      overflow: hidden;
    }
    .card-foot {
      font-family: ${fontStacks.body};
      font-weight: 400;
      font-size: 24px;
      color: ${colors["--color-text-muted"]};
    }
  </style>
  <div class="card-head">${
    logoDataUri ? `<img class="card-logo" src="${logoDataUri}" />` : ""
  }<span class="card-site">${escapeHtml(siteName)}</span></div>
  <div>
    <p class="card-title">${escapeHtml(title)}</p>
    <div class="card-rule"></div>${
      trimmedDescription
        ? `\n    <p class="card-description">${escapeHtml(trimmedDescription)}</p>`
        : ""
    }
  </div>
  <div class="card-foot">${escapeHtml(siteUrl)}</div>
</div>`;
}
