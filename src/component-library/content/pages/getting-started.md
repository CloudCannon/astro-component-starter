---
title: Getting Started
contentSections: []
---

# Getting Started

This guide will walk you through the basics of customizing your site in CloudCannon, from editing components to creating custom sections and adjusting your brand colors.

### What is CloudCannon?

<a href="https://cloudcannon.com/" target="_blank" rel="noopener">CloudCannon</a> is a visual content management system that lets you edit your Astro site without touching code. Once your site is connected, you can add components, edit content, and manage pages through a visual interface that previews your changes in real time.

## Editing content

Once your site is connected to CloudCannon, you can start editing components directly in the Visual Editor.

### Editing existing components

1. **Open a page** in CloudCannon's Visual Editor
2. **Click on any component** to see its editable inputs in the sidebar. Make some updates and watch the preview update live.
3. **Click on text** in the preview to edit it directly inline.

### Adding new components

1. Click the **"Add Page Section"** button in the sidebar to open the component picker.
2. **Choose** a Page Section to add from the available options.
3. Fill out the content in the sidebar inputs.
4. **Reorder components** by dragging them in the sidebar.
5. Watch the preview update in real-time as you make changes.

## Building a component structure from scratch

Let's create a split layout with a heading and text on one side, and an image on the other. This will help you understand how components work together.

### Step 1: Add a Custom Section

A [Custom Section](/component-library/components/page-sections/builders/custom-section/) is a container that controls padding, width, and background colors. It's the foundation for most page sections.

1. On your page, click **"Add Page Section"** in the sidebar.
2. Select **"Custom Section"** from the component picker.
3. The custom section will appear with default settings.

### Step 2: Add a Split

A [Split](/component-library/components/building-blocks/wrappers/split/) divides the space into two columns with adjustable widths.

1. Open your Custom Section in the sidebar.
2. Click **"+ Add Content Section"**.
3. Select **"Split"** from the component picker.

### Step 3: Add content elements

Now we'll add the actual content: a [Heading](/component-library/components/building-blocks/core-elements/heading/), [Text](/component-library/components/building-blocks/core-elements/text/), and an [Image](/component-library/components/building-blocks/core-elements/image/).

**First Column:**

1. In your Split, click **"Add First Column Content Section"**.
2. Select **"Heading"** and add your heading text.
3. Click **"Add First Column Content Section"** again.
4. Select **"Text"** and add your body text.

**Second Column:**

1. In your Split, click **"Add Second Column Content Section"**.
2. Select **"Image"**.
3. Choose an image source from your assets.

**Result:** You've created a split layout! Experiment with the properties of each component to see how you can customize spacing, alignment, colors, and more.

## Creating reusable page sections

You've just built a split layout manually by nesting components together. While this works, it requires navigating through multiple levels of nested properties: Custom Section → Split → First Column → Heading/Text, and so on.

To make this easier for editors, you can create a **Page Section component** that packages this structure into a single, reusable component. Instead of managing all the nested components, editors see a simplified interface with just the properties they need: heading, text, image, and styling options.

### Try Feature Split

The [Feature Split](/component-library/components/page-sections/features/feature-split/) component is a perfect example of this pattern. It combines `CustomSection` and `Split` internally, but presents editors with a clean, focused set of inputs.

1. Add a **Feature Split** component to your page.
2. Notice how it has the same structure you just built, but with a simpler interface.
3. Compare the editing experience. Much easier, right?

### How it works

If we look at the Feature Split source code, we can see it uses the same building blocks, but with Astro templating:

