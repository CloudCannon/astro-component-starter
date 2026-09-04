import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Card colours, read from the theme CSS so a rebrand reaches the share cards
 * without a second edit. Values must resolve to a literal colour: a token left
 * as `var()` all the way down, or set to something Takumi cannot parse
 * (`color-mix()`, a gradient), falls back and warns rather than failing the
 * build, because an off-palette card should not block a deploy.
 */
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

/**
 * The dark theme sets `--color-text-muted` to the same white as
 * `--color-text-strong`, which would flatten the card's title/description
 * hierarchy to size and weight alone. `--color-text` is the dark theme's
 * softer body colour, so it stands in for the description there.
 */
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
    const css = readFileSync(path.join(root, source), "utf8");

    for (const [, name, value] of css.matchAll(DECLARATION)) {
      declared.set(name, value.trim());
    }
  }

  return declared;
}

/**
 * One theme is baked into the image: no social platform renders a card
 * per-viewer, so `shareImageTheme` picks which set of tokens to read.
 */
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
