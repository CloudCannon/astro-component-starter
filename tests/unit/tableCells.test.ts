import { describe, expect, it } from "vitest";
import { columnCount, normalizeRow } from "../../src/components/utils/tableCells";

describe("columnCount", () => {
  it("uses the header width when rows are narrower", () => {
    expect(columnCount(["a", "b", "c"], [{ cells: ["1"] }])).toBe(3);
  });

  it("widens to the widest row when a row exceeds the header", () => {
    expect(columnCount(["a"], [{ cells: ["1", "2", "3"] }])).toBe(3);
  });

  it("handles missing header, rows, and cells", () => {
    expect(columnCount()).toBe(0);
    expect(columnCount([], [null, {}, { cells: null }])).toBe(0);
  });
});

describe("normalizeRow", () => {
  it("pads short rows with empty strings so <td>s never collapse", () => {
    expect(normalizeRow(["1"], 3)).toEqual(["1", "", ""]);
  });

  it("truncates nothing when the row already fits", () => {
    expect(normalizeRow(["1", "2"], 2)).toEqual(["1", "2"]);
  });

  it("stringifies non-string cells and blanks nullish ones", () => {
    expect(normalizeRow([42, null, undefined], 3)).toEqual(["42", "", ""]);
  });

  it("returns all-empty cells for a missing row", () => {
    expect(normalizeRow(null, 2)).toEqual(["", ""]);
  });
});
