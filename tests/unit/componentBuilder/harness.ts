import { buildComponentMetadataMapFromDisk } from "../../../src/component-docs/shared/metadata";
import { discoverComponentsFrom } from "../../../src/component-docs/components/ComponentBuilder/utils/componentDiscovery";
import type { ComponentDiscoveryResult } from "../../../src/component-docs/components/ComponentBuilder/utils/componentDiscovery";

let cached: ComponentDiscoveryResult | null = null;

/** Run builder discovery from disk. Cached for the life of the test file. */
export function discoverForTests(): ComponentDiscoveryResult {
  if (!cached) {
    cached = discoverComponentsFrom(buildComponentMetadataMapFromDisk());
  }

  return cached;
}
