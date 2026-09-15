import { z } from 'astro/zod';

const webUrl = z
  .url()
  .refine((url) => /^https?:\/\//.test(url), 'Use an HTTP or HTTPS URL');
const link = z.object({ title: z.string().min(1), url: webUrl });
const project = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  creator: z.string().min(1),
  creatorUrl: webUrl.optional(),
  github: webUrl
    .refine((url) => new URL(url).hostname === 'github.com', 'Use a GitHub URL')
    .optional(),
  demo: webUrl.optional(),
  image: z
    .object({ src: z.string().startsWith('/images/'), alt: z.string().min(1) })
    .optional(),
  permissionToPublish: z.literal(true),
});
const base = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  draft: z.boolean().default(false),
  topics: z.array(z.string().min(1)).min(1),
  city: z.string().default('Phoenix, Arizona'),
});
const dated = base.extend({
  startsAt: z.iso.datetime({ offset: true }),
  venue: z.string().min(1),
});
export const meetupSchema = z.discriminatedUnion('status', [
  base.extend({ status: z.literal('planning') }),
  dated.extend({ status: z.literal('scheduled'), rsvp: webUrl.optional() }),
  dated.extend({
    status: z.literal('completed'),
    recap: z.string().min(1),
    links: z.array(link).default([]),
    projects: z.array(project).default([]),
  }),
]);
