import { describe, expect, it } from "vitest";
import { paginationWindow } from "../../src/components/utils/paginationWindow";

describe("paginationWindow", () => {
  it("shows every page when they all fit", () => {
    expect(paginationWindow(1, 4)).toEqual({
      pages: [1, 2, 3, 4],
      showFirst: false,
      showLast: false,
      gapBefore: false,
    });
  });

  it("keeps the bar at maxVisiblePages once both jumps are needed", () => {
    const { pages, showFirst, showLast, gapBefore } = paginationWindow(5, 10);

    expect(pages).toEqual([4, 5, 6]);
    expect(showFirst).toBe(true);
    expect(showLast).toBe(true);
    expect(gapBefore).toBe(true);
    // 1 … 4 5 6 … 10 — five numbered items, the ellipses do not count.
    expect(pages.length + Number(showFirst) + Number(showLast)).toBe(5);
  });

  it("drops the leading ellipsis when the window starts at page 2", () => {
    const { showFirst, gapBefore } = paginationWindow(3, 10);

    expect(showFirst).toBe(true);
    expect(gapBefore).toBe(false);
  });

  it("keeps the current page inside the window on the last page", () => {
    const { pages, showFirst, showLast } = paginationWindow(10, 10);

    expect(pages).toEqual([7, 8, 9, 10]);
    expect(showFirst).toBe(true);
    // Without the tail clamp, page 10 fell out of the window and rendered as a
    // plain link to itself with no `aria-current`.
    expect(showLast).toBe(false);
  });

  it("always includes the current page", () => {
    for (let total = 1; total <= 20; total += 1) {
      for (let current = 1; current <= total; current += 1) {
        const { pages, showFirst, showLast } = paginationWindow(current, total);
        const rendered = [...(showFirst ? [1] : []), ...pages, ...(showLast ? [total] : [])];

        expect(rendered, `page ${current} of ${total}`).toContain(current);
      }
    }
  });

  it("never renders a page number outside the range, or out of order", () => {
    for (let total = 1; total <= 20; total += 1) {
      for (let current = 1; current <= total; current += 1) {
        const { pages } = paginationWindow(current, total);

        expect(Math.min(...pages)).toBeGreaterThanOrEqual(1);
        expect(Math.max(...pages)).toBeLessThanOrEqual(total);
        expect([...pages].sort((a, b) => a - b)).toEqual(pages);
      }
    }
  });

  it("honours a custom window size", () => {
    expect(paginationWindow(5, 20, 7).pages).toEqual([4, 5, 6, 7, 8]);
  });
});
