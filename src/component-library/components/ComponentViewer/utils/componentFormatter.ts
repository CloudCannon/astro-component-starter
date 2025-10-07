// @ts-ignore
import MarkdownIt from "markdown-it";
// @ts-ignore
import pkg from "js-beautify";
import { getComponentDisplayName } from "./componentUtils";
const { html } = pkg;

export function formatComponentWithSlots(block: any, indentLevel: number = 0): string {
  const componentPath = block._bookshop_name;
  const componentName = getComponentDisplayName(componentPath);
  const props = { ...block };
  const indent = "  ".repeat(indentLevel);

  delete props._bookshop_name;
  delete props.contentBlocks;
  delete props.navBlocks;
  delete props.formBlocks;
  // Don't delete items for content-selector as it uses the prop internally
  if (!componentPath.includes("content-selector")) {
    delete props.items;
  }
  delete props.firstColumnContentBlocks;
  delete props.secondColumnContentBlocks;
  delete props.buttonBlocks;
  delete props.slides;
  if (!componentPath.includes("choice-group") && !componentPath.includes("segments")) {
    delete props.options;
  }

  const isTextComponent =
    componentPath.includes("heading") ||
    componentPath.includes("simple-text") ||
    componentPath.includes("rich-text") ||
    componentPath.includes("list-item") ||
    componentPath.includes("definition-list-item") ||
    componentPath.includes("testimonial") ||
    componentPath.includes("button") ||
    componentPath.includes("submit");
  const textContent = isTextComponent ? props.text : null;

  if (textContent) {
    delete props.text;
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
      } else if (Array.isArray(value)) {
        const formattedArray = JSON.stringify(value, null, 2)
          .split("\n")
          .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
          .join("\n");

        complexProps.push(`${key}={\n${indent}  ${formattedArray}\n${indent}}`);
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

  const items = block.items;

  const nestedBlocks =
    block.contentBlocks || block.navBlocks || block.formBlocks || block.buttonBlocks;

  if (nestedBlocks) {
    const blocksArray = Array.isArray(nestedBlocks) ? nestedBlocks : [nestedBlocks];
    const nestedContent = blocksArray
      .map((nestedBlock: any) => formatComponentWithSlots(nestedBlock, indentLevel + 1))
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${nestedContent}
${indent}</${componentName}>`;
  } else if (
    componentPath.includes("split") &&
    (block.firstColumnContentBlocks || block.secondColumnContentBlocks)
  ) {
    const firstContent = block.firstColumnContentBlocks
      ? (Array.isArray(block.firstColumnContentBlocks)
          ? block.firstColumnContentBlocks
          : [block.firstColumnContentBlocks]
        )
          .map((nestedBlock: any) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
          .join("\n")
      : "";

    const secondContent = block.secondColumnContentBlocks
      ? (Array.isArray(block.secondColumnContentBlocks)
          ? block.secondColumnContentBlocks
          : [block.secondColumnContentBlocks]
        )
          .map((nestedBlock: any) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
          .join("\n")
      : "";

    return `${indent}<${componentName}${propsString}>
${
  firstContent
    ? `${indent}  <Fragment slot="first">
${firstContent}
${indent}  </Fragment>`
    : ""
}${firstContent && secondContent ? "\n" : ""}${
      secondContent
        ? `${indent}  <Fragment slot="second">
${secondContent}
${indent}  </Fragment>`
        : ""
    }
${indent}</${componentName}>`;
  } else if (items && componentPath.includes("list")) {
    // Handle list items as slot content
    const itemsArray = Array.isArray(items) ? items : [items];
    const isDefinitionList = componentPath.includes("definition-list");
    const itemComponentName = isDefinitionList ? "DefinitionListItem" : "ListItem";

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };

        delete itemProps.text; // Remove text from props since it goes in the slot
        if (isDefinitionList) {
          delete itemProps.title; // Remove title from props for definition lists
        }

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort attributes alphabetically
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const itemText = item.text
          ? new MarkdownIt()
              .renderInline(item.text)
              .trim()
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
          : "";

        if (isDefinitionList) {
          // For definition lists, use title prop and text in slot
          const titleProp = item.title ? ` title="${item.title}"` : "";

          return `${indent}  <${itemComponentName}${titleProp}${itemPropsString ? ` ${itemPropsString}` : ""}>${itemText}</${itemComponentName}>`;
        } else {
          return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>${itemText}</${itemComponentName}>`;
        }
      })
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (items && componentPath.includes("grid")) {
    // Handle grid items as slot content
    const itemsArray = Array.isArray(items) ? items : [items];
    const itemComponentName = "GridItem";

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };

        delete itemProps.contentBlocks; // Remove contentBlocks from props since it goes in the slot

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort attributes alphabetically
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const itemContent = item.contentBlocks
          ? (Array.isArray(item.contentBlocks) ? item.contentBlocks : [item.contentBlocks])
              .map((nestedBlock: any) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
              .join("\n")
          : "";

        return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${itemContent}
${indent}  </${itemComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (items && componentPath.includes("accordion")) {
    // Handle accordion items as slot content
    const itemsArray = Array.isArray(items) ? items : [items];
    const itemComponentName = "AccordionItem";

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };

        delete itemProps.contentBlocks; // Remove contentBlocks from props since it goes in the slot

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort attributes alphabetically
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const itemContent = item.contentBlocks
          ? (Array.isArray(item.contentBlocks) ? item.contentBlocks : [item.contentBlocks])
              .map((nestedBlock: any) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
              .join("\n")
          : "";

        return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${itemContent}
${indent}  </${itemComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (block.slides && componentPath.includes("carousel")) {
    // Handle carousel slides as slot content
    const slidesArray = Array.isArray(block.slides) ? block.slides : [block.slides];
    const slideComponentName = "CarouselSlide";

    const slidesContent = slidesArray
      .map((slide: any) => {
        const slideProps = { ...slide };

        delete slideProps.contentBlocks; // Remove contentBlocks from props since it goes in the slot

        const slidePropsString = Object.entries(slideProps)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort attributes alphabetically
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const slideContent = slide.contentBlocks
          ? (Array.isArray(slide.contentBlocks) ? slide.contentBlocks : [slide.contentBlocks])
              .map((nestedBlock: any) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
              .join("\n")
          : "";

        return `${indent}  <${slideComponentName}${slidePropsString ? ` ${slidePropsString}` : ""}>
${slideContent}
${indent}  </${slideComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${slidesContent}
${indent}</${componentName}>`;
  } else if (block.options && componentPath.includes("select")) {
    // Handle select options as slot content
    const optionsArray = Array.isArray(block.options) ? block.options : [block.options];
    const optionComponentName = "SelectOption";

    const optionsContent = optionsArray
      .map((option: any) => {
        const optionProps = { ...option };

        const optionPropsString = Object.entries(optionProps)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort attributes alphabetically
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        return `${indent}  <${optionComponentName}${optionPropsString ? ` ${optionPropsString}` : ""} />`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString}>
${optionsContent}
${indent}</${componentName}>`;
  } else if (textContent) {
    // For text components, put the text content as slot content
    // Convert markdown to HTML for text components
    let htmlContent = textContent;

    if (
      componentPath.includes("simple-text") ||
      componentPath.includes("heading") ||
      componentPath.includes("list-item") ||
      componentPath.includes("definition-list-item") ||
      componentPath.includes("testimonial") ||
      componentPath.includes("button") ||
      componentPath.includes("submit")
    ) {
      htmlContent = new MarkdownIt({ html: true }).renderInline(textContent).trim();
    } else if (componentPath.includes("rich-text")) {
      htmlContent = new MarkdownIt().render(textContent).trim();
    }

    if (componentPath.includes("rich-text") && htmlContent.includes("<")) {
      const formattedHtml = html(htmlContent, {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 1,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: "normal",
        brace_style: "collapse",
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 0,
        indent_inner_html: true,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false,
      });

      // Add proper indentation to each line
      const indentedLines = formattedHtml
        .split("\n")
        .map((line: any) => `${indent}  ${line}`)
        .join("\n");

      return `${indent}<${componentName}${propsString}>
${indentedLines}
${indent}</${componentName}>`;
    } else {
      return `${indent}<${componentName}${propsString}>
${indent}  ${htmlContent}
${indent}</${componentName}>`;
    }
  } else {
    // Self-closing tag
    return `${indent}<${componentName}${propsString}${propsString ? "" : " "}/>`;
  }
}
