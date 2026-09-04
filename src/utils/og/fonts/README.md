# Vendored share-card fonts

`twemoji.woff2` — Twemoji compiled to a **COLR/CPAL** colour font, used only at
build time to draw emoji into generated Open Graph cards. Never served to a
browser.

It is vendored rather than installed because the only npm package carrying this
build (`twemoji-colr-font`) is deprecated, and a starter template should not
hand every downstream site a deprecated dependency.

COLR is not interchangeable with a bitmap emoji font here: Takumi rasterizes
COLR and silently draws **nothing** for a CBDT bitmap font such as Noto Color
Emoji. Replace this file only with another COLR build.

- Font compilation: SIL Open Font License 1.1 — see `LICENSE-twemoji.txt`.
  Built with <https://github.com/mozilla/twemoji-colr> from
  <https://github.com/mrdrogdrog/twemoji-color-font>.
- Underlying Twemoji artwork: CC-BY 4.0, Twitter, Inc. and other contributors —
  <https://github.com/jdecked/twemoji>.
- Covers up to Twemoji 15 (2023); newer emoji fall back and render blank.
