---
title: Component Builder
contentSections: []
---

# Component Builder

The Component Builder is a visual tool for prototyping page sections. Instead of writing code from scratch, you drag building blocks into a sandbox, arrange them, configure their props, and export a complete component package: Astro code and CloudCannon config files included.

It's a great way to experiment with component structures before committing to code.

## Opening the builder

Navigate to the [Component Builder](/component-docs/component-builder/) page. You'll see three areas:

- **Component palette** (left): All available building blocks, organized by category
- **Sandbox** (center): Your component workspace where you drag and arrange blocks
- **Property editor** (right): Appears when you select a component, showing its configurable props

## Adding components

Browse the palette on the left to find building blocks. Components are grouped into categories like Core Elements, Wrappers, and Forms.

**Drag a component** from the palette into the sandbox to add it. Start with a wrapper like a `CustomSection` as your outer container, then add content inside it.

## Nesting components with slots

Many components have **slots**: named areas where child components can go. When you drag a component over a slot-compatible parent, you'll see drop zones appear indicating where you can nest it.

For example:

1. Add a **Custom Section** to the sandbox
2. Drag a **Heading** into the Custom Section's content area
3. Drag a **Text** component below the Heading
4. Drag a **Button** below the Text

You've just built a simple content block by nesting building blocks inside a wrapper.

### Working with multi-slot components

Some components have multiple named slots. A **Split** component, for example, has `first` and `second` slots for its two columns. Drag components into the specific slot you want them in.

## Configuring props

Click any component in the sandbox to open the property editor on the right. Each prop has a type-appropriate input:

- **Text** props show a text field
- **Select** props show a dropdown
- **Switch** props show a toggle
- **URL** props show a link field
- **Number** props show a numeric input
- **Image** props show a file picker

### Hardcoded vs. exposed props

This is a key concept. For each prop, you can choose whether to **hardcode** it or **expose** it:

- **Hardcoded** props have a fixed value baked into the component. The developer makes the decision and editors can't change it. Good for layout decisions, sizing, alignment: things editors shouldn't need to think about.

- **Exposed** props become inputs that editors can change in CloudCannon. Good for content: headings, text, images, links.

Use the toggle next to each prop to switch between hardcoded and exposed. This is exactly what you'd do when writing a page section by hand (see [Building a Page Section](/component-docs/building-a-page-section/)). The builder just gives you a visual way to make these decisions.

### Renaming exposed props

When you expose a prop, you can rename it to something more meaningful. For example, if you have a Heading component nested inside a Split, you might rename its `text` prop to `heading` so editors see a clear, descriptive input name.

### Repeatable item slots

Some components have slots designed for repeatable items: Accordion items, Grid items, Button Group buttons, and so on. These slots are marked with a **Repeatable** badge in the builder.

In a repeatable slot, you define **one template item** that sets the structure for every item in the list. Editors can then add, remove, and reorder items when building pages in CloudCannon, each following the template you defined.

For example, to build an FAQ section:

1. Add an **Accordion** inside a Custom Section
2. Drag an **AccordionItem** into the Accordion's repeatable slot — this is your template
3. Add a **Text** component inside the AccordionItem
4. Expose the `title` and `text` props so editors can fill in each question and answer

Use the **Preview copies** control to specify how many items appear in the live preview so you can see what the component looks like with realistic data.

### Open for page building

Some slots have an **Open for page building** toggle. When this is on, the slot is left open for editors to fill with whatever components they choose when building pages in CloudCannon. The children you've placed in the builder are ignored in the export.

This is useful when you want a section layout (padding, background, width) but don't want to lock down what goes inside. For example, a Custom Section with "Open for page building" turned on gives editors full freedom to compose their own content using any available building blocks.

When it's off, the children you've placed in the builder are baked into the exported component.

## Reordering and removing

- **Drag components** within the sandbox to reorder them
- **Select a component** and use the delete option to remove it from the sandbox

## Exporting your component

When you're happy with your composition, click the **Export** button. A modal appears where you configure:

1. **Component type**: Page Section or Building Block
2. **Category**: Where it lives in the component hierarchy. For page sections, you can choose from existing categories (heroes, features, ctas, etc.) or enter a custom one. For building blocks, choose from core-elements, wrappers, or forms.
3. **Component name**: A kebab-case name like `info-block` or `feature-cards`

A live path preview shows where the component will live: `page-sections/ctas/info-block`

Click **Confirm** to download a ZIP file containing all three files:

- **`ComponentName.astro`**: The Astro component with your layout, hardcoded values, and exposed props
- **`component-name.cloudcannon.inputs.yml`**: Input definitions for every exposed prop
- **`component-name.cloudcannon.structure-value.yml`**: Defaults and picker metadata

Unzip the files into the appropriate directory under `src/components/` and your new component is ready to use, both in code and in CloudCannon's visual editor.

## Tips for effective use

- **Start with CustomSection** as your outer wrapper. It handles padding, width, color scheme, and background, so you don't have to.
- **Think about what to hardcode early.** Layout decisions (gap sizes, alignment, max widths) are usually hardcoded. Content (text, images, links) is usually exposed.
- **Use the builder to prototype, then refine in code.** The exported code is a solid starting point, but you'll likely want to add styles, conditional rendering, or additional polish.
- **Check the exported CloudCannon config.** The generated inputs and structure-value files are functional, but you may want to tweak `comment` descriptions, add `hidden` conditions, or adjust `options` for select inputs.

## Next up

If you haven't connected your site to CloudCannon yet, see the setup steps in [Editing a Page](/component-docs/editing-a-page/) to get the visual editor running.
