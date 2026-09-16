import { z } from "zod";

export const privacyConfigSchema = z.object({
  _schema: z.literal("privacy"),
  enabled: z.boolean().default(true),
  policyRevision: z.number().int().positive(),
  expiryDays: z.number().int().min(1).max(365).default(180),
  policyUrl: z
    .string()
    .startsWith("/")
    .refine(
      (value) =>
        !value.startsWith("//") &&
        !value
          .split(/[?#]/, 1)[0]
          .split("/")
          .some((segment) => segment === "." || segment === ".."),
      "Use a safe, site-relative policy URL"
    ),
  bannerHeading: z.string().min(1),
  bannerText: z.string().min(1),
  settingsLabel: z.string().min(1),
  analyticsLabel: z.string().min(1),
  analyticsDescription: z.string().min(1),
  externalMediaLabel: z.string().min(1),
  externalMediaDescription: z.string().min(1),
  honorGlobalPrivacyControl: z.boolean().default(true),
});

export type PrivacyConfig = z.infer<typeof privacyConfigSchema>;

const plausibleScriptUrlSchema = z.url().refine((value) => {
  const url = new URL(value);

  return (
    url.protocol === "https:" &&
    url.hostname === "plausible.io" &&
    /^\/js\/pa-[a-zA-Z0-9_-]+\.js$/.test(url.pathname)
  );
}, "Use the site-specific https://plausible.io/js/pa-….js URL from Plausible");

export const analyticsConfigSchema = z.discriminatedUnion("provider", [
  z.object({
    _schema: z.literal("analytics"),
    provider: z.literal("none"),
    scriptUrl: z.literal("").default(""),
  }),
  z.object({
    _schema: z.literal("analytics"),
    provider: z.literal("plausible-hosted"),
    scriptUrl: plausibleScriptUrlSchema,
  }),
]);

export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;

export function parsePrivacyConfig(value: unknown): PrivacyConfig {
  return privacyConfigSchema.parse(value);
}

export function parseAnalyticsConfig(value: unknown): AnalyticsConfig {
  return analyticsConfigSchema.parse(value);
}
