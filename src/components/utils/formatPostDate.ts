/** The long date format every blog surface shares. An unparseable date renders
 *  empty rather than the literal "Invalid Date". Pure, so it unit-tests. */
export function formatPostDate(
  date: Date | string | number | null | undefined,
  locale = "en-US"
): string {
  if (date == null) return "";

  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.valueOf())) return "";

  return value.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
