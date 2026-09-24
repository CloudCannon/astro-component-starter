import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    alias: {
      // `astro:assets` only exists inside Astro's Vite pipeline.
      "astro:assets": new URL("./tests/unit/stubs/astro-assets.ts", import.meta.url).pathname,
      // Only the tsconfig `paths` the unit suite needs, not all of them.
      "@component-utils": new URL("./src/components/utils", import.meta.url).pathname,
      "@components": new URL("./src/components", import.meta.url).pathname,
    },
  },
});
