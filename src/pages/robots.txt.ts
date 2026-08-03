import type { APIRoute } from "astro";

// Served as a route rather than a static `public/robots.txt` so the Sitemap
// line always points at the real production URL from `site` in astro.config.mjs
// instead of a hardcoded domain that goes stale the moment a project is renamed.
export const GET: APIRoute = ({ site }) => {
  const lines = ["User-agent: *", "Allow: /"];

  if (site) {
    lines.push("", `Sitemap: ${new URL("sitemap-index.xml", site).href}`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
