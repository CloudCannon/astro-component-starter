# Astro component templates

Copy the template for your tier, rename, and strip what you don't use. Verify prop names against the real component you model on — do not trust these verbatim.

## Standard props (every component)

**MUST:** destructure these on every component, even if unused.

| Prop                        | Purpose                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `_component`                | The kebab dir path CloudCannon writes. Its presence means "placed in the editor" — render.                              |
| `class: className`          | Author-supplied classes. Merge with `class:list`.                                                                       |
| `useDefaultEditableBinding` | Toggles the component's default inline-edit binding. `renderBlock` passes it down.                                      |
| `...htmlAttributes`         | Pass-through. **MUST** spread on the root element so `renderBlock` can inject `data-editable="array-item"` + `data-id`. |

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
const {
  text = '',
  size,
  alignmentHorizontal = 'start',
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

<div class:list={['my-element', className]} {...htmlAttributes}>
  <div
    class:list={['my-element-inner', size && `size-${size}`, `align-${alignmentHorizontal}`]}
    {...textDataAttributes}
  >
    <slot>{text}</slot>
  </div>
</div>

<style is:global>
  @layer components {
    .my-element {
      margin-top: var(--spacing-lg);

      > .my-element-inner {
        color: var(--color-text);
      }
    }
  }
</style>
```

## Wrapper with child items (card, grid, accordion)

Model on `src/components/building-blocks/wrappers/accordion/Accordion.astro`.

**Common miss:** `Accordion.astro` itself omits `class: className` — a known inconsistency, not the pattern. Every other wrapper (`Grid`, `Split`, `ButtonGroup`) destructures it; follow the template below, not Accordion, on this point.

```astro
---
import ChildItem from './MyWrapperItem.astro';

type ItemProps = Record<string, unknown>;

const {
  items,
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

<div class:list={['my-wrapper', className]} {...htmlAttributes}>
  <div {...arrayDataAttributes}>
    <slot>
      {
        items?.map((item: ItemProps) => (
          <ChildItem
            useDefaultEditableBinding={!!effectiveChildrenProp}
            data-editable="array-item"
            data-id="building-blocks/wrappers/my-wrapper/my-wrapper-item"
            {...item}
          />
        ))
      }
    </slot>
  </div>
</div>
```

**`data-id` on mapped children** is the mapped child's own kebab component path (its `.astro` file, PascalCase collapsed to kebab — e.g. `AccordionItem.astro` → `.../accordion/accordion-item`). The editable-regions skill owns the full array-item wiring.

To hold arbitrary building blocks instead of a fixed child component, render the array through `renderBlock.astro` (see `Card.astro`) and register a `*Sections` context — see [cloudcannon-yaml.md](cloudcannon-yaml.md#child-content-arrays).

## Page section (full-width section composed of building blocks)

Model on `src/components/page-sections/ctas/cta-center/CtaCenter.astro`. Page sections wrap content in `CustomSection` and compose existing building blocks — do not hand-write section chrome.

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

### CustomSection props (page sections forward these)

Page section wrappers expose `label` to authors as `sectionLabel` and forward it. Common props: `maxContentWidth` (`none`/`xs`..`3xl`), `paddingHorizontal`/`paddingVertical` (`none`/`xs`..`6xl`; only `paddingVertical` has a default, `4xl`), `colorScheme` (`inherit`/`light`/`dark`), `lockColorScheme` (bool — pins the scheme when the visitor toggles site theme), `backgroundColor` (`none`/`base`/`surface`/`accent`/`highlight`), `background` (object: `type` image/video, positioning, `overlay` -1..1, image/video fields). Read `@builders/custom-section/CustomSection.astro` for the authoritative list. `rounded` is only on `CustomSection` directly, not forwarded by page section wrappers.

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
