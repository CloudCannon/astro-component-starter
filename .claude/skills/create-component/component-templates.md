# Astro component templates

Copy the template for your tier, rename, and strip what you don't use. Verify prop names against the real component you model on — do not trust these verbatim.

## Standard props (every component)

**MUST:** destructure these on every component, even if unused.

| Prop                        | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_component`                | The kebab dir path CloudCannon writes. Its presence means "placed in the editor" — render.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `class: className`          | Author-supplied classes. Merge with `class:list`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `useDefaultEditableBinding` | Toggles the component's default inline-edit binding. `renderBlock` passes it down.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `...htmlAttributes`         | Pass-through. **MUST** spread on the root element so `renderBlock` can inject `data-editable="array-item"` + `data-id`.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `spaceBefore`               | Flow override (`none`/`tight`/`default`/`loose`). Stackable blocks only — emit via `data-space-before={spaceBeforeAttr(spaceBefore)}` on a DIRECT CHILD of the root, never the root itself (CloudCannon's editable-regions re-render keeps the root element, so a prop-driven attribute there goes stale in the visual editor; flow's `:has()` hoists it — see `_flow.css`) and never the `style` attribute (it must stay free for consumers). Mark the root `stackable`, add the shared `/.cloudcannon/inputs/space-before.yml` glob entry. |

Editable-binding props (`data-prop`, `data-children-prop`, `data-prop-src`/`-alt`) and the attributes they translate to are owned by the [editable-regions skill](../editable-regions/SKILL.md). Do not restate the attribute tables here.

**MUST NOT:** put `data-editable` on the root element — it collides with the one `renderBlock` injects.
**MUST NOT:** use `display: contents` on the root — it breaks editable array-item regions.

## Early-return guard

**MUST:** core elements and wrappers guard against empty programmatic use.

```astro
const hasText = text?.trim().length > 0; const hasSlotContent = Astro.slots.has("default"); if
(!_component && !hasText && !hasSlotContent) return;
```

**Why:** when composed programmatically with no content the component should render nothing; when `_component` is set (placed via CloudCannon) it must always render so the editor can interact with it.

Page sections skip the guard — they delegate to `CustomSection`, which owns the render decision.

## Core element (atomic UI: text, icon, media, form control)

Model on `src/components/building-blocks/core-elements/text/Text.astro`.

```astro
---
import { spaceBeforeAttr } from '@component-utils/spaceBefore.mjs';

const {
  text = '',
  size,
  alignmentHorizontal = 'start',
  spaceBefore = 'default',
  class: className,
  useDefaultEditableBinding = false,
  'data-prop': customDataProp,
  _component,
  ...htmlAttributes
} = Astro.props;

const effectiveDataProp = customDataProp ?? (useDefaultEditableBinding ? 'text' : null);
const textDataAttributes = effectiveDataProp
  ? { 'data-editable': 'text', 'data-prop': effectiveDataProp }
  : {};

const hasText = text?.trim().length > 0;
const hasSlotContent = Astro.slots.has('default');
if (!_component && !hasText && !hasSlotContent) return;
---

<div class:list={['my-element', 'stackable', className]} {...htmlAttributes}>
  <div
    class:list={['my-element-inner', size && `size-${size}`, `align-${alignmentHorizontal}`]}
    data-space-before={spaceBeforeAttr(spaceBefore)}
    {...textDataAttributes}
  >
    <slot>{text}</slot>
  </div>
</div>

<style is:global>
  @layer components {
    /* No root margin — sibling spacing comes from the flow system. Declare a
       `--space-before` type default only if the block shouldn't fall back to
       `--space-before-default` (Heading: loose, Text: tight, Grid: loose). */
    .my-element {
      > .my-element-inner {
        color: var(--color-text);
      }
    }
  }
</style>
```

## Wrapper with child items (card, grid, accordion)

Model on `src/components/building-blocks/wrappers/accordion/Accordion.astro`.

**Common miss:** forgetting `class: className`. A wrapper that does not destructure it lets a caller's `class` replace the component's own root class outright — a spread `class` beats both `class` and `class:list`, so the hook class its CSS and `setup.ts` key on simply vanishes. Always merge: `class:list={["my-wrapper", className]}`. `lint:roots` fails on a classed root that spreads a rest without a `class` prop.

```astro
---
import { spaceBeforeAttr } from '@component-utils/spaceBefore.mjs';

