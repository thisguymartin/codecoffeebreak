import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedArticles } from '../utils/content';
export async function GET(context: APIContext) {
  return rss({
    title: 'Code Coffee Break',
    description: 'Engineering lessons from actually building things.',
    site: context.site ?? 'https://codecoffeebreak.com',
    items: (await publishedArticles()).map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: `/articles/${article.id}`,
      categories: article.data.topics,
    })),
  });
}
