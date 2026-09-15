# Code Coffee Break

A relaxed developer reading room with original articles and small browser tools. Astro + TypeScript + Markdown + pnpm. Cloudflare Workers serves the static `dist/` directory.

## Local development

Use Node 24+ and pnpm.

```sh
pnpm install
pnpm dev
pnpm verify
```

Open [localhost](http://127.0.0.1:4321/). Verification checks Astro/TypeScript, calculator and content-command tests, generated links/assets, drafts, RSS, sitemap, and article metadata. Use `pnpm preview` to inspect the production build.

Run `pnpm format` after code edits, or `pnpm format:check` to check formatting. Astro templates and styles are formatted for straightforward editing.

## Writing workflow

```sh
pnpm note "What happens after a timeout?"
pnpm new:article "A small lesson about cache misses"
pnpm new:project "My next terminal tool"
```

Commands create Markdown and print the file path. Existing files are never replaced.

1. Capture questions in `notes/ideas/`. These notes are not served publicly.
2. Edit the generated article or project under `src/content/`.
3. Replace the prompts, fill in the description, and keep `draft: true` while writing.
4. Preview, set `draft: false`, and run `pnpm verify`.
5. Commit and deploy when ready.

Articles also need a nonfuture publication date. Draft and future-dated articles are excluded from routes, listings, RSS, and the sitemap. Empty topic archives do not invent articles.

```yaml
title: "A specific engineering lesson"
description: "What the reader will learn."
publishedAt: 2026-09-14
topics: [Architecture, Web Development]
type: field-note
draft: true
```

The default editorial author is Code Coffee Break with `authorKind: Organization`. Real contributors supply their name, `authorKind: Person`, and optionally `authorUrl`. AI-assisted editorial must include a visible `editorialNote`. Optional fields include `updatedAt` and `featured`. Types: `field-note`, `deep-dive`, `experiment`, `build-log`, `quick-break`. Reading time and code highlighting are generated at build time.

Projects use `technologies`, `status`, optional public `github`, and `order` (lower appears first). Statuses: `Active`, `Experiment`, `Public`, `Open Source`, `Archived`. Use Open Source only when the repository license supports that label.

The opening reads are original AI-assisted educational articles with fictional scenarios and primary references. Personal draft outlines and project summaries are archived in `docs/archived-personal/`, outside the published collections. The calculator article uses illustrative numbers.

## Editing map

| Change | Location |
| --- | --- |
| Editorial identity, navigation, default topics | `src/config/site.ts` |
| Homepage introduction | `src/pages/index.astro` |
| Publication purpose and editorial standards | `src/pages/about.astro` |
| Articles, projects, tool descriptions | `src/content/` |
| Colors, typography, spacing | `src/styles/global.css` |
| Navigation, metadata, footer | `src/layouts/BaseLayout.astro` |
| Calculator math and sample workload | `src/utils/calculator.ts` |
| Proposed domain/product direction | [docs/domain-direction.md](docs/domain-direction.md) |

If the domain changes, update `src/config/site.ts`, `astro.config.mjs`, and `public/robots.txt` together. Geist is self-hosted with its included SIL license. Earlier generated article illustrations are retired in `docs/retired-visuals/`. The new painted coffee brand asset was specifically requested; its source and prompts are in `docs/brand/`. Use real project screenshots, code, diagrams, or measurements when an article needs visual evidence.

## Recommended management

Markdown -> Git -> Cloudflare Workers Builds. Keep rough notes private, publish useful results when ready, and let RSS announce new writing. A hosted CMS or newsletter service adds administration this site does not currently need. Add either when the manual workflow becomes a specific problem.

There is no application server, database, account system, comments service, model API integration, or recurring price catalog. Calculator users enter their own rates. Optional analytics is disabled by default.

The hand-painted mug has separate slow SVG steam loops. Its component pauses on user request, reduced-motion preference, offscreen state, and hidden tabs. No animation library or audio stream is required. The favicon uses the same painted mug in 96px PNG and 180px Apple icon formats. Source paintings and exact built-in generation prompts are recorded in `docs/brand/`. Derived PNGs preserve the hero mug’s transparent alpha.

The contribution guide is at `/contribute`, with a downloadable Markdown template. Submissions are explicitly not open yet. Recommended next step: create the publication's Git repository and accept reviewed pull requests for articles. Keep author bylines, draft review, and image provenance in that workflow before adding a CMS or discussion platform.

## Calculator contract

Each call repeats system prompt + repository context + task input. Output is separate. Multiply by calls per task, tasks per day, and 30 days per month. Rates are USD per million tokens. Both scenarios share system prompt, task input, output, and call count.

The estimate excludes caching, conversation growth, tool results, reasoning tokens, retries, and subscription allowances. Smaller context does not guarantee equal answer quality. Inputs are neither uploaded nor stored.

## Deployment

`wrangler.jsonc` serves `dist/` directly with custom `404.html`. No Worker script or SSR adapter.

After authenticating your own Cloudflare account:

```sh
pnpm exec wrangler login
pnpm exec wrangler deploy --dry-run
pnpm deploy
```

For automatic publishing, put this project in a Git repository and connect Workers Builds. Build command: `pnpm build` (or `pnpm verify`). Deploy command: `pnpm exec wrangler deploy`. The asset directory is already configured. See [Cloudflare's build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Connect `codecoffeebreak.com` to that Worker in your own Cloudflare account. This session does not authenticate Cloudflare, alter DNS, or deploy publicly. The working directory currently has no Git repository or remote.

## Optional analytics

Set `PUBLIC_CF_ANALYTICS_TOKEN` in the build environment after obtaining your own Cloudflare Web Analytics token. Without it, no analytics script is included. The calculator never transmits inputs.

## Documentation checked

Implementation syntax checked against official Astro and Cloudflare docs through Context7. Workers Builds settings also verified against current official web documentation.

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro RSS](https://docs.astro.build/en/guides/rss/)
- [Astro on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
