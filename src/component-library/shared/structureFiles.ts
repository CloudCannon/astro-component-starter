import { readdirSync } from "fs";
import { join } from "path";

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
