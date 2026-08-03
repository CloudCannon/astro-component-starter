/**
 * Loads a component's CloudCannon structure-value config (label/icon/description
 * plus the fully-populated default `value`) directly from disk, merging in the
 * `_inputs`/`_structures` it references via `_inputs_from_glob`.
 *
 * This is the same data CloudCannon itself reads to drive the visual editor —
 * reusing it here means a component with no hand-written docs entry still gets
 * a complete docs page (see [...slug].astro / componentIndex.ts).
 */
import { load as yamlLoad } from "js-yaml";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { findStructureValueFiles } from "./structureFiles";

export type ComponentConfig = {
  label?: string;
  icon?: string;
  description?: string;
  value?: Record<string, unknown>;
  _inputs?: Record<string, unknown>;
  _structures?: Record<string, unknown>;
  [key: string]: unknown;
};

let componentKeysCache: string[] | null = null;
const componentConfigCache = new Map<string, ComponentConfig | null>();

/** POSIX-normalize a path so cached keys are stable across platforms. */
function toPosix(path: string): string {
  return path.split(sep).join("/");
}

/**
 * Every component key derivable from a `*.cloudcannon.structure-value.yml`
 * file under `src/components` — the directory path relative to
 * `src/components`, POSIX-normalized (e.g. "building-blocks/wrappers/card").
 */
export function listComponentKeys(): string[] {
  if (componentKeysCache) {
    return componentKeysCache;
  }

  const componentsDir = "src/components";
  const structureValueFiles = findStructureValueFiles(componentsDir);

  const keys = structureValueFiles.map((filePath) =>
    toPosix(relative(componentsDir, dirname(filePath)))
  );

  componentKeysCache = Array.from(new Set(keys)).sort();

  return componentKeysCache;
}

/**
 * Reads and merges a single component's structure-value config, following
 * `_inputs_from_glob` to hoist `_inputs`/`_structures` onto the returned
 * object. Returns null when no structure-value file exists for the key.
 *
 * Extracted verbatim from the previous getStaticPaths loader in
 * [...slug].astro — preserve the exact merge semantics if this changes.
 */
export function loadComponentConfig(componentKey: string): ComponentConfig | null {
  if (componentConfigCache.has(componentKey)) {
    return componentConfigCache.get(componentKey) ?? null;
  }

  let configData: ComponentConfig | null = null;

  const lastPart = componentKey.split("/").pop();
  const configPath = `src/components/${componentKey}/${lastPart}.cloudcannon.structure-value.yml`;

  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, "utf8");

      configData = yamlLoad(content) as ComponentConfig | null;

      if (configData?._inputs_from_glob && Array.isArray(configData._inputs_from_glob)) {
        const inputs: Record<string, unknown> = {};
        const structures: Record<string, unknown> = {};

        for (const inputPath of configData._inputs_from_glob) {
          const resolvedPath = inputPath.startsWith("/")
            ? inputPath.slice(1)
            : `src/components/${componentKey}/${inputPath}`;

          if (existsSync(resolvedPath)) {
            try {
              const inputContent = readFileSync(resolvedPath, "utf8");
              const inputData = yamlLoad(inputContent) as Record<string, unknown> | null;

              if (inputData && typeof inputData === "object") {
                Object.keys(inputData).forEach((key) => {
                  if (key !== "_structures") {
                    inputs[key] = inputData[key];
                  }
                });
                if (inputData._structures) {
                  Object.assign(structures, inputData._structures as Record<string, unknown>);
                }
              }
            } catch (error) {
              console.error(`Error parsing input file ${resolvedPath}:`, error);
            }
          }
        }

        if (Object.keys(inputs).length > 0) {
          configData._inputs = inputs;
        }
        if (Object.keys(structures).length > 0) {
          configData._structures = structures;
        }
      }
    } catch (error) {
      console.error(`Error parsing structure-value file ${configPath}:`, error);
    }
  }

  componentConfigCache.set(componentKey, configData);

  return configData;
}
