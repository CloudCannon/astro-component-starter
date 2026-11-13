/**
 * A slot's `fallbackFor` is the one prop its fallback renders (directly, gated, or via a one-level
 * alias). Anything else comes back `ambiguous`; patch it in metadata.ts's `mergeSlotMetadata`.
 */
import { existsSync, readFileSync } from "node:fs";
import { toPascalCase } from "./caseUtils";

export type DerivedSlot = {
  name: string;
  fallbackFor?: string;
  childComponent?: { name: string };
  ambiguous?: boolean;
};

type PropsInfo = {
  propNames: Set<string>;
  /** Local variable name (post-rename) -> original prop key. */
  localToProp: Map<string, string>;
};

type RawSlot = {
  name: string;
  /** null for self-closing slots (no fallback content at all). */
  content: string | null;
};

const JS_RESERVED = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "this",
  "typeof",
  "in",
  "of",
  "new",
  "void",
]);

/** Run before splitting: an apostrophe in a comment would open a never-closed
 *  string and swallow every prop after it. Mirrored in `componentModel.mjs`. */
function stripComments(str: string): string {
  return str.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** A .ts copy of `splitTopLevel` in `scripts/lib/componentModel.mjs` (Astro can't
 *  import the scripts/ .mjs) — keep the two in step. */
function splitTopLevel(str: string, sep: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = "";

  for (let i = 0; i < str.length; i++) {
    const c = str[i];

    if (quote) {
      current += c;
      if (c === quote && str[i - 1] !== "\\") quote = null;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      current += c;
      continue;
    }

    if (c === "(" || c === "[" || c === "{") depth++;
    if (c === ")" || c === "]" || c === "}") depth--;

    if (c === sep && depth === 0) {
      if (sep === "=") {
        const next = str[i + 1];
        const prev = str[i - 1];

        if (
          next === "=" ||
          next === ">" ||
          prev === "=" ||
          prev === "!" ||
          prev === "<" ||
          prev === ">"
        ) {
          current += c;
          continue;
        }
      }

      result.push(current);
      current = "";
      continue;
    }

    current += c;
  }

  result.push(current);

  return result;
}

function stripQuotes(raw: string): string {
  const trimmed = raw.trim();

  if (
    trimmed.length >= 2 &&
    ((trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"') ||
      (trimmed[0] === "'" && trimmed[trimmed.length - 1] === "'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function extractPropsInfo(script: string): PropsInfo {
  const propNames = new Set<string>();
  const localToProp = new Map<string, string>();

  const propsIdx = script.indexOf("Astro.props");

  if (propsIdx === -1) return { propNames, localToProp };

  const eqIdx = script.lastIndexOf("=", propsIdx);

  if (eqIdx === -1) return { propNames, localToProp };

  let closeBraceIdx = eqIdx - 1;

  while (closeBraceIdx >= 0 && /\s/.test(script[closeBraceIdx])) closeBraceIdx--;
  if (script[closeBraceIdx] !== "}") return { propNames, localToProp };

  let depth = 0;
  let openBraceIdx = -1;

  for (let i = closeBraceIdx; i >= 0; i--) {
    const c = script[i];

    if (c === "}") depth++;
    else if (c === "{") {
      depth--;
      if (depth === 0) {
        openBraceIdx = i;
        break;
      }
    }
  }

  if (openBraceIdx === -1) return { propNames, localToProp };

  const inner = stripComments(script.slice(openBraceIdx + 1, closeBraceIdx));
  const entries = splitTopLevel(inner, ",");

  for (const rawEntry of entries) {
    const entry = rawEntry.trim();

    if (!entry || entry.startsWith("...")) continue;

    const [namePartRaw] = splitTopLevel(entry, "=");
    const namePart = namePartRaw.trim();
    const colonParts = splitTopLevel(namePart, ":");
    const originalKey = stripQuotes(colonParts[0]);

    if (!originalKey) continue;

    const localVar = colonParts.length > 1 ? stripQuotes(colonParts[1]) : originalKey;

    propNames.add(originalKey);
    localToProp.set(localVar, originalKey);
  }

  return { propNames, localToProp };
}

function extractAliasMap(script: string, propsInfo: PropsInfo): Map<string, Set<string>> {
  const aliasMap = new Map<string, Set<string>>();
  const declRegex = /\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = declRegex.exec(script))) {
    const [, aliasName, expr] = match;
    const referenced = resolveIdentifiers(expr, propsInfo);

    if (referenced.size > 0) {
      aliasMap.set(aliasName, referenced);
    }
  }

  return aliasMap;
}

function resolveIdentifiers(expr: string, propsInfo: PropsInfo): Set<string> {
  const found = new Set<string>();
  const identifierRegex = /\b[A-Za-z_$][\w$]*\b/g;
  let m: RegExpExecArray | null;

  while ((m = identifierRegex.exec(expr))) {
    const id = m[0];

    if (JS_RESERVED.has(id)) continue;
    if (propsInfo.localToProp.has(id)) {
      found.add(propsInfo.localToProp.get(id) as string);
    }
  }

  return found;
}

function resolveCandidate(
  identifier: string,
  propsInfo: PropsInfo,
  aliasMap: Map<string, Set<string>>
): Set<string> {
  if (propsInfo.localToProp.has(identifier)) {
    return new Set([propsInfo.localToProp.get(identifier) as string]);
  }

  return aliasMap.get(identifier) ?? new Set();
}

function findRawSlots(template: string): RawSlot[] {
  const slots: RawSlot[] = [];
  const slotTagRegex = /<slot\b([^>]*)>/g;
  let match: RegExpExecArray | null;

  while ((match = slotTagRegex.exec(template))) {
    let attrs = match[1];
    let selfClosing = false;

    if (attrs.trim().endsWith("/")) {
      selfClosing = true;
      attrs = attrs.trim().slice(0, -1);
    }

    const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/);
    const name = nameMatch ? nameMatch[1] : "default";

    if (selfClosing) {
      slots.push({ name, content: null });
      continue;
    }

    const afterTagIdx = match.index + match[0].length;
    const closeIdx = template.indexOf("</slot>", afterTagIdx);
    const content = closeIdx === -1 ? "" : template.slice(afterTagIdx, closeIdx);

    slots.push({ name, content });

    if (closeIdx !== -1) {
      slotTagRegex.lastIndex = closeIdx + "</slot>".length;
    }
  }

  return slots;
}

const GATE_REGEX = /\b([A-Za-z_$][\w$]*)\b\s*(?:\?\.\s*map\(|\.\s*map\(|&&(?!=))/;

function tryBareIdentifier(content: string): string | null {
  let inner = content.trim();

  if (inner.startsWith("{") && inner.endsWith("}")) {
    inner = inner.slice(1, -1).trim();
  }

  const m = inner.match(/^([A-Za-z_$][\w$]*)$/);

  return m ? m[1] : null;
}

function resolveFallback(
  content: string,
  propsInfo: PropsInfo,
  aliasMap: Map<string, Set<string>>
): { fallbackFor?: string; ambiguous: boolean } {
  const trimmed = content.trim();

  if (!trimmed) {
    return { ambiguous: false };
  }

  const gateMatch = trimmed.match(GATE_REGEX);
  const bareIdentifier = !gateMatch ? tryBareIdentifier(trimmed) : null;

  let candidates: Set<string>;

  if (gateMatch) {
    candidates = resolveCandidate(gateMatch[1], propsInfo, aliasMap);
  } else if (bareIdentifier) {
    candidates = resolveCandidate(bareIdentifier, propsInfo, aliasMap);
  } else {
    candidates = resolveIdentifiers(trimmed, propsInfo);
  }

  if (candidates.size === 1) {
    return { fallbackFor: [...candidates][0], ambiguous: false };
  }

  return { ambiguous: true };
}

function findChildComponent(content: string): { name: string } | undefined {
  const mapIdx = content.search(/\.\s*map\(/);

  if (mapIdx === -1) return undefined;

  const after = content.slice(mapIdx);
  const tagMatch = after.match(/<([A-Z][A-Za-z0-9]*)/);

  return tagMatch ? { name: tagMatch[1] } : undefined;
}

/** A resolved branch beats an ambiguous one (Timeline's computed `groups`), so the docs
 *  preview keeps the authoring prop; two resolved branches that disagree (Split) are ambiguous. */
function mergeSameNameSlot(a: DerivedSlot, b: DerivedSlot): DerivedSlot {
  const aResolved = !a.ambiguous && !!a.fallbackFor;
  const bResolved = !b.ambiguous && !!b.fallbackFor;

  if (aResolved && !bResolved) return a;
  if (bResolved && !aResolved) return b;

  if (a.ambiguous || b.ambiguous) {
    return { name: a.name, ambiguous: true };
  }

  if (a.fallbackFor && b.fallbackFor) {
    if (a.fallbackFor === b.fallbackFor) {
      return {
        name: a.name,
        fallbackFor: a.fallbackFor,
        childComponent: a.childComponent ?? b.childComponent,
      };
    }

    return { name: a.name, ambiguous: true };
  }

  if (a.fallbackFor && !b.fallbackFor) return a;
  if (b.fallbackFor && !a.fallbackFor) return b;

  return { name: a.name };
}

function splitFrontmatter(source: string): { script: string; template: string } {
  const openMatch = source.match(/^---\r?\n/);

  if (!openMatch) return { script: "", template: source };

  const afterOpen = source.slice(openMatch[0].length);
  const closeMatch = afterOpen.match(/\n---\r?\n/);

  if (!closeMatch || closeMatch.index === undefined) {
    return { script: "", template: source };
  }

  return {
    script: afterOpen.slice(0, closeMatch.index),
    template: afterOpen.slice(closeMatch.index + closeMatch[0].length),
  };
}

export function deriveSlotsFromSource(source: string): DerivedSlot[] {
  try {
    const { script, template } = splitFrontmatter(source);
    const propsInfo = extractPropsInfo(script);
    const aliasMap = extractAliasMap(script, propsInfo);
    const rawSlots = findRawSlots(template);

    const byName = new Map<string, DerivedSlot>();

    for (const raw of rawSlots) {
      let derived: DerivedSlot;

      if (raw.content === null) {
        derived = { name: raw.name };
      } else {
        const { fallbackFor, ambiguous } = resolveFallback(raw.content, propsInfo, aliasMap);

        derived = {
          name: raw.name,
          fallbackFor,
          ambiguous: ambiguous || undefined,
          childComponent: fallbackFor ? findChildComponent(raw.content) : undefined,
        };
      }

      const existing = byName.get(raw.name);

      byName.set(raw.name, existing ? mergeSameNameSlot(existing, derived) : derived);
    }

    return [...byName.values()];
  } catch (error) {
    console.error("Error deriving slots from component source:", error);
    return [];
  }
}

const derivedSlotsCache = new Map<string, DerivedSlot[]>();

export function deriveSlotsForComponent(componentKey: string): DerivedSlot[] {
  if (derivedSlotsCache.has(componentKey)) {
    return derivedSlotsCache.get(componentKey) as DerivedSlot[];
  }

  const lastPart = componentKey.split("/").pop() ?? componentKey;
  const pascalName = toPascalCase(lastPart);
  const astroPath = `src/components/${componentKey}/${pascalName}.astro`;

  let slots: DerivedSlot[] = [];

  if (existsSync(astroPath)) {
    try {
      const source = readFileSync(astroPath, "utf8");

      slots = deriveSlotsFromSource(source);
    } catch (error) {
      console.error(`Error reading component source for "${componentKey}":`, error);
    }
  }

  derivedSlotsCache.set(componentKey, slots);

  return slots;
}
