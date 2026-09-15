---
title: 'When a cache expires, everyone asks at once'
description: 'A cache miss can become a crowd. Walk through one expired key and the difference between storing a result and sharing work.'
publishedAt: 2026-09-14
topics: [Architecture, Performance]
type: quick-break
draft: false
author: Code Coffee Break
authorKind: Organization
editorialNote: 'Original AI-assisted editorial. Request counts and timings below are illustrative.'
---

Imagine a page with a cached list of popular books. Reading the cache is cheap. Rebuilding the list takes a database query and a little sorting.

The cache entry expires. Ten requests arrive before the first rebuild finishes.

Each request looks in the cache, sees nothing, and starts the same work. The cache was meant to reduce database traffic, but its expiration has briefly concentrated it.

## Walk through one key

This fictional example has a 200 ms rebuild. All ten requests arrive within that interval.

```text
Request A    miss -> rebuild ----------------> save result
Request B    miss -> rebuild ----------------> save result
Request C    miss -> rebuild ----------------> save result
...seven more requests start before A finishes
```

Ten requests do not always imply ten rebuilds. The important condition is that they all miss before a usable result becomes available, and that nothing coordinates the refresh.

## Share the work in progress

A request coalescer gives concurrent callers for one key the same work to wait for.

```text
Request A    miss -> start rebuild ----------> result
Request B    miss -> wait for A -------------> same result
Request C    miss -> wait for A -------------> same result
```

The coalescer remembers unfinished work. The cache remembers completed data. Those are different jobs.

In Go, [singleflight](https://pkg.go.dev/golang.org/x/sync/singleflight) supplies duplicate-call suppression for a key. It does not supply cache storage, expiration, or coordination across application processes.

For a cache design, the sequence might be:

```text
Read cache.
If fresh, return it.
Otherwise join the refresh for this key.
Inside the refresh, check the cache again.
If another refresh already filled it, return that value.
Otherwise load and store the new result.
```

The second check matters when a caller observed a miss before an earlier refresh completed, but joins after that refresh has left the group. It avoids rebuilding data that is now available.

## Decide what waiting means

Sharing a refresh creates a shared dependency. If the refresh fails, its waiting callers need a failure result too. The work-in-progress entry must be cleared so the next attempt can run. The underlying load also needs a bounded lifetime.

Cancellation needs care. If the refresh uses the first caller's cancellation signal, that caller leaving can interrupt work that other callers still want. Decide separately how long the shared work may run and how long each caller will wait.

With four application instances, a process-local coalescer can still allow four refreshes. That may be acceptable. Cross-instance coordination adds another failure mode and should answer a measured need.

## Jitter solves a different problem

Randomizing expiration times can spread refreshes for many keys over time. It does not make ten concurrent misses for the same expired key share one refresh.

Serving a slightly stale value during refresh is another choice. A book list might tolerate it; information requiring immediate freshness might not. Document the acceptable staleness before using that shortcut.

## A small check for later

Look at the most expensive cache miss in your application. Ask what happens if ten callers encounter it together. You may only need a simple per-key refresh group and a clear failure policy.
