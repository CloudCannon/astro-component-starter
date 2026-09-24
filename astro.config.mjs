import sitemap from "@astrojs/sitemap";
import editableRegions from "@cloudcannon/editable-regions/astro-integration";
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mdx from "@astrojs/mdx";

import pruneCss from "./scripts/build/pruneCss.mjs";
import pruneOgCache from "./scripts/build/pruneOgCache.mjs";
import { siteFonts } from "./site-fonts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Anchored to __dirname: a bare `**/.claude/**` matches every file in an agent
// worktree (its own path contains `.claude/`) and silently disables HMR.
const watchIgnored = [
  ...[
    ".claude",
    "dist",
    ".astro",
    ".local",
    ".preview-screenshots",
    "public/pagefind",
    "public/_astro",
  ].map((dir) => path.join(__dirname, dir, "**")),
  ...[".preview-montage.png", ".siteready-*.json", "siteready-report.*"].map((file) =>
    path.join(__dirname, file)
  ),
];

// https://astro.build/config
export default defineConfig({
  site: "https://example.com", // TODO: Update to your production URL
  fonts: siteFonts,
  build: {
    // A shared stylesheet measured ~190ms FCP / ~240ms LCP slower on cold Slow-4G.
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 4321,
  },
  image: {
    domains: [],
  },
  integrations: [
    editableRegions(),
    pruneOgCache(),
    // Reads built HTML: list runtime-assembled or third-party-injected classes in `alwaysKeep`.
    pruneCss({ alwaysKeep: [] }),
    sitemap({
      filter: (page) => {
        if (page.endsWith("/404") || page.endsWith("/404.html")) {
          return false;
        }
        // `search.md` is noindex; listing it in the sitemap would contradict that.
        if (page.endsWith("/search/") || page.endsWith("/search")) {
          return false;
        }
        if (page.includes("/component-docs")) {
          return false;
        }
        return true;
      },
    }),
    mdx(),
  ],
  vite: {
    build: {
      minify: "esbuild",
      // lightningcss (Vite's default) merges same-name `@layer` blocks, fusing
      // unrelated components into one block that `pruneCss` can only keep whole.
      cssMinify: "esbuild",
      chunkSizeWarningLimit: 1024,
    },
    server: {
      watch: {
        ignored: watchIgnored,
      },
    },
    plugins: [
      {
        name: "suppress-node-externalized-warning",
        config() {
          return {
            build: {
              rollupOptions: {
                onwarn(warning, defaultHandler) {
                  if (
                    warning.message?.includes("externalized for browser compatibility") &&
                    warning.message?.includes("discoverVideoSources")
                  )
                    return;
                  defaultHandler(warning);
                },
              },
            },
          };
        },
        configResolved(config) {
          const originalWarn = config.logger.warn;

          config.logger.warn = (msg, options) => {
            if (
              typeof msg === "string" &&
              msg.includes("externalized for browser compatibility") &&
              msg.includes("discoverVideoSources")
            )
              return;
            originalWarn(msg, options);
          };
        },
      },
    ],
    css: {
      devSourcemap: true,
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@core-elements": path.resolve(__dirname, "src/components/building-blocks/core-elements"),
        "@forms": path.resolve(__dirname, "src/components/building-blocks/forms"),
        "@wrappers": path.resolve(__dirname, "src/components/building-blocks/wrappers"),
        "@navigation": path.resolve(__dirname, "src/components/navigation"),
        "@page-sections": path.resolve(__dirname, "src/components/page-sections"),
        "@explainers": path.resolve(__dirname, "src/components/page-sections/explainers"),
        "@builders": path.resolve(__dirname, "src/components/page-sections/builders"),
        "@data": path.resolve(__dirname, "src/data"),
        "@content": path.resolve(__dirname, "src/content"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@component-docs": path.resolve(__dirname, "src/component-docs"),
        "@layouts": path.resolve(__dirname, "src/layouts"),
        "@component-utils": path.resolve(__dirname, "src/components/utils"),
        "@styles": path.resolve(__dirname, "src/styles"),
      },
    },
  },
});