import ChildItem from './MyWrapperItem.astro';

type ItemProps = Record<string, unknown>;

const {
  items,
  spaceBefore = 'default',
  class: className,
  useDefaultEditableBinding = false,
  'data-children-prop': childrenDataProp,
  _component,
  ...htmlAttributes
} = Astro.props;

const effectiveChildrenProp = childrenDataProp ?? (useDefaultEditableBinding ? 'items' : null);
const arrayDataAttributes = effectiveChildrenProp
  ? { 'data-editable': 'array', 'data-prop': effectiveChildrenProp }
  : {};

const hasItems = items?.length > 0;
const hasSlotContent = Astro.slots.has('default');
if (!_component && !hasItems && !hasSlotContent) return;
---

<div class:list={['my-wrapper', 'stackable', className]} {...htmlAttributes}>
  <div data-space-before={spaceBeforeAttr(spaceBefore)} {...arrayDataAttributes}>
    <slot>
      {items?.map((item: ItemProps) => (
        <ChildItem
          useDefaultEditableBinding={!!effectiveChildrenProp}
          data-editable="array-item"
          data-id="building-blocks/wrappers/my-wrapper/my-wrapper-item"
          {...item}
        />
      ))}
    </slot>
  </div>
</div>
```

**`data-id` on mapped children** is the mapped child's own kebab component path (its `.astro` file, PascalCase collapsed to kebab — e.g. `AccordionItem.astro` → `.../accordion/accordion-item`). The editable-regions skill owns the full array-item wiring.

To hold arbitrary building blocks instead of a fixed child component, render the array through `renderBlock.astro` (see `Card.astro`) and register a `*Sections` context — see [cloudcannon-yaml.md](cloudcannon-yaml.md#child-content-arrays).

## Page section (full-width section composed of building blocks)

Model on `src/components/page-sections/conversion/cta-center/CtaCenter.astro`. Page sections wrap content in `CustomSection` and compose existing building blocks — do not hand-write section chrome.

```astro
---
import CustomSection from '@builders/custom-section/CustomSection.astro';
import Heading from '@core-elements/heading/Heading.astro';
import Text from '@core-elements/text/Text.astro';
import ButtonGroup from '@wrappers/button-group/ButtonGroup.astro';

const {
  heading = '',
  subtext = '',
  buttonSections = [],
  sectionLabel,
  maxContentWidth = 'lg',
  paddingHorizontal = 'lg',
  paddingVertical = '4xl',
  colorScheme = 'inherit',
  backgroundColor,
  background,
  class: className,
  useDefaultEditableBinding = false,
  _component,
  ...htmlAttributes
} = Astro.props;
---

<CustomSection
  class:list={['my-section', className]}
  label={sectionLabel}
  maxContentWidth={maxContentWidth}
  paddingHorizontal={paddingHorizontal}
  paddingVertical={paddingVertical}
  colorScheme={colorScheme}
  backgroundColor={backgroundColor}
  background={background}
  useDefaultEditableBinding={useDefaultEditableBinding}
  {...htmlAttributes}
>
  <Heading level="h2" size="xl" alignmentHorizontal="center" data-prop="heading" text={heading} />
  <Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
  <ButtonGroup
    class="buttonSections"
    buttonSections={buttonSections}
    alignmentHorizontal="center"
    data-children-prop="buttonSections"
  />
</CustomSection>

<style is:global>
  @layer page-sections {
    .my-section {
      /* section-specific overrides only */
    }
  }
