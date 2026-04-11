---
name: migrate-existing-site
description: Migrate an existing website into the Astro + CloudCannon component starter. Use when converting an existing site's pages, content, branding, and structure into this component library.
---

# Migrate Existing Site

End-to-end workflow for migrating an existing website into this component starter. The goal is to reproduce the site's content and visual structure using existing components where possible, and creating new ones only when necessary.

## Migration workflow overview

1. **Analyze** the source site — identify pages, sections, navigation, and branding
2. **Set up branding** — colors, fonts, and design tokens
3. **Configure site data** — navigation, footer, SEO
4. **Map sections** to existing components or flag for new creation
5. **Build pages** — generate `pageSections` YAML for each page
6. **Handle images** — download and place in the asset directory
7. **Migrate blog** — convert posts to MDX format (if applicable)

---

## Step 1: Analyze the source site

### Fetch and segment

Use the browser or fetch tool to load each page of the source site. For each page, identify:

- **Navigation**: logo, menu items, CTA buttons
- **Sections**: each visually distinct block on the page (separated by background changes, large spacing, or dividers)
- **Footer**: links, social icons, copyright text
- **Brand elements**: colors, fonts, logo

### Per-section analysis

For each section, note:

| Observation     | Record                                                           |
| --------------- | ---------------------------------------------------------------- |
| Layout type     | Centered, split (text + image), grid of cards, accordion, slider |
| Heading text    | Exact text                                                       |
| Body text       | Exact text (preserve line breaks)                                |
| Images          | URLs, descriptions for alt text                                  |
| Buttons         | Label text, link target, primary vs secondary                    |
| Background      | Light, dark, colored, image                                      |
| Repeating items | Count, fields per item (title, description, icon, image)         |

---

## Step 2: Set up branding

Follow the [theming skill](../theming/SKILL.md) to configure the design system.

### Quick checklist

1. **Extract brand colors** from the source site (use browser dev tools or a color picker)
2. **Edit** `src/styles/variables/_colors.css` — add brand palette values
3. **Edit** `src/styles/themes/_light.css` AND `_dark.css` — map brand colors to semantic tokens (always both files)
4. **Edit** `site-fonts.mjs` — set the brand's font families and weights
5. **Replace** `public/images/logo.svg` with the site's logo

---

## Step 3: Configure site data

Follow the [site-data-navigation skill](../site-data-navigation/SKILL.md).

### Quick checklist

1. **Edit** `src/data/seo.json` — site name, URL, description, title format
2. **Edit** `src/data/mainNav.json` — logo, navigation items, CTA buttons
3. **Edit** `src/data/footer.json` — logo, links, socials, copyright text
4. **Update** `site` in `astro.config.mjs` to match the production URL

---

## Step 4: Map sections to components

For each section identified in Step 1, match it to an existing page section or flag it for new component creation.

### Section mapping table

