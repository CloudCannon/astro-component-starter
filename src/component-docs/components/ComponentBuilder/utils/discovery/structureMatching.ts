import type { ComponentInfo, NestingRules } from "../../types";

type Logger = (...args: unknown[]) => void;

/** Check if a component is allowed in a structure based on nesting rules. */
export function isComponentAllowedInStructure(
  componentPath: string,
  structureName: string,
  nestingRules: NestingRules,
  isVirtual = false
): boolean {
  const allowed = nestingRules[structureName] || [];
  const excluded = nestingRules[`${structureName}_excluded`] || [];

  const componentName = componentPath.split("/").pop();
  const componentPathWithName = componentName ? `${componentPath}/${componentName}` : componentPath;

  if (excluded.includes(componentPath) || excluded.includes(componentPathWithName)) {
    return false;
  }

  if (allowed.includes(componentPath) || allowed.includes(componentPathWithName)) {
    return true;
  }

  // Virtual sub-components (e.g. definition-list-item) should only match
  // when explicitly listed, not through parent wildcards.
  if (isVirtual) return false;

  for (const pattern of allowed) {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -2);

      if (componentPath.startsWith(`${prefix}/`)) {
        if (!excluded.includes(componentPath) && !excluded.includes(componentPathWithName)) {
          return true;
        }
      }
    }
  }

  return false;
}

/** Get allowed components for a structure. */
export function getAllowedComponentsForStructure(
  structureName: string,
  allComponents: ComponentInfo[],
  nestingRules: NestingRules,
  log: Logger = () => {}
): string[] {
  log(`Getting allowed components for structure "${structureName}"`);
  log(`Rules for this structure:`, nestingRules[structureName]);

  const filtered = allComponents
    .filter((c) => {
      const allowed = isComponentAllowedInStructure(
        c.path,
        structureName,
        nestingRules,
        c.isVirtual
      );

      if (allowed) {
        log(`✓ ${c.path} is allowed`);
      }

      return allowed;
    })
    .map((c) => c.path);

  log(`Total allowed: ${filtered.length}`);

  return filtered;
}
