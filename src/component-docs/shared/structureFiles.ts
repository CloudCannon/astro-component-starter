import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import * as yaml from "js-yaml";

/**
 * The single reader for `.cloudcannon/structures` — componentConfig and the
 * Component Builder's nesting rules must see the same set of files.
 */
export function loadGlobalStructures(dir = ".cloudcannon/structures"): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  if (!existsSync(dir)) return merged;

  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".yml")) continue;
    try {
      const data = yaml.load(readFileSync(join(dir, file), "utf8"));

      if (data && typeof data === "object") {
        Object.assign(merged, data as Record<string, unknown>);
      }
    } catch (error) {
      console.error(`Error parsing structures file ${join(dir, file)}:`, error);
    }
  }

  return merged;
}

/** Recursively find all CloudCannon structure-value files under a directory. */
export function findStructureValueFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...findStructureValueFiles(fullPath));
      } else if (entry.name.endsWith(".cloudcannon.structure-value.yml")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Silently skip directories we can't read
  }

  return files;
}
