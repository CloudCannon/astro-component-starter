# Astro Component Starter

A starter template with 40+ Astro components, each built for visual editing in [CloudCannon](https://cloudcannon.com/). You clone it, you own it. Every component is your source code to modify, extend, or delete.

There's no package dependency to manage. You own the source code and decide when (or if) to pull in future improvements from the core repo.

The design is intentionally unbranded so it can morph into any brand you want. Components are built on web fundamentals: vanilla CSS, semantic HTML, and a sprinkling of vanilla JS only when something can't be done with CSS alone. Performance and accessibility are baked in from the start.

## Quick Start

```bash
git clone <repository-url>
cd astro-component-starter
npm install
npm run dev
```

Your site is now running at `http://localhost:4321`.

**Make your first change:** Open `src/content/pages/index.md`, change the hero heading, and watch it update in your browser.

## What You'll See

- **Your site** at [localhost:4321](http://localhost:4321), a fully working demo with pages, blog, and navigation
- **Component docs** at [localhost:4321/component-docs/](http://localhost:4321/component-docs/), documentation, examples, and a visual builder for every component

## The Three-File Pattern

Every component in this starter ships with three files. This is what makes the system work: developers build components, editors visually manage content.

```
src/components/.../button/
├── Button.astro                          # The component
├── button.cloudcannon.inputs.yml         # What editors see and can change
└── button.cloudcannon.structure-value.yml # Defaults and picker metadata
```

## Key Directories

```
src/
├── components/          # All 40+ components (yours to edit)
│   ├── building-blocks/ # Core UI: buttons, headings, forms, layout wrappers
│   ├── page-sections/   # Full-width sections: heroes, features, CTAs
│   └── navigation/      # Header, footer, mobile nav
├── content/             # Your pages and blog posts (Markdown/MDX)
├── styles/              # Design tokens, themes, base styles
│   ├── variables/       # Colors, fonts, spacing, widths
│   └── themes/          # Light and dark theme definitions
└── component-docs/   # Built-in docs (can be excluded from production builds)
```

## Available Scripts

| Command                    | Description                      |
| -------------------------- | -------------------------------- |
| `npm run dev`              | Start the development server     |
| `npm run build`            | Build for production             |
| `npm run build:no-library` | Build without the component docs |
| `npm run preview`          | Preview the production build     |
| `npm run lint`             | Run all linters (JS, CSS, YML)   |
| `npm run lint:fix`         | Auto-fix linting issues          |
| `npm run format`           | Check formatting                 |
| `npm run format:fix`       | Auto-fix formatting              |

## Prerequisites

- Node.js >= 24.0.0

## Learn More

Head to the [component docs](http://localhost:4321/component-docs/) in your dev server for a guided tour, examples for every component, and a visual component builder.

## License

MIT
