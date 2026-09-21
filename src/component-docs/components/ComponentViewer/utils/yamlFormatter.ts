import { dump } from "js-yaml";
import { removeStyleField } from "../../../shared/blockDataUtils";

/**
 * The block tree a user pastes into their own page, not the example file it was
 * read from: no `blocks:` key (that is the docs-examples collection's own
 * field) and no `---` fences (the snippet is a fragment of frontmatter, never a
 * whole file). The Astro view shows the same tree plus its imports, nothing else.
 */
export function formatBlocksYaml(blocks: unknown): string {
  if (!blocks) return "";

  return dump(removeStyleField(blocks), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  }).trimEnd();
}
