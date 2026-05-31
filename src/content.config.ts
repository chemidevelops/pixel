import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    issue: z.number().optional(),
    lang: z.enum(['es', 'en']).default('es'),
    gallery: z.array(z.union([
      z.string(),
      z.object({ src: z.string(), caption: z.string().optional() })
    ])).optional(),
  }),
});

const issues = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/issues' }),
  schema: z.object({
    number: z.number(),
    title: z.string(),
    date: z.string(),
    pdf: z.string().optional(),
    pdf_print: z.string().optional(),
  }),
});

export const collections = { posts, issues };
