---
title: 'Your CLI has two conversations'
description: 'One stream carries the result. The other explains what happened. A tiny Node.js example that stays useful when you pipe it.'
publishedAt: 2026-09-14
topics: [Developer Tools]
type: quick-break
draft: false
author: Code Coffee Break
authorKind: Organization
editorialNote: 'Original AI-assisted editorial. The example uses fictional data and can be run locally.'
---

A command can look fine in a terminal and become awkward in a script.

Consider a fictional utility that lists two saved snippets. It prints a friendly progress message, then JSON:

```text
Loaded 2 snippets.
[{"id":"a","title":"retry"},{"id":"b","title":"cache"}]
```

A person can read that. A JSON parser cannot parse the whole output as one JSON document.

The fix is a small contract. Put the result on standard output. Put diagnostics on standard error.

## A runnable example

Save this as `snippets.mjs`. It uses Node.js and has no package dependencies.

```js
const snippets = [
  { id: 'a', title: 'retry' },
  { id: 'b', title: 'cache' },
];

process.stdout.on('error', (error) => {
  process.stderr.write(`Could not write result: ${error.message}\n`);
  process.exitCode = 1;
});

process.stderr.write(`Loaded ${snippets.length} snippets.\n`);
process.stdout.write(`${JSON.stringify(snippets)}\n`);
```

[Node's process documentation](https://nodejs.org/api/process.html#processstdout) explains the stdout and stderr streams. Here, the stdout error listener reports a write failure and sets a nonzero exit status. Setting `exitCode` lets Node finish pending work rather than forcing an immediate exit that might truncate output.

This is a small teaching program, not a general streaming CLI. A large output needs a backpressure strategy. Some tools deliberately treat a downstream closed pipe as a normal outcome; this example treats any stdout error as a failure.

## Give it another program to talk to

Run:

```sh
node snippets.mjs | node --input-type=module -e '
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  console.log(JSON.parse(input).map(item => item.title).join(", "));
'
```

You will see the progress message and the parsed titles. Only the JSON travels through the pipe; the message still appears on the terminal through stderr.

To keep the result and diagnostics in separate files:

```sh
node snippets.mjs > snippets.json 2> snippets.log
```

`snippets.json` contains a JSON array. `snippets.log` contains the progress message. Neither contains both.

## Stderr does not mean failure

Warnings and progress messages can go to stderr during a successful run. The exit status is the separate signal for success or failure.

The reverse distinction matters too. Human-readable results can belong on stdout. A command does not have to produce JSON; it has to define what its output means.

If a script uses `2>&1`, it merges stderr into stdout. That can be useful for reading a combined log, but it breaks this command's single-JSON-document contract.

## A pleasant default

For a small utility, start with an output format that stays predictable when redirected. Keep optional decoration out of machine-readable results. If you add a human-oriented view later, make the choice explicit.

Then try your command both ways. Read it directly in the terminal, and send its result to another program. The second conversation usually reveals the rough edges.
