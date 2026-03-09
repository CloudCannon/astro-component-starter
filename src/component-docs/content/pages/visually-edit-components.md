---
title: How Visual Editing Works
contentSections: []
---

# How Visual Editing Works

If you followed the previous guide, the component you built was already visually editable. Editors can click on the heading and subtext to edit them directly in CloudCannon's visual editor. That worked because the `Heading` and `Text` building blocks handle editable regions automatically when you pass `data-prop`.

This page explains the full picture: what those attributes do, how they connect to CloudCannon, and how to handle images and arrays too.

## What are editable regions?

When CloudCannon renders your page in the visual editor, it needs a way to connect each visible element back to the data that produced it. A heading on the screen might come from a `heading` prop, which came from frontmatter, which lives in a Markdown file. Editable regions are the mechanism that traces that path.

Without them, CloudCannon can show your page but can't know which piece of data to update when an editor clicks on something. Editable regions close that gap by marking HTML elements with `data-*` attributes that say "this element represents this prop."

For full details on CloudCannon's editable regions, see the [CloudCannon documentation](https://cloudcannon.com/documentation/developer-articles/what-are-editable-regions/).

## Working with Editable Regions

This starter simplifies editable regions through conventions in its building block components:

**Building blocks handle their own editable attributes.** Components like `Heading` and `Text` automatically add `data-editable="text"` and `data-prop` to the right element internally. You just tell them which prop to bind to:

```astro
<Heading data-prop="heading" text={heading} />
```

You don't need to know the underlying HTML structure — the component takes care of placing the attributes correctly.

**`renderBlock.astro` marks array items automatically.** When sections are rendered through `renderBlock`, each one gets `data-editable="array-item"` without you writing it.

**Wrapper components handle array containers.** Components like `ButtonGroup`, `Grid`, and `Accordion` add `data-editable="array"` internally when you pass `data-children-prop`. You just specify which prop holds the array.

This means at the page section level, you're mostly passing props to building blocks rather than writing raw `data-*` attributes yourself.

## Text editing

The most common pattern. Pass `data-prop` to a building block to make its text editable inline:

```astro
<Heading level="h2" size="lg" alignX="center" data-prop="heading" text={heading} />
<Text alignX="center" data-prop="subtext" text={subtext} />
```

The `data-prop` value must match a prop name on your component. When an editor clicks the heading in the preview, CloudCannon updates the `heading` prop in the page's frontmatter.

By default, `Heading` and `Text` bind to their own `text` prop. When you pass `data-prop="heading"`, you're overriding that to point at the parent component's prop instead. This is how the data traces from the visual element all the way back to the frontmatter.

## Image editing

For images, map the source and alt text props:

```astro
<Image source={imageSource} alt={imageAlt} data-prop-src="imageSource" data-prop-alt="imageAlt" />
```

When an editor clicks this image, CloudCannon opens a picker. The selected file writes back to `imageSource` and the alt text to `imageAlt`.

## Array editing

Some components contain arrays of child components, like a row of buttons or a set of accordion items. Pass `data-children-prop` to make them editable inline:

```astro
<ButtonGroup buttonSections={buttonSections} alignX="center" data-children-prop="buttonSections" />
```

`ButtonGroup` handles the rest internally — it adds `data-editable="array"` to its container so CloudCannon knows this element holds an array of children that can be added, removed, and reordered in the preview. Setting `data-children-prop` implies editability, just like `data-prop` does for text components.

## Putting it all together

Here's [CTA Center](/component-docs/components/page-sections/ctas/cta-center/) as a real-world example using all three patterns:

```astro
<CustomSection maxContentWidth="lg" paddingVertical={paddingVertical} {...htmlAttributes}>
  <Heading level="h2" size="xl" alignX="center" data-prop="heading" text={heading} />
  <Text alignX="center" data-prop="subtext" text={subtext} />
  <ButtonGroup
    buttonSections={buttonSections}
    alignX="center"
    data-children-prop="buttonSections"
  />
</CustomSection>
```

Three `data-*` attributes at the page section level, and the building blocks handle the rest. Editors can update the heading and subtext inline, and add, remove, or reorder buttons without leaving the visual preview. Notice there's no `editable` prop — `data-prop` and `data-children-prop` are all you need to signal editability.

Browse any page section in the component docs to see more working examples.

If you'd rather not wire these up by hand, the [Component Builder](/component-docs/component-builder/) handles all the editable regions for you. It generates the right `data-*` attributes on every building block it includes, so the exported component is fully editable out of the box.

## Next up

You've completed the Getting Started guide. You can build components, brand them, and make them visually editable. From here, explore the full set of components in the sidebar — each one documents its props, examples, and CloudCannon configuration. Or head to the [Component Builder](/component-docs/component-builder/) to prototype new sections visually.
