import { regionalPolicySchema } from "../src/integrations/consent/config";
import { policyForCountry } from "../src/integrations/consent/regionPolicy";

type VercelRequest = {
  headers: Record<string, string | string[] | undefined>;
  url?: string;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: { policy: string }): void;
};

export default function consentPolicy(request: VercelRequest, response: VercelResponse): void {
  const preset = regionalPolicySchema
    .catch("global-strict")
    .parse(
      new URL(request.url ?? "/api/consent-policy", "https://consent.invalid").searchParams.get(
        "preset"
      )
    );
  const header = request.headers["x-vercel-ip-country"];
  const country = Array.isArray(header) ? header[0] : header;

  response.setHeader("Cache-Control", "private, no-store");
  response.status(200).json({ policy: policyForCountry(country, preset) });
}
