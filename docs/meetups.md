# Meetup publishing

## Plan

1. Keep meetup records separate from blog articles.
2. Store each gathering in `src/content/meetups/<stable-id>.md`.
3. Publish the plan before the event and update the same URL afterward.
4. Review GitHub submissions before adding recap links or projects.
5. Verify production excludes drafts and preserves existing blog behavior.

## Event states

`planning` requires a title, description, and topics. No date or venue is invented.

`scheduled` also requires a quoted ISO timestamp with timezone offset in `startsAt`, and a `venue`. An optional HTTPS `rsvp` URL enables registration. Use Phoenix local time, for example `"2027-01-15T18:00:00-07:00"`. This is a format example, not a scheduled event.

`completed` requires the same date and venue plus a nonempty `recap` summary. Replace the Markdown plan with the actual discussion notes. Optional `links` contain `title` and `url`.

Completed events may include `projects`. Each requires `name`, `description`, `creator`, and `permissionToPublish: true`. Optional fields are `creatorUrl`, `github`, `demo`, and `image` with `src` under `/images/` and descriptive `alt` text. Do not record permission until the creator has actually granted it. Keep the issue as the review record.

Dates display in Phoenix time. The stable filename keeps submission links intact when a date changes. Set `draft: true` to preview locally without including the event in the production archive or sitemap.

## Enable submissions

The repository is public with issues enabled. The form is `.github/ISSUE_TEMPLATE/meetup-submission.yml`.

1. Merge or push the form to the default branch, `main`.
2. Open GitHub's new-issue page and verify the form is available.
3. Set `meetupSubmissionsEnabled` to `true` in `src/config/site.ts`.
4. Rebuild and deploy. Each event page links to the form with its meetup URL and any confirmed date prefilled.

The website keeps the button hidden until activation. No form responses are automatically published. A GitHub account is required, and submissions are public. Never request private customer data or contact information.

## Review a submission

Check the meetup URL and date. Confirm permission, inspect links, and verify creator credit. Add accepted material to that meetup's Markdown file, not the blog. Preserve attribution and avoid claims that have not been verified. Build and deploy the reviewed change.

## Verification

Run `pnpm verify`. For local preview run `pnpm dev` and visit `/meetups/`. Check the archive, event detail page, and a draft event. No event-schema search markup is emitted for unconfirmed events.
