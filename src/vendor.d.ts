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

  export default function markdownit(options?: Options | string): MarkdownIt;
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

declare module "js-yaml" {
  interface DumpOptions {
    indent?: number;
    noArrayIndent?: boolean;
    skipInvalid?: boolean;
    flowLevel?: number;
    sortKeys?: boolean | ((a: string, b: string) => number);
    lineWidth?: number;
    noRefs?: boolean;
    noCompatMode?: boolean;
    condenseFlow?: boolean;
    quotingType?: "'" | '"';
    forceQuotes?: boolean;
    [key: string]: unknown;
  }

  interface JsYaml {
    load(str: string, opts?: Record<string, unknown>): unknown;
    dump(obj: unknown, opts?: DumpOptions): string;
  }

  const yaml: JsYaml;
  export default yaml;
  export function load(str: string, opts?: Record<string, unknown>): unknown;
  export function dump(obj: unknown, opts?: DumpOptions): string;
}
