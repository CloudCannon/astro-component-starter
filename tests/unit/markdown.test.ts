import { describe, expect, it } from "vitest";
import { renderMarkdown, renderMarkdownInline } from "../../src/components/utils/markdown";

describe("renderMarkdown", () => {
  it("renders block-level HTML with wrapping paragraphs", () => {
    expect(renderMarkdown("**bold**")).toBe("<p><strong>bold</strong></p>\n");
  });

  it("renders block structures such as lists", () => {
    const html = renderMarkdown("- one\n- two");

    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>two</li>");
  });

  it("passes raw HTML through (parser is configured with html: true)", () => {
    expect(renderMarkdown('<div class="raw">kept</div>')).toContain('<div class="raw">kept</div>');
  });

  it("returns an empty string for empty, null, and undefined input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown(null)).toBe("");
    expect(renderMarkdown(undefined)).toBe("");
  });
});

describe("renderMarkdownInline", () => {
  it("renders inline HTML without block wrappers", () => {
    expect(renderMarkdownInline("**bold**")).toBe("<strong>bold</strong>");
    expect(renderMarkdownInline("a *b* c")).toBe("a <em>b</em> c");
  });

  it("passes raw inline HTML through", () => {
    expect(renderMarkdownInline('see <a href="/x">here</a>')).toContain('<a href="/x">here</a>');
  });

  it("returns an empty string for empty, null, and undefined input", () => {
    expect(renderMarkdownInline("")).toBe("");
    expect(renderMarkdownInline(null)).toBe("");
    expect(renderMarkdownInline(undefined)).toBe("");
  });
});
