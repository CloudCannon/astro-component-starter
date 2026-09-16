import { describe, expect, it } from "vitest";
import { isAllowedExternalMediaUrl } from "../../src/integrations/consent/externalMedia";

describe("external-media URL validation", () => {
  it("allows the built-in iframe providers over HTTPS", () => {
    expect(isAllowedExternalMediaUrl("https://www.youtube-nocookie.com/embed/example")).toBe(true);
    expect(isAllowedExternalMediaUrl("https://player.vimeo.com/video/123")).toBe(true);
    expect(isAllowedExternalMediaUrl("https://www.google.com/maps/embed?pb=example")).toBe(true);
  });

  it("fails closed for untrusted, malformed, and non-HTTPS URLs", () => {
    expect(isAllowedExternalMediaUrl("https://example.com/embed")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://www.google.evil.com/maps/embed")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://www.youtube.com/embed/example")).toBe(false);
    expect(isAllowedExternalMediaUrl("http://www.youtube-nocookie.com/embed/example")).toBe(false);
    expect(isAllowedExternalMediaUrl("not a URL")).toBe(false);
  });
});
