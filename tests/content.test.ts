import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(
  new URL('../scripts/content.mjs', import.meta.url),
);

function run(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('creates an unpublished article with the supplied title and a UTC publication date', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ccbreak-content-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const before = new Date().toISOString().slice(0, 10);
  const result = run(root, 'article', 'Café "cache"\nwarmer');
  const after = new Date().toISOString().slice(0, 10);
  assert.equal(result.status, 0, result.stderr);
  const article = await readFile(
    join(root, 'src/content/articles/cafe-cache-warmer.md'),
    'utf8',
  );
  assert.match(article, /title: "Café \\"cache\\"\\nwarmer"/);
  assert.match(article, /^description: ""$/m);
  const publishedAt = article.match(/^publishedAt: (.+)$/m)?.[1];
  assert.ok(publishedAt === before || publishedAt === after);
  assert.match(article, /author: "Code Coffee Break"/);
  assert.match(article, /topics: \[Architecture\]/);
  assert.match(article, /type: field-note\ndraft: true/);
});

test('refuses to replace an existing file after a slug collision', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ccbreak-content-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  assert.equal(run(root, 'article', 'Cache warmer').status, 0);
  const path = join(root, 'src/content/articles/cache-warmer.md');
  await writeFile(path, 'Author-owned contents\n');
  const result = run(root, 'article', 'Cache / warmer');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /already exists/);
  assert.equal(await readFile(path, 'utf8'), 'Author-owned contents\n');
});

test('normalizes hostile titles into filenames inside the requested collection', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ccbreak-content-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const result = run(root, 'project', '../../escape');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readdir(root), ['src']);
  assert.deepEqual(await readdir(join(root, 'src/content/projects')), [
    'escape.md',
  ]);
  const project = await readFile(
    join(root, 'src/content/projects/escape.md'),
    'utf8',
  );
  assert.match(project, /topics: \[Developer Tools\]/);
  assert.match(
    project,
    /technologies: \[\]\nstatus: Experiment\narticles: \[\]\ndraft: true/,
  );
  assert.doesNotMatch(project, /^github:/m);
});

test('creates a private idea note with questions and no invented results', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ccbreak-content-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const result = run(root, 'note', 'Context costs');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readdir(root), ['notes']);
  const note = await readFile(
    join(root, 'notes/ideas/context-costs.md'),
    'utf8',
  );
  assert.match(note, /^# Context costs\n/);
  assert.match(note, /What would you like to investigate\?/);
  assert.match(note, /public or synthetic examples/);
  assert.doesNotMatch(note, /publishedAt|draft:|\d+%|results show|I found/i);
});

test('rejects invalid commands and empty filenames without writing files', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ccbreak-content-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const args of [
    [],
    ['publish', 'Title'],
    ['article'],
    ['article', '  '],
    ['article', '../../'],
    ['article', 'One', 'Two'],
  ]) {
    const result = run(root, ...args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.notEqual(result.stderr.trim(), '');
  }
  assert.deepEqual(await readdir(root), []);
  const help = run(root, '--help');
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /node scripts\/content.mjs article "Title"/);
  assert.deepEqual(await readdir(root), []);
});
