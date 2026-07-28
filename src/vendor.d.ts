declare module "markdown-it" {
  interface Options {
    html?: boolean;
    xhtmlOut?: boolean;
    breaks?: boolean;
    langPrefix?: string;
    linkify?: boolean;
    typographer?: boolean;
  }

  interface MarkdownIt {
    render(src: string, env?: Record<string, unknown>): string;
    renderInline(src: string, env?: Record<string, unknown>): string;
  }

  // markdown-it is callable both with and without `new` at runtime.
  interface MarkdownItConstructor {
    new (options?: Options | string): MarkdownIt;
    (options?: Options | string): MarkdownIt;
  }

  const MarkdownIt: MarkdownItConstructor;
  export default MarkdownIt;
}

declare module "js-beautify" {
  interface BeautifyOptions {
    indent_size?: number;
    indent_char?: string;
    indent_with_tabs?: boolean;
    preserve_newlines?: boolean;
    max_preserve_newlines?: number;
    wrap_line_length?: number;
    [key: string]: unknown;
  }

  type BeautifyFn = (source: string, options?: BeautifyOptions) => string;

  const pkg: {
    html: BeautifyFn;
    css: BeautifyFn;
    js: BeautifyFn;
  };

  export default pkg;
}
