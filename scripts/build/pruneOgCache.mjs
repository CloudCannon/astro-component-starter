import { pruneCache } from "../../src/utils/og/cache.mjs";

/**
 * Drop generated share cards this build never used, so an edited title does not
 * leave its old card behind for good.
 */
export default function pruneOgCache() {
  let startedAt = 0;

  return {
    name: "prune-og-cache",
    hooks: {
      "astro:build:start": () => {
        startedAt = Date.now();
      },
      "astro:build:done": ({ logger }) => {
        if (!startedAt) return;

        const removed = pruneCache(process.cwd(), startedAt);

        if (removed > 0) logger.info(`Pruned ${removed} unused share card(s).`);
      },
    },
  };
}
