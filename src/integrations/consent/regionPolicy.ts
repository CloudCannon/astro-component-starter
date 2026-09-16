import type { ConsentPolicy, RegionalPolicy } from "./config";

const EEA_UK_CH = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "GB",
  "CH",
  "EU",
]);

// Providers normally emit ISO 3166-1 alpha-2 country codes. Keeping this
// allowlist here makes provider placeholders such as XX, and any future
// undocumented pseudo-code, fail closed rather than becoming permissive.
const KNOWN_COUNTRIES = new Set(
  `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO
  BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK
  DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS
  GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP
  KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS
  MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS
  PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC
  TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK
  YE YT ZA ZM ZW`
    .split(/\s+/)
    .filter(Boolean)
);

export function policyForCountry(
  country: string | null | undefined,
  preset: RegionalPolicy
): ConsentPolicy {
  if (preset === "global-strict") return "strict-opt-in";
  if (!country) return "strict-opt-in";

  const normalized = country.toUpperCase();

  if (!KNOWN_COUNTRIES.has(normalized) && normalized !== "EU") return "strict-opt-in";

  return EEA_UK_CH.has(normalized) ? "strict-opt-in" : "notice-and-opt-out";
}
