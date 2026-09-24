import type { APIRoute } from "astro";

// A route, not public/robots.txt, so the Sitemap line follows `site` in astro.config.mjs.
export const GET: APIRoute = ({ site }) => {
  const lines = ["User-agent: *", "Allow: /"];

  if (site) {
    lines.push("", `Sitemap: ${new URL("sitemap-index.xml", site).href}`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
