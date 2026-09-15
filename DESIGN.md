---
name: Code Coffee Break
description: A quiet developer reading room in cream and espresso.
colors:
  bg: "#f8f3e9"
  paper: "#eee6d9"
  raised: "#fffaf1"
  ink: "#302820"
  muted: "#726253"
  accent: "#8a4c30"
  accent-soft: "#ead9c2"
  line: "#ded2c2"
  code: "#eee6d9"
  dark-bg: "#211d19"
  dark-paper: "#29231e"
  dark-raised: "#302820"
  dark-ink: "#f3e8d7"
  dark-muted: "#b9a997"
  dark-accent: "#ddb18b"
  dark-accent-soft: "#493627"
  dark-line: "#493d31"
  dark-code: "#29231e"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "15px"
    lineHeight: 1.7
  reading:
    fontFamily: "Geist, sans-serif"
    fontSize: "16px"
    lineHeight: 1.9
rounded:
  inline-code: "3px"
  icon-button: "6px"
  code-block: "7px"
---

# Design System: Code Coffee Break

## Overview

Code Coffee Break is a quiet developer reading room. Warm cream in daylight and espresso at night frame short software lessons, browser-local tools, and an invitation to future contributors. Editorial rows and readable text carry the page. A hand-painted sage mug and slow steam establish the coffee atmosphere.

This document describes the built source, not an approved visual comp. The independent fresh review disposition is ship, with no material findings. Review captures are `.impeccable/review/cafe-desktop.png`, `.impeccable/review/cafe-light.png`, and `.impeccable/review/cafe-mobile.png`. This does not establish completion of historical formal `.impeccable/build` comp state.

## Colors

The frontmatter records the CSS palette in `src/styles/global.css`. Unprefixed tokens are the light theme; `dark-` tokens replace their counterparts under `data-theme='dark'`.

Use `bg` for the page, `ink` for primary text, and `muted` for descriptions and metadata. `accent` is warm coffee brown in light mode and milky caramel in dark mode. It marks links, content types, focus, and the coffee illustration. `paper`, `raised`, and `code` provide tonal containers. `line` separates editorial sections. The hero mug has its own painted sage ceramic palette. Theme selection starts with system preference and stores an explicit choice locally under `ccb-theme`.

## Typography

Geist is self-hosted through `/fonts/geist-regular.ttf` and `/fonts/geist-semibold.ttf`, with `font-display: swap`. Display and body text share the same sans-serif family. Code uses monospace rendering.

The desktop home heading uses the display tokens above. At 640px and below it becomes `2rem`. The lead article title is `1.8rem` with `1.22` line height; editorial row titles are `1.35rem`. Body text is `15px`; article prose is `16px`, `1.9` line height, and at most `70ch`. Mobile prose becomes `15px`. Small metadata and navigation support the hierarchy without competing with titles.

## Layout

The centered wrapper is `min(1080px, calc(100% - 80px))`. At 640px and below, horizontal gutters become 18px. At 740px and below, the header moves navigation onto its own row.

The home introduction pairs copy with a 220px coffee column and a 50px gap. Mobile keeps a compact 100px coffee column beside the copy. The publication grid pairs reading content with a 260px topic sidebar and a 42px gap. At 900px the sidebar becomes 230px; at 700px it moves below the content with a top rule.

Article lists use horizontal rules and 23px vertical row padding. Rows without thumbnails occupy one column. The home page places Fresh reads before Something to try, then the coffee-break question and RSS invitation. Preserve article reading measure and compact list rhythm when adding screens.

## Elevation & Depth

The reading room is flat. Background tones, one-pixel rules, and spacing distinguish sections. Editorial lists and the sidebar do not need card shadows or floating panels. Keyboard focus uses a two-pixel accent outline with a four-pixel offset.

## Shapes

Editorial rows remain open and rectangular. Small control and code radii are recorded above. The signature mark is a hand-painted sage ceramic mug with steam on warm paper, generated through the built-in image tool to match the requested lo-fi Studio Ghibli-inspired mood. `CoffeeMark.astro` uses the 96px `/favicon.png`; the Apple icon is 180px. The hero uses `/images/cafe-mug.png`, a transparent version of the same painting, with separate animated steam. Original sources and exact prompts are in `docs/brand/`. The rejected SVG is retired outside the public build.

## Components

Navigation uses muted text, an accent underline for `aria-current`, and palette-based hover and focus. Text links pair short labels with small arrow icons. Theme and RSS controls use compact icon buttons. Prose links are underlined.

Article rows show content type, reading time, title, description, byline/date, and topic links. The article header renders `editorialNote` as visible disclosure. Article data distinguishes `authorKind: 'Person' | 'Organization'`; `BaseLayout.astro` uses that value for structured authorship. Editorial organization attribution must not impersonate a contributor. The publication's own architecture page may explain the site and calculator without promoting personal projects.

The coffee steam starts still without JavaScript. With JavaScript it runs only while the cup is visible, the document is visible, reduced motion is off, and the reader has not paused it. The control switches between Pause steam and Play steam, exposes its pressed state, and becomes disabled with Motion reduced under reduced-motion preference. Three paths drift on staggered 7s, 8s, and 6.5s loops. Reduced motion also removes interface transitions; arrow hover movement is one pixel when motion is allowed.

Tools use real local inputs and numeric results. The contribution guide states that submissions are not yet open. The RSS invitation provides a working feed rather than a simulated signup form.

## Do's and Don'ts

- Do keep the cream/espresso palette and self-hosted Geist consistent across reading, topics, tools, and informational pages.
- Do use rules, restrained metadata, and whitespace to organize editorial content.
- Do retain visible AI assistance disclosures, fictional example framing, and primary-source links.
- Do preserve skip navigation, semantic landmarks, visible focus, theme choice, and all steam pause conditions.
- Don't add personal biography or personal project promotion to the publication.
- Don't invent production incidents, benchmarks, contributors, community membership, or submission destinations.
- Do preserve the requested painted coffee mood. Keep article imagery focused on evidence. Don't introduce audio, chat, accounts, or commerce without a product decision.
- Don't treat review screenshots as an approved comp or rewrite historical workflow state to imply one exists.
