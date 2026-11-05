import { describe, expect, it } from "vitest";
import {
  allowedExternalMediaUrl,
  embedIframeUrl,
  externalMediaProvider,
  isAllowedExternalMediaUrl,
} from "../../src/integrations/consent/externalMedia";

describe("external-media URL validation", () => {
  it("allows the built-in iframe providers over HTTPS", () => {
    expect(isAllowedExternalMediaUrl("https://www.youtube-nocookie.com/embed/example")).toBe(true);
    expect(isAllowedExternalMediaUrl("https://player.vimeo.com/video/123")).toBe(true);
    expect(isAllowedExternalMediaUrl("https://www.google.com/maps/embed?pb=example")).toBe(true);
    expect(
      isAllowedExternalMediaUrl("https://www.openstreetmap.org/export/embed.html?bbox=example")
    ).toBe(true);
  });

  it("moves YouTube's share code to Privacy Enhanced Mode and drops its tracking parameter", () => {
    expect(
      allowedExternalMediaUrl("https://www.youtube.com/embed/-mYn_ofgSWo?si=abc&start=30")
    ).toBe("https://www.youtube-nocookie.com/embed/-mYn_ofgSWo?start=30");
    expect(allowedExternalMediaUrl("https://youtube.com/embed/example")).toBe(
      "https://www.youtube-nocookie.com/embed/example"
    );
    expect(allowedExternalMediaUrl("https://www.youtube.com/watch?v=example")).toBe(null);
  });

  it("fails closed for untrusted, malformed, and non-HTTPS URLs", () => {
    expect(isAllowedExternalMediaUrl("https://example.com/embed")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://www.google.evil.com/maps/embed")).toBe(false);
    expect(isAllowedExternalMediaUrl("http://www.youtube-nocookie.com/embed/example")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://www.google.com/search?q=not-a-map")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://player.vimeo.com/showcase/123")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://www.openstreetmap.org/about")).toBe(false);
    expect(isAllowedExternalMediaUrl("https://user@example.com/embed")).toBe(false);
    expect(isAllowedExternalMediaUrl("not a URL")).toBe(false);
  });
});

describe("Embed iframe URLs", () => {
  it("allows any HTTPS page and still moves YouTube to Privacy Enhanced Mode", () => {
    expect(embedIframeUrl("https://open.spotify.com/embed/track/example")).toBe(
      "https://open.spotify.com/embed/track/example"
    );
    expect(embedIframeUrl("https://www.youtube.com/embed/example?si=abc")).toBe(
      "https://www.youtube-nocookie.com/embed/example"
    );
  });

  it("rejects non-HTTPS, credentialed, and malformed URLs", () => {
    expect(embedIframeUrl("http://example.com/embed")).toBe(null);
    expect(embedIframeUrl("javascript:alert(1)")).toBe(null);
    expect(embedIframeUrl("data:text/html,<p>hi</p>")).toBe(null);
    expect(embedIframeUrl("https://user:pass@example.com/embed")).toBe(null);
    expect(embedIframeUrl("https://example.com:8443/embed")).toBe(null);
    expect(embedIframeUrl("/relative/path")).toBe(null);
  });
});

describe("external-media provider names", () => {
  it("names known providers, then the hostname, then a generic site", () => {
    expect(externalMediaProvider("https://www.youtube-nocookie.com/embed/x")).toBe("YouTube");
    expect(externalMediaProvider("https://open.spotify.com/embed/x")).toBe("open.spotify.com");
    expect(externalMediaProvider("javascript:alert(1)")).toBe("an external site");
    expect(externalMediaProvider("not a URL")).toBe("an external site");
  });
});
