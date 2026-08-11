/** Safe for non-string inputs — numbers/booleans can arrive from YAML/CMS content. */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
