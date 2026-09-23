---
title: Consent
description: Site-wide privacy choices for analytics and third-party media.
defaultSize: xl
overview: |
  Consent is site chrome, not a page section: it appears once on every page, so you don't add it to a page. Its wording, and whether it shows at all, come from the site's **Privacy & Consent** and **Analytics** settings.

  The first-visit banner appears only when analytics is set up and the visitor hasn't chosen yet. External media asks separately, on each blocked video, map, or embed. **Accept All** allows both optional categories, **Reject All** blocks both, and **Customize** opens a settings dialog with a switch for each one. Accepting and rejecting always carry equal weight. Necessary storage is marked **Always on**, and the footer's **Privacy settings** link reopens the dialog at any time.

  Everything optional stays off until the visitor allows it, and turning the banner off in settings keeps it off rather than loading anything. A saved choice expires after a while and is asked again when the privacy policy changes. This preview is a demonstration: its buttons don't save anything or load analytics. See the [privacy, consent, and analytics guide](https://github.com/CloudCannon/astro-component-starter/blob/main/docs/PRIVACY.md) for setup and testing.
---

## Before launch

Rewrite the default privacy policy at `/privacy/` to describe your site, and set the banner wording in **Privacy & Consent**. Leave analytics off, or add your own Plausible script in **Analytics**. After a significant change to the policy or the services you use, increase the policy revision so visitors are asked again.
