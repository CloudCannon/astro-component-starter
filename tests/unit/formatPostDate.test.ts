import { describe, expect, it } from "vitest";
import { formatPostDate } from "../../src/components/utils/formatPostDate";

describe("formatPostDate", () => {
  it("renders the long form every blog surface shares", () => {
    expect(formatPostDate(new Date(Date.UTC(2026, 8, 3, 12)))).toBe("September 3, 2026");
  });

  it("accepts an ISO string as well as a Date", () => {
    expect(formatPostDate("2026-09-03T12:00:00Z")).toBe(
      formatPostDate(new Date("2026-09-03T12:00:00Z"))
    );
  });

  it("honours the locale", () => {
    expect(formatPostDate("2026-09-03T12:00:00Z", "en-GB")).toBe("3 September 2026");
  });

  it("renders empty rather than 'Invalid Date'", () => {
    expect(formatPostDate("not a date")).toBe("");
    expect(formatPostDate(new Date("nope"))).toBe("");
    expect(formatPostDate(null)).toBe("");
    expect(formatPostDate(undefined)).toBe("");
  });
});
