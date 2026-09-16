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
        analyticsLabel: "Analytics",
        analyticsDescription: "Measure site use.",
        externalMediaLabel: "External media",
        externalMediaDescription: "Load hosted content.",
      }).regionalPolicy
    ).toBe("global-strict");
    expect(
      parseAnalyticsConfig({ _schema: "analytics", provider: "none", domain: "" }).provider
    ).toBe("none");
  });

  it("rejects a provider that has no typed adapter", () => {
    expect(() =>
      parseAnalyticsConfig({ _schema: "analytics", provider: "gtm", domain: "x" })
    ).toThrow();
  });

  it("requires an explicit approval before regional policy can become permissive", () => {
    expect(
      parsePrivacyConfig({
        _schema: "privacy",
        policyRevision: 1,
        policyUrl: "/privacy/",
        bannerHeading: "Privacy",
        bannerText: "Choose.",
        settingsLabel: "Settings",
        analyticsLabel: "Analytics",
        analyticsDescription: "Measure site use.",
        externalMediaLabel: "External media",
        externalMediaDescription: "Load hosted content.",
        regionalPolicy: "eea-uk-ch-strict",
      }).regionalPolicyApproved
    ).toBe(false);
  });
});
