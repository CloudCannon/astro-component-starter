/** Deeply removes `style` fields from block data. */
export function removeStyleField(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => removeStyleField(item));
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key !== "style") {
        result[key] = removeStyleField(nestedValue);
      }
    }

    return result;
  }

  return value;
}
