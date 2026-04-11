import { getCollection } from "astro:content";

/** Blog posts newest-first (for index and tag archives). */
export async function getBlogPostsSortedByDate() {
  const posts = await getCollection("blog");

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
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
