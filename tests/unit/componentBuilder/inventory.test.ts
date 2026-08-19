import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { listComponentKeys } from "../../../src/component-docs/shared/componentConfig";
import {
  BUILDER_EXCLUDED,
  ROOT_COMPONENT_PATH,
  isBuilderExcluded,
} from "../../../src/component-docs/components/ComponentBuilder/constants";
import { isComponentAllowedInStructure } from "../../../src/component-docs/components/ComponentBuilder/utils/discovery/structureMatching";
import { discoverForTests } from "./harness";

function expectedBuildingBlockKeys(): string[] {
  return listComponentKeys().filter(
    (key) => key.startsWith("building-blocks/") && !isBuilderExcluded(key)
  );
}

describe("Component Builder inventory", () => {
  const discovery = discoverForTests();
  const byPath = new Map(discovery.components.map((component) => [component.path, component]));

  it("lists a non-empty reason for every BUILDER_EXCLUDED entry, and the directory still exists", () => {
    const entries = Object.entries(BUILDER_EXCLUDED);

    expect(entries.length).toBeGreaterThan(0);

    for (const [key, reason] of entries) {
      expect(reason.trim(), `${key} needs a reason`).not.toBe("");
      expect(existsSync(`src/components/${key}`), `stale exclusion: ${key} is not on disk`).toBe(
        true
      );
    }
  });

  it("includes every main building-block except BUILDER_EXCLUDED", () => {
    const missing = expectedBuildingBlockKeys().filter((key) => !byPath.has(key));

    expect(missing, "building-blocks missing from the builder registry").toEqual([]);
  });

  it("does not include excluded building-blocks", () => {
    const leaked = Object.keys(BUILDER_EXCLUDED).filter((key) => byPath.has(key));

    expect(leaked).toEqual([]);
  });

  it("includes the Custom Section root", () => {
    const root = byPath.get(ROOT_COMPONENT_PATH);

    expect(root).toBeDefined();
    expect(root?.isVirtual).toBeFalsy();
  });

  it("points every non-virtual registry path at a real component directory", () => {
    const missing = discovery.components
      .filter((component) => !component.isVirtual)
      .filter((component) => !existsSync(`src/components/${component.path}`))
      .map((component) => component.path);

    expect(missing).toEqual([]);
  });

  it("points every virtual child at an .astro file in its parent directory", () => {
    const missing = discovery.components
      .filter((component) => component.isVirtual)
      .filter((component) => {
        const parentPath = component.path.split("/").slice(0, -1).join("/");
        const fileName = component.fileName;

        return !fileName || !existsSync(`src/components/${parentPath}/${fileName}`);
      })
      .map((component) => `${component.path} (${component.fileName ?? "no fileName"})`);

    expect(missing).toEqual([]);
  });

  it("does not offer virtual children at the Custom Section root slot", () => {
    const root = byPath.get(ROOT_COMPONENT_PATH);
    const slot = root?.slots?.find((item) => item.propName === "contentSections");

    expect(slot).toBeDefined();

    const virtualInRoot = (slot?.allowedComponents ?? []).filter(
      (path) => byPath.get(path)?.isVirtual
    );

    expect(virtualInRoot).toEqual([]);
  });

  it("allows every non-virtual building-block that containerSections nesting rules allow", () => {
    const root = byPath.get(ROOT_COMPONENT_PATH);
    const slot = root?.slots?.find((item) => item.propName === "contentSections");

    expect(slot?.structureName).toBeTruthy();

    const structureName = slot?.structureName ?? "";
    const allowed = new Set(slot?.allowedComponents ?? []);
    const missing = discovery.components
      .filter((component) => !component.isVirtual)
      .filter((component) => component.path.startsWith("building-blocks/"))
      .filter((component) =>
        isComponentAllowedInStructure(
          component.path,
          structureName,
          discovery.nestingRules,
          component.isVirtual
        )
      )
      .filter((component) => !allowed.has(component.path))
      .map((component) => component.path);

    expect(missing, "nesting-allowed blocks missing from the Custom Section picker").toEqual([]);
  });
});
