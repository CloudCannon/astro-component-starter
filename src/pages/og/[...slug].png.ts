import seoData from "@data/seo.json";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { listCards } from "../../utils/og/paths";
import { renderCard } from "../../utils/og/render";

export async function getStaticPaths() {
  const [pages, posts] = await Promise.all([getCollection("pages"), getCollection("blog")]);

  return listCards(pages, posts).map(({ slug, title, description }) => ({
    params: { slug },
    props: { title, description },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description?: string };
  const theme = seoData.shareImageTheme === "dark" ? "dark" : "light";

  const png = await renderCard({
    title,
    description,
    siteName: seoData.name,
    siteUrl: new URL(seoData.url).host,
    // A dark card needs the light-on-dark logo, or the mark disappears into it.
    logoSource:
      theme === "dark" ? seoData.logoAlternateSource || seoData.logoSource : seoData.logoSource,
    theme,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
