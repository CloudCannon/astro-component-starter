import { regionalPolicySchema } from "../../src/integrations/consent/config";
import { policyForCountry } from "../../src/integrations/consent/regionPolicy";

type CloudflareContext = { request: Request & { cf?: { country?: string } } };

export function onRequestGet(context: CloudflareContext): Response {
  const preset = regionalPolicySchema
    .catch("global-strict")
    .parse(new URL(context.request.url).searchParams.get("preset"));

  return Response.json(
    { policy: policyForCountry(context.request.cf?.country, preset) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
