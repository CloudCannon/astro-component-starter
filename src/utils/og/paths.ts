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
 * The card URL for an entry, or `null` when it should not have one — generation
 * is off for its kind, or it already carries its own `image`, which always wins.
 */
export function ogCardPath(kind: CardKind, entry?: CardEntry): string | null {
  if (!isGenerationEnabled(kind)) return null;
  if (kind !== "site" && !entry) return null;
  if (entry?.data.image) return null;

  return `${OG_BASE}/${slugFor(kind, entry?.id ?? SITE_CARD_SLUG)}.png`;
}

export interface CardDefinition {
  /** Route param for `src/pages/og/[...slug].png.ts`. */
  slug: string;
  title: string;
  description?: string;
}

/**
 * Every card to build: the site card, plus each page and post with no `image`
 * of its own. Cost is proportional to the pages that need a card, not to the
 * size of the site.
 */
export function listCards(pages: CardEntry[], posts: CardEntry[]): CardDefinition[] {
  const cards: CardDefinition[] = [];

  if (isGenerationEnabled("site")) {
    cards.push({
      slug: SITE_CARD_SLUG,
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
        slug: url.slice(`${OG_BASE}/`.length, -".png".length),
        title: entry.data.title ?? seoData.name,
        description: entry.data.description,
      });
    }
  }

  return cards;
}
