/** Convert kebab-case name to PascalCase. */
export function toPascalCase(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
