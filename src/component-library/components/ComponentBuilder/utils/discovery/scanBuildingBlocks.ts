import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import yaml from "js-yaml";
import { join } from "path";

import { kebabToTitleCase, toPascalCase } from "../../../../shared/caseUtils";
import type { ComponentMetadata as SharedComponentMetadata } from "../../../../shared/metadata";
import type { ComponentInfo, InputConfig, SlotDefinition, StructureValue } from "../../types";
import { isArrayStructureInput, structureHasComponentValues } from "./inputUtils";

type Logger = (...args: unknown[]) => void;

/** Scan building-blocks directories and return discovered components. */
export function scanBuildingBlocksComponents(
  metadataMap: Map<string, SharedComponentMetadata>,
  log: Logger = () => {}
): ComponentInfo[] {
  const componentsDir = join(process.cwd(), "src/components/building-blocks");
  const components: ComponentInfo[] = [];

  const excludedComponents = new Set(["pagination"]);

  function scanDirectory(dir: string, category: string): void {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (!entry.isDirectory()) continue;
        if (excludedComponents.has(entry.name)) continue;

        const astroFiles = readdirSync(fullPath).filter((f) => f.endsWith(".astro"));
        const kebabName = entry.name;
        const pascalName = toPascalCase(kebabName);

        const mainComponentFile = astroFiles.find((f) => {
          const baseName = f.replace(".astro", "");

          return (
            baseName.toLowerCase() === pascalName.toLowerCase() ||
            baseName.toLowerCase() === kebabName ||
            (astroFiles.length === 1 &&
              !baseName.includes("Item") &&
              !baseName.includes("Slide") &&
              !baseName.includes("Panel") &&
              !baseName.includes("Option") &&
              !baseName.includes("Unpic") &&
              !baseName.includes("Astro"))
          );
        });

        if (!mainComponentFile) {
          scanDirectory(fullPath, category);
          continue;
        }

        const componentPath = `building-blocks/${category}/${entry.name}`;
        const inputsPath = join(fullPath, `${entry.name}.cloudcannon.inputs.yml`);
        const structureValuePath = join(fullPath, `${entry.name}.cloudcannon.structure-value.yml`);

        let inputs: Record<string, InputConfig> = {};
        let structureValue: StructureValue | null = null;
        let description = "";
        let icon = "";

        if (existsSync(inputsPath)) {
          try {
            const inputsContent = readFileSync(inputsPath, "utf8");

            inputs = (yaml.load(inputsContent) as Record<string, InputConfig>) || {};
          } catch (error) {
            console.warn(`Error reading inputs file for ${componentPath}:`, error);
          }
        }

        if (existsSync(structureValuePath)) {
          try {
            const structureContent = readFileSync(structureValuePath, "utf8");

            structureValue = yaml.load(structureContent) as StructureValue;
            description = structureValue?.description || "";
            icon = structureValue?.icon || "";
          } catch (error) {
            console.warn(`Error reading structure-value file for ${componentPath}:`, error);
          }
        }

        const metadata = metadataMap.get(componentPath) || metadataMap.get(entry.name);
        const slots: SlotDefinition[] = [];

        for (const [propName, inputDef] of Object.entries(inputs)) {
          if (!isArrayStructureInput(inputDef)) continue;

          const structureRef = inputDef.options?.structures;

          if (!structureRef) continue;
          let structureName = structureRef.replace("_structures.", "");

          if (
            !metadata?.childComponent &&
            structureValue?._structures &&
            structureValue._structures[structureName]
          ) {
            const inlineStruct = structureValue._structures[structureName];

            if (inlineStruct?.values && Array.isArray(inlineStruct.values)) {
              const firstValue = inlineStruct.values[0] as {
                _inputs?: Record<string, InputConfig>;
              };

              if (firstValue?._inputs) {
                for (const nestedInputDef of Object.values(firstValue._inputs)) {
                  if (isArrayStructureInput(nestedInputDef)) {
                    const nestedStructureRef = nestedInputDef.options?.structures;

                    if (!nestedStructureRef) continue;

                    structureName = nestedStructureRef.replace("_structures.", "");
                    log(
                      `Resolved inline structure for slot "${propName}": ${structureRef} -> ${nestedStructureRef} (${structureName})`
                    );
                    break;
                  }
                }
              }
            }
          }

          const metaSlot = metadata?.slots?.find((s) => s.fallbackFor === propName);
          const shouldTreatAsSlot =
            !!metaSlot || structureHasComponentValues(structureValue, structureName);

          if (!shouldTreatAsSlot) continue;

          slots.push({
            propName,
            label:
              typeof inputDef.label === "string"
                ? inputDef.label
                : propName.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase()),
            allowedComponents: [],
            structureName,
            astroSlotName: metaSlot?.name,
            isRepeatable: !!metaSlot?.childComponent,
          });
        }

        components.push({
          path: componentPath,
          fileName: mainComponentFile,
          category,
          name: entry.name,
          displayName: kebabToTitleCase(entry.name),
          inputs,
          structureValue,
          supportsSlots: slots.length > 0 || metadata?.supportsSlots || false,
          fallbackFor: metadata?.fallbackFor,
          description,
          icon,
          slots: slots.length > 0 ? slots : undefined,
        });
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  const buildingBlocksCategories = ["wrappers", "core-elements", "forms"];

  buildingBlocksCategories.forEach((category) => {
    const categoryDir = join(componentsDir, category);

    if (existsSync(categoryDir) && statSync(categoryDir).isDirectory()) {
      scanDirectory(categoryDir, category);
    }
  });

  return components;
}
