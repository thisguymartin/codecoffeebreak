import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { site } from './config/site';

const common = z.object({
  title: z.string(),
  description: z.string(),
  topics: z.array(z.string()).min(1),
  draft: z.boolean().default(false),
  image: z.string().startsWith('/images/').optional(),
  imageAlt: z.string().optional(),
});
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: common.extend({
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default(site.editorialName),
    authorKind: z.enum(['Person', 'Organization']).default('Organization'),
    authorUrl: z.url().optional(),
    editorialNote: z.string().optional(),
    type: z.enum([
      'field-note',
      'deep-dive',
      'experiment',
      'build-log',
      'quick-break',
    ]),
    featured: z.boolean().default(false),
    audio: z
      .object({
        enabled: z.literal(false).default(false),
        src: z.string().optional(),
        duration: z.string().optional(),
      })
      .default({ enabled: false }),
  }),
});
const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: common.extend({ status: z.enum(['available', 'experiment']) }),
});
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: common.extend({
    order: z.number().default(10),
    technologies: z.array(z.string()),
    status: z.enum([
      'Active',
      'Experiment',
      'Open Source',
      'Public',
      'Archived',
    ]),
    github: z.url().optional(),
    articles: z.array(z.string()).default([]),
  }),
});
export const collections = { articles, tools, projects };
