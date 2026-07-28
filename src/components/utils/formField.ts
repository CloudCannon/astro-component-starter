/**
 * Resolve the id used to associate a form control with its `<label>`.
 *
 * Returns `providedId` when the author supplied one (e.g. via `id` on the
 * component), otherwise a unique `${prefix}-<uuid>` value generated per render.
 */
export function generateFieldId(prefix: string, providedId?: string | null): string {
  return providedId || `${prefix}-${crypto.randomUUID()}`;
}
