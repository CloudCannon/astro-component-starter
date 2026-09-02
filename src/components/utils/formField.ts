/** Label-association id for a form control: a provided id wins, otherwise a prefixed UUID. */
export function generateFieldId(prefix: string, providedId?: string | null): string {
  return providedId || `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Narrows a value to what `<input type="date">` accepts (`YYYY-MM-DD`).
 * CloudCannon's `date` input stores a full ISO datetime, which the browser
 * discards silently — the field just renders empty.
 */
export function toDateInputValue(value?: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }

  if (typeof value !== "string") return undefined;

  return /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1];
}
