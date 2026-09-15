import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(join(directory, entry.name))
          : join(directory, entry.name),
      ),
    )
  ).flat();
}
const allFiles = await files('dist');
const pages = allFiles.filter((file) => file.endsWith('.html'));
const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const titles = new Set();
let checkedLinks = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  assert.ok(
    !/Martin Patino|martinpatino\.com|thisguymartin|\/projects\/(grove|mochi|zettl)/i.test(
      html,
    ),
    `Publication identity stays independent in ${page}`,
  );
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title, `Title exists in ${page}`);
  assert.ok(!titles.has(title), `Unique title in ${page}`);
  titles.add(title);
  assert.ok(
    html.includes('name="description"'),
    `Description exists in ${page}`,
  );
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `One h1 in ${page}`);
  assert.ok(html.includes('rel="canonical"'), `Canonical exists in ${page}`);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  assert.ok(canonical?.startsWith('https://codecoffeebreak.com/'), `Production canonical in ${page}`);
  if (page === 'dist/404.html') {
    assert.ok(html.includes('name="robots" content="noindex"'), '404 is not indexable');
    assert.ok(!sitemapUrls.includes(canonical), '404 excluded from sitemap');
  } else {
    assert.ok(!html.includes('content="noindex"'), `Public page stays indexable in ${page}`);
    assert.ok(sitemapUrls.includes(canonical), `Canonical matches sitemap in ${page}`);
  }
  for (const match of html.matchAll(
    /(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g,
  )) {
    const target = decodeURIComponent(match[1]);
    const candidates = [
      join('dist', target),
      join('dist', target, 'index.html'),
    ];
    const exists = await Promise.all(
      candidates.map((file) =>
        access(file)
          .then(() => true)
          .catch(() => false),
      ),
    );
    assert.ok(
      exists.some(Boolean),
      `Local resource ${target} linked from ${page}`,
    );
    checkedLinks++;
  }
}
const homepage = await readFile('dist/index.html', 'utf8');
assert.match(homepage, /<title>Phoenix Developer &amp; AI Meetups/);
assert.ok(homepage.includes('Developer meetups in Phoenix, Arizona.'), 'Visible local meetup positioning');
assert.match(homepage, /property="og:image" content="https:\/\//);
assert.ok(homepage.includes('name="twitter:card" content="summary_large_image"'), 'Homepage large image preview');
assert.ok(!homepage.includes('"@type":"Event"'), 'Unconfirmed gathering has no Event markup');
for (const slug of [
  'welcome-draft',
  'building-my-first-sekiro-mod',
  'lambda-cache-warmer',
  'repository-context-experiment',
]) {
  assert.ok(
    !allFiles.some((file) => file.includes(slug)),
    `Draft ${slug} excluded from output`,
  );
  assert.ok(
    !(await readFile('dist/rss.xml', 'utf8')).includes(slug),
    `Draft ${slug} excluded from RSS`,
  );
  assert.ok(!sitemap.includes(slug), `Draft ${slug} excluded from sitemap`);
  for (const page of pages) {
    assert.ok(!(await readFile(page, 'utf8')).includes(`/articles/${slug}`), `Draft link excluded from ${page}`);
  }
}
const article = await readFile(
  'dist/articles/the-cost-of-repeated-context/index.html',
  'utf8',
);
const structured = JSON.parse(
  article.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s,
  )?.[1] ?? '{}',
);
assert.equal(structured['@type'], 'Article');
assert.equal(structured.author['@type'], 'Organization');
assert.equal(structured.author.name, 'Code Coffee Break');
assert.ok(
  !structured.author.url,
  'Editorial attribution does not link to a personal portfolio',
);
for (const slug of [
  'a-timeout-is-not-a-receipt',
  'when-the-cache-door-opens',
  'your-cli-has-two-conversations',
]) {
  const html = await readFile(`dist/articles/${slug}/index.html`, 'utf8');
  assert.ok(
    html.includes('Original AI-assisted editorial'),
    `Editorial provenance shown for ${slug}`,
  );
}
const favicon = await readFile('dist/favicon.png');
assert.equal(favicon.subarray(1, 4).toString(), 'PNG');
assert.equal(favicon.readUInt32BE(16), 96);
assert.equal(favicon.readUInt32BE(20), 96);
assert.equal(structured.datePublished, '2026-09-14T00:00:00.000Z');
assert.ok(structured.dateModified && structured.author && structured.keywords);
assert.ok(
  (await readFile('dist/rss.xml', 'utf8')).includes(
    'the-cost-of-repeated-context',
  ),
);
assert.ok(
  (await readFile('dist/sitemap-0.xml', 'utf8')).includes(
    'https://codecoffeebreak.com/articles/the-cost-of-repeated-context',
  ),
);
console.log(
  `Verified ${pages.length} static pages, ${checkedLinks} local links/assets, draft exclusion, RSS, sitemap, and Article JSON-LD.`,
);
