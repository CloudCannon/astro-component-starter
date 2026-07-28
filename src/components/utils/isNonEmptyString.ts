/**
 * True when `value` is a string containing non-whitespace characters.
 *
 * Safe for non-string inputs (numbers/booleans can arrive from YAML props):
 * returns `false` rather than throwing, matching the behaviour of the
 * `typeof x === "string" && x.trim() !== ""` guards it replaces.
 */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
