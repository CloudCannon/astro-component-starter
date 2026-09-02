import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

import { findStructureValueFiles, loadGlobalStructures } from "../../../../shared/structureFiles";
import type { NestingRules, StructureValue } from "../../types";

/** Parse global and inline CloudCannon structures into nesting rules. */
export function parseNestingRules(): NestingRules {
  const structuresDir = join(process.cwd(), ".cloudcannon/structures");
  const rules: NestingRules = {};

  function processStructureDefinition(
    structureName: string,
    structureDef: Record<string, unknown>
  ): void {
    const allowedPaths: string[] = [];
    const excludedPaths: string[] = [];

    const valuesFromGlob = structureDef?.values_from_glob;

    if (Array.isArray(valuesFromGlob)) {
      for (const glob of valuesFromGlob as string[]) {
        if (glob.startsWith("!")) {
          const path = glob.substring(1);
          const match = path.match(/\/src\/components\/(.+?)\.cloudcannon\.structure-value\.yml/);

          if (match) {
            excludedPaths.push(match[1]);
          }
        } else {
          const match = glob.match(
            /\/src\/components\/(.+?)(?:\/\*\*\/\*)?\.cloudcannon\.structure-value\.yml/
          );

          if (match) {
            const componentPath = match[1];

            if (glob.includes("/**/*.")) {
              allowedPaths.push(`${componentPath}/*`);
            } else {
              allowedPaths.push(componentPath);
            }
          }
        }
      }
    }

    if (structureDef?.values && Array.isArray(structureDef.values)) {
      for (const valueItem of structureDef.values) {
        if (valueItem?.value?._component) {
          allowedPaths.push(valueItem.value._component);
        }
      }
    }

    if (allowedPaths.length > 0 || excludedPaths.length > 0) {
      rules[structureName] = allowedPaths.filter((p) => !excludedPaths.some((e) => p === e));
      rules[`${structureName}_excluded`] = excludedPaths;
    }
  }

  for (const [structureName, structureDef] of Object.entries(loadGlobalStructures(structuresDir))) {
    processStructureDefinition(structureName, structureDef as Record<string, unknown>);
  }

  const componentsDir = join(process.cwd(), "src/components");

  try {
    const structureValueFiles = findStructureValueFiles(componentsDir);

    for (const filePath of structureValueFiles) {
      try {
        const content = readFileSync(filePath, "utf8");
        const parsed = yaml.load(content) as StructureValue | null;

        if (parsed?._structures) {
          for (const [structureName, structureDef] of Object.entries(parsed._structures)) {
            processStructureDefinition(
              structureName,
              structureDef as unknown as Record<string, unknown>
            );
          }
        }
      } catch {
        // Silently skip files we can't parse
      }
    }
  } catch (error) {
    console.warn("Error scanning for inline structures:", error);
  }

  return rules;
}
