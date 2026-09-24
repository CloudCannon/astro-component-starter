import seoData from "@data/seo.json";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getBlogPostsSortedByDate } from "../utils/blog";

// `noindex` pages are omitted to match the sitemap.
const line = (title: string, path: string, description?: string) =>
  description ? `- [${title}](${path}): ${description}` : `- [${title}](${path})`;

const pagePath = (id: string) => {
  const slug = id.replace(/(^|\/)index$/, "");

  return slug.length === 0 ? "/" : `/${slug}/`;
};

export const GET: APIRoute = async () => {
  const pages = (await getCollection("pages"))
    .filter((page) => !page.data.noindex)
    .sort((a, b) => pagePath(a.id).localeCompare(pagePath(b.id)));

  const posts = await getBlogPostsSortedByDate();

  const sections = [
    `# ${seoData.name}`,
    "",
    `> ${seoData.description}`,
    "",
    "## Pages",
    "",
    ...pages.map((page) => line(page.data.title, pagePath(page.id), page.data.description)),
  ];

  if (posts.length > 0) {
    sections.push(
      "",
      "## Blog",
      "",
      ...posts.map((post) =>
        line(post.data.title, `/blog/${post.id.replace(/\.mdx?$/, "")}/`, post.data.description)
      )
    );
  }

  return new Response(`${sections.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
