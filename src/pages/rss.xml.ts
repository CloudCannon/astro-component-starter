import rss from "@astrojs/rss";
import seoData from "@data/seo.json";
import type { APIRoute } from "astro";
import { getBlogPostsSortedByDate } from "../utils/blog";

// Descriptions, not rendered bodies: MDX posts can embed components no feed reader honours.
const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (char) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] as string
  );

export const GET: APIRoute = async ({ site }) => {
  const posts = await getBlogPostsSortedByDate();

  return rss({
    title: seoData.name,
    description: seoData.description,
    site: site ?? seoData.url,
    // RSS <author> must be an email address; dc:creator takes a plain name.
    xmlns: { dc: "http://purl.org/dc/elements/1.1/" },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/blog/${post.id.replace(/\.mdx?$/, "")}/`,
      customData: post.data.author
        ? `<dc:creator>${escapeXml(post.data.author)}</dc:creator>`
        : undefined,
    })),
  });
};
