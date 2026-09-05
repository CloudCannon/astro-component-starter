/**
 * Pins every siteready run so results are comparable across machines and CI.
 * Run: `npx siteready ./dist --source-dir ./src` against a prod `npm run build`
 * (never a `build:with-library` tree — the ~80 component-docs pages do not ship
 * and swamp the report).
 */
export default {
  // TODO: replace with the real domain. Until then own-domain absolute links
  // are graded as external, and `src/data/seo.json` says the same thing.
  siteUrl: "https://example.com",
  offline: true,
  // `npm run test:render` leaves a page in dist/ that renders all 79 structure
  // defaults at once. Grading a dist left over from that run manufactures five
  // duplicate-id errors and eight placeholder-link warnings out of a fixture
  // that never ships.
  ignorePaths: ["kitchen-sink-render-test/**"],
  checks: {
    content: {
      rules: {
        // The demo blog posts are deliberately lorem ipsum: this is a starter,
        // and the posts exist to show the layouts, not to be read.
        "placeholder-copy": "off",
      },
    },
    forms: {
      rules: {
        // `formAction: ./` is the starter's placeholder. A real project points
        // it at its own endpoint; flagging it here every run is noise.
        "action-missing-target": "off",
      },
    },
    security: {
      rules: {
        // A static site cannot mint per-request nonces. Use hashes if a CSP is
        // ever added.
        "inline-script-no-nonce": "off",
        "inline-style-no-nonce": "off",
      },
    },
  },
};
