import { describe, expect, it } from "vitest";
import { fontsourceCoverage, uncoveredCharacters } from "../../src/utils/og/coverage";
import { BODY_WEIGHT, cardFontStacks, cardFonts } from "../../src/utils/og/fonts";
import { listCards, ogCardPath } from "../../src/utils/og/paths";
import { TEMPLATE_SOURCE_PATH, cardHtml, platePaint, truncate } from "../../src/utils/og/template";
import { resolveCardColors } from "../../src/utils/og/theme";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const entry = (id: string, data: Record<string, unknown> = {}) => ({
  id,
  data: { title: `Title for ${id}`, ...data },
});

describe("ogCardPath", () => {
  it("namespaces each kind so no id can collide with another", () => {
    expect(ogCardPath("site")).toBe("/og/site.png");
    expect(ogCardPath("page", entry("index"))).toBe("/og/page/index.png");
    expect(ogCardPath("blog", entry("my-post"))).toBe("/og/blog/my-post.png");
  });

  it("keeps a nested id in the path", () => {
    expect(ogCardPath("page", entry("examples/about"))).toBe("/og/page/examples/about.png");
  });

  it("drops the file extension a blog id carries", () => {
    expect(ogCardPath("blog", entry("2025-01-01-post.mdx"))).toBe("/og/blog/2025-01-01-post.png");
  });

  it("gives an entry with an image a jpg card, since the photo goes under the text", () => {
    expect(ogCardPath("page", entry("about", { image: "/src/assets/images/x.jpg" }))).toBe(
      "/og/page/about.jpg"
    );
    expect(ogCardPath("blog", entry("post", { image: "/src/assets/images/x.jpg" }))).toBe(
      "/og/blog/post.jpg"
    );
  });
});

describe("listCards", () => {
  it("builds a card for the site and for every entry, photo or not", () => {
    const cards = listCards(
      [entry("index"), entry("about", { image: "/src/assets/images/x.jpg" })],
      [entry("post-a"), entry("post-b", { image: "/src/assets/images/x.jpg" })]
    );

    expect(cards.map((card) => card.slug)).toEqual([
      "site.png",
      "page/index.png",
      "page/about.jpg",
      "blog/post-a.png",
      "blog/post-b.jpg",
    ]);
  });

  it("carries the featured image so the endpoint can draw it under the text", () => {
    const [, , withPhoto] = listCards([entry("a"), entry("b", { image: "/src/x.jpg" })], []);

    expect(withPhoto.featuredImage).toBe("/src/x.jpg");
  });

  it("carries the title and description the endpoint renders", () => {
    const [, page] = listCards([entry("index", { description: "A description" })], []);

    expect(page).toMatchObject({ title: "Title for index", description: "A description" });
  });

  it("never emits a slug for an entry ogCardPath excludes", () => {
    const pages = [entry("index"), entry("about", { image: "/src/x.jpg" })];
    const slugs = new Set(listCards(pages, []).map((card) => card.slug));

    for (const page of pages) {
      const url = ogCardPath("page", page);

      expect(url).not.toBeNull();
      expect(slugs.has(url!.replace("/og/", ""))).toBe(true);
    }
  });
});

describe("resolveCardColors", () => {
  it.each(["light", "dark"] as const)("resolves every %s token to a literal colour", (theme) => {
    const { colors, unresolved } = resolveCardColors(ROOT, theme);

    expect(unresolved).toEqual([]);

    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^(#|rgb|hsl|oklch|oklab|lab|lch|color\()/i);
    }
  });

  it("inverts ground and text between the themes", () => {
    const light = resolveCardColors(ROOT, "light").colors;
    const dark = resolveCardColors(ROOT, "dark").colors;

    expect(light["--color-bg"]).not.toBe(dark["--color-bg"]);
    expect(light["--color-text-strong"]).not.toBe(dark["--color-text-strong"]);
  });

  it("keeps the description distinct from the title in both themes", () => {
    // The dark theme sets --color-text-muted to the same white as
    // --color-text-strong, so the card substitutes --color-text there.
    for (const theme of ["light", "dark"] as const) {
      const { colors } = resolveCardColors(ROOT, theme);

      expect(colors["--color-text-muted"]).not.toBe(colors["--color-text-strong"]);
    }
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("Short enough", 40)).toBe("Short enough");
  });

  it("cuts on a word boundary and appends an ellipsis", () => {
    const result = truncate("one two three four five six seven eight nine ten", 20);

    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toMatch(/\s…$/);
    expect(result.length).toBeLessThanOrEqual(21);
  });

  it("collapses whitespace so a wrapped description does not keep its newlines", () => {
    expect(truncate("one\n  two   three")).toBe("one two three");
  });
});

