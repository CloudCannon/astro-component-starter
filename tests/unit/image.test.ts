import { describe, expect, it } from "vitest";
import {
  getResponsiveWidths,
  heightForWidth,
  prepareImageData,
  resolveImageSource,
  resolveShareImage,
} from "../../src/components/utils/image";

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

describe("resolveShareImage", () => {
  it("returns remote and public paths with no dimensions", () => {
    expect(resolveShareImage("https://example.com/share.jpg")).toEqual({
      src: "https://example.com/share.jpg",
      isSvg: false,
    });
    expect(resolveShareImage("/images/uploaded.png")).toEqual({
      src: "/images/uploaded.png",
      isSvg: false,
    });
  });

  it("flags SVG sources so callers skip the 1200×630 raster crop", () => {
    expect(resolveShareImage("https://example.com/mark.svg").isSvg).toBe(true);
    expect(resolveShareImage("/brand.svg").isSvg).toBe(true);
  });
});

describe("heightForWidth", () => {
  it("scales native height to a srcset-cap width without stretching", () => {
    // Card Grid masonry: castle.jpg is 1707×1280, covers pass width={800}.
    expect(heightForWidth(1707, 1280, 800)).toBe(600);
    expect(heightForWidth(1440, 1080, 800)).toBe(600);
  });

  it("never returns a zero height", () => {
    expect(heightForWidth(100, 1, 1)).toBe(1);
  });
});

// `prepareImageData` only passes a max width for optimized local assets, which
// need Astro's image pipeline — so the capping branch is exercised directly.
describe("getResponsiveWidths", () => {
  const PRESETS = [640, 1280, 2560];

  it("returns every candidate when no max width is given", () => {
    expect(getResponsiveWidths(PRESETS)).toEqual([640, 1280, 2560]);
  });

  it("includes the native width when it falls between two steps", () => {
    // The reported case: a 1181px source was filtered down to a lone 640w
    // candidate, so browsers had nothing else to pick.
    expect(getResponsiveWidths(PRESETS, 1181)).toEqual([640, 1181]);
    expect(getResponsiveWidths(PRESETS, 1707)).toEqual([640, 1280, 1707]);
  });

  it("includes a cropped width, which rarely lands on a step", () => {
    // A portrait crop of a 1707x1280 source: round(1280 * 0.75).
    expect(getResponsiveWidths(PRESETS, 960)).toEqual([640, 960]);
  });

  it("keeps the ceiling when the native width exceeds every step", () => {
    // A 6000px camera upload must not produce a 6000px variant.
    expect(getResponsiveWidths(PRESETS, 6000)).toEqual([640, 1280, 2560]);
    expect(getResponsiveWidths(PRESETS, 2560)).toEqual([640, 1280, 2560]);
  });

  it("skips a native width within the tolerance of the largest step", () => {
    expect(getResponsiveWidths(PRESETS, 1350)).toEqual([640, 1280]);
    expect(getResponsiveWidths(PRESETS, 1280)).toEqual([640, 1280]);
  });

  it("falls back to the native width when it is below every step", () => {
    expect(getResponsiveWidths(PRESETS, 400)).toEqual([400]);
    expect(getResponsiveWidths([], 400)).toEqual([400]);
  });

  it("normalizes before capping", () => {
    expect(getResponsiveWidths([2560, "640", 640, -5, 1280.4], 1181)).toEqual([640, 1181]);
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
