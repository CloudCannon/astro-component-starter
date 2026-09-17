import { describe, expect, it } from "vitest";
import { parseAnalyticsConfig, parsePrivacyConfig } from "../../src/integrations/consent/config";

describe("consent configuration", () => {
  it("accepts the strict, analytics-disabled starter defaults", () => {
    expect(
      parsePrivacyConfig({
        _schema: "privacy",
        policyRevision: 1,
        policyUrl: "/privacy/",
        bannerHeading: "Privacy",
        bannerText: "Choose.",
        settingsLabel: "Settings",
        necessaryLabel: "Necessary",
        necessaryDescription: "Remember privacy choices.",
        analyticsLabel: "Analytics",
        analyticsDescription: "Measure site use.",
        externalMediaLabel: "External media",
        externalMediaDescription: "Load hosted content.",
      }).honorGlobalPrivacyControl
    ).toBe(true);
    expect(
      parseAnalyticsConfig({ _schema: "analytics", provider: "none", scriptUrl: "" }).provider
    ).toBe("none");
  });

  it("accepts only Plausible's site-specific hosted script URL", () => {
    expect(
      parseAnalyticsConfig({
        _schema: "analytics",
        provider: "plausible-hosted",
        scriptUrl: "https://plausible.io/js/pa-site_123.js",
      }).scriptUrl
    ).toBe("https://plausible.io/js/pa-site_123.js");

    for (const scriptUrl of [
      "https://plausible.io/js/script.manual.js",
      "https://example.com/js/pa-site.js",
      "http://plausible.io/js/pa-site.js",
    ]) {
      expect(() =>
        parseAnalyticsConfig({ _schema: "analytics", provider: "plausible-hosted", scriptUrl })
      ).toThrow();
    }
  });

  it("rejects a provider that has no typed adapter", () => {
    expect(() =>
      parseAnalyticsConfig({ _schema: "analytics", provider: "gtm", scriptUrl: "" })
    ).toThrow();
  });

  it("rejects external and traversing privacy-policy URLs", () => {
    const privacy = {
      _schema: "privacy",
      policyRevision: 1,
      bannerHeading: "Privacy",
      bannerText: "Choose.",
      settingsLabel: "Settings",
      necessaryLabel: "Necessary",
      necessaryDescription: "Remember privacy choices.",
      analyticsLabel: "Analytics",
      analyticsDescription: "Measure site use.",
      externalMediaLabel: "External media",
      externalMediaDescription: "Load hosted content.",
    } as const;

    expect(() => parsePrivacyConfig({ ...privacy, policyUrl: "//example.com/privacy" })).toThrow();
    expect(() => parsePrivacyConfig({ ...privacy, policyUrl: "/../privacy/" })).toThrow();
  });
});
