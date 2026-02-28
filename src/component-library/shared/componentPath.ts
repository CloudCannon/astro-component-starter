import { toKebabCase } from "./caseUtils";

/**
 * Gets the full component path for a child component.
 * Example: "typography/list" + "ListItem" -> "typography/list/list-item"
 */
export function getChildComponentPath(parentPath: string, childName: string): string {
  return `${parentPath}/${toKebabCase(childName)}`;
}
