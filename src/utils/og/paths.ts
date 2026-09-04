import seoData from "../../data/seo.json";

/**
 * Which entries get a generated share card, and at what URL.
 *
 * Both sides of the feature read this: the endpoint's `getStaticPaths` to decide
 * what to build, and the layouts to decide what to put in `og:image`. They must
 * never disagree, or a page advertises a card that was never rendered, and
 * nothing reports the 404 — so route and endpoint both go through
 * `ogCardPath`, and neither applies its own extra condition.
 */

export type ShareImageGeneration = "all" | "blog" | "none";

export type CardKind = "site" | "page" | "blog";

/** Kept out of the URL space of `page`/`blog` ids so no slug can collide. */
export const SITE_CARD_SLUG = "site";

const OG_BASE = "/og";

function generationMode(): ShareImageGeneration {
  const configured = (seoData as { shareImageGeneration?: string }).shareImageGeneration;

  return configured === "blog" || configured === "none" ? configured : "all";
}

export function isGenerationEnabled(kind: CardKind): boolean {
  const mode = generationMode();

  if (mode === "none") return false;
  if (mode === "blog") return kind !== "page";

  return true;
}

interface CardEntry {
  id: string;
  data: { title?: string; description?: string; image?: string | null };
}

const slugFor = (kind: CardKind, id: string) =>
  kind === "site" ? SITE_CARD_SLUG : `${kind}/${id.replace(/\.mdx?$/, "")}`;

/**
 * PNG for the flat plain card, JPEG for a photo one: PNG stores a photograph at
 * roughly seven times the size, and JPEG rings around the crisp text of a flat
 * card. The URL's extension decides what the endpoint encodes, so the bytes can
 * never disagree with what was advertised, even if the photo fails to load.
 */
export const cardFormat = (entry?: CardEntry): "png" | "jpg" => (entry?.data.image ? "jpg" : "png");

/**
 * The card URL for an entry, or `null` when generation is off for its kind.
 *
 * An entry's own `image` no longer opts it out: it becomes the card's
 * background, drawn under the text plates, so a shared link always carries the
 * title. Turn cards off with `shareImageGeneration` to share raw images again.
 */
export function ogCardPath(kind: CardKind, entry?: CardEntry): string | null {
  if (!isGenerationEnabled(kind)) return null;
  if (kind !== "site" && !entry) return null;

  return `${OG_BASE}/${slugFor(kind, entry?.id ?? SITE_CARD_SLUG)}.${cardFormat(entry)}`;
}

export interface CardDefinition {
  /** Route param for `src/pages/og/[...slug].png.ts`. */
  slug: string;
  title: string;
  description?: string;
  /** The entry's own image, drawn full-bleed under the text plates. */
  featuredImage?: string | null;
}

/** Every card to build: the site card, plus one per page and per post. */
export function listCards(pages: CardEntry[], posts: CardEntry[]): CardDefinition[] {
  const cards: CardDefinition[] = [];

  if (isGenerationEnabled("site")) {
    cards.push({
      slug: `${SITE_CARD_SLUG}.png`,
      title: seoData.name,
      description: seoData.description,
    });
  }

  for (const [kind, entries] of [
    ["page", pages],
    ["blog", posts],
  ] as const) {
    for (const entry of entries) {
      const url = ogCardPath(kind, entry);

      if (!url) continue;

      cards.push({
        slug: url.slice(`${OG_BASE}/`.length),
        title: entry.data.title ?? seoData.name,
        description: entry.data.description,
        featuredImage: entry.data.image,
      });
    }
  }

  return cards;
}
