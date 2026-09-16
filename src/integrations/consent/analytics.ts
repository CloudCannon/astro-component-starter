import type { AnalyticsConfig, PrivacyConfig } from "./config";
import { getConsentManager } from "./runtime";

let initialized = false;
let pageReady = false;
let pageSerial = 0;
let trackedSerial = -1;
let scriptLoaded = false;

function plausibleQueue(): NonNullable<Window["plausible"]> {
  if (!window.plausible) {
    const queue = ((...args: unknown[]) => queue.q?.push(args)) as NonNullable<Window["plausible"]>;

    queue.q = [];
    window.plausible = queue;
  }

  return window.plausible;
}

function loadPlausible(domain: string): NonNullable<Window["plausible"]> {
  const queue = plausibleQueue();

  if (scriptLoaded) return queue;
  scriptLoaded = true;

  const script = document.createElement("script");

  script.defer = true;
  script.dataset.domain = domain;
  script.src = "https://plausible.io/js/script.manual.js";
  document.head.append(script);
  return queue;
}

function trackCurrent(config: AnalyticsConfig, privacy: PrivacyConfig): void {
  const manager = getConsentManager(privacy);

  if (!pageReady || !manager.isAllowed("analytics") || trackedSerial === pageSerial) return;
  trackedSerial = pageSerial;

  if (config.provider === "plausible-hosted") {
    loadPlausible(config.domain)("pageview", {
      u: `${location.origin}${location.pathname}`,
    });
  }
}

export function setupAnalytics(config: AnalyticsConfig, privacy: PrivacyConfig): void {
  if (initialized || config.provider === "none" || window.inEditorMode) return;
  initialized = true;

  const manager = getConsentManager(privacy);

  manager.subscribe(() => trackCurrent(config, privacy));
  document.addEventListener("astro:page-load", () => {
    pageReady = true;
    pageSerial += 1;
    trackCurrent(config, privacy);
  });
}

declare global {
  interface Window {
    inEditorMode?: boolean;
    plausible?: ((event: string, options?: Record<string, unknown>) => void) & { q?: unknown[][] };
  }
}
