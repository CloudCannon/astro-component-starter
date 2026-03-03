import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { toKebabCase, toPascalCase } from "../../../../shared/caseUtils";
import type { ComponentMetadata as SharedComponentMetadata } from "../../../../shared/metadata";
import type { ComponentInfo, InputConfig, NestingRules, SlotDefinition } from "../../types";
import { getAllowedComponentsForStructure } from "./structureMatching";

type Logger = (...args: unknown[]) => void;

/** Register virtual components from inline structure definitions. */
export function registerVirtualComponents(
  components: ComponentInfo[],
  metadataMap: Map<string, SharedComponentMetadata>,
  log: Logger = () => {}
): ComponentInfo[] {
  const virtualComponents: ComponentInfo[] = [];

  for (const component of components) {
    if (component.structureValue?._structures) {
      for (const [, structureDef] of Object.entries(component.structureValue._structures)) {
        const sd = structureDef as Record<string, unknown>;

        if (!sd?.values || !Array.isArray(sd.values)) continue;

        for (const valueItem of sd.values as Record<string, unknown>[]) {
          const valueObj = valueItem?.value as Record<string, unknown> | undefined;

          if (!valueObj?._component) continue;

          const virtualPath = valueObj._component as string;

          if (
            components.some((c) => c.path === virtualPath) ||
            virtualComponents.some((c) => c.path === virtualPath)
          ) {
            continue;
          }

          log(`Registering virtual component: ${virtualPath}`);

          const virtualSlots: SlotDefinition[] = [];
          const valueInputs = valueItem._inputs as
            | Record<string, Record<string, unknown>>
            | undefined;

          if (valueInputs) {
            for (const [propName, inputDef] of Object.entries(valueInputs)) {
              if (
                typeof inputDef === "object" &&
                inputDef !== null &&
                "type" in inputDef &&
                inputDef.type === "array" &&
                "options" in inputDef &&
                typeof inputDef.options === "object" &&
                inputDef.options !== null &&
                "structures" in inputDef.options &&
                typeof (inputDef.options as Record<string, unknown>).structures === "string"
              ) {
                const nestedStructureName = (
                  (inputDef.options as Record<string, unknown>).structures as string
                ).replace("_structures.", "");

                virtualSlots.push({
                  propName,
                  label: propName.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
                  allowedComponents: [],
                  structureName: nestedStructureName,
                });
              }
            }
          }

          const mergedInputs: Record<string, InputConfig> = {};

          for (const [key, val] of Object.entries(valueObj)) {
            if (key.startsWith("_")) continue;

            if (valueInputs && valueInputs[key] && typeof valueInputs[key] === "object") {
              mergedInputs[key] = valueInputs[key] as InputConfig;
            } else {
              mergedInputs[key] = (val as InputConfig) || {};
            }
          }

          const previewObj = valueItem.preview as Record<string, unknown> | undefined;
          const parentMetadata = metadataMap.get(component.path) || metadataMap.get(component.name);
          let virtualDisplayName =
            (valueItem.label as string) || virtualPath.split("/").pop() || virtualPath;

          if (parentMetadata?.childComponent?.name) {
            const childName = parentMetadata.childComponent.name;
            const childKebab = toKebabCase(childName);
            const expectedVirtualPath = `${component.path}/${childKebab}`;

            if (virtualPath === expectedVirtualPath) {
              virtualDisplayName = childName.replace(/([a-z])([A-Z])/g, "$1 $2");
            }
          }

          virtualComponents.push({
            path: virtualPath,
            category: component.category,
            name: virtualPath.split("/").pop() || virtualPath,
            displayName: virtualDisplayName,
            fileName: parentMetadata?.childComponent?.name
              ? `${parentMetadata.childComponent.name}.astro`
              : `${toPascalCase(virtualPath.split("/").pop() || virtualPath)}.astro`,
            inputs: mergedInputs,
            structureValue: {
              label: (valueItem.label as string) || undefined,
              icon: (previewObj?.icon as string) || undefined,
              value: valueObj as Record<string, unknown>,
            },
            supportsSlots: virtualSlots.length > 0,
            description: "",
            icon: (previewObj?.icon as string) || "",
            slots: virtualSlots.length > 0 ? virtualSlots : undefined,
            isVirtual: true,
          });
        }
      }
    }
  }

  // Some wrapper components intentionally omit `_component` from inline structure values
  // (e.g. Grid items / Carousel slides). For those, synthesize the virtual child component
  // from docs metadata so the builder can still add/edit repeatable wrapper items.
  for (const component of components) {
    const parentMetadata = metadataMap.get(component.path) || metadataMap.get(component.name);
    const childMeta = parentMetadata?.childComponent;

    if (!childMeta?.name) continue;

    const childKebab = toKebabCase(childMeta.name);
    const virtualPath = `${component.path}/${childKebab}`;
    const alreadyRegistered =
      components.some((c) => c.path === virtualPath) ||
      virtualComponents.some((c) => c.path === virtualPath);

    if (alreadyRegistered) continue;

    const repeatableSlot = component.slots?.find((slot) => slot.isRepeatable);
    const slotStructureName = repeatableSlot?.structureName;
    const structureDef = slotStructureName
      ? (component.structureValue?._structures?.[slotStructureName] as
          | Record<string, unknown>
          | undefined)
      : undefined;
    const firstValue = Array.isArray(structureDef?.values)
      ? (structureDef.values[0] as Record<string, unknown> | undefined)
      : undefined;
    const valueObj = (firstValue?.value as Record<string, unknown> | undefined) || {};
    const valueInputs =
      (firstValue?._inputs as Record<string, Record<string, unknown>> | undefined) || {};
    const virtualSlots: SlotDefinition[] = [];

    for (const [propName, inputDef] of Object.entries(valueInputs)) {
      if (
        typeof inputDef === "object" &&
        inputDef !== null &&
        "type" in inputDef &&
        inputDef.type === "array" &&
        "options" in inputDef &&
        typeof inputDef.options === "object" &&
        inputDef.options !== null &&
        "structures" in inputDef.options &&
        typeof (inputDef.options as Record<string, unknown>).structures === "string"
      ) {
        const nestedStructureName = (
          (inputDef.options as Record<string, unknown>).structures as string
        ).replace("_structures.", "");

        virtualSlots.push({
          propName,
          label: propName.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
          allowedComponents: [],
          structureName: nestedStructureName,
        });
      }
    }

    const mergedInputs: Record<string, InputConfig> = {};

    for (const [key, val] of Object.entries(valueObj)) {
      if (key.startsWith("_")) continue;

      if (valueInputs[key] && typeof valueInputs[key] === "object") {
        mergedInputs[key] = valueInputs[key] as InputConfig;
      } else {
        mergedInputs[key] = (val as InputConfig) || {};
      }
    }

    log(`Registering metadata virtual component: ${virtualPath}`);
    virtualComponents.push({
      path: virtualPath,
      category: component.category,
      name: childKebab,
      displayName: childMeta.name.replace(/([a-z])([A-Z])/g, "$1 $2"),
      fileName: `${childMeta.name}.astro`,
      inputs: mergedInputs,
      structureValue: {
        value: valueObj,
      },
      supportsSlots: virtualSlots.length > 0,
      description: "",
      icon: "",
      slots: virtualSlots.length > 0 ? virtualSlots : undefined,
      isVirtual: true,
    });
  }

  return virtualComponents;
}

