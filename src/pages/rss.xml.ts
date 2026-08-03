import rss from "@astrojs/rss";
import seoData from "@data/seo.json";
import type { APIRoute } from "astro";
import { getBlogPostsSortedByDate } from "../utils/blog";

// Posts are MDX and can embed any component in the library, so the feed carries
// descriptions and links rather than rendered bodies — a full-content feed would
// have to serialise carousels, videos and the like into markup no reader honours.
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
    // RSS 2.0 defines <author> as an email address, which trips feed
    // validators on a plain name — dc:creator is the element for that.
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
