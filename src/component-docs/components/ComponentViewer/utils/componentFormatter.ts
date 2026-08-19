import MarkdownIt from "markdown-it";
import pkg from "js-beautify";
import type { ComponentMetadata } from "../../../shared/metadata";
import { getComponentDisplayName } from "./componentUtils";
const { html } = pkg;

function hasSlotBlocks(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "object";
}

/** Nested `_component` trees belong as JSX children, not `foo="[object Object]"`. */
function isNestedBlockTree(value: unknown): boolean {
  if (value == null) return false;

  const items = Array.isArray(value) ? value : [value];

  return items.some((item) => item !== null && typeof item === "object" && "_component" in item);
}

function formatAttribute(key: string, value: unknown, indent: string): string {
  if (typeof value === "string") {
    return `${key}="${value}"`;
  }
  if (typeof value === "boolean") {
    return value ? key : "";
  }
  if (typeof value === "number") {
    return `${key}={${value}}`;
  }
  if (Array.isArray(value)) {
    const formattedArray = JSON.stringify(value, null, 2)
      .split("\n")
      .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
      .join("\n");

    return `${key}={\n${indent}  ${formattedArray}\n${indent}}`;
  }
  if (typeof value === "object" && value !== null) {
    return `${key}={${JSON.stringify(value)}}`;
  }

  return `${key}="${String(value)}"`;
}

function formatAttributes(props: Record<string, unknown>, indent: string): string {
  return Object.entries(props)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => formatAttribute(key, value, indent))
    .filter(Boolean)
    .join(" ");
}

function formatBlockArray(
  blocks: unknown,
  childIndentLevel: number,
  componentMetadata?: Map<string, ComponentMetadata>,
  nestedBlockProperties?: Set<string>
): string {
  const arr = Array.isArray(blocks) ? blocks : [blocks];

  return arr
    .map((nestedBlock) =>
      formatComponentWithSlots(
        nestedBlock,
        childIndentLevel,
        componentMetadata,
        nestedBlockProperties
      )
    )
    .filter(Boolean)
    .join("\n");
}

