import { describe, expect, it } from "vitest";
import { prepareImageData, resolveImageSource } from "../../src/components/utils/image";

// image.ts eagerly globs /src/assets/images/**/* and imports `astro:assets`
// (stubbed via vitest.config.ts). These tests only exercise the pure,
// non-local-asset code paths: remote/public sources never touch the asset
// registry or Astro's image service.

describe("resolveImageSource", () => {
  it("returns non-/src/ sources unchanged", () => {
    expect(resolveImageSource("https://example.com/pic.jpg")).toBe("https://example.com/pic.jpg");
    expect(resolveImageSource("/images/uploaded.png")).toBe("/images/uploaded.png");
  });

  it("returns a /src/ path unchanged when no matching asset exists", () => {
    expect(resolveImageSource("/src/assets/images/definitely-not-a-real-file-xyz.jpg")).toBe(
      "/src/assets/images/definitely-not-a-real-file-xyz.jpg"
    );
  });
});

describe("prepareImageData (non-local sources)", () => {
  it("passes a remote source through without optimization", () => {
    const data = prepareImageData({
      source: "https://example.com/pic.jpg",
      width: 800,
      height: 600,
    });

    expect(data.shouldRenderOptimizedPicture).toBe(false);
    expect(data.imageSrc).toBe("https://example.com/pic.jpg");
    expect(data.imageWidth).toBe(800);
    expect(data.imageHeight).toBe(600);
    expect(data.finalWidth).toBe(800);
    expect(data.finalHeight).toBe(600);
    expect(data.useFit).toBeUndefined();
    expect(data.usePosition).toBeUndefined();
  });

  it("normalizes widths: coerces, drops non-positive values, dedupes, and sorts", () => {
    const data = prepareImageData({
      source: "https://example.com/pic.jpg",
      width: 800,
      widths: [1200, "400", 400, -5, 0, "not-a-number", 800.4],
    });

    // Not optimized, so the widths are normalized but never capped by width.
    expect(data.filteredWidths).toEqual([400, 800, 1200]);
  });

  it("returns an empty widths list when widths is not an array", () => {
    const data = prepareImageData({ source: "https://example.com/pic.jpg", widths: "800" });

    expect(data.filteredWidths).toEqual([]);
  });

  it("ignores aspectRatio for sources that are not optimized local assets", () => {
    const data = prepareImageData({
      source: "/images/uploaded.png",
      width: 1000,
      height: 500,
      aspectRatio: "square",
    });

    expect(data.shouldRenderOptimizedPicture).toBe(false);
    expect(data.finalWidth).toBe(1000);
    expect(data.finalHeight).toBe(500);
    expect(data.useFit).toBeUndefined();
  });
});
