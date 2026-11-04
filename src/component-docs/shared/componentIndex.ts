/** Left-joins every component against the `docs-components` collection; a docs entry is optional. */
import { getCollection, type CollectionEntry } from "astro:content";
import { type ComponentConfig, listComponentKeys, loadComponentConfig } from "./componentConfig";

export type ComponentIndexEntry = {
  key: string;
  parts: string[];
  title: string;
  order: number;
  hasDocs: boolean;
  docsEntry: CollectionEntry<"docs-components"> | null;
  config: ComponentConfig | null;
};

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  ctas: "CTAs",
  cta: "CTA",
};

export function formatDisplayName(value = ""): string {
  const lower = value.toLowerCase();

  if (DISPLAY_NAME_OVERRIDES[lower]) {
    return DISPLAY_NAME_OVERRIDES[lower];
  }

  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Must match the key derivation in [...slug].astro. */
function slugFromEntryId(id: string): string {
  return id
    .replace(/^components\//, "")
    .replace(/\/index$/, "")
    .split("/")
    .filter(Boolean)
    .join("/");
}

let componentIndexCache: ComponentIndexEntry[] | null = null;

export async function getComponentIndex(): Promise<ComponentIndexEntry[]> {
  if (componentIndexCache) {
    return componentIndexCache;
  }

  const keys = listComponentKeys();
  const keySet = new Set(keys);

  let docsEntries: CollectionEntry<"docs-components">[] = [];

  try {
    docsEntries = await getCollection("docs-components");
  } catch (error) {
    console.error("Error loading docs-components collection:", error);
  }

  const docsBySlug = new Map<string, CollectionEntry<"docs-components">>();

  for (const entry of docsEntries) {
    const slug = slugFromEntryId(entry.id);

    if (!keySet.has(slug)) {
      console.warn(
        `[component-docs] Docs entry "${entry.id}" resolves to component key "${slug}", which has no matching component under src/components — excluding it.`
      );
      continue;
    }

    docsBySlug.set(slug, entry);
  }

  componentIndexCache = keys.map((key) => {
    const docsEntry = docsBySlug.get(key) ?? null;
    const config = loadComponentConfig(key);
    const parts = key.split("/");
    const lastPart = parts[parts.length - 1];

    const title = docsEntry?.data.title ?? config?.label ?? formatDisplayName(lastPart);
    const order = docsEntry?.data.order ?? 999;

    return {
      key,
      parts,
      title,
      order,
      hasDocs: !!docsEntry,
      docsEntry,
      config,
    };
  });

  return componentIndexCache;
}
