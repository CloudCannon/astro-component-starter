import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = resolve(fileURLToPath(new URL(".", import.meta.url)));

describe("sticky navigation layering", () => {
  it("keeps the main navigation above regular card content when it is sticky", () => {
    const mainNavSource = readFileSync(
      resolve(__dirname, "../../src/components/navigation/main-nav/MainNav.astro"),
      "utf8"
    );

    expect(mainNavSource).toContain("z-index: var(--layer-4);");
  });
});
