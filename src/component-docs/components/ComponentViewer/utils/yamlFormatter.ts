import { dump } from "js-yaml";
import { removeStyleField } from "../../../shared/blockDataUtils";

// A paste-able fragment: no `blocks:` key (the docs collection's own field) and no `---` fences.
export function formatBlocksYaml(blocks: unknown): string {
  if (!blocks) return "";

  return dump(removeStyleField(blocks), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  }).trimEnd();
}
