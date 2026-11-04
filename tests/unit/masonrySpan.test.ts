import { describe, expect, it } from "vitest";
import { masonrySpan } from "../../src/components/utils/masonrySpan";

describe("masonrySpan", () => {
  it("covers the content height plus one gap in whole units", () => {
    // 200px content + 16px gap on 8px rows -> 27 rows (216 / 8).
    expect(masonrySpan(200, 16, 8)).toBe(27);
  });

  it("rounds partial units up so content never overflows its span", () => {
    expect(masonrySpan(201, 16, 8)).toBe(28);
    expect(masonrySpan(1, 0, 8)).toBe(1);
  });

  it("treats zero gap as content-only", () => {
    expect(masonrySpan(80, 0, 8)).toBe(10);
  });

  it("never returns less than one row", () => {
    expect(masonrySpan(0, 16, 8)).toBe(1);
    expect(masonrySpan(-5, 16, 8)).toBe(1);
    expect(masonrySpan(Number.NaN, 16, 8)).toBe(1);
  });

  it("ignores a malformed gap", () => {
    expect(masonrySpan(80, Number.NaN, 8)).toBe(10);
    expect(masonrySpan(80, -4, 8)).toBe(10);
  });
});
