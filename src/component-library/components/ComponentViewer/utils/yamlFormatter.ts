import { dump } from "js-yaml";
import { removeStyleField } from "../../../shared/blockDataUtils";

export function formatBlocksYaml(blocks: any, _title: string, _spacing: string): string {
  if (!blocks) return "";

  try {
    const blocksWithoutStyle = removeStyleField(blocks);

    const frontMatterData = {
      blocks: blocksWithoutStyle,
    };

    const yamlContent = dump(frontMatterData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    const trimmedContent = yamlContent.trimEnd();

    return `---\n${trimmedContent}\n---`;
  } catch {
    return "";
  }
}
