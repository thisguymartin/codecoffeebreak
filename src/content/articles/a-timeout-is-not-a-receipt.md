---
title: 'A timeout is not a receipt'
description: 'The client stopped waiting. The server might still have finished. A small example of the awkward space between those two facts.'
publishedAt: 2026-09-14
topics: [Architecture, Web Development]
type: quick-break
featured: true
draft: false
author: Code Coffee Break
authorKind: Organization
editorialNote: 'Original AI-assisted editorial. This is a fictional example, not a production incident.'
---

Consider a small application that creates a printable poster. You press **Make poster**. The request takes too long, and the page shows a timeout.

You press the button again.

Later, two posters appear in your account. The first request worked; its response never reached the browser in time. The second request created another poster.

That is the awkward part of a timeout after a request has been sent. It tells you that a response did not arrive within the allowed wait. It may leave the operation's outcome unknown. A failure known to happen before sending is a different case.

## The missing response

Here is a fictional sequence. The times only explain the order.

```text
0 ms     Browser sends create-poster request.
140 ms   Server saves poster A.
500 ms   Browser gives up waiting for the response.
700 ms   Browser sends another create-poster request.
840 ms   Server saves poster B.
```

Changing the wait to five seconds might make this particular example disappear. It does not define what a retry means when a response gets lost.

The application needs a way to distinguish another attempt at the same action from an intentionally new action.

## Give the action an identity

One possible API design gives each intended poster creation an operation key. The client creates the key once and keeps it for retries of that action.

```text
First attempt     operation = poster-request-17
Retry             operation = poster-request-17
Another poster    operation = poster-request-18
```

The server recognizes the repeated key and returns the existing outcome, rather than creating another poster. The [AWS Builders' Library explanation of idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) describes this explicit caller-provided identity and its tradeoffs.

A header by itself does nothing. The server must implement the contract.

For this hypothetical poster service, that contract could say:

- Keys belong to an authenticated account.
- The key and poster creation are recorded atomically.
- A repeated key with the same input refers to the original poster.
- A repeated key with different input is rejected.
- An unfinished operation returns an explicit pending state.
- The retention period is documented so clients know how long retry protection lasts.

These are proposed design choices, not a universal API standard. External side effects and work across several services need additional coordination.

## Let the interface admit uncertainty

After an ambiguous timeout, **Could not confirm creation** is more accurate than **Creation failed**.

The page can check the operation status or offer a retry that preserves the original key. Disabling the button while waiting helps prevent accidental clicks, but it cannot handle a refresh, another tab, or a lost response by itself.

Cancellation is also a separate question. Stopping the browser's wait does not establish that the server rolled back its write.

## Try this in your own code

Find a button that starts a write. Imagine the write succeeds and the response disappears. What would the user see? What would a retry do?

That small thought experiment often reveals an API decision hidden inside an error message.
