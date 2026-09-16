import { z } from "zod";

export const consentPolicySchema = z.enum(["strict-opt-in", "notice-and-opt-out"]);
export type ConsentPolicy = z.infer<typeof consentPolicySchema>;

export const regionalPolicySchema = z.enum(["global-strict", "eea-uk-ch-strict"]);
export type RegionalPolicy = z.infer<typeof regionalPolicySchema>;

export const privacyConfigSchema = z.object({
  _schema: z.literal("privacy"),
  enabled: z.boolean().default(true),
  policyRevision: z.number().int().positive(),
  regionalPolicy: regionalPolicySchema.default("global-strict"),
  regionalPolicyApproved: z.boolean().default(false),
  expiryDays: z.number().int().min(1).max(365).default(180),
  policyUrl: z.string().startsWith("/"),
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

export const analyticsConfigSchema = z.discriminatedUnion("provider", [
  z.object({ _schema: z.literal("analytics"), provider: z.literal("none"), domain: z.string() }),
  z.object({
    _schema: z.literal("analytics"),
    provider: z.literal("plausible-hosted"),
    domain: z.string().min(1),
  }),
]);

export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;

export function parsePrivacyConfig(value: unknown): PrivacyConfig {
  return privacyConfigSchema.parse(value);
}

export function parseAnalyticsConfig(value: unknown): AnalyticsConfig {
  return analyticsConfigSchema.parse(value);
}
