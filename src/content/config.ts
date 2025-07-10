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
  spacing: z.string().optional(),
  component: z.string().optional(),
  component_path: z.string().optional(),
  blocks: z.union([z.record(z.any()), z.array(z.record(z.any()))]).optional(),
  primary_size: z.string().optional(),
  examples: z
    .union([
      z.array(
        z.object({
          title: z.string(),
          slugs: z.array(z.string()),
          size: z.string().optional(),
        })
      ),
      z.null(),
    ])
    .optional()
    .transform((val: any) => val || []),
});

const pagesCollection = defineCollection({
  schema: pageSchema,
});

const docsPagesCollection = defineCollection({
  type: "content",
  schema: docsPageSchema,
});

const docsComponentsCollection = defineCollection({
  type: "content",
  schema: docsComponentSchema,
});

export const collections = {
  pages: pagesCollection,
  "docs/pages": docsPagesCollection,
  "docs/components": docsComponentsCollection,
};
