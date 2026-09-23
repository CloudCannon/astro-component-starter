import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrivacyConfig } from "../../src/integrations/consent/config";
import {
  ConsentManager,
  isConsentAllowed,
  parseConsentRecord,
  type ConsentRecord,
} from "../../src/integrations/consent/runtime";

const config: PrivacyConfig = {
  _schema: "privacy",
  enabled: true,
  policyRevision: 3,
  expiryDays: 30,
  policyUrl: "/privacy/",
  bannerHeading: "Privacy",
  bannerText: "Choose optional services.",
  settingsLabel: "Privacy settings",
  necessaryLabel: "Necessary",
  necessaryDescription: "Remember privacy choices.",
  analyticsLabel: "Analytics",
  analyticsDescription: "Measure site use.",
  externalMediaLabel: "External media",
  externalMediaDescription: "Load third-party content.",
  honorGlobalPrivacyControl: true,
};

const record = (overrides: Partial<ConsentRecord> = {}): ConsentRecord => ({
  policyRevision: config.policyRevision,
  decidedAt: Date.UTC(2026, 0, 1),
  decisions: { analytics: "granted", externalMedia: "denied" },
  ...overrides,
});

afterEach(() => vi.unstubAllGlobals());

describe("consent runtime", () => {
  it("keeps a current record and expires old or superseded records", () => {
    const current = record();
    const now = current.decidedAt + 29 * 24 * 60 * 60 * 1000;

    expect(parseConsentRecord(JSON.stringify(current), config, now)).toEqual(current);
    expect(
      parseConsentRecord(JSON.stringify(current), config, now + 2 * 24 * 60 * 60 * 1000).decisions
    ).toEqual({ analytics: "unset", externalMedia: "unset" });
    expect(
      parseConsentRecord(JSON.stringify({ ...current, policyRevision: 2 }), config, now).decisions
    ).toEqual({ analytics: "unset", externalMedia: "unset" });
  });

  it("fails closed for malformed and partially invalid records", () => {
    expect(parseConsentRecord("not json", config).decisions).toEqual({
      analytics: "unset",
      externalMedia: "unset",
    });

    const parsed = parseConsentRecord(
      JSON.stringify(
        record({ decisions: { analytics: "invalid" as never, externalMedia: "granted" } })
      ),
      config,
      record().decidedAt
    );

    expect(parsed.decisions).toEqual({ analytics: "unset", externalMedia: "granted" });
  });

  it("requires an explicit grant and fails closed when disabled", () => {
    const unset = record({ decisions: { analytics: "unset", externalMedia: "unset" } });

    expect(isConsentAllowed(unset, "analytics", config)).toBe(false);
    expect(isConsentAllowed(record(), "analytics", config)).toBe(true);
    expect(isConsentAllowed(record(), "externalMedia", config)).toBe(false);
    expect(isConsentAllowed(record(), "analytics", { ...config, enabled: false })).toBe(false);
  });

  it("retains the current-visit choice when browser storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("window", { addEventListener: vi.fn(), dispatchEvent: vi.fn() });
    vi.stubGlobal("BroadcastChannel", undefined);

    const manager = new ConsentManager(config);
    const subscriber = vi.fn();

    manager.subscribe(subscriber);

    manager.acceptAll();
    expect(manager.record.decisions).toEqual({
      analytics: "granted",
      externalMedia: "granted",
    });
    expect(subscriber).toHaveBeenCalledTimes(1);

    manager.rejectAll();
    expect(manager.record.decisions).toEqual({
      analytics: "denied",
      externalMedia: "denied",
    });
    expect(subscriber).toHaveBeenCalledTimes(2);

    manager.setDecision("analytics", "granted");
    expect(manager.record.decisions.analytics).toBe("granted");
    expect(manager.isAllowed("analytics")).toBe(true);
  });

  it("records a decline up front when the browser sends Global Privacy Control", () => {
    const stored = new Map<string, string>();

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
    });
    vi.stubGlobal("window", { addEventListener: vi.fn(), dispatchEvent: vi.fn() });
    vi.stubGlobal("BroadcastChannel", undefined);

    vi.stubGlobal("navigator", { globalPrivacyControl: true });
    const honored = new ConsentManager(config);

    expect(honored.hasDecision).toBe(true);
    expect(honored.record.decisions).toEqual({ analytics: "denied", externalMedia: "denied" });

    stored.clear();
    vi.stubGlobal("navigator", { globalPrivacyControl: true });
    const ignored = new ConsentManager({ ...config, honorGlobalPrivacyControl: false });

    expect(ignored.hasDecision).toBe(false);

    stored.clear();
    vi.stubGlobal("navigator", {});
    const noSignal = new ConsentManager(config);

    expect(noSignal.hasDecision).toBe(false);
  });
});
