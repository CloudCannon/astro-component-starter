import type { PrivacyConfig } from "./config";

export const CONSENT_STORAGE_KEY = "site-consent";

export const consentCategories = ["analytics", "externalMedia"] as const;
export type ConsentCategory = (typeof consentCategories)[number];
export type ConsentDecision = "unset" | "granted" | "denied";

export type ConsentRecord = {
  policyRevision: number;
  decidedAt: number;
  decisions: Record<ConsentCategory, ConsentDecision>;
};

export type ConsentChange = {
  category?: ConsentCategory;
  record: ConsentRecord;
};

type Subscriber = (change: ConsentChange) => void;

const blankDecisions = (): Record<ConsentCategory, ConsentDecision> => ({
  analytics: "unset",
  externalMedia: "unset",
});

function emptyRecord(revision: number): ConsentRecord {
  return { policyRevision: revision, decidedAt: 0, decisions: blankDecisions() };
}

function isDecision(value: unknown): value is ConsentDecision {
  return value === "unset" || value === "granted" || value === "denied";
}

export function parseConsentRecord(
  value: string | null,
  config: PrivacyConfig,
  now = Date.now()
): ConsentRecord {
  if (!value) return emptyRecord(config.policyRevision);

  try {
    const parsed = JSON.parse(value) as Partial<ConsentRecord>;
    const maxAge = config.expiryDays * 24 * 60 * 60 * 1000;

    if (
      parsed.policyRevision !== config.policyRevision ||
      typeof parsed.decidedAt !== "number" ||
      parsed.decidedAt + maxAge < now
    ) {
      return emptyRecord(config.policyRevision);
    }

    return {
      policyRevision: config.policyRevision,
      decidedAt: parsed.decidedAt,
      decisions: {
        analytics: isDecision(parsed.decisions?.analytics) ? parsed.decisions.analytics : "unset",
        externalMedia: isDecision(parsed.decisions?.externalMedia)
          ? parsed.decisions.externalMedia
          : "unset",
      },
    };
  } catch {
    return emptyRecord(config.policyRevision);
  }
}

export function isConsentAllowed(
  record: ConsentRecord,
  category: ConsentCategory,
  config: PrivacyConfig,
  globalPrivacyControl = false
): boolean {
  if (!config.enabled) return false;

  const decision = record.decisions[category];

  if (decision === "denied") return false;
  if (config.honorGlobalPrivacyControl && globalPrivacyControl && decision !== "granted") {
    return false;
  }

  return decision === "granted";
}

function globalPrivacyControlEnabled(): boolean {
  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

export class ConsentManager {
  #config: PrivacyConfig;
  #record: ConsentRecord;
  #subscribers = new Set<Subscriber>();
  #channel?: BroadcastChannel;

  constructor(config: PrivacyConfig) {
    this.#config = config;
    this.#record = this.read();

    if (typeof BroadcastChannel !== "undefined") {
      this.#channel = new BroadcastChannel(CONSENT_STORAGE_KEY);
      this.#channel.addEventListener("message", () => this.sync());
    }

    window.addEventListener("storage", (event) => {
      if (event.key === CONSENT_STORAGE_KEY) this.sync();
    });
  }

  get record(): ConsentRecord {
    return structuredClone(this.#record);
  }

  get hasDecision(): boolean {
    return consentCategories.some((category) => this.#record.decisions[category] !== "unset");
  }

  isAllowed(category: ConsentCategory): boolean {
    return isConsentAllowed(this.#record, category, this.#config, globalPrivacyControlEnabled());
  }

  setDecision(category: ConsentCategory, decision: Exclude<ConsentDecision, "unset">): void {
    this.#record = {
      policyRevision: this.#config.policyRevision,
      decidedAt: Date.now(),
      decisions: { ...this.#record.decisions, [category]: decision },
    };
    this.write();
    this.notify({ category, record: this.record });
  }

  acceptAnalytics(): void {
    this.setDecision("analytics", "granted");
  }

  rejectOptional(): void {
    consentCategories.forEach((category) => this.setDecision(category, "denied"));
  }

  subscribe(subscriber: Subscriber): () => void {
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber);
  }

  private read(): ConsentRecord {
    try {
      return parseConsentRecord(localStorage.getItem(CONSENT_STORAGE_KEY), this.#config);
    } catch {
      return emptyRecord(this.#config.policyRevision);
    }
  }

  private write(): void {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.#record));
      this.#channel?.postMessage("changed");
    } catch {
      // Browser storage can be unavailable. The in-memory record still makes
      // the current visit honour the visitor's choice.
    }
  }

  private sync(): void {
    const record = this.read();

    if (JSON.stringify(record) === JSON.stringify(this.#record)) return;
    this.#record = record;
    this.notify({ record: this.record });
  }

  private notify(change: ConsentChange): void {
    this.#subscribers.forEach((subscriber) => subscriber(change));
    window.dispatchEvent(new CustomEvent("site-consent-change", { detail: change }));
  }
}

declare global {
  interface Window {
    siteConsent?: ConsentManager;
  }
}

export function getConsentManager(config: PrivacyConfig): ConsentManager {
  window.siteConsent ??= new ConsentManager(config);
  return window.siteConsent;
}
