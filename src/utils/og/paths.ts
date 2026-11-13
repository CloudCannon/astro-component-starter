import seoData from "../../data/seo.json";

// The endpoint and the layouts' `og:image` must both go through `ogCardPath` with no extra
// condition of their own, or a page silently advertises a card that was never built.

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

// PNG stores a photo ~7x larger; JPEG rings around flat text. The endpoint encodes by URL extension.
export const cardFormat = (entry?: CardEntry): "png" | "jpg" => (entry?.data.image ? "jpg" : "png");

export function ogCardPath(kind: CardKind, entry?: CardEntry): string | null {
  if (!isGenerationEnabled(kind)) return null;
  if (kind !== "site" && !entry) return null;

  return `${OG_BASE}/${slugFor(kind, entry?.id ?? SITE_CARD_SLUG)}.${cardFormat(entry)}`;
}

export interface CardDefinition {
  slug: string;
  title: string;
  description?: string;
  featuredImage?: string | null;
}

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
