---
title: 'Your context window has a running tab'
description: 'A small calculator, a transparent example, and a useful way to think about repeated context in AI coding workflows.'
publishedAt: 2026-09-14
topics: [AI Engineering, Developer Tools, Architecture]
type: quick-break
featured: false
draft: false
author: Code Coffee Break
authorKind: Organization
editorialNote: 'AI-assisted editorial. The numbers are illustrative; this article explains the site calculator.'
---

A repository can fit in a context window and still be expensive to send repeatedly. The interesting number isn't only the size of a prompt. It's how often that prompt travels with another call.

This is a **calculator explainer, not a report of a production benchmark**. The numbers below are illustrative. Use the [AI Context Cost Calculator](/tools/ai-context-calculator) to substitute your own workload and rates.

## One task, several calls

Imagine a task that makes five model calls. Every call includes a 2,000-token system prompt, 3,000 tokens of task input, and some repository context. Each produces 2,000 output tokens.

With 80,000 tokens of repository context, the input total is:

```text
(2,000 + 80,000 + 3,000) × 5 = 425,000 input tokens
2,000 × 5 = 10,000 output tokens
```

At illustrative rates of $3 per million input tokens and $15 per million output tokens, that task costs $1.425. Twenty tasks a day for thirty days works out to $855.

Change the repository context to 8,000 tokens, keeping everything else fixed, and input drops to 65,000 tokens per task. The task now costs $0.345, or $207 over the same month. The difference is $648 in this example. It comes entirely from the changed context assumption.

## What the comparison tells you

The calculator holds output size, task input, and call count fixed. That makes the context difference easy to see. It does **not** establish that the smaller prompt solves the task equally well.

A carefully selected file set may omit an important interface or test. A larger set may contain irrelevant generated code. Cost is one dimension of the decision; correctness and the time needed to recover from a bad edit matter too.

To compare approaches on real work, start with a repeatable task and a clear success check. Record the context provided, calls made, actual usage, and whether the resulting change passed that check. Run each approach against the same starting point. Otherwise you're comparing different problems.

## What this estimate leaves out

This tool assumes every call resends the same input and uses ordinary input/output rates. Provider prompt caching, different rates by model, growing conversation history, tool results, reasoning tokens, retries, and subscription billing can change the actual bill.

Some systems cache repeated prefixes. Others send additional context after a tool call. Some usage is covered by an account plan rather than priced directly at these rates. Check the usage records from your actual provider before using an estimate as a budget.

The calculator deliberately asks for prices instead of keeping a model-price catalog that could quietly become stale. Enter the rates that apply to the model and account you're using.

## The takeaway

Count repeated context across calls, not only within one prompt. Start with enough context to explain the relevant contracts. Expand when the task shows that something is missing. Compare quality alongside cost, and treat a transparent estimate as a starting point for measurement.

## Source

The arithmetic is implemented in this site's browser-only calculator. All example prices and workload values are illustrative; no provider pricing claim or firsthand benchmark is made.
