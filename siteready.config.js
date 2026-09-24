/**
 * Run `npx siteready ./dist --source-dir ./src` against a prod `npm run build`,
 * never a `build:with-library` tree (the component-docs pages don't ship).
 */
export default {
  // TODO: replace with the real domain. Until then own-domain absolute links
  // are graded as external, and `src/data/seo.json` says the same thing.
  siteUrl: "https://example.com",
  offline: true,
  // A fixture `npm run test:render` leaves in dist/; it never ships.
  ignorePaths: ["kitchen-sink-render-test/**"],
  checks: {
    content: {
      rules: {
        // The demo blog posts are deliberately lorem ipsum.
        "placeholder-copy": "off",
      },
    },
    forms: {
      rules: {
        // `formAction: ./` is the starter's placeholder.
        "action-missing-target": "off",
      },
    },
    security: {
      rules: {
        // A static site can't mint per-request nonces; use hashes if a CSP is added.
        "inline-script-no-nonce": "off",
        "inline-style-no-nonce": "off",
      },
    },
  },
};
