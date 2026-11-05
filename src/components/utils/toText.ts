/** Text value from a CMS/YAML scalar: unquoted `2024` arrives as a number, not a string. */
export function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  return "";
}
