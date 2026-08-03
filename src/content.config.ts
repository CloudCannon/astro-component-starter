import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "zod";

const contentBlockSchema = z.object({ _component: z.string() }).passthrough();
const docsViewerSizeSchema = z.enum(["sm", "md", "lg", "xl"]);

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  image: z.string().optional(),
  canonical: z.string().optional(),
  pageSections: z.array(contentBlockSchema),
});

const docsPageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  contentSections: z.array(contentBlockSchema),
});

const docsComponentSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  order: z.number().optional(),
  overview: z.string().optional(),
  description: z.string().optional(),
  defaultSize: docsViewerSizeSchema.optional(),
  // Spacing for the synthesized primary example (see ComponentLayout.astro).
  spacing: z.string().optional().nullable(),
  component: z.string().optional(),
  component_path: z.string().optional(),
  slots: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        fallback_for: z.string().optional().nullable(),
        child_component: z
          .object({
            // Optional: derived from the component source (see slotDerivation.ts).
            name: z.string().optional(),
            props: z.array(z.string()).optional(),
          })
          .optional()
          .nullable(),
      })
    )
    .optional(),
  examples: z
    .union([
      z.array(
        z.object({
          title: z.string().optional(),
          slugs: z.array(z.string()),
          size: docsViewerSizeSchema.optional(),
        })
      ),
      z.null(),
    ])
    .optional()
    .transform((val) => {
      if (!val) return [];

      return val.map((example) => ({
        title:
          example.title ||
          (example.slugs?.[0]
            ? example.slugs[0].replace(/-/g, " ").charAt(0).toUpperCase() +
              example.slugs[0].replace(/-/g, " ").slice(1)
            : "Example"),
        slugs: example.slugs,
        size: example.size,
      }));
    }),
});

// Hand-written docs examples. `title` is required — ComponentViewer reads it
// unconditionally, so a missing one is a build error rather than a render crash.
const docsComponentExampleSchema = z.object({
  title: z.string(),
  spacing: z.string().optional().nullable(),
  blocks: z
    .union([z.record(z.string(), z.any()), z.array(z.record(z.string(), z.any()))])
    .optional(),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: pageSchema,
});

const docsPagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/component-docs/content/pages" }),
  schema: docsPageSchema,
});

const docsComponentsCollection = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/component-docs/content/components" }),
  schema: docsComponentSchema,
});

const docsComponentExamplesCollection = defineCollection({
  loader: glob({ pattern: "**/examples/*.md", base: "./src/component-docs/content/components" }),
  schema: docsComponentExampleSchema,
});

const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  author: z.string().default("Anonymous"),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).optional(),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: blogPostSchema,
});

export const collections = {
  pages: pagesCollection,
  "docs-pages": docsPagesCollection,
  "docs-components": docsComponentsCollection,
  "docs-component-examples": docsComponentExamplesCollection,
  blog: blogCollection,
};
