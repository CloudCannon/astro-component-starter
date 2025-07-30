import bookshop from "@bookshop/astro-bookshop";
import postcssGlobalData from "@csstools/postcss-global-data";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import autoprefixer from "autoprefixer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcssCustomMedia from "postcss-custom-media";
import postcssEach from "postcss-each";
import postcssImport from "postcss-import";
import postcssNested from "postcss-nested";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
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
    bookshop(),
    icon({
      iconDir: path.resolve(__dirname, "src/icons"),
    }),
  ],
  vite: {
    css: {
      devSourcemap: true,
      postcss: {
        plugins: [
          postcssImport,
          postcssGlobalData({
            files: [path.resolve(__dirname, "./src/styles/skele/variables/_media.pcss")],
          }),
          postcssCustomMedia,
          postcssNested,
          postcssEach,
          autoprefixer,
        ],
      },
    },
    resolve: {
      alias: {
        "@skele/components": path.resolve(__dirname, "src/components"),
        "@skele/styles": path.resolve(__dirname, "src/styles"),
        "@skele/plugins": path.resolve(__dirname, "src/plugins"),
      },
    },
  },
});
