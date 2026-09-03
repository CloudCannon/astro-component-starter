import { getCollection } from "astro:content";

/** Blog posts newest-first (for index and tag archives). */
export async function getBlogPostsSortedByDate() {
  const posts = await getCollection("blog");

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * Replace the heading of a listing's hero section. Every blog listing — the
 * index, its pages 2..n, and each tag archive — renders the same hero out of
 * `src/content/pages/blog.md`, so without this they all share one h1.
 */
export function withListingHeading(heroSections: any[], heading: string) {
  let replaced = false;

  return heroSections.map((section) => {
    if (replaced || typeof section?.heading !== "string") return section;
    replaced = true;

    return { ...section, heading };
  });
}

/**
 * Drop the hero's breadcrumb trail. Tag archives render their own
 * Blog > Tag trail in the listing grid, so leaving the hero's on would put two
 * `<nav aria-label="Breadcrumb">` landmarks on the page.
 */
export function withoutHeroBreadcrumbs(heroSections: any[]) {
  return heroSections.map((section) =>
    section?.showBreadcrumbs ? { ...section, showBreadcrumbs: false } : section
  );
}

/** CMS `pages` entry with id `blog` and its hero `pageSections`. */
export async function loadBlogPageContext() {
  let blogPage: any;
  let heroSections: any[] = [];

  try {
    const pages = await getCollection("pages");

    blogPage = pages.find((p: any) => p.id === "blog");

    if (blogPage?.data?.pageSections) {
      heroSections = blogPage.data.pageSections;
    }
  } catch (e) {
    console.error("Failed to load blog page data:", e);
  }

  return { blogPage, heroSections };
}
