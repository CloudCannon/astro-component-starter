import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    alias: {
      // `src/components/utils/image.ts` imports the `astro:assets` virtual
      // module, which only exists inside Astro's Vite pipeline. Stub it so the
      // pure parts of that util can be unit-tested.
      "astro:assets": new URL("./tests/unit/stubs/astro-assets.ts", import.meta.url).pathname,
      // Mirrors tsconfig `paths` — a util that imports a sibling by alias is
      // otherwise unresolvable outside Astro's Vite pipeline.
      "@component-utils": new URL("./src/components/utils", import.meta.url).pathname,
      "@components": new URL("./src/components", import.meta.url).pathname,
    },
  },
});
