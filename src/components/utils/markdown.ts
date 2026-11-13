import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true });

export function renderMarkdown(text?: string | null): string {
  return text ? md.render(text) : "";
}

export function renderMarkdownInline(text?: string | null): string {
  return text ? md.renderInline(text) : "";
}

export function hasCodeFence(body?: string | null): boolean {
  return /^ {0,3}(```|~~~)/m.test(body ?? "");
}