| Source section pattern                             | Component to use    | `_component` path                                                        |
| -------------------------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| **Centered hero** (heading + subtext + buttons)    | Hero Center         | `page-sections/heroes/hero-center`                                       |
| **Split hero** (text + image side by side)         | Hero Split          | `page-sections/heroes/hero-split`                                        |
| **Feature grid** (grid of items with icons/titles) | Feature Grid        | `page-sections/features/feature-grid`                                    |
| **Feature showcase** (text + image alternating)    | Feature Split       | `page-sections/features/feature-split`                                   |
| **Feature carousel** (sliding cards)               | Feature Slider      | `page-sections/features/feature-slider`                                  |
| **Centered CTA** (heading + buttons)               | CTA Center          | `page-sections/ctas/cta-center`                                          |
| **Split CTA** (text + image + buttons)             | CTA Split           | `page-sections/ctas/cta-split`                                           |
| **Contact form** (form + image)                    | CTA Form            | `page-sections/ctas/cta-form`                                            |
| **FAQ / accordion**                                | FAQ Section         | `page-sections/info-blocks/faq-section`                                  |
| **Team members grid**                              | Team Grid           | `page-sections/people/team-grid`                                         |
| **Testimonial / quote**                            | Testimonial Section | `page-sections/people/testimonial-section`                               |
| **Custom content** (doesn't fit above)             | Custom Section      | `page-sections/builders/custom-section`                                  |
| **Unique layout** (nothing fits)                   | **Create new**      | Use [screenshot-to-component skill](../screenshot-to-component/SKILL.md) |

### Decision: reuse vs create new

**Reuse an existing component when:**

- The source section's layout matches an existing component's structure
- Minor visual differences can be handled by props (colorScheme, backgroundColor, reverse, alignment)
- Content fields map cleanly to the component's props

**Create a new component when:**

- The layout is fundamentally different from all existing components
- The section has unique interactive behavior not covered by existing wrappers
- The data shape doesn't fit any existing component's prop structure

When creating new components, use the [screenshot-to-component skill](../screenshot-to-component/SKILL.md) if you have a visual reference, or the [create-component skill](../create-component/SKILL.md) for building from a description.

### Using custom-section as a fallback

`custom-section` can compose any building blocks freely. Before creating a brand-new page section, consider whether `custom-section` with the right building blocks achieves the layout:

```yaml
- _component: page-sections/builders/custom-section
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Section title
      level: h2
      size: lg
      alignmentHorizontal: center
    - _component: building-blocks/core-elements/text
      text: >-
        Body content here.
      alignmentHorizontal: center
    - _component: building-blocks/wrappers/grid
      minItemWidth: 300
      maxItemWidth: 400
      gap: lg
      items:
        - _component: building-blocks/wrappers/card
          border: true
          paddingHorizontal: md
          paddingVertical: md
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Card title
              level: h3
              size: sm
            - _component: building-blocks/core-elements/text
              text: Card description.
  maxContentWidth: 2xl
  paddingHorizontal: lg
  paddingVertical: 4xl
  colorScheme: inherit
  backgroundColor: surface
```

---

## Step 5: Build pages

Create a `.md` file in `src/content/pages/` for each page.

### Content extraction rules

- **Text**: Copy verbatim from the source. Use `>-` block scalar for multiline values.
- **Images**: Use `/src/assets/images/placeholder.jpg` initially, replace after downloading (Step 6).
- **Links**: Map to the new site's URL structure (e.g., `/about/` not `https://oldsite.com/about`).
- **Buttons**: Map to the closest `variant` (`primary`, `secondary`, `tertiary`, `ghost`).

### Visual treatment mapping

| Source appearance               | `colorScheme` | `backgroundColor`       |
| ------------------------------- | ------------- | ----------------------- |
| White / light background        | `inherit`     | `base`                  |
| Light gray background           | `inherit`     | `surface`               |
| Dark background with light text | `dark`        | `surface`               |
| Brand-colored background        | `inherit`     | `accent` or `highlight` |
| Transparent / no background     | `inherit`     | `none`                  |

### Alternating sections

A common pattern is alternating `backgroundColor` between `base` and `surface` to visually separate sections:

```yaml
pageSections:
  - _component: page-sections/heroes/hero-center
    backgroundColor: base
  - _component: page-sections/features/feature-grid
    backgroundColor: surface
  - _component: page-sections/features/feature-split
    backgroundColor: base
  - _component: page-sections/ctas/cta-center
    colorScheme: dark
    backgroundColor: surface
```

### Feature split alternating pattern

When migrating multiple feature sections, alternate `reverse` to create a zigzag layout:

```yaml
- _component: page-sections/features/feature-split
  reverse: false
  backgroundColor: base
- _component: page-sections/features/feature-split
  reverse: true
  backgroundColor: base
  paddingVertical: lg
```

Refer to the [page-content-authoring skill](../page-content-authoring/SKILL.md) for the full component catalog and prop reference.

---

## Step 6: Handle images

### Download strategy

1. Identify all images from the source site
2. Download to `src/assets/images/` (Astro optimizes images from this path)
3. Organize in subdirectories if the site has many images (e.g., `src/assets/images/team/`, `src/assets/images/blog/`)
4. Update image paths in the YAML frontmatter

### Image path format

Images referenced in page frontmatter use the full source path:

```yaml
imageSource: /src/assets/images/hero.jpg
```

For static images that shouldn't be processed (like logos), place in `public/images/`:

```yaml
logoSource: /images/logo.svg
```

### Placeholder approach

During migration, use a placeholder first and replace later:

```yaml
imageSource: /src/assets/images/placeholder.jpg
imageAlt: Descriptive alt text based on the original image
```

Always write meaningful alt text even when using placeholders — it won't need updating later.

---

## Step 7: Migrate blog content

If the source site has a blog, follow the [blog-mdx-content skill](../blog-mdx-content/SKILL.md).

### Quick checklist

1. Create `.mdx` files in `src/content/blog/` for each post
2. Convert HTML content to MDX markdown
3. Set frontmatter: `title`, `description`, `date`, `author`, `image`, `tags`
4. Download and place blog images in `src/assets/images/`
5. Update `src/content/pages/blog.md` with the blog index hero section

---

## Multi-page migration

When migrating multiple pages:

### File structure

```
src/content/pages/
├── index.md          # Home page
├── about.md          # About page
├── services.md       # Services page
├── contact.md        # Contact page
├── blog.md           # Blog index (hero only; posts are in src/content/blog/)
└── search.md         # Search page (usually keep as-is)
```

### Page priority order

1. **Home page** — most sections, sets the tone
2. **Key landing pages** — services, features, pricing
3. **About / team page** — uses team-grid, testimonials
4. **Contact page** — uses cta-form
5. **Blog** — last, most labor-intensive

---

## Quality checklist

After migration, verify:

- [ ] All pages render without errors (`npm run dev`)
- [ ] Navigation links point to correct pages
- [ ] Footer links and socials are correct
- [ ] SEO data shows correct titles and descriptions
- [ ] Images load (no broken references)
- [ ] Color scheme looks correct in both light and dark sections
- [ ] Responsive layout works on mobile
- [ ] CloudCannon visual editor shows editable regions (if deployed)
- [ ] No placeholder text remains in production content
