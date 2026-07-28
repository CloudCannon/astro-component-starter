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
    },
  },
});
