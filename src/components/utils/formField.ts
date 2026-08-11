/** Label-association id for a form control: a provided id wins, otherwise a prefixed UUID. */
export function generateFieldId(prefix: string, providedId?: string | null): string {
  return providedId || `${prefix}-${crypto.randomUUID()}`;
}
