import { isNonEmptyString } from "./isNonEmptyString";
import { slugifyLabel } from "./slugify";

// Derived, never random: a random id differs between the editor re-render and the
// built page. Two fields sharing a `name` on one page collide; give one an explicit `id`.
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
  controlAttributes: Record<string, unknown>;
  shellAttributes: Record<string, unknown>;
}

const AUTOCOMPLETE_BY_TYPE: Record<string, string> = {
  email: "email",
  tel: "tel",
  url: "url",
};

// Order matters (`company_name` is not a person's name). Keep it to unambiguous
// matches: a wrong token autofills the wrong value, which is worse than none.
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

export function inferAutocomplete(type?: unknown, name?: unknown): string | undefined {
  if (isNonEmptyString(type) && AUTOCOMPLETE_BY_TYPE[(type as string).trim()]) {
    return AUTOCOMPLETE_BY_TYPE[(type as string).trim()];
  }

  if (!isNonEmptyString(name)) return undefined;

  const key = (name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return AUTOCOMPLETE_BY_NAME.find(([pattern]) => pattern.test(key))?.[1];
}

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
      "aria-required": required ? "true" : undefined,
      "aria-invalid": errorId ? "true" : undefined,
      "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    },
    shellAttributes: { fieldId, label, required, hint, hintId, error, errorId },
  };
}

// CloudCannon stores a full ISO datetime, which `<input type="date">` silently discards.
export function toDateInputValue(value?: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }

  if (typeof value !== "string") return undefined;

  return /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1];
}
