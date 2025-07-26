import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const pageSchema = z.object({
  title: z.string(),
  content_blocks: z.array(z.any()),
});

const docsPageSchema = z.object({
  title: z.string(),
  content_blocks: z.array(z.any()),
});

const docsComponentSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  spacing: z.string().optional().nullable(),
  component: z.string().optional(),
  component_path: z.string().optional(),
  blocks: z.union([z.record(z.any()), z.array(z.record(z.any()))]).optional(),
  primary_size: z.string().optional(),
  examples: z
    .union([
      z.array(
        z.object({
          title: z.string().optional(),
          slugs: z.array(z.string()),
          size: z.string().optional(),
        })
      ),
      z.null(),
    ])
    .optional()
    .transform((val: any) => {
      if (!val) return [];

      return val.map((example: any) => ({
        title:
          example.title ||
          (example.slugs?.[0]
            ? example.slugs[0].replace(/-/g, " ").charAt(0).toUpperCase() +
              example.slugs[0].replace(/-/g, " ").slice(1)
            : "Example"),
        slugs: example.slugs,
        size: example.size ?? "md",
      }));
    }),
});

const pagesCollection = defineCollection({
  schema: pageSchema,
});

const docsPagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/skele-docs/content/pages" }),
  schema: docsPageSchema,
});

const docsComponentsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/skele-docs/content/components" }),
  schema: docsComponentSchema,
});

export const collections = {
  pages: pagesCollection,
  "docs-pages": docsPagesCollection,
  "docs-components": docsComponentsCollection,
};
