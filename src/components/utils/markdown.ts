import MarkdownIt from "markdown-it";

// Shared instance — markdown-it holds no per-render state, so one configured
// parser is reused across every component render.
const md = new MarkdownIt({ html: true });

/** Render markdown as block-level HTML (wrapping `<p>`, lists, etc.). */
export function renderMarkdown(text?: string | null): string {
  return text ? md.render(text) : "";
}

/** Render markdown inline (no block wrappers), for single-line text. */
export function renderMarkdownInline(text?: string | null): string {
  return text ? md.renderInline(text) : "";
}
