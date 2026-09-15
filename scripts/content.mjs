import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const help = `Create an unpublished article, project, or private idea note.

Usage:
  node scripts/content.mjs article "Title"
  node scripts/content.mjs project "Title"
  node scripts/content.mjs note "Title"
  node scripts/content.mjs --help

Articles and projects start with draft: true. Fill in the description and
replace the writing prompts before publishing. Existing files are never replaced.
`;

const templates = {
  article: {
    directory: ['src', 'content', 'articles'],
    render: (title) => `---
title: ${JSON.stringify(title)}
description: ""
publishedAt: ${new Date().toISOString().slice(0, 10)}
author: "Code Coffee Break"
authorKind: Organization
topics: [Architecture]
type: field-note
draft: true
---

## The problem

Describe the problem you encountered and who it affects.

## The example

Use a public or fictional example. Label any invented data.

## What it shows

Explain the behavior. Link sources for external claims. Disclose AI assistance when used.

## Try it yourself

Explain the tradeoffs and what you would try next.
`,
  },
  project: {
    directory: ['src', 'content', 'projects'],
    render: (title) => `---
title: ${JSON.stringify(title)}
description: ""
topics: [Developer Tools]
technologies: []
status: Experiment
articles: []
draft: true
---

## The problem

Describe the need this project addresses.

## Current state

Explain what works today and what still needs testing.

## Decisions

Record the architecture, constraints, and tradeoffs.

## Next step

Name the next useful improvement. Add a github field only when a public repository exists.
`,
  },
  note: {
    directory: ['notes', 'ideas'],
    render: (title) => `# ${title.replace(/\s+/g, ' ')}

## The question

What would you like to investigate?

## Evidence to collect

Which public or synthetic examples would help answer it?

## Possible article

What might be useful to share after the investigation?
`,
  },
};

function slugify(title) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/æ/gi, 'ae')
    .replace(/œ/gi, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '');
}

async function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    process.stdout.write(help);
    return;
  }

  const [kind, suppliedTitle] = args;
  if (args.length !== 2 || !Object.hasOwn(templates, kind ?? '')) {
    throw new Error(
      `Choose article, project, or note and provide one quoted title.\n\n${help}`,
    );
  }
  const title = suppliedTitle.trim();
  const slug = slugify(title);
  if (!slug)
    throw new Error(
      'The title must contain at least one letter or number that can form a filename.',
    );

  const template = templates[kind];
  const relativePath = join(...template.directory, `${slug}.md`);
  await mkdir(join(process.cwd(), ...template.directory), { recursive: true });
  try {
    await writeFile(join(process.cwd(), relativePath), template.render(title), {
      flag: 'wx',
    });
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        `${relativePath} already exists. Choose a different title or edit that file.`,
      );
    throw error;
  }
  process.stdout.write(`Created ${relativePath}\n`);
}

main(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
