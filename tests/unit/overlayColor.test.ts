import { describe, expect, it } from "vitest";
import { overlayColor } from "../../src/components/utils/overlayColor";

describe("overlayColor", () => {
  it("darkens with black for negative overlay values", () => {
    expect(overlayColor(-0.5)).toBe("rgba(0, 0, 0, 0.5)");
    expect(overlayColor(-1)).toBe("rgba(0, 0, 0, 1)");
  });

  it("lightens with white for positive overlay values", () => {
    expect(overlayColor(0.25)).toBe("rgba(255, 255, 255, 0.25)");
    expect(overlayColor(1)).toBe("rgba(255, 255, 255, 1)");
  });

  it("uses the magnitude of the overlay as the alpha", () => {
    expect(overlayColor(-0.05)).toBe("rgba(0, 0, 0, 0.05)");
    expect(overlayColor(0.9)).toBe("rgba(255, 255, 255, 0.9)");
  });

  it("treats zero as white with zero alpha (callers skip rendering at 0)", () => {
    expect(overlayColor(0)).toBe("rgba(255, 255, 255, 0)");
  });
});
