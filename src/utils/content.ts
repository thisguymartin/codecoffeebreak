import { getCollection, type CollectionEntry } from 'astro:content';

export const topicSlug = (topic: string) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
export const readingTime = (body: string | undefined) =>
  Math.max(1, Math.ceil((body ?? '').split(/\s+/).length / 220));
export const typeLabel = (type: CollectionEntry<'articles'>['data']['type']) =>
  ({
    'field-note': 'Field note',
    'deep-dive': 'Deep dive',
    experiment: 'Experiment',
    'build-log': 'Build log',
    'quick-break': 'Quick break',
  })[type];
export async function publishedArticles() {
  return (
    await getCollection(
      'articles',
      ({ data }) => !data.draft && data.publishedAt <= new Date(),
    )
  ).sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}
