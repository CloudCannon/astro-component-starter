---
title: Consent
description: Site-wide privacy choices for analytics and third-party media.
defaultSize: xl
overview: |
  Consent is site chrome, not a page section. The starter renders it once from `src/data/privacy.json` and `src/data/analytics.json`; do not add it to a page's `pageSections` array.

  The first-visit banner appears only when analytics is configured and the visitor has not made an analytics choice. External media asks contextually on each blocked video, map, or embed. **Accept All** grants both optional categories, **Reject All** denies both, and **Customize** opens the granular settings dialog. The three choices use equal visual prominence. The dialog identifies the necessary preference record as **Always on** and repeats **Accept All** and **Reject All**, so changing or withdrawing consent remains one action away. The footer or persistent **Privacy settings** control reopens it later.

  Choices use strict opt-in, expire after `expiryDays`, reset when `policyRevision` changes, synchronize across tabs, and respect Global Privacy Control until the visitor explicitly grants a category. Turning the workflow off fails closed: it hides the controls but does not load optional services. This docs preview is isolated, so its buttons do not save to browser storage or load the example Plausible script. See the [privacy, consent, and analytics guide](https://github.com/CloudCannon/astro-component-starter/blob/main/docs/PRIVACY.md) for configuration, provider limits, and launch testing.
---

## Before launch

Replace the privacy-policy scaffold at `/privacy/`, remove `starterPrivacyPolicyPlaceholder: true`, set the final wording and policy URL in `src/data/privacy.json`, and either keep analytics off or add the site-specific Plausible script URL in `src/data/analytics.json`. Increase `policyRevision` whenever a material policy or service change should require visitors to choose again, then run `npm run check:placeholders -- --strict` and verify production network traffic before and after each choice.
