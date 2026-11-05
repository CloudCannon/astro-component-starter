/** An unparseable date renders empty, not the literal "Invalid Date". */
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
