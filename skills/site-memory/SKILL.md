---
name: site-memory
description: |
  Persistent memory for repeated browser work. Use when an agent revisits the
  same sites or flows and should load a few relevant notes up front, then save
  durable site knowledge after the task finishes.
---

# site-memory

This skill adds a reusable note loop to browser automation.

Its job is intentionally narrow:

- load a small number of high-value notes before acting
- write back reusable lessons after the task completes

It does not define business schemas. It does not own the browser driver.
Pair it with whatever browser control tool you already trust.

## Runtime location

Memory is global and shared across all projects. Notes about a website learned
in one project are automatically available in every other project.

The default location is `~/.site-memory/`. Override with `SITE_MEMORY_HOME` or
`--runtime-base <path>`.

Resolve it with:

```bash
node ./scripts/resolve-runtime-root.mjs
```

Initialize it with:

```bash
node ./scripts/init-memory-root.mjs
```

## Memory shape

The runtime root contains:

- `INDEX.md` as a compact index
- topic files with frontmatter and reusable details

Supported note kinds:

- `operator`
- `guidance`
- `context`
- `reference`

Use them this way:

- `operator`: collaboration preferences, pause points, tolerance for automation
- `guidance`: reusable rules, warnings, and tactics
- `context`: surrounding deadlines or constraints that matter across runs
- `reference`: stable selectors, URL patterns, routes, and site structure

## Lookup workflow

1. Build the lookup inputs:

```bash
node ./scripts/build-recall-input.mjs --task "<current task>"
```

2. Use the generated selector prompt to choose only the notes that are likely
to save real exploration time.

3. Open only the chosen files:

```bash
node ./scripts/read-recalled-files.mjs --files "reference/foo.md,guidance/bar.md"
```

4. Treat recalled notes as leads, not ground truth. Re-check selectors, button
labels, URLs, and flows against the live page before relying on them.

## Capture workflow

After the browser task ends, build the write-back prompt:

```bash
node ./scripts/build-distill-input.mjs --message-count <n>
```

The output contains a `prompt` field. You MUST execute that prompt as an
after-action pass. This pass can:

- read memory files
- search memory files
- update files only inside the memory root

That pass should:

- update an existing topic file when possible
- create a new topic file only when the lesson is genuinely new
- keep `INDEX.md` short
- avoid storing one-off outputs, secrets, or temporary task state

## Design rules

- Keep notes generic and reusable.
- Save only information that should make a future visit cheaper or safer.
- Prefer revising topic notes over appending session logs.
- Load only a few notes per task; too much memory becomes noise.
- If a remembered selector or route may be stale, verify it before use.

## Browser automation

A CDP-based browser control skill is bundled at `./vendor/chrome-cdp-skill/`.
Read its instructions before first use:

```bash
cat ./vendor/chrome-cdp-skill/skills/chrome-cdp/SKILL.md
```

Use `node ./scripts/cdp-proxy.mjs <command> [args]` for browser interaction.

### Commands

All commands use `./scripts/cdp-proxy.mjs`. The `<target>` is a unique
targetId prefix from `list`.

```text
list                              List open pages
shot <target> [file]              Viewport screenshot
snap <target>                     Accessibility tree snapshot
nav  <target> <url>               Navigate and wait for load
click <target> <selector>         Click by CSS selector
clickxy <target> <x> <y>          Click at CSS pixel coordinates
type <target> <text>              Type text at current focus
eval <target> <expr>              Evaluate JavaScript
html <target> [selector]          Full page or element HTML
open [url]                        Open new tab
```

### Coordinates

`shot` saves at native resolution: image pixels = CSS pixels x DPR.
CDP input events use CSS pixels: `CSS px = screenshot px / DPR`.

### Tips

- Prefer `snap --compact` over `html` for page structure
- Use `type` (not eval) to enter text in cross-origin iframes
- Chrome shows an "Allow debugging" modal once per tab on first access

## Browser task workflow

For repeated browser work, follow these phases in order:

### 1. Prepare the runtime

```bash
node ./scripts/init-memory-root.mjs
```

### 2. Load likely-helpful notes

```bash
node ./scripts/build-recall-input.mjs --task "<url> <objective>"
```

Read the manifest from the output, choose the strongest matches, then open only
those notes:

```bash
node ./scripts/read-recalled-files.mjs --files "file1.md,file2.md"
```

### 3. Browse and verify

Use the browser tool to accomplish the objective. If notes mention selectors or
routes, verify them on the live page before depending on them.

### 4. Capture durable findings

After the task, save only the parts that should help a future visit. For site
knowledge, a `reference` note often benefits from a body structure like:

```markdown
## What this site is
## How the site works
## Verified selectors
## Pitfalls
## Successful paths
```

Update `INDEX.md` after writing. If the task produced no durable lesson, skip
the write-back.
