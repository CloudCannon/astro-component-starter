import { toPascalCase } from "../../../shared/caseUtils";

export function getComponentDisplayName(componentPath: string): string {
  // Convert "wrappers/card" to "Card", "elements/button" to "Button", etc.
  const parts = componentPath.split("/");
  const lastPart = parts[parts.length - 1];

  // Convert kebab-case to PascalCase
  return toPascalCase(lastPart);
}
