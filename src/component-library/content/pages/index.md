---
title: Astro Component Starter
contentSections: []
---
# Astro Component Starter

Welcome to your Astro Component Starter. It's a modular foundation for building fast, accessible, and maintainable websites using web fundamentals.

Here you’ll find **examples and documentation** for every component in your design system.

This starter will help you:

* Keep designs consistent across pages and sites
* Maintain a single source of truth for your components
* Make it simple to explore, tweak, and extend your system

### What are components?

Components are focused, reusable UI pieces that combine to create larger sections.

Components are grouped by purpose:

* **Building Blocks** — Foundational UI components designed for reuse within larger structures.
* **Page Sections** — Full-width sections used to assemble complete page layouts.
* **Navigation** — Components that facilitate movement throughout the site, such as headers, menus, and footers.

### Using this starter

Components are designed to work together seamlessly. You can:

* **Browse components** using the sidebar to see all available options
* **View examples** for each component to understand different use cases
* **Copy code** directly from the component viewer to use in your pages
* **Customize components** by modifying their props and slots
* **Combine components** to build complete page sections

### CSS

This starter uses modern, vanilla CSS built on PostCSS with CSS variables for theming and consistency.

Styles are organized into:

* **Variables** (`src/styles/variables/`) — Design tokens for colors, spacing, typography, and more
* **Base styles** (`src/styles/base/`) — Reset, typography, forms, and HTML element defaults
* **Themes** (`src/styles/themes/`) — Color scheme definitions for default (light) and contrast (dark) themes.
* **Component styles** — Scoped styles within each component file

### JavaScript

JavaScript is treated as a **progressive enhancement** throughout the Component Starter.

* **Most components** have no JavaScript at all
* **Some components** use JavaScript to manage aria attributes for accessibility
* **A few components** are reliant on JavaScript for core functionality (like carousels)

When JavaScript is needed, it's written in **vanilla JavaScript**.

### CloudCannon Configuration

Components are configured for use with <a href="https://cloudcannon.com/" target="_blank" rel="noopener">CloudCannon</a>, so editors can visually edit and management content without touching code.

#### Configuration Files

Each component can include:

* **`*.cloudcannon.inputs.yml`** — Defines the [inputs](https://cloudcannon.com/documentation/articles/what-are-inputs/) shown in CloudCannon's editor. Each prop can be configured with a type (text, select, switch, etc.), description, and validation
* **`*.cloudcannon.structure-value.yml`** — Defines the [structures](https://cloudcannon.com/documentation/articles/what-is-a-structure/) for components to control how they behave in the editor.
* **`*.cloudcannon.snippets.yml`** — Defines [snippets](https://cloudcannon.com/documentation/articles/what-is-a-snippet/) editors can use while editing MDX files.

#### Editable Regions

[Editable Regions](https://cloudcannon.com/documentation/articles/what-are-editable-regions/) enable live preview editing in CloudCannon, allowing you to add and edit components, modify text, and update assets directly on the page.

Editable regions require context about prop names and array structures. When building Page Sections, use `data-prop` attributes to map text props correctly. The same approach applies to images and arrays. See the Page Sections components source code for examples.