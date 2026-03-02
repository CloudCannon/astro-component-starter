/**
 * Export Generator
 *
 * Orchestrates Astro + CloudCannon export generation and bundles output files
 * into a downloadable ZIP archive.
 *
 * @module exportGenerator
 */

import JSZip from "jszip";

import { toPascalCase } from "../../../shared/caseUtils";
import { debugLog } from "../constants";
import type { ComponentInfo, ComponentMetadata, ComponentNode } from "../types";
import type { BuilderNode } from "./shared";
import { generateAstroFile } from "./export/astroGenerator";
import { generateCloudCannonInputs } from "./export/cloudcannonGenerator";
import { generateStructureValue } from "./export/structureValueGenerator";
import { cleanComponentTree } from "./export/treeHelpers";

/** Generate preview strings without downloading. */
export function generateExportPreview(
  componentTree: ComponentNode[],
  componentName: string,
  components: ComponentInfo[],
  metadataMap: Record<string, ComponentMetadata>,
  nestedBlockProperties: string[],
  componentPath: string | null = null
): { astro: string; inputs: string; structureValue: string } {
  const cleanTree = cleanComponentTree(componentTree);

  return {
    astro: generateAstroFile(
      cleanTree,
      componentName,
      components,
      metadataMap,
      nestedBlockProperties,
      componentTree as BuilderNode[]
    ),
    inputs: generateCloudCannonInputs(
      cleanTree,
      components,
      metadataMap,
      componentTree as BuilderNode[]
    ),
    structureValue: generateStructureValue(
      cleanTree,
      componentName,
      components,
      componentTree as BuilderNode[],
      componentPath,
      metadataMap
    ),
  };
}

/** Generate and download the component export. */
export async function generateExport(
  componentTree: ComponentNode[],
  componentName: string,
  components: ComponentInfo[],
  metadataMap: Record<string, ComponentMetadata>,
  nestedBlockProperties: string[],
  componentPath: string | null = null
): Promise<void> {
  debugLog("Starting export for:", componentName);

  const cleanTree = cleanComponentTree(componentTree);

  const astroCode = generateAstroFile(
    cleanTree,
    componentName,
    components,
    metadataMap,
    nestedBlockProperties,
    componentTree as BuilderNode[]
  );

  const inputsYaml = generateCloudCannonInputs(
    cleanTree,
    components,
    metadataMap,
    componentTree as BuilderNode[]
  );

  const structureValueYaml = generateStructureValue(
    cleanTree,
    componentName,
    components,
    componentTree as BuilderNode[],
    componentPath,
    metadataMap
  );

  const zip = new JSZip();
  const pascalName = toPascalCase(componentName);

  zip.file(`${pascalName}.astro`, astroCode);
  zip.file(`${componentName}.cloudcannon.inputs.yml`, inputsYaml);
  zip.file(`${componentName}.cloudcannon.structure-value.yml`, structureValueYaml);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${componentName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  debugLog("Export completed successfully");
}
