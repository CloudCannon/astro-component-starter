import { describe, expect, it } from "vitest";
import { generateFieldId, toDateInputValue } from "../../src/components/utils/formField";

// `generateFieldId` uses crypto.randomUUID() when no id is provided, so these
// tests assert the contract (prefix, uniqueness, precedence of the provided
// id) rather than exact generated values.
describe("generateFieldId", () => {
  it("returns the provided id untouched when one is supplied", () => {
    expect(generateFieldId("input", "my-custom-id")).toBe("my-custom-id");
  });

  it("generates a prefixed id when no id is provided", () => {
    expect(generateFieldId("input")).toMatch(/^input-/);
    expect(generateFieldId("select", null)).toMatch(/^select-/);
    expect(generateFieldId("textarea", undefined)).toMatch(/^textarea-/);
  });

  it("treats an empty-string id as absent and generates one", () => {
    expect(generateFieldId("input", "")).toMatch(/^input-/);
  });

  it("generates a non-empty unique suffix per call", () => {
    const first = generateFieldId("field");
    const second = generateFieldId("field");

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan("field-".length);
  });
});

describe("toDateInputValue", () => {
  it("keeps a bare YYYY-MM-DD value", () => {
    expect(toDateInputValue("2026-01-01")).toBe("2026-01-01");
  });

  it("drops the time part of an ISO datetime", () => {
    expect(toDateInputValue("2026-01-01T15:30:00")).toBe("2026-01-01");
    expect(toDateInputValue("2026-01-01T15:30:00.000Z")).toBe("2026-01-01");
  });

  it("formats a Date object", () => {
    expect(toDateInputValue(new Date("2026-01-01T15:30:00Z"))).toBe("2026-01-01");
  });

  it("returns undefined for anything a date input cannot use", () => {
    expect(toDateInputValue(undefined)).toBeUndefined();
    expect(toDateInputValue(null)).toBeUndefined();
    expect(toDateInputValue("")).toBeUndefined();
    expect(toDateInputValue("next tuesday")).toBeUndefined();
    expect(toDateInputValue(new Date("nope"))).toBeUndefined();
  });
});
