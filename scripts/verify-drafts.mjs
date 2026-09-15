import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:4321';
for (const path of ['/articles/', '/articles/welcome-draft/']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `${path} loads in development`);
  const html = await response.text();
  assert.ok(html.includes('Welcome to Code Coffee Break'), `${path} shows the draft`);
  assert.ok(html.includes('Local preview mode'), `${path} shows preview mode`);
  assert.match(html, /name="robots" content="noindex"/);
  assert.ok(html.includes('Draft'), `${path} labels the draft`);
}
const feed = await fetch(new URL('/rss.xml', base));
assert.equal(feed.status, 200);
assert.ok(!(await feed.text()).includes('welcome-draft'), 'Development RSS excludes drafts');
console.log('Verified local draft listing, article, preview labels, noindex, and published-only RSS.');
