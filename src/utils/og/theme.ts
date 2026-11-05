import { readFileSync } from "node:fs";
import path from "node:path";

/** A token that isn't a literal colour Takumi parses (`color-mix()`, gradients) falls back and
 *  warns; never throw. */
export type CardColorToken =
  "--color-bg" | "--color-text-strong" | "--color-text-muted" | "--color-brand";

export type CardColors = Record<CardColorToken, string>;

const FALLBACK: CardColors = {
  "--color-bg": "#ffffff",
  "--color-text-strong": "#000000",
  "--color-text-muted": "#555555",
  "--color-brand": "#000000",
};

const DARK_FALLBACK: CardColors = {
  "--color-bg": "#000000",
  "--color-text-strong": "#ffffff",
  "--color-text-muted": "#aaaaaa",
  "--color-brand": "#ffffff",
};

const TOKENS = Object.keys(FALLBACK) as CardColorToken[];

export type CardTheme = "light" | "dark";

const PRIMITIVES = "src/styles/variables/_colors.css";
const THEME_FILE: Record<CardTheme, string> = {
  light: "src/styles/themes/_light.css",
  dark: "src/styles/themes/_dark.css",
};

/** Dark `--color-text-muted` equals `--color-text-strong`, which flattens card contrast. */
const MUTED_SUBSTITUTE: Partial<Record<CardTheme, string>> = { dark: "--color-text" };

const DECLARATION = /(--[\w-]+)\s*:\s*([^;}]+)/g;
const VAR_REFERENCE = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/;
const LITERAL = /^(#|rgb|hsl|oklch|oklab|lab|lch|color\()/i;
const MAX_HOPS = 3;

export interface ResolvedCardColors {
  colors: CardColors;
  /** Tokens that fell back, for the caller to warn about. */
  unresolved: CardColorToken[];
}

function declaredProperties(root: string, theme: CardTheme): Map<string, string> {
  const declared = new Map<string, string>();

  for (const source of [PRIMITIVES, THEME_FILE[theme]]) {
    let css: string;

    try {
      css = readFileSync(path.join(root, source), "utf8");
    } catch {
      continue;
    }

    for (const [, name, value] of css.matchAll(DECLARATION)) {
      declared.set(name, value.trim());
    }
  }

  return declared;
}

export function resolveCardColors(root: string, theme: CardTheme = "light"): ResolvedCardColors {
  const declared = declaredProperties(root, theme);

  const resolve = (name: string, hops = 0): string | null => {
    if (hops > MAX_HOPS) return null;

    const value = declared.get(name);

    if (!value) return null;

    const reference = value.match(VAR_REFERENCE);

    if (reference) {
      const [, referenced, literalFallback] = reference;

      return resolve(referenced, hops + 1) ?? literalFallback?.trim() ?? null;
    }

    return LITERAL.test(value) ? value : null;
  };

  const colors = { ...(theme === "dark" ? DARK_FALLBACK : FALLBACK) };
  const unresolved: CardColorToken[] = [];

  for (const token of TOKENS) {
    const substitute = token === "--color-text-muted" ? MUTED_SUBSTITUTE[theme] : undefined;
    const value = (substitute ? resolve(substitute) : null) ?? resolve(token);

    if (value) colors[token] = value;
    else unresolved.push(token);
  }

  return { colors, unresolved };
}
