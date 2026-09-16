import type { ConsentPolicy, PrivacyConfig } from "./config";
import { policyForCountry } from "./regionPolicy";

function cloudCannonCountry(): string | null {
  const match = [...document.documentElement.classList]
    .map((className) => className.match(/^country-([a-z]{2})$/i)?.[1])
    .find(Boolean);

  return match?.toUpperCase() ?? null;
}

export async function resolveConsentPolicy(config: PrivacyConfig): Promise<ConsentPolicy> {
  if (config.regionalPolicy === "global-strict" || !config.regionalPolicyApproved) {
    return "strict-opt-in";
  }

  const country = cloudCannonCountry();

  if (country) return policyForCountry(country, config.regionalPolicy);

  try {
    const response = await fetch(
      `/api/consent-policy?preset=${encodeURIComponent(config.regionalPolicy)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    const body = (await response.json()) as { policy?: unknown };

    return body.policy === "notice-and-opt-out" ? "notice-and-opt-out" : "strict-opt-in";
  } catch {
    return "strict-opt-in";
  }
}