describe("cardHtml", () => {
  const base = {
    siteName: "Site",
    siteUrl: "example.com",
    colors: resolveCardColors(ROOT).colors,
    fontStacks: cardFontStacks(),
  };

  it("escapes text so a title cannot inject markup", () => {
    const html = cardHtml({ ...base, title: '<script>x</script> & "q"', description: "<b>d</b>" });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });

  it("omits the description element when there is none", () => {
    const without = cardHtml({ ...base, title: "T", description: "" });
    const with_ = cardHtml({ ...base, title: "T", description: "A description" });

    expect(without).not.toContain('<p class="card-description">');
    expect(with_).toContain('<p class="card-description">A description</p>');
  });

  it("clamps with -webkit-line-clamp and no max-height, which caused an off-by-one", () => {
    const html = cardHtml({ ...base, title: "T", description: "d" });

    expect(html).toContain("-webkit-line-clamp: 3");
    expect(html).toContain("-webkit-line-clamp: 2");
    expect(html).not.toContain("max-height");
  });
});

describe("font coverage", () => {
  it("reads a unicode-range from the aggregate fontsource stylesheet", () => {
    const ranges = fontsourceCoverage("Inter", BODY_WEIGHT);

    expect(ranges.length).toBeGreaterThan(0);
    expect(ranges.some(({ from, to }) => from <= 0x41 && to >= 0x41)).toBe(true);
  });

  it("passes latin text and flags a script no registered font covers", () => {
    const ranges = fontsourceCoverage("Inter", BODY_WEIGHT);

    expect(uncoveredCharacters(["Plain latin text"], ranges).missing).toEqual([]);
    expect(uncoveredCharacters(["日本語"], ranges).missing).toEqual(["日", "本", "語"]);
  });

  it("treats emoji as covered, because the vendored COLR font serves them", () => {
    const ranges = fontsourceCoverage("Inter", BODY_WEIGHT);

    expect(uncoveredCharacters(["Ship it 🚀 🎉"], ranges).missing).toEqual([]);
  });
});

describe("cardFonts", () => {
  it("registers each emoji subset under a shared subsetOf, not a shared name", () => {
    const emoji = cardFonts(ROOT).filter((font) => font.subsetOf);

    expect(emoji.length).toBeGreaterThan(0);
    expect(new Set(emoji.map((font) => font.name)).size).toBe(emoji.length);
    expect(new Set(emoji.map((font) => font.subsetOf)).size).toBe(1);
  });

  it("supplies every weight the template asks for, so nothing is faux-bolded", () => {
    const fonts = cardFonts(ROOT);
    const stacks = cardFontStacks();
    const registered = new Set(fonts.map((font) => `${font.name}:${font.weight}`));

    const headingFamily = stacks.heading.split(",")[0].trim();
    const bodyFamily = stacks.body.split(",")[0].trim();

    expect(registered).toContain(`${headingFamily}:700`);
    expect(registered).toContain(`${bodyFamily}:400`);
    expect(registered).toContain(`${bodyFamily}:600`);
  });
});

describe("cache invalidation", () => {
  it("points at its own real source, which render.ts hashes into the cache key", () => {
    // A wrong path would silently stop invalidating cards on a template edit.
    expect(existsSync(path.join(ROOT, TEMPLATE_SOURCE_PATH))).toBe(true);
    expect(TEMPLATE_SOURCE_PATH.endsWith("template.ts")).toBe(true);
  });
});

describe("platePaint", () => {
  it("inverts the theme, so the plate always contrasts with the site's ground", () => {
    const light = resolveCardColors(ROOT, "light").colors;
    const dark = resolveCardColors(ROOT, "dark").colors;

    // Light theme -> dark plate with light text; dark theme -> the reverse.
    expect(platePaint(light)).toEqual({
      ground: light["--color-text-strong"],
      ink: light["--color-bg"],
    });
    expect(platePaint(dark).ground).toBe(light["--color-bg"]);
    expect(platePaint(light).ground).toBe(dark["--color-bg"]);
  });

  it("never paints the plate the same colour as its own text", () => {
    for (const theme of ["light", "dark"] as const) {
      const { ground, ink } = platePaint(resolveCardColors(ROOT, theme).colors);

      expect(ground).not.toBe(ink);
    }
  });
});
