// @ts-ignore
import yaml from "js-yaml";

export function formatBlocksYaml(blocks: any, title: string, spacing: string): string {
  if (!blocks) return "";

  try {
    const frontMatterData = {
      title,
      spacing,
      blocks,
    };

    const yamlContent = yaml.dump(frontMatterData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    return `---\n${yamlContent}---`;
  } catch (error) {
    return "";
  }
}
