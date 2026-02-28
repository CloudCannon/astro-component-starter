/** Convert PascalCase name to kebab-case. */
export function toKebabCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Convert PascalCase name to kebab-case, preserving acronym boundaries. */
export function pascalToKebab(name: string): string {
  return name
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

/** Convert kebab-case name to PascalCase. */
export function toPascalCase(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/** Convert kebab-case name to a spaced title (e.g. "foo-bar" -> "Foo Bar"). */
export function kebabToTitleCase(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