```astro
---
import CustomSection from "@builders/custom-section/CustomSection.astro";
import Heading from "@core-elements/heading/Heading.astro";
import Image from "@core-elements/image/Image.astro";
import SimpleText from "@core-elements/simple-text/SimpleText.astro";
import Text from "@core-elements/text/Text.astro";
import ButtonGroup from "@wrappers/button-group/ButtonGroup.astro";
import Split from "@wrappers/split/Split.astro";

const {
  eyebrow = "",
  heading = "",
  subtext = "",
  buttonSections = [],
  imageSource = "",
  imageAlt = "",
  imageAspectRatio = "portrait",
  imageRounded = true,
  reverse = false,
  colorScheme,
  backgroundColor,
  paddingVertical = "4xl",
  class: className,
} = Astro.props;

const minSplitWidth = 720;
const featureSplitId = `feature-split-${crypto.randomUUID()}`;
---

<CustomSection
  class:list={["feature-split", className]}
  maxContentWidth="xl"
  paddingHorizontal="lg"
  paddingVertical={paddingVertical}
  colorScheme={colorScheme}
  backgroundColor={backgroundColor}
  data-feature-split-id={featureSplitId}
>
  <Split
    class="feature-split-layout"
    distributionMode="flexible-fixed"
    fixedWidth="400"
    minSplitWidth={minSplitWidth}
    reverse={reverse}
    verticalAlignment="center"
    gap="2xl"
    reverseOrderOnMobile={true}
  >
    <Fragment slot="first">
      {
        eyebrow && (
          <SimpleText class="eyebrow" data-prop="eyebrow">
            {eyebrow}
          </SimpleText>
        )
      }
      {
        heading && (
          <Heading level="h2" size="lg" data-prop="heading">
            {heading}
          </Heading>
        )
      }
      {subtext && <Text class="subtext" data-prop="subtext" text={subtext} />}
      {
        buttonSections?.length > 0 && (
          <ButtonGroup
            class="feature-buttons"
            buttonSections={buttonSections}
            direction="row"
            alignX="start"
          />
        )
      }
    </Fragment>
    {
      imageSource && (
        <Image
          slot="second"
          class:list={["feature-split-image", reverse && "reverse"]}
          source={imageSource}
          alt={imageAlt}
          rounded={imageRounded}
          aspectRatio={imageAspectRatio}
          data-prop-src="imageSource"
          data-prop-alt="imageAlt"
          data-editable="image"
        />
      )
    }
  </Split>
</CustomSection>
```

**Key points:**

- **Hardcoded values** like `maxContentWidth="xl"` and `gap="2xl"` are set by the developer.
- **Editor-controlled props** like `heading`, `subtext`, and `imageSource` come from CloudCannon inputs.
- **`data-prop` attributes** tell CloudCannon which props map to editable regions for inline editing.
- **Conditional rendering** (the `&&` checks) means components only render when they have content.

This is the foundation of how you build in the Astro Component Starter: combine polished building blocks to create Page Sections that editors can use to build pages without touching code.

## Understanding CSS Cascade Layers

This project uses CSS Cascade Layers to organize styles into a predictable hierarchy. This system ensures that component styles can be easily overridden without fighting specificity battles.

### How Layers Work

Styles are organized into five layers (in order of precedence):

1. **`reset`** - CSS reset styles that normalize browser defaults
2. **`base`** - Base typography, form elements, and HTML element styles
3. **`components`** - Reusable component styles (buttons, cards, navigation, etc.)
4. **`utils`** - Utility classes (e.g., `.visually-hidden`)
5. **`overrides`** - Page section styles and custom overrides

Later layers always win over earlier layers, regardless of CSS specificity. This means a simple selector like `.my-class` in the `overrides` layer will override a highly specific selector like `.bar[data-astro-cid-xyz] .nav-item > a` in the `components` layer.

### Using Layers When Building Components

When creating new components or modifying existing ones:

- **Building block components** (buttons, headings, forms, wrappers) should use `@layer components`
- **Page section components** (heroes, features, CTAs) should use `@layer overrides`

## Customizing your brand

Your site's brand colors, content widths, font sizes, and other styling aspects are controlled by CSS variables. You can customize them to match your brand.

### Changing CSS variables

**Brand colors** are defined in:

- **`src/styles/themes/_default.pcss`** — Light theme variables
- **`src/styles/themes/_contrast.pcss`** — Dark theme variables

**Typography and layout** are defined in:

- **`src/styles/variables/_fonts.pcss`** — Font families and sizing
- **`src/styles/variables/_content-widths.pcss`** — Max content widths used by sections/layouts

Try updating some of these variables and see the impact across your entire site. Since components use these variables, changes propagate automatically.

### Customizing components

All components in this starter are yours to edit, tweak, and extend. Whether you want to:

- Modify existing components to better match your needs
- Add new props for additional customization
- Create entirely new components by combining building blocks

You have full control. Component source files are in `src/components/`—open any component file and customize it to your heart's content. This is a starting point, not a limitation.

## Next Steps

Now that you understand the basics, here's how to continue:

- **Explore the component starter**: Browse all available components in the sidebar to see what's possible.
- **Read component documentation**: Each component has detailed prop information and examples.
- **Experiment with combinations**: Try combining different building blocks to create unique layouts.
- **Review CloudCannon configuration**: Check `cloudcannon.config.yml` and component `.cloudcannon.*.yml` files to understand how editor customization works.
- **Build your own Page Section**: Use Feature Split as a template to create custom sections for your specific needs.
