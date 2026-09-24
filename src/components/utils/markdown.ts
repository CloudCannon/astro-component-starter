import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true });

export function renderMarkdown(text?: string | null): string {
  return text ? md.render(text) : "";
}

export function renderMarkdownInline(text?: string | null): string {
  return text ? md.renderInline(text) : "";
}
