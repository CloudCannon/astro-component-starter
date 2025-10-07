import type { APIRoute } from "astro";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import yaml from "js-yaml";
import { join } from "path";

interface ComponentInfo {
  category: string;
  name: string;
  spec: any;
  blueprint: any;
  inputs: any;
  structures?: any;
  examples?: Array<{ title: string; blocks: any; filename: string }>;
  primaryExample?: { title: string; blocks: any };
  structureToComponents?: Record<string, string[]>;
}

/**
 * Recursively scan the components directory to find all .bookshop.yml files
 */
function findBookshopFiles(
  baseDir: string,
  relativePath = ""
): Array<{ category: string; name: string; path: string }> {
  const results: Array<{ category: string; name: string; path: string }> = [];
  const fullPath = join(baseDir, relativePath);

  try {
    const entries = readdirSync(fullPath);

    for (const entry of entries) {
      const entryPath = join(fullPath, entry);
      const relativeEntryPath = relativePath ? join(relativePath, entry) : entry;
      const stat = statSync(entryPath);

      if (stat.isDirectory()) {
        // Skip utility and other non-component directories
        if (entry === "utils" || entry.startsWith(".")) {
          continue;
        }

        // Recursively scan subdirectories
        results.push(...findBookshopFiles(baseDir, relativeEntryPath));
      } else if (entry.endsWith(".bookshop.yml")) {
        // Found a bookshop file
        const pathParts = relativePath.split("/").filter(Boolean);

        if (pathParts.length >= 2) {
          const category = pathParts[0];
          const componentName = pathParts[1];

          results.push({
            category,
            name: componentName,
            path: entryPath,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${fullPath}:`, error);
  }

  return results;
}

/**
 * Recursively remove style properties from objects
 */
function stripStyleProps(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => stripStyleProps(item));
  } else if (obj !== null && typeof obj === "object") {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key !== "style") {
        cleaned[key] = stripStyleProps(value);
      }
    }

    return cleaned;
  }

  return obj;
}

/**
 * Find and parse example files for a component
 */
function findComponentExamples(
  category: string,
  name: string
): Array<{ title: string; blocks: any; filename: string }> {
  const examplesDir = `src/component-library/content/components/${category}/${name}/examples`;
  const examples: Array<{ title: string; blocks: any; filename: string }> = [];

  if (!existsSync(examplesDir)) {
    return examples;
  }

  try {
    const files = readdirSync(examplesDir);

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = join(examplesDir, file);
        const content = readFileSync(filePath, "utf8");

        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          try {
            const frontmatter = yaml.load(frontmatterMatch[1]) as any;

            if (frontmatter.title && frontmatter.blocks) {
              examples.push({
                title: frontmatter.title,
                blocks: stripStyleProps(frontmatter.blocks),
                filename: file,
              });
            }
          } catch (error) {
            console.error(`Error parsing example ${filePath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading examples directory ${examplesDir}:`, error);
  }

  return examples;
}

export async function getStaticPaths() {
  const componentsDir = "src/components";
  const bookshopFiles = findBookshopFiles(componentsDir);

  // First pass: build a map of structures to components
  const structureToComponents = new Map<string, string[]>();

  for (const { category, name, path } of bookshopFiles) {
    try {
      const content = readFileSync(path, "utf8");
      const bookshopData = yaml.load(content) as any;

      // Track which structures this component belongs to
      if (bookshopData.spec?.structures && Array.isArray(bookshopData.spec.structures)) {
        for (const structure of bookshopData.spec.structures) {
          if (!structureToComponents.has(structure)) {
            structureToComponents.set(structure, []);
          }

          const componentList = structureToComponents.get(structure);

          if (componentList) {
            componentList.push(`${category}/${name}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing bookshop file ${path}:`, error);
    }
  }

  // Second pass: create paths with structure information
  const paths: Array<{ params: { slug: string }; props: { component: ComponentInfo } }> = [];

  for (const { category, name, path } of bookshopFiles) {
    try {
      const content = readFileSync(path, "utf8");
      const bookshopData = yaml.load(content) as any;
      const allExamples = findComponentExamples(category, name);

      // Find primary example
      const primaryExample = allExamples.find((ex) => ex.filename === "primary.md");

      // Filter out primary example from the examples list
      const examples = allExamples.filter((ex) => ex.filename !== "primary.md");

      paths.push({
        params: { slug: `${category}/${name}` },
        props: {
          component: {
            category,
            name,
            spec: bookshopData.spec || {},
            blueprint: bookshopData.blueprint || {},
            inputs: bookshopData._inputs || {},
            structures: bookshopData._structures || {},
            examples,
            primaryExample,
            structureToComponents: Object.fromEntries(structureToComponents),
          },
        },
      });
    } catch (error) {
      console.error(`Error parsing bookshop file ${path}:`, error);
    }
  }

  return paths;
}

// Helper function to format component name
function formatName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to get component display name (PascalCase)
function getComponentDisplayName(componentPath: string): string {
  const parts = componentPath.split("/");
  const lastPart = parts[parts.length - 1];

  return lastPart
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Simplified Astro formatter for markdown documentation
function formatBlockToAstro(block: any, indentLevel = 0): string {
  if (!block || !block._bookshop_name) return "";

  const indent = "  ".repeat(indentLevel);
  const componentName = getComponentDisplayName(block._bookshop_name);
  const props = { ...block };

  // Remove internal/slot properties
  delete props._bookshop_name;
  delete props.contentBlocks;
  delete props.navBlocks;
  delete props.formBlocks;
  delete props.buttonBlocks;
  delete props.firstColumnContentBlocks;
  delete props.secondColumnContentBlocks;
  delete props.slides;

  // Handle text content for text-based components
  const isTextComponent =
    block._bookshop_name.includes("heading") ||
    block._bookshop_name.includes("simple-text") ||
    block._bookshop_name.includes("button") ||
    block._bookshop_name.includes("submit") ||
    block._bookshop_name.includes("testimonial");

  const textContent = isTextComponent ? props.text : null;

  if (textContent) {
    delete props.text;
  }

  // Don't delete items/options for certain components
  if (!block._bookshop_name.includes("content-selector")) {
    delete props.items;
  }
  if (
    !block._bookshop_name.includes("choice-group") &&
    !block._bookshop_name.includes("segments")
  ) {
    delete props.options;
  }

  // Separate simple props from complex ones
  const simpleProps: string[] = [];
  const complexProps: string[] = [];

  Object.entries(props)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      if (typeof value === "string") {
        simpleProps.push(`${key}="${value}"`);
      } else if (typeof value === "boolean") {
        if (value) simpleProps.push(key);
      } else if (typeof value === "number") {
        simpleProps.push(`${key}={${value}}`);
      } else if (typeof value === "object" && value !== null) {
        // Format objects as JavaScript object literals (not JSON)
        const formatObjectLiteral = (obj: any, depth = 0): string => {
          const objIndent = indent + "  ".repeat(depth + 1);
          const nextIndent = indent + "  ".repeat(depth + 2);

          const entries = Object.entries(obj)
            .map(([k, v]) => {
              if (typeof v === "string") {
                return `${nextIndent}${k}: "${v}"`;
              } else if (typeof v === "boolean" || typeof v === "number") {
                return `${nextIndent}${k}: ${v}`;
              } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
                return `${nextIndent}${k}: ${formatObjectLiteral(v, depth + 1)}`;
              } else if (Array.isArray(v)) {
                return `${nextIndent}${k}: ${JSON.stringify(v)}`;
              }

              return `${nextIndent}${k}: ${JSON.stringify(v)}`;
            })
            .join(",\n");

          return `{\n${entries}\n${objIndent}}`;
        };

        complexProps.push(`${key}=${formatObjectLiteral(value)}`);
      } else {
        simpleProps.push(`${key}="${String(value)}"`);
      }
    });

  // Build props string with complex props on new lines
  let propsString = "";

  if (complexProps.length > 0) {
    // If there are complex props, put each prop on its own line
    const allProps = [...complexProps, ...simpleProps];

    propsString = allProps.map((prop) => `${indent}  ${prop}`).join("\n");
    propsString = `\n${propsString}\n${indent}`;
  } else if (simpleProps.length > 0) {
    // If only simple props, join them with spaces
    propsString = ` ${simpleProps.join(" ")}`;
  }

  // Handle nested content blocks
  const nestedBlocks =
    block.contentBlocks || block.navBlocks || block.formBlocks || block.buttonBlocks;

  if (nestedBlocks) {
    const blocksArray = Array.isArray(nestedBlocks) ? nestedBlocks : [nestedBlocks];
    const nestedContent = blocksArray
      .map((nestedBlock) => formatBlockToAstro(nestedBlock, indentLevel + 1))
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${nestedContent}
${indent}</${componentName}>`;
  }

  // Handle split component with named slots
  if (
    block._bookshop_name.includes("split") &&
    (block.firstColumnContentBlocks || block.secondColumnContentBlocks)
  ) {
    const firstContent = block.firstColumnContentBlocks
      ? (Array.isArray(block.firstColumnContentBlocks)
          ? block.firstColumnContentBlocks
          : [block.firstColumnContentBlocks]
        )
          .map((nestedBlock: any) => formatBlockToAstro(nestedBlock, indentLevel + 2))
          .join("\n")
      : "";

    const secondContent = block.secondColumnContentBlocks
      ? (Array.isArray(block.secondColumnContentBlocks)
          ? block.secondColumnContentBlocks
          : [block.secondColumnContentBlocks]
        )
          .map((nestedBlock: any) => formatBlockToAstro(nestedBlock, indentLevel + 2))
          .join("\n")
      : "";

    return `${indent}<${componentName}${propsString}>
${firstContent ? `${indent}  <Fragment slot="first">\n${firstContent}\n${indent}  </Fragment>` : ""}${firstContent && secondContent ? "\n" : ""}${secondContent ? `${indent}  <Fragment slot="second">\n${secondContent}\n${indent}  </Fragment>` : ""}
${indent}</${componentName}>`;
  }

  // Handle text components with slot content
  if (textContent) {
    return `${indent}<${componentName}${propsString}>
${indent}  ${textContent}
${indent}</${componentName}>`;
  }

  // Self-closing tag
  return `${indent}<${componentName}${propsString}${propsString ? "" : " "}/>`;
}

// Generate imports for Astro code
function generateImports(blocks: any): string {
  const uniqueComponents = new Set<string>();

  const addComponent = (block: any) => {
    if (block?._bookshop_name) {
      uniqueComponents.add(block._bookshop_name);
    }

    // Check for nested blocks
    [
      "contentBlocks",
      "navBlocks",
      "formBlocks",
      "buttonBlocks",
      "firstColumnContentBlocks",
      "secondColumnContentBlocks",
    ].forEach((prop) => {
      if (block?.[prop]) {
        const nested = Array.isArray(block[prop]) ? block[prop] : [block[prop]];

        nested.forEach(addComponent);
      }
    });
  };

  const blocksArray = Array.isArray(blocks) ? blocks : [blocks];

  blocksArray.forEach(addComponent);

  return Array.from(uniqueComponents)
    .map((componentPath) => {
      const parts = componentPath.split("/");
      const lastPart = parts[parts.length - 1];
      const importPath = `${componentPath}/${lastPart}`;

      return `import ${getComponentDisplayName(componentPath)} from "@components/${importPath}.astro";`;
    })
    .join("\n");
}

// Convert example blocks to Astro code
function formatExampleToAstro(blocks: any): string {
  const imports = generateImports(blocks);
  const blocksArray = Array.isArray(blocks) ? blocks : [blocks];
  const componentUsage = blocksArray.map((block) => formatBlockToAstro(block)).join("\n");

  if (imports) {
    return `---\n${imports}\n---\n\n${componentUsage}`;
  }

  return componentUsage;
}

type PropertyMeta = {
  name: string;
  type: string;
  optional: boolean;
  default: unknown;
  enumValues?: string[];
  description: string;
  nestedProperties?: PropertyMeta[];
  arrayItemProperties?: PropertyMeta[];
  componentList?: string[];
};

function getPropertyType(inputConfig: any, propertyName?: string): string {
  if (!inputConfig) {
    return "string";
  }

  switch (inputConfig.type) {
    case "text":
    case "textarea":
    case "url":
    case "image":
    case "file":
    case "markdown":
      return "string";
    case "checkbox":
    case "switch":
      return "boolean";
    case "select":
      return "enum";
    case "number":
    case "range":
    case "date":
      return "number";
    case "array":
    case "blocks":
      // Check if this is a component array by property name
      if (propertyName && (propertyName.includes("Blocks") || propertyName.includes("blocks"))) {
        return "component-array";
      }

      return "array";
    case "object":
      return "object";
    default:
      return inputConfig.type || "string";
  }
}

function formatDefaultValue(value: any, inputConfig: any): string {
  if (value === undefined || value === null) {
    return "";
  }

  // Handle object types
  if (inputConfig?.type === "object" || (typeof value === "object" && !Array.isArray(value))) {
    return "object";
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return "array";
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return value.toString();
  }

  // Handle other types
  return String(value);
}

function getEnumValues(inputConfig: any): string[] | undefined {
  if (inputConfig?.type === "select" && inputConfig.options?.values) {
    if (Array.isArray(inputConfig.options.values)) {
      if (
        inputConfig.options.values.length > 0 &&
        typeof inputConfig.options.values[0] === "object" &&
        "id" in inputConfig.options.values[0]
      ) {
        return inputConfig.options.values.map((item: any) => item.id);
      }
      if (
        inputConfig.options.values.length > 0 &&
        typeof inputConfig.options.values[0] === "object" &&
        "value" in inputConfig.options.values[0]
      ) {
        return inputConfig.options.values.map((item: any) => item.value);
      }
      // Handle simple string values
      return inputConfig.options.values;
    }
  }
  return undefined;
}

function getNestedProperties(inputConfig: any, bookshopData?: any): PropertyMeta[] | undefined {
  if (inputConfig?.type === "object" && inputConfig._inputs) {
    const nestedProperties: PropertyMeta[] = [];

    Object.entries(inputConfig._inputs).forEach(([key, nestedInput]: [string, any]) => {
      nestedProperties.push({
        name: key,
        type: getPropertyType(nestedInput),
        optional: false,
        default: formatDefaultValue(nestedInput.default, nestedInput),
        enumValues: getEnumValues(nestedInput),
        description: nestedInput?.comment || "",
        nestedProperties: getNestedProperties(nestedInput, bookshopData),
        arrayItemProperties: getArrayItemProperties(nestedInput, bookshopData),
      });
    });

    return nestedProperties;
  }

  return undefined;
}

function getArrayItemProperties(inputConfig: any, bookshopData: any): PropertyMeta[] | undefined {
  // Check if this is an array with a structure reference
  if (
    (inputConfig?.type === "array" || inputConfig?.type === "blocks") &&
    inputConfig.options?.structures
  ) {
    const structurePath = inputConfig.options.structures;

    // Handle _structures.item format
    if (structurePath.startsWith("_structures.")) {
      const structureName = structurePath.replace("_structures.", "");
      const structure = bookshopData._structures?.[structureName];

      if (structure?.values && structure.values.length > 0) {
        // Get the first value as the template
        const itemTemplate = structure.values[0];
        const itemValue = itemTemplate.value;
        const itemInputs = itemTemplate._inputs;

        if (itemValue && itemInputs) {
          const arrayItemProperties: PropertyMeta[] = [];

          Object.entries(itemValue).forEach(([key, value]) => {
            const itemInputConfig = itemInputs[key];

            arrayItemProperties.push({
              name: key,
              type: getPropertyType(itemInputConfig),
              optional: false,
              default: formatDefaultValue(value, itemInputConfig),
              enumValues: getEnumValues(itemInputConfig),
              description: itemInputConfig?.comment || "",
              nestedProperties: getNestedProperties(itemInputConfig, bookshopData),
              arrayItemProperties: getArrayItemProperties(itemInputConfig, bookshopData),
            });
          });

          return arrayItemProperties;
        }
      }
    }
  }

  return undefined;
}

function parseBookshopProperties(
  bookshopData: any,
  structureToComponents?: Record<string, string[]>
): PropertyMeta[] {
  const properties: PropertyMeta[] = [];

  if (bookshopData.blueprint) {
    Object.entries(bookshopData.blueprint).forEach(([key, value]) => {
      const inputConfig = bookshopData._inputs?.[key];
      const propertyType = getPropertyType(inputConfig, key);

      // If this is a component array, find which components belong to this structure
      let componentList: string[] | undefined;

      if (propertyType === "component-array" && structureToComponents) {
        componentList = structureToComponents[key];
      }

      properties.push({
        name: key,
        type: propertyType,
        optional: false,
        default: formatDefaultValue(value, inputConfig),
        enumValues: getEnumValues(inputConfig),
        description: inputConfig?.comment || "",
        nestedProperties: getNestedProperties(inputConfig, bookshopData),
        arrayItemProperties: getArrayItemProperties(inputConfig, bookshopData),
        componentList,
      });
    });
  }

  return properties;
}

function formatPropertyMarkdown(prop: PropertyMeta, depth = 0): string {
  let md = "";

  // Property heading
  const heading = depth === 0 ? "###" : "####";

  md += `${heading} \`${prop.name}\`\n\n`;

  // Description
  if (prop.description) {
    md += `${prop.description}\n\n`;
  }

  // Type and default
  let typeLine = `**Type:** \`${prop.type}\``;

  if (
    prop.default &&
    prop.type !== "object" &&
    prop.type !== "array" &&
    prop.type !== "component-array"
  ) {
    typeLine += ` | **Default:** \`${prop.default}\``;
  }
  md += `${typeLine}\n\n`;

  // Component list for component arrays
  if (prop.type === "component-array" && prop.componentList && prop.componentList.length > 0) {
    md += `**Accepted components:**\n\n`;
    for (const component of prop.componentList.sort()) {
      const parts = component.split("/");
      const componentName = parts[parts.length - 1];

      md += `- \`${component}\` \n`;
    }
    md += `\n`;
  }

  // Enum values
  if (prop.enumValues && prop.enumValues.length > 0) {
    md += `**Accepted values:**\n\n`;
    for (const value of prop.enumValues) {
      md += `- \`${value}\`\n`;
    }
    md += `\n`;
  }

  // Nested properties (for objects)
  if (prop.nestedProperties && prop.nestedProperties.length > 0) {
    md += `**Properties:**\n\n`;
    for (const nestedProp of prop.nestedProperties) {
      md += formatPropertyMarkdown(nestedProp, depth + 1);
    }
  }

  // Array item properties
  if (prop.arrayItemProperties && prop.arrayItemProperties.length > 0) {
    md += `**Item Properties:**\n\n`;
    for (const itemProp of prop.arrayItemProperties) {
      md += formatPropertyMarkdown(itemProp, depth + 1);
    }
  }

  return md;
}

export const GET: APIRoute = ({ props }) => {
  const { component } = props as { component: ComponentInfo };

  const componentTitle = formatName(component.name);
  const categoryTitle = formatName(component.category);

  // Generate markdown content
  let markdown = `# ${componentTitle}\n\n`;

  // Add badges/metadata
  markdown += `**Category:** ${categoryTitle}\n\n`;

  if (component.spec.tags && component.spec.tags.length > 0) {
    markdown += `**Tags:** ${component.spec.tags.join(", ")}\n\n`;
  }

  // Add description
  if (component.spec.description) {
    markdown += `${component.spec.description}\n\n`;
  }

  markdown += `---\n\n`;

  // Usage section
  markdown += `## Usage\n\n`;

  // Use primary example if available, otherwise use blueprint defaults
  if (component.primaryExample) {
    markdown += "```yaml\n";
    markdown += yaml.dump(component.primaryExample.blocks, { indent: 2, lineWidth: -1 });
    markdown += "```\n\n";
  } else {
    markdown += "```astro\n";
    markdown += `---\n`;
    markdown += `import ${formatName(component.name).replace(/ /g, "")} from '@components/${component.category}/${component.name}/${component.name}.astro';\n`;
    markdown += `---\n\n`;
    markdown += `<${formatName(component.name).replace(/ /g, "")} \n`;
    const sampleProps = Object.keys(component.blueprint).slice(0, 3);

    for (const key of sampleProps) {
      markdown += `  ${key}="${component.blueprint[key] || ""}"\n`;
    }
    markdown += `/>\n`;
    markdown += "```\n\n";
  }

  // Structures section
  if (component.spec.structures && component.spec.structures.length > 0) {
    markdown += `## Structures\n\n`;
    markdown += `This can be added to the following structures:\n\n`;
    for (const structure of component.spec.structures) {
      markdown += `- \`${structure}\`\n`;
    }
    markdown += `\n`;
  }

  // Properties section
  markdown += `## Properties\n\n`;

  const properties = parseBookshopProperties(
    {
      blueprint: component.blueprint,
      _inputs: component.inputs,
      _structures: component.structures,
    },
    component.structureToComponents
  );

  if (properties.length > 0) {
    for (const prop of properties) {
      markdown += formatPropertyMarkdown(prop);
    }
  } else {
    markdown += `This component has no configurable properties.\n\n`;
  }

  // Frontmatter Examples section
  if (component.examples && component.examples.length > 0) {
    markdown += `## Frontmatter Examples\n\n`;

    for (const example of component.examples) {
      markdown += `### ${example.title}\n\n`;
      markdown += "```yaml\n";
      markdown += yaml.dump(example.blocks, { indent: 2, lineWidth: -1 });
      markdown += "```\n\n";
    }
  }

  // Astro Templating Examples section
  const allExamples = [];

  if (component.primaryExample) {
    allExamples.push(component.primaryExample);
  }
  if (component.examples && component.examples.length > 0) {
    allExamples.push(...component.examples);
  }

  if (allExamples.length > 0) {
    markdown += `## Astro Templating Examples\n\n`;

    for (const example of allExamples) {
      markdown += `### ${example.title}\n\n`;
      markdown += "```astro\n";
      markdown += formatExampleToAstro(example.blocks);
      markdown += "\n```\n\n";
    }
  } else {
    // Fallback example if no examples are defined
    markdown += `## Example\n\n`;
    markdown += "```astro\n";
    markdown += `---\n`;
    markdown += `import ${formatName(component.name).replace(/ /g, "")} from '@components/${component.category}/${component.name}/${component.name}.astro';\n`;
    markdown += `---\n\n`;
    markdown += `<${formatName(component.name).replace(/ /g, "")}\n`;
    const exampleProps = Object.entries(component.blueprint).slice(0, 5);

    for (const [key, value] of exampleProps) {
      if (value === null || value === undefined || value === "") {
        markdown += `  ${key}="example-value"\n`;
      } else if (typeof value === "boolean") {
        markdown += `  ${key}={${value}}\n`;
      } else if (typeof value === "object") {
        markdown += `  ${key}={${JSON.stringify(value)}}\n`;
      } else {
        markdown += `  ${key}="${value}"\n`;
      }
    }
    markdown += `/>\n`;
    markdown += "```\n\n";
  }

  // Footer
  markdown += `---\n\n`;

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
