/**
 * Raw values in component CSS that a token already covers.
 *
 *   node scripts/css/lint-literals.mjs
 *
 * Nothing breaks when a literal slips in — it just quietly leaves one value
 * outside the theming API, so re-skinning a brand misses it. The token layer
 * is only worth having if every consumer goes through it.
 *
 * A declaration whose property is itself a custom property is never flagged:
 * naming a value (`--carousel-dot-size: 8px`) is the sanctioned way to keep a
 * component-specific number that no global token should own.
 *
 * The CSS is parsed, not pattern-matched. A text scan reports `1px solid` in a
 * comment, `"#fff"` in a `content` string, and the `#000` of a `mask-image`
 * split over several lines, while missing a duration in a multi-line
 * `transition` — all four were real when this was a regex. PostCSS is already
 * in the tree as stylelint's engine; this adds no build-time PostCSS.
 */
import { readFileSync } from "node:fs";
import { glob } from "glob";
import postcss from "postcss";
import valueParser from "postcss-value-parser";

// `src/component-docs` is the dev-only docs UI: its own palette, ships nothing.
const SOURCES = ["src/components/**/*.astro", "src/layouts/**/*.astro", "src/styles/base/*.css"];

const BORDER_WIDTH = /^border(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-width)?$/;
const MASK = /^(-webkit-)?mask/;
const TIMED = /^(transition|animation)$/;
const DURATION_PROP = /^(transition|animation)-(duration|delay)$/;
const EASING = new Set(["ease", "ease-in", "ease-out", "ease-in-out", "linear", "step-start"]);
const LENGTH = /^([0-9]*\.?[0-9]+)px$/;
const TIME = /^([0-9]*\.?[0-9]+)(ms|s)$/;
const HEX = /^#[0-9a-fA-F]{3,8}$/;
const COLOR_FN = new Set(["rgb", "rgba", "hsl", "hsla"]);

const HINTS = {
  "border width": "--border-width-sm | --border-width-md | --border-width-lg",
  "color literal": "a --color-* token, or color-mix() over one",
  "full radius": "--radius-full",
  "easing keyword": "--ease-default | --ease-out | --ease-in-out | --ease-smooth",
  duration: "--animation-fast | --animation-normal | --animation-slow",
  unparsed: "a style block this script could not read — check its syntax",
};

/** Milliseconds, or null when the word is not a time. */
function ms(word) {
  const match = TIME.exec(word);

  return match ? Number(match[1]) * (match[2] === "s" ? 1000 : 1) : null;
}

/** Top-level comma-separated groups of a value, each as its own node list. */
function commaGroups(parsed) {
  const groups = [[]];

  for (const node of parsed.nodes) {
    if (node.type === "div" && node.value === ",") groups.push([]);
    else groups[groups.length - 1].push(node);
  }

  return groups;
}

/** Every word and function in a value, skipping strings and `url()` contents. */
function walkValue(parsed, visit) {
  parsed.walk((node) => {
    if (node.type === "string") return false;
    if (node.type === "function" && node.value === "url") return false;

    visit(node);

    return undefined;
  });
}

function checkDeclaration(decl, report) {
  // Naming a value is the escape hatch.
  if (decl.prop.startsWith("--")) return;

  const parsed = valueParser(decl.value);

  walkValue(parsed, (node) => {
    if (node.type === "word" && node.value === "9999px") report("full radius", node.value);

    if (MASK.test(decl.prop)) return;

    if (node.type === "word" && HEX.test(node.value)) report("color literal", node.value);
    if (node.type === "function" && COLOR_FN.has(node.value)) {
      report("color literal", `${node.value}(…)`);
    }
  });

  if (BORDER_WIDTH.test(decl.prop)) {
    walkValue(parsed, (node) => {
      if (node.type === "word" && LENGTH.test(node.value)) report("border width", node.value);
    });
  }

  if (DURATION_PROP.test(decl.prop)) {
    walkValue(parsed, (node) => {
      if (node.type === "word" && ms(node.value) > 10) report("duration", node.value);
    });
  }

  if (!TIMED.test(decl.prop)) return;

  // Per comma group, so `visibility 0s linear var(--animation-normal)` — an
  // instant change used to delay a property, not a motion decision — is judged
  // on its own duration rather than the whole shorthand's.
  for (const group of commaGroups(parsed)) {
    const words = group.filter((node) => node.type === "word").map((node) => node.value);
    const times = words.map(ms).filter((value) => value !== null);
    const instant = times.length > 0 && times.every((value) => value <= 10);

    if (instant) continue;

    for (const word of words) {
      if (EASING.has(word)) report("easing keyword", word);
      if (ms(word) > 10) report("duration", word);
    }
  }
}

/**
 * Index of the `>` that closes the tag opened at `open`, skipping `{…}`
 * expressions and strings. `<style is:inline set:html={`…`}>` carries both, and
 * its template literal contains `>` — a `<style[^>]*>` match ends inside it and
 * hands PostCSS a fragment of the component template.
 */
function findTagEnd(source, open) {
  let depth = 0;
  let quote = null;

  for (let i = open + 1; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
    else if (char === ">" && depth === 0) return i;
  }

  return -1;
}

/** `{ css, line }` blocks: an `.astro` file's `<style>` bodies, or the whole file. */
function styleBlocks(file, source) {
  if (!file.endsWith(".astro")) return [{ css: source, line: 1 }];

  const blocks = [];
  let index = 0;

  for (
    let open = source.indexOf("<style", index);
    open !== -1;
    open = source.indexOf("<style", index)
  ) {
    const tagEnd = findTagEnd(source, open);

    if (tagEnd === -1) break;

    index = tagEnd + 1;

    // A self-closing `<style … />` builds its CSS in an expression: no body.
    if (source[tagEnd - 1] === "/") continue;

    const close = source.indexOf("</style>", tagEnd);

    if (close === -1) break;

    blocks.push({
      css: source.slice(tagEnd + 1, close),
      line: source.slice(0, tagEnd + 1).split("\n").length,
    });
    index = close + "</style>".length;
  }

  return blocks;
}

const files = [...new Set((await Promise.all(SOURCES.map((p) => glob(p)))).flat())].sort();
const findings = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");

  for (const { css, line: base } of styleBlocks(file, source)) {
    let root;

    try {
      root = postcss.parse(css, { from: file });
    } catch (error) {
      findings.push({ file, line: base, rule: "unparsed", text: error.reason ?? String(error) });
      continue;
    }

    root.walkDecls((decl) => {
      checkDeclaration(decl, (rule, text) => {
        findings.push({ file, line: base + (decl.source?.start?.line ?? 1) - 1, rule, text });
      });
    });
  }
}

if (!findings.length) {
  console.log(`ok     no untokenized values across ${files.length} file(s).`);
  process.exit(0);
}

for (const { file, line, rule, text } of findings) {
  console.error(`FAIL   ${file}:${line}  ${rule}: ${text}  — use ${HINTS[rule]}`);
}

console.error(
  `\n${findings.length} raw value(s) a token already covers. Name the value as a custom ` +
    `property on the component root if no global token should own it.`
);
process.exit(1);
