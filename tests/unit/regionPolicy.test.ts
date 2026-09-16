import { describe, expect, it } from "vitest";
import { policyForCountry } from "../../src/integrations/consent/regionPolicy";

describe("policyForCountry", () => {
  it("fails closed when the country is unavailable", () => {
    expect(policyForCountry(undefined, "eea-uk-ch-strict")).toBe("strict-opt-in");
    expect(policyForCountry("EU", "eea-uk-ch-strict")).toBe("strict-opt-in");
    expect(policyForCountry("XX", "eea-uk-ch-strict")).toBe("strict-opt-in");
  });

  it("keeps the global preset strict", () => {
    expect(policyForCountry("US", "global-strict")).toBe("strict-opt-in");
  });

  it("uses strict opt-in for EEA, UK, and Switzerland in the regional preset", () => {
    expect(policyForCountry("DE", "eea-uk-ch-strict")).toBe("strict-opt-in");
    expect(policyForCountry("gb", "eea-uk-ch-strict")).toBe("strict-opt-in");
    expect(policyForCountry("CH", "eea-uk-ch-strict")).toBe("strict-opt-in");
  });

  it("selects notice-and-opt-out outside the regional group", () => {
    expect(policyForCountry("US", "eea-uk-ch-strict")).toBe("notice-and-opt-out");
  });
});
