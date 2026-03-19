import sitemap from "@astrojs/sitemap";
import editableRegions from "@cloudcannon/editable-regions/astro-integration";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mdx from "@astrojs/mdx";

import { siteFonts } from "./site-fonts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://example.com", // TODO: Update to your production URL
  fonts: siteFonts,
  build: {
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 4321,
  },
  image: {
    domains: ["picsum.photos"],
  },
  integrations: [
    {
      name: "builder-preview-dev-only",
      hooks: {
        "astro:config:setup": ({ command, injectRoute, updateConfig }) => {
          if (command === "dev") {
            injectRoute({
              pattern: "/component-docs/builder-preview",
              entrypoint: "./src/component-docs/pages/builder-preview.astro",
              prerender: false,
            });
            updateConfig({
              adapter: {
                name: "dev-only-server-preview",
                serverEntrypoint: "",
                supportedAstroFeatures: {
                  serverOutput: "stable",
                  staticOutput: "stable",
                  hybridOutput: "stable",
                  sharpImageService: "stable",
                },
              },
            });
          }
        },
      },
    },
    editableRegions(),
    icon({
      iconDir: path.resolve(__dirname, "src/icons"),
      svgoOptions: {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupIds: false,
              },
            },
          },
        ],
      },
    }),
    sitemap({
      filter: (page) => {
        // Always exclude component library from sitemap if disabled
        if (process.env.DISABLE_COMPONENT_LIBRARY === "true") {
          return !page.includes("/component-docs");
        }
        // If not disabled, still exclude from sitemap (existing behavior)
        return !page.includes("/component-docs");
      },
    }),
    mdx(),
  ],
  vite: {
    build: {
      chunkSizeWarningLimit: 1024,
    },
    css: {
      devSourcemap: true,
      transformer: "lightningcss",
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@building-blocks": path.resolve(__dirname, "src/components/building-blocks"),
        "@core-elements": path.resolve(__dirname, "src/components/building-blocks/core-elements"),
        "@forms": path.resolve(__dirname, "src/components/building-blocks/forms"),
        "@wrappers": path.resolve(__dirname, "src/components/building-blocks/wrappers"),
        "@navigation": path.resolve(__dirname, "src/components/navigation"),
        "@page-sections": path.resolve(__dirname, "src/components/page-sections"),
        "@features": path.resolve(__dirname, "src/components/page-sections/features"),
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
