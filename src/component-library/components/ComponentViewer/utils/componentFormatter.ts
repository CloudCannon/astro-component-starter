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

  // Check if this is a text component with text content
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

  // Format props as Astro attributes
  const propsString = Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`;
      } else if (typeof value === "boolean") {
        return value ? key : "";
      } else if (typeof value === "number") {
        return `${key}={${value}}`;
      } else if (Array.isArray(value)) {
        const formattedArray = JSON.stringify(value, null, 2)
          .split("\n")
          .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
          .join("\n");

        return `${key}={\n${indent}  ${formattedArray}\n${indent}}`;
      } else if (typeof value === "object" && value !== null) {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}="${String(value)}"`;
    })
    .filter(Boolean)
    .join(" ");

  // Check if component has items prop (for list components)
  const items = block.items;

  // Check if component has nested content (contentBlocks, navBlocks, formBlocks, or buttonBlocks)
  const nestedBlocks =
    block.contentBlocks || block.navBlocks || block.formBlocks || block.buttonBlocks;

  if (nestedBlocks) {
    const blocksArray = Array.isArray(nestedBlocks) ? nestedBlocks : [nestedBlocks];
    const nestedContent = blocksArray
      .map((nestedBlock) => formatComponentWithSlots(nestedBlock, indentLevel + 1))
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${nestedContent}
${indent}</${componentName}>`;
  } else if (
    componentPath.includes("split") &&
    (block.firstColumnContentBlocks || block.secondColumnContentBlocks)
  ) {
    // Handle split component with named slots
    const firstContent = block.firstColumnContentBlocks
      ? (Array.isArray(block.firstColumnContentBlocks)
          ? block.firstColumnContentBlocks
          : [block.firstColumnContentBlocks]
        )
          .map((nestedBlock) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
          .join("\n")
      : "";

    const secondContent = block.secondColumnContentBlocks
      ? (Array.isArray(block.secondColumnContentBlocks)
          ? block.secondColumnContentBlocks
          : [block.secondColumnContentBlocks]
        )
          .map((nestedBlock) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
          .join("\n")
      : "";

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
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

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
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
              .map((nestedBlock) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
              .join("\n")
          : "";

        return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${itemContent}
${indent}  </${itemComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
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
              .map((nestedBlock) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
              .join("\n")
          : "";

        return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${itemContent}
${indent}  </${itemComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (block.slides && componentPath.includes("carousel")) {
    // Handle carousel slides as slot content
    const slidesArray = Array.isArray(block.slides) ? block.slides : [block.slides];
    const slideComponentName = "CarouselSlide";

    const slidesContent = slidesArray
      .map((slide) => {
        const slideProps = { ...slide };

        delete slideProps.contentBlocks; // Remove contentBlocks from props since it goes in the slot

        const slidePropsString = Object.entries(slideProps)
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
              .map((nestedBlock) => formatComponentWithSlots(nestedBlock, indentLevel + 2))
              .join("\n")
          : "";

        return `${indent}  <${slideComponentName}${slidePropsString ? ` ${slidePropsString}` : ""}>
${slideContent}
${indent}  </${slideComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${slidesContent}
${indent}</${componentName}>`;
  } else if (block.options && componentPath.includes("select")) {
    // Handle select options as slot content
    const optionsArray = Array.isArray(block.options) ? block.options : [block.options];
    const optionComponentName = "SelectOption";

    const optionsContent = optionsArray
      .map((option) => {
        const optionProps = { ...option };

        const optionPropsString = Object.entries(optionProps)
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

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
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
      // Inline rendering to avoid p tags for simple-text, heading, list-item, definition-list-item, testimonial, button, and submit
      htmlContent = new MarkdownIt({ html: true }).renderInline(textContent).trim();
    } else if (componentPath.includes("rich-text")) {
      // Full markdown rendering for rich-text (allows paragraphs, etc.)
      htmlContent = new MarkdownIt().render(textContent).trim();
    }

    // Format HTML content with proper indentation for rich-text
    if (componentPath.includes("rich-text") && htmlContent.includes("<")) {
      // Use js-beautify to format the HTML properly
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
        .map((line) => `${indent}  ${line}`)
        .join("\n");

      return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${indentedLines}
${indent}</${componentName}>`;
    } else {
      return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${indent}  ${htmlContent}
${indent}</${componentName}>`;
    }
  } else {
    // Handle multi-line props formatting
    if (propsString && propsString.includes("\n")) {
      return `${indent}<${componentName}\n${propsString}\n${indent}/>`;
    } else {
      return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""} />`;
    }
  }
}
