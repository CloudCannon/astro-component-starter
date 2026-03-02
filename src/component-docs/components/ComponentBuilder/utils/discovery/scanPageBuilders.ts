import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import yaml from "js-yaml";
import { join } from "path";

import { kebabToTitleCase, toPascalCase } from "../../../../shared/caseUtils";
import type { ComponentMetadata as SharedComponentMetadata } from "../../../../shared/metadata";
import type { ComponentInfo, InputConfig, SlotDefinition, StructureValue } from "../../types";
import { isArrayStructureInput, structureHasComponentValues } from "./inputUtils";

type Logger = (...args: unknown[]) => void;

function buildSlotFromInput(
  propName: string,
  inputConfig: InputConfig,
  metadata?: SharedComponentMetadata | null
): SlotDefinition {
  const options = inputConfig.options ?? {};
  const structureRef = options.structures ?? "";
  const structureName = structureRef.replace("_structures.", "");

  const metaSlot = metadata?.slots?.find((s) => s.fallbackFor === propName);

  const slotDef: SlotDefinition = {
    propName,
    label:
      typeof inputConfig.label === "string"
        ? inputConfig.label
        : propName.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    allowedComponents: [],
    structureName,
    astroSlotName: metaSlot?.name,
    isRepeatable: !!metaSlot?.childComponent,
  };

  if (options.allow_as_prop === true) {
    slotDef.allowAsProp = true;
    slotDef.propType = options.prop_type || "textarea";
    slotDef.propLabel = options.prop_label || slotDef.label;
    slotDef.propConfig = options.prop_config || {};
  }

  return slotDef;
}

/** Scan page-sections/builders and return discovered builder components. */
export function scanPageBuilderComponents(
  metadataMap: Map<string, SharedComponentMetadata>,
  log: Logger = () => {}
): ComponentInfo[] {
  const buildersDir = join(process.cwd(), "src/components/page-sections/builders");
  const components: ComponentInfo[] = [];

  if (!(existsSync(buildersDir) && statSync(buildersDir).isDirectory())) {
    return components;
  }

  const builderEntries = readdirSync(buildersDir, { withFileTypes: true });

  for (const entry of builderEntries) {
    if (!entry.isDirectory()) continue;

    const fullPath = join(buildersDir, entry.name);
    const kebabName = entry.name;
    const pascalName = toPascalCase(kebabName);

    const astroFiles = readdirSync(fullPath).filter((f) => f.endsWith(".astro"));
    const mainComponentFile = astroFiles.find((f) => f.replace(".astro", "") === pascalName);

    if (!mainComponentFile) continue;

    const componentPath = `page-sections/builders/${entry.name}`;
    const inputsPath = join(fullPath, `${entry.name}.cloudcannon.inputs.yml`);
    const structureValuePath = join(fullPath, `${entry.name}.cloudcannon.structure-value.yml`);

    let inputs: Record<string, InputConfig> = {};
    let structureValue: StructureValue | null = null;
    let description = "";
    let icon = "";
    let componentSlots: SlotDefinition[] = [];
    const metadata = metadataMap.get(componentPath) || metadataMap.get(entry.name);

    if (existsSync(inputsPath)) {
      try {
        const inputsContent = readFileSync(inputsPath, "utf8");

        inputs = (yaml.load(inputsContent) as Record<string, InputConfig>) || {};

        for (const propName in inputs) {
          const inputConfig = inputs[propName];

          if (isArrayStructureInput(inputConfig)) {
            componentSlots.push(buildSlotFromInput(propName, inputConfig, metadata));
          }
        }
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

    // Keep only true component slots:
    // - explicitly declared metadata slots, OR
    // - arrays whose structures contain `_component` blocks.
    componentSlots = componentSlots.filter((slot) => {
      const metaSlot = metadata?.slots?.find((s) => s.fallbackFor === slot.propName);

      return !!metaSlot || structureHasComponentValues(structureValue, slot.structureName || "");
    });

    if (structureValue?._structures) {
      for (const [inlineStructName, inlineStructDef] of Object.entries(
        structureValue._structures
      )) {
        if (inlineStructDef && typeof inlineStructDef === "object" && "values" in inlineStructDef) {
          const values = (inlineStructDef as Record<string, unknown>).values;

          if (Array.isArray(values)) {
            for (const valueItem of values) {
              const typedValue = valueItem as { _inputs?: Record<string, InputConfig> };

              if (typedValue._inputs) {
                for (const [nestedPropName, nestedInputDef] of Object.entries(typedValue._inputs)) {
                  if (isArrayStructureInput(nestedInputDef)) {
                    const nestedStructureRef = nestedInputDef.options?.structures ?? "";
                    const nestedStructureName = nestedStructureRef.replace("_structures.", "");
                    const nestedMeta =
                      metadataMap.get(componentPath) || metadataMap.get(entry.name);
                    const nestedMetaSlot = nestedMeta?.slots?.find(
                      (s) => s.fallbackFor === nestedPropName
                    );

                    if (
                      !nestedMetaSlot &&
                      !structureHasComponentValues(structureValue, nestedStructureName)
                    ) {
                      continue;
                    }

                    if (!componentSlots.some((s) => s.propName === nestedPropName)) {
                      const nestedSlotDef = buildSlotFromInput(
                        nestedPropName,
                        nestedInputDef,
                        nestedMeta
                      );

                      nestedSlotDef.structureName = nestedStructureName;
                      componentSlots.push(nestedSlotDef);

                      log(
                        `Found nested slot "${nestedPropName}" in component "${componentPath}" via inline structure "${inlineStructName}" -> structure "${nestedStructureName}"`
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    components.push({
      path: componentPath,
      fileName: mainComponentFile,
      category: "page-builders",
      name: entry.name,
      displayName: structureValue?.label || kebabToTitleCase(entry.name),
      inputs,
      structureValue,
      supportsSlots: componentSlots.length > 0,
      description,
      icon,
      slots: componentSlots,
    });
  }

  return components;
}