</style>
```

The template above is array shape A (`data-children-prop` on a composed wrapper). Mapping a `{Name}Item` (shape B) or a plain object array into custom markup (shape C) is in the [editable-regions skill](../editable-regions/SKILL.md#array-repeating-items) — do that before leaving the `.astro`. Heading chrome being editable is not enough.

### CustomSection props (page sections forward these)

Page section wrappers expose `label` to authors as `sectionLabel` and forward it. Common props: `maxContentWidth` (`none`/`xs`..`3xl`), `paddingHorizontal`/`paddingVertical` (`none`/`xs`..`6xl`; only `paddingVertical` has a default, `4xl`), `colorScheme` (`inherit`/`light`/`dark`), `lockColorScheme` (bool — pins the scheme when the visitor toggles site theme), `backgroundColor` (`none`/`base`/`surface`/`accent`/`highlight`), `background` (object: `type` image/video/pattern, positioning, `overlay` -1..1, image/video fields, `patternSize` natural/sm/md/lg for tiled patterns — pattern reuses `imageSource` and repeats it). Read `@builders/custom-section/CustomSection.astro` for the authoritative list. `rounded` is only on `CustomSection` directly, not forwarded by page section wrappers.

## Scroll-pinned sections

`ScrollDeck` and `ScrollStepper` are the two worked examples. Four constraints, each of which fails silently:

- **Sticky elements must be direct children of the element they scroll within.** A sticky box cannot leave its parent's box, so wrapping each card in its own full-height block pins nothing. `ScrollDeck` puts the cards straight into one track.
- **A sticky pane in a grid must be the grid item itself**, with `align-self: start` — put `position: sticky` on a child of a stretched item and it has nothing to travel through.
- **Clear the nav with `var(--main-nav-height, 0px)`**, never a measured value or a repeated `5rem`. `MainNav.astro` declares the token; the fallback keeps a site that drops the nav working.
- **`top` percentages resolve against the SCROLLPORT**, not the viewport — which is the preview pane in the component docs and the iframe in the editor, not the window. `top: 50%` centres correctly in all three; `100dvh` does not. Any JS comparing `getBoundingClientRect()` against a computed `top` has to subtract the scrollport's own offset (see `scroll-deck/setup.ts`).

`animation-timeline: view()` is **not** an option for a cue on the pinned element: a view progress timeline measures the subject's stuck position, so a pinned element never enters its own `exit` range and the timeline sits at negative progress. Drive that kind of cue from the IntersectionObserver you already need for the rail.

An ancestor with `overflow: hidden` kills sticky (it makes a scroll container); `overflow: clip` does not. `CustomSection`'s `rounded` sets `overflow: hidden`, so a scroll-pinned section must never pass it.

## Composition and CSS-first rules

- **Compose existing building blocks** (Button, Heading, Text, Icon, Image, Card, Grid, ButtonGroup) rather than hand-writing HTML + styling. The [page-content-authoring skill](../page-content-authoring/SKILL.md) owns the catalog of what exists.
- **CSS-first:** core interactions work without JS. Reach for JS only when CSS can't express it.

| Interaction              | Technique                                                       | Example                 |
| ------------------------ | --------------------------------------------------------------- | ----------------------- |
| Modal / popup / dropdown | Popover API (`popover`, `popovertarget`)                        | `Modal.astro`           |
| Expand / collapse        | `<details>` / `<summary>` (`name` for single-open)              | `AccordionItem.astro`   |
| Tabs / switcher          | Hidden radio inputs + `:checked` sibling + `:has()` fallback    | `ContentSelector.astro` |
| Enter/exit animations    | `@starting-style` + `allow-discrete` transitions                | `Modal.astro`           |
| Conditional visibility   | `:has()` or checkbox/radio toggle                               | `ContentSelector.astro` |
| Responsive layout        | Container queries (`container-type: inline-size`, `@container`) | `FeatureSplit.astro`    |

## Interactive components (JS that must run in the editor)

**MUST NOT:** rely on an inline `<script>` for behaviour that must also work inside the CloudCannon Visual Editor.
**Why:** the editor renders Astro via React's `renderToStaticMarkup`, which strips inline `<script>` tags — so inline setup never runs in the editor.

| Where the behaviour must run         | How to wire it                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Live site only (progressive enhance) | Inline `<script>` with the `onPageLoad` utility (below).                                                     |
| Live site **and** the editor         | Put setup in an importable module (see `carousel/setup.ts`); register + re-init it in `editor-live-sync.js`. |

```astro
<script>
  import { onPageLoad } from '@component-utils/onPageLoad';

  onPageLoad(() => {
    const elements = document.querySelectorAll('.my-component');
    if (!elements.length) return;
    elements.forEach((el) => {
      // progressive enhancement only
    });
  });
</script>
```

Query inside the callback, early-return when none found, keep it minimal — enhance, don't replace, the CSS-first behaviour.