export function formatComponentWithSlots(
  block: any,
  indentLevel: number = 0,
  componentMetadata?: Map<string, ComponentMetadata>,
  nestedBlockProperties?: Set<string>
): string {
  // A malformed/unexpected child (no `_component`, e.g. a plain data object
  // that ended up somewhere a nested block tree was expected) can't be
  // formatted — degrade gracefully by skipping just this one child instead
  // of throwing, which previously took down the *entire* code sample (the
  // caller in astroFormatter.ts wraps generation in a single try/catch).
  if (!block || typeof block !== "object" || !block._component) {
    console.warn(
      "[componentFormatter] Skipping a block with no _component while generating an Astro code sample:",
      block
    );

    return "";
  }

  const componentPath = block._component;
  const componentName = getComponentDisplayName(componentPath);
  const props = { ...block };
  const indent = "  ".repeat(indentLevel);

  delete props._component;

  const componentSlug = componentPath
    .replace(/^blocks\//, "")
    .replace(/^elements\//, "")
    .replace(/^forms\//, "")
    .replace(/^navigation\//, "")
    .replace(/^typography\//, "")
    .replace(/^wrappers\//, "");
  let metadata = componentMetadata?.get(componentSlug);

  if (!metadata) {
    metadata = componentMetadata?.get(componentPath);
  }
  const supportsSlots = metadata?.supportsSlots ?? false;

  // Only slots with no `childComponent` hold arbitrary nested `_component`
  // block trees (e.g. Card's before/default/after, Modal/CustomSection's
  // contentSections). A slot WITH a childComponent (List's `items`,
  // Accordion's `items`, Select's `options`, ...) holds plain prop-data
  // objects that get spread onto a repeatable wrapper component further
  // down — those objects have no `_component` of their own, so recursing
  // into them here would crash. Keep them out of this "raw JSX children"
  // path entirely; the dedicated branches below (`items && .../list`,
  // `items && .../content-selector`, or the generic childComponent branch)
  // already know how to render them correctly.
  const rawContentSlots = metadata?.slots?.filter((slot) => !slot.childComponent) ?? [];

  const isTextComponent =
    componentPath.includes("heading") ||
    componentPath.includes("text") ||
    componentPath.includes("simple-text") ||
    componentPath.includes("list-item") ||
    componentPath.includes("definition-list-item") ||
    componentPath.includes("testimonial") ||
    componentPath.includes("button") ||
    componentPath.includes("submit");

  const textContent = isTextComponent ? props.text : null;

  if (textContent) {
    delete props.text;
  }

  if (supportsSlots) {
    if (nestedBlockProperties) {
      for (const prop of nestedBlockProperties) {
        // `nestedBlockProperties` is a single global set of prop *names*
        // shared across every component (built from every component's own
        // fallbackFor in metadata.ts's getNestedBlockProperties). A name
        // being in the set doesn't guarantee THIS component's value for it
        // is block-shaped — e.g. Embed's own fallbackFor ("html", a string)
        // lands in the same shared set, so without this check it would get
        // stripped here from every component that happens to have an
        // `html`-named prop, scalar or not. Same guard as below: only strip
        // when there's actually block content to strip it in favor of.
        if (hasSlotBlocks(props[prop])) {
          delete props[prop];
        }
      }
    }
    delete props.contentSections;
    delete props.navBlocks;
    delete props.formBlocks;
    delete props.firstColumnContentSections;
    delete props.secondColumnContentSections;
    delete props.buttonSections;
    delete props.slides;
    if (metadata?.slots) {
      for (const slot of metadata.slots) {
        // Only strip the fallback prop when it will actually be rendered as
        // slot children somewhere below — a scalar/string fallback (e.g.
        // Embed's `html`) has no slot-children path to land in, so deleting
        // it here would drop it from the generated snippet entirely instead
        // of leaving it as a regular attribute.
        if (hasSlotBlocks(block[slot.fallbackFor])) {
          delete props[slot.fallbackFor];
        }
      }
    }
  } else if (componentPath.includes("split")) {
    delete props.firstColumnContentSections;
    delete props.secondColumnContentSections;
  } else if (componentPath.includes("form")) {
    delete props.formBlocks;
  }

  // If formBlocks exists, we'll handle it as slot content, so remove it from props
  if (block.formBlocks) {
    delete props.formBlocks;
  }

  // Don't delete items for content-selector as it uses the prop internally
  if (!componentPath.includes("content-selector")) {
    delete props.items;
  }
  if (!componentPath.includes("choice-group") && !componentPath.includes("segments")) {
    delete props.options;
  }

  const propsString = formatAttributes(props, indent);

  const items = block.items;

  const hasAnySlotContent =
    supportsSlots &&
    !componentPath.includes("content-selector") &&
    rawContentSlots.some((slot) => hasSlotBlocks(block[slot.fallbackFor]));

  if (hasAnySlotContent) {
    const namedPieces: string[] = [];
    const defaultPieces: string[] = [];

    for (const slot of rawContentSlots) {
      if (!hasSlotBlocks(block[slot.fallbackFor])) continue;

      if (slot.name === "default") {
        defaultPieces.push(
          formatBlockArray(
            block[slot.fallbackFor],
            indentLevel + 1,
            componentMetadata,
            nestedBlockProperties
          )
        );
      } else {
        namedPieces.push(
          `${indent}  <Fragment slot="${slot.name}">\n${formatBlockArray(
            block[slot.fallbackFor],
            indentLevel + 2,
            componentMetadata,
            nestedBlockProperties
          )}\n${indent}  </Fragment>`
        );
      }
    }

    const inner = [...namedPieces, ...defaultPieces].join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${inner}
${indent}</${componentName}>`;
  } else if (block.formBlocks) {
    // Handle formBlocks as slot content - render as Form with child components
    const formAction = block.formAction || "./";
    const formBlocksArray = Array.isArray(block.formBlocks) ? block.formBlocks : [block.formBlocks];
    const FormComponentName = getComponentDisplayName("building-blocks/forms/form");

    const formChildren = formBlocksArray
      .map((formBlock: unknown) =>
        formatComponentWithSlots(
          formBlock,
          indentLevel + 2,
          componentMetadata,
          nestedBlockProperties
        )
      )
      .filter(Boolean)
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${indent}  <${FormComponentName} action="${formAction}">
${formChildren}
${indent}  </${FormComponentName}>
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

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (items && componentPath.includes("content-selector")) {
    // Handle content selector items as slot content
    const itemsArray = Array.isArray(items) ? items : [items];
    const itemComponentName = "ContentSelectorPanel";
    const containerProps = { ...props };

    delete containerProps.items;

    const containerPropsString = Object.entries(containerProps)
      .sort(([a], [b]) => a.localeCompare(b))
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

    const itemsContent = itemsArray
      .map((item, index) => {
        const itemProps = { ...item };

        delete itemProps._component;
        delete itemProps.contentSections;

        if (index === 0) {
          itemProps.checked = true;
        }

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b))
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

        const itemContent = item.contentSections
          ? (Array.isArray(item.contentSections) ? item.contentSections : [item.contentSections])
              .map((nestedBlock: unknown) =>
                formatComponentWithSlots(
                  nestedBlock,
                  indentLevel + 2,
                  componentMetadata,
                  nestedBlockProperties
                )
              )
              .filter(Boolean)
              .join("\n")
          : "";

        return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${itemContent}
${indent}  </${itemComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${containerPropsString ? ` ${containerPropsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (metadata?.childComponent && metadata?.fallbackFor && block[metadata.fallbackFor]) {
    const fallbackItems = block[metadata.fallbackFor];
    const itemsArray = Array.isArray(fallbackItems) ? fallbackItems : [fallbackItems];
    const itemComponentName = metadata.childComponent.name;

    const slotProps = new Set<string>();

    if (metadata.childComponent.props) {
      for (const prop of metadata.childComponent.props) {
        if (prop.endsWith("/slot")) {
          slotProps.add(prop.replace("/slot", ""));
        }
      }
    }

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };
        const itemSlotProps = new Set(slotProps);

        for (const [key, value] of Object.entries(itemProps)) {
          if (isNestedBlockTree(value)) {
            itemSlotProps.add(key);
          }
        }

        for (const slotProp of itemSlotProps) {
          delete itemProps[slotProp];
        }

        const itemPropsString = formatAttributes(itemProps, `${indent}  `);

        const slotContentParts: string[] = [];

        for (const slotProp of itemSlotProps) {
          if (item[slotProp]) {
            const nestedBlocks = Array.isArray(item[slotProp]) ? item[slotProp] : [item[slotProp]];

            for (const nestedBlock of nestedBlocks) {
              slotContentParts.push(
                formatComponentWithSlots(
                  nestedBlock,
                  indentLevel + 2,
                  componentMetadata,
                  nestedBlockProperties
                )
              );
            }
          }
        }
        const slotContent = slotContentParts.filter(Boolean).join("\n");

        if (slotContent) {
          return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${slotContent}
${indent}  </${itemComponentName}>`;
        } else {
          return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""} />`;
        }
      })
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (textContent) {
    let htmlContent = textContent;

    if (
      componentPath.includes("text") ||
      componentPath.includes("simple-text") ||
      componentPath.includes("heading") ||
      componentPath.includes("list-item") ||
      componentPath.includes("definition-list-item") ||
      componentPath.includes("testimonial") ||
      componentPath.includes("button") ||
      componentPath.includes("submit")
    ) {
      // For text component, use full markdown render
      if (
        componentPath.includes("text") &&
        !componentPath.includes("heading") &&
        !componentPath.includes("simple-text")
      ) {
        htmlContent = new MarkdownIt().render(textContent).trim();
      } else {
        // For simple-text and other text components, use inline markdown
        htmlContent = new MarkdownIt({ html: true }).renderInline(textContent).trim();
      }
    }

    if (
      componentPath.includes("text") &&
      !componentPath.includes("simple-text") &&
      htmlContent.includes("<")
    ) {
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
