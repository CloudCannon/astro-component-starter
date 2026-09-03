import { isNonEmptyString } from "./isNonEmptyString";
import { slugifyLabel } from "./slugify";

/**
 * Label-association id for a form control, derived from the field's own `name`
 * or label rather than generated: a random id differs between the editor's
 * re-render and the built page, so every `for`/`aria-describedby` written
 * against one goes stale. Two fields sharing a `name` on one page collide as a
 * result — give one an explicit `id`.
 */
export function generateFieldId(
  prefix: string,
  providedId?: string | null,
  source?: unknown
): string {
  if (isNonEmptyString(providedId)) return (providedId as string).trim();

  const slug = isNonEmptyString(source) ? slugifyLabel(source as string) : "";

  return slug ? `${prefix}-${slug}` : prefix;
}

interface FormFieldProps {
  prefix: string;
  id?: string | null;
  name?: unknown;
  label?: unknown;
  placeholder?: unknown;
  type?: unknown;
  autocomplete?: unknown;
  required?: boolean;
  hint?: unknown;
  error?: unknown;
}

interface FormFieldParts {
  fieldId: string;
  /** Spread onto the control itself — the `<input>`, `<select>`, `<textarea>`. */
  controlAttributes: Record<string, unknown>;
  /** Spread onto `FormField.astro`, which renders the label, hint and error. */
  shellAttributes: Record<string, unknown>;
}

const AUTOCOMPLETE_BY_TYPE: Record<string, string> = {
  email: "email",
  tel: "tel",
  url: "url",
};

/**
 * Ordered `name` fragments to `autocomplete` tokens (WCAG 1.3.5). Deliberately
 * short: a wrong token autofills the wrong value, which is worse than none, so
 * anything ambiguous ("password" — current or new?) is left to the author.
 * Order matters — `company_name` must not read as a person's name.
 */
const AUTOCOMPLETE_BY_NAME: [RegExp, string][] = [
  [/compan|organi[sz]ation|business|employer/, "organization"],
  [/job-?title|position|role/, "organization-title"],
  [/(first|given)-?name|forename/, "given-name"],
  [/(last|family|sur)-?name/, "family-name"],
  [/e-?mail/, "email"],
  [/phone|mobile|(^|-)tel(-|$)/, "tel"],
  [/street|address-?(1|line)/, "street-address"],
  [/(^|-)(city|town|suburb)(-|$)/, "address-level2"],
  [/(^|-)(state|province|region)(-|$)/, "address-level1"],
  [/zip|post(al)?-?code/, "postal-code"],
  [/country/, "country-name"],
  [/website|(^|-)url(-|$)/, "url"],
  [/b-?day|birth-?day|date-?of-?birth|(^|-)dob(-|$)/, "bday"],
  [/(^|-)(full-?)?name(-|$)/, "name"],
];

/**
 * The `autocomplete` token a field's own type and name imply, or undefined
 * when nothing matches confidently. An explicit `autocomplete` prop wins.
 */
export function inferAutocomplete(type?: unknown, name?: unknown): string | undefined {
  if (isNonEmptyString(type) && AUTOCOMPLETE_BY_TYPE[(type as string).trim()]) {
    return AUTOCOMPLETE_BY_TYPE[(type as string).trim()];
  }

  if (!isNonEmptyString(name)) return undefined;

  const key = (name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return AUTOCOMPLETE_BY_NAME.find(([pattern]) => pattern.test(key))?.[1];
}

/** The ids, ARIA and shell props of a field rendered through `FormField.astro`. */
export function formFieldParts({
  prefix,
  id,
  name,
  label,
  placeholder,
  type,
  autocomplete,
  required = false,
  hint,
  error,
}: FormFieldProps): FormFieldParts {
  const fieldId = generateFieldId(prefix, id, isNonEmptyString(name) ? name : label);
  const hintId = isNonEmptyString(hint) ? `${fieldId}-hint` : undefined;
  const errorId = isNonEmptyString(error) ? `${fieldId}-error` : undefined;

  // A field with no visible label has no accessible name at all, so fall back
  // to whatever text the author did give it.
  const fallbackName = isNonEmptyString(label)
    ? undefined
    : isNonEmptyString(placeholder)
      ? (placeholder as string)
      : isNonEmptyString(name)
        ? (name as string)
        : undefined;

  return {
    fieldId,
    controlAttributes: {
      id: fieldId,
      required,
      autocomplete: isNonEmptyString(autocomplete)
        ? (autocomplete as string)
        : inferAutocomplete(type, name),
      "aria-label": fallbackName,
      "aria-required": required ? "true" : "false",
      "aria-invalid": errorId ? "true" : undefined,
      "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    },
    shellAttributes: { fieldId, label, required, hint, hintId, error, errorId },
  };
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
