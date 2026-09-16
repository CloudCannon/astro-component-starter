import { regionalPolicySchema } from "../../src/integrations/consent/config";
import { policyForCountry } from "../../src/integrations/consent/regionPolicy";

type NetlifyContext = { geo?: { country?: { code?: string } } };

export default function consentPolicy(request: Request, context: NetlifyContext): Response {
  const preset = regionalPolicySchema
    .catch("global-strict")
    .parse(new URL(request.url).searchParams.get("preset"));

  return Response.json(
    { policy: policyForCountry(context.geo?.country?.code, preset) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export const config = { path: "/api/consent-policy" };
