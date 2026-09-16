---
title: Consent
description: Site-wide privacy choices for analytics and third-party media.
defaultSize: xl
overview: |
  Consent is site chrome, not a page section. The starter renders it once from `src/data/privacy.json` and `src/data/analytics.json`; do not add it to a page's `pageSections` array.

  The banner appears before a visitor has made an analytics choice. **Manage preferences** opens the complete settings dialog, and the footer's **Privacy settings** link reopens it later. This docs preview is isolated: its buttons do not save to browser storage or load the example Plausible script.
---

## Before launch

Replace the privacy-policy scaffold at `/privacy/`, set the final wording and policy URL in `src/data/privacy.json`, and either keep analytics off or add the site-specific Plausible script URL in `src/data/analytics.json`. Increase `policyRevision` whenever a material policy or service change should require visitors to choose again.