/** Populate slot allowed components using structure nesting rules. */
export function populateAllowedComponentsForSlots(
  components: ComponentInfo[],
  nestingRules: NestingRules,
  log: Logger = () => {}
): void {
  for (const component of components) {
    if (component.slots) {
      for (const slot of component.slots) {
        if (slot.structureName) {
          log(
            `Processing slot "${slot.propName}" in component "${component.path}" with structure "${slot.structureName}"`
          );
          slot.allowedComponents = getAllowedComponentsForStructure(
            slot.structureName,
            components,
            nestingRules,
            log
          );
          if (slot.isRepeatable) {
            const wrapperVirtualChildren = components
              .filter((c) => c.isVirtual && c.path.startsWith(`${component.path}/`))
              .map((c) => c.path);

            for (const childPath of wrapperVirtualChildren) {
              if (!slot.allowedComponents.includes(childPath)) {
                slot.allowedComponents.push(childPath);
              }
            }
          }
          log("-> Allowed components:", slot.allowedComponents);
        }
      }
    }
  }
}

/** Group components by category. */
export function groupComponentsByCategory(
  components: ComponentInfo[]
): Record<string, ComponentInfo[]> {
  const byCategory: Record<string, ComponentInfo[]> = {};

  components.forEach((component) => {
    if (!byCategory[component.category]) {
      byCategory[component.category] = [];
    }

    byCategory[component.category].push(component);
  });

  return byCategory;
}

/** Discover page-sections categories by reading folder structure. */
export function discoverPageSectionCategories(): string[] {
  const pageSectionsDir = join(process.cwd(), "src/components/page-sections");
  let pageSectionCategories: string[] = [];

  if (existsSync(pageSectionsDir) && statSync(pageSectionsDir).isDirectory()) {
    try {
      pageSectionCategories = readdirSync(pageSectionsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    } catch (error) {
      console.warn("Error reading page-sections directory:", error);
    }
  }

  return pageSectionCategories;
}
