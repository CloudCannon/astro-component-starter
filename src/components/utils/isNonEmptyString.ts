/** Safe for non-strings: numbers/booleans can arrive from YAML. */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
