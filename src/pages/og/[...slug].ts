import seoData from "@data/seo.json";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { listCards } from "../../utils/og/paths";
import { renderCard } from "../../utils/og/render";

export async function getStaticPaths() {
  const [pages, posts] = await Promise.all([getCollection("pages"), getCollection("blog")]);

  return listCards(pages, posts).map(({ slug, title, description, featuredImage }) => ({
    params: { slug },
    props: { title, description, featuredImage },
  }));
}

export const GET: APIRoute = async ({ params, props }) => {
  const { title, description, featuredImage } = props as {
    title: string;
    description?: string;
    featuredImage?: string | null;
  };
  const theme = seoData.shareImageTheme === "dark" ? "dark" : "light";
  // The extension the URL promised, not what the render happens to produce.
  const format = params.slug?.endsWith(".jpg") ? "jpeg" : "png";

  const png = await renderCard({
    title,
    description,
    siteName: seoData.name,
    siteUrl: new URL(seoData.url).host,
    // A dark card needs the light-on-dark logo, or the mark disappears into it.
    logoSource:
      theme === "dark" ? seoData.logoAlternateSource || seoData.logoSource : seoData.logoSource,
    logoOnDarkSource: seoData.logoAlternateSource || seoData.logoSource,
    theme,
    featuredImage,
    format,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": format === "jpeg" ? "image/jpeg" : "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
