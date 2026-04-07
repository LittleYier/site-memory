export const INDEX_FILE = 'INDEX.md';
export const INDEX_LINE_LIMIT = 180;
export const INDEX_BYTE_LIMIT = 20_000;
export const SURFACE_LINE_LIMIT = 150;
export const SURFACE_BYTE_LIMIT = 4_096;
export const HEADER_SCAN_LINE_LIMIT = 25;
export const MANIFEST_FILE_LIMIT = 120;
export const NOTE_TYPES = ['operator', 'guidance', 'context', 'reference'];

export const NOTE_FRONTMATTER_EXAMPLE = `\`\`\`markdown
---
name: {{short note name}}
summary: {{one-line reason this note should be loaded for a future task}}
kind: {{operator, guidance, context, reference}}
---

{{reusable note body}}
\`\`\``;

export const NOTE_TYPE_GUIDE = `## Memory categories

This runtime uses four note lanes. Pick the lane that best predicts future reuse.

<lanes>
<lane>
  <name>operator</name>
  <fit>Stable collaboration preferences and working habits of the person driving the browser task.</fit>
  <capture>Save when you learn constraints that should change how the agent navigates, explains, or pauses for confirmation.</capture>
  <apply>Use when the task depends on the person's preferred pace, tolerance for automation, or review checkpoints.</apply>
  <example>
  operator: Pause before submitting forms that trigger emails or purchases.
  note: This operator wants a quick confirmation checkpoint before irreversible browser actions.
  </example>
</lane>
<lane>
  <name>guidance</name>
  <fit>Reusable operating rules, tactics, and warnings that can steer future visits.</fit>
  <capture>Save when a rule, workaround, or warning is likely to matter again. Include what makes the rule necessary.</capture>
  <apply>Use when deciding how to approach a site, what to avoid, or which shortcut to trust first.</apply>
  <format>State the rule, then add **Why:** and **How to apply:** so future runs can judge scope and edge cases.</format>
  <example>
  operator: On this vendor portal, typing into the search box works, but the icon beside it does nothing.
  note: Use Enter to submit search on the vendor portal. Why: the icon is decorative. How to apply: prefer keyboard submit unless the explicit form button is visible.
  </example>
</lane>
<lane>
  <name>context</name>
  <fit>Durable surrounding facts about the work that are not obvious from the live page or repo alone.</fit>
  <capture>Save when deadlines, handoff rules, stakeholders, or task priorities should influence future browsing work.</capture>
  <apply>Use when the browser task needs surrounding business context to make better tradeoffs.</apply>
  <format>State the durable fact, then add **Why:** and **How to apply:** so the note stays interpretable later.</format>
  <example>
  operator: We only need enough listings for tomorrow's client review, not a perfect archive.
  note: Listing collection for the April 6, 2026 review favors speed over completeness. Why: a client-ready sample matters more than exhaustive coverage. How to apply: stop once the requested sample size is reached.
  </example>
</lane>
<lane>
  <name>reference</name>
  <fit>Durable site facts such as selectors, URL patterns, page layouts, and successful navigation routes.</fit>
  <capture>Save when you discover a stable page entry point, extraction path, or interaction pattern that should reduce exploration next time.</capture>
  <apply>Use when you need the fastest likely route through a known site.</apply>
  <example>
  note: Reports on example-portal.com open directly at /admin/reports, and export buttons live under .report-toolbar.
  </example>
</lane>
</lanes>`;

export const DO_NOT_SAVE = `## What not to store

- Raw page copies, long DOM dumps, or screenshots recreated as text.
- One-off answers, current search results, or outputs that will expire before the next useful revisit.
- Secrets, cookies, session tokens, personal data, or anything that should not be written to disk.
- Temporary UI state such as a banner that only existed today, a once-off alert, or the exact order of one ad-hoc click sequence unless the pattern itself matters.
- Repo facts, source-code structure, or git history that can be checked directly from the workspace.
- Session-by-session logs that do not reveal a reusable shortcut, warning, or durable fact.

If someone asks you to "save everything," extract the repeatable lesson instead of copying the full transcript or page state.`;

export const WHEN_TO_RECALL = `## When to check memory

- Check memory before browsing a site or flow that may have been seen before.
- You MUST check memory when the operator asks what worked last time, asks you to remember something, or explicitly refers to prior runs.
- If the operator says to ignore memory or start fresh, act as if no notes exist and do not mention remembered content.
- Treat stored notes as leads. If the live page disagrees with a note, trust the live page and repair the note later.`;

export const VERIFY_BEFORE_USE = `## Verify before relying on a note

Stored notes can drift as sites change.

Before depending on a recalled detail:

- Re-test selectors, button text, and URL shortcuts against the live page.
- Reconfirm auth assumptions, modal behavior, and pagination patterns.
- If the note describes a shortcut or "safe" path, verify the exact step that matters for the current task.
- If the operator is about to act on the result, do the live check now.

A note is evidence from an earlier visit, not proof about the current page.

When a note and the current page disagree, prefer the current page and queue a note update after the task.`;

function saveInstructions(skipIndex) {
  if (skipIndex) {
    return `## How to write notes

Create or revise one topic file per reusable lesson using this frontmatter:

${NOTE_FRONTMATTER_EXAMPLE}

- Keep the name, summary, and kind aligned with the body.
- Organize by durable topic, not by session date.
- Prefer revising an existing file over creating a near-copy.
- Remove or repair notes that have gone stale.`;
  }

  return `## How to write notes

Keep notes organized by durable topic, not by session.

Step 1: create or revise a topic file using this frontmatter:

${NOTE_FRONTMATTER_EXAMPLE}

Step 2: keep a one-line pointer in \`${INDEX_FILE}\` for that topic file.

\`${INDEX_FILE}\` is only an index. Do not place full note bodies inside it.

- Keep index entries short and skimmable.
- Prefer revising an existing file over creating a near-copy.
- Remove or repair notes that have gone stale.`;
}

export function buildMemoryPolicy({
  runtimeRoot,
  indexContent,
  skipIndex = false,
}) {
  const indexSection = indexContent && indexContent.trim().length > 0
    ? `## ${INDEX_FILE}\n\n${indexContent.trim()}`
    : `## ${INDEX_FILE}\n\nThe index is currently empty. New durable notes will appear here after they are written.`;

  return `# Persistent Browser Memory

You have a reusable note directory at \`${runtimeRoot}\`.

Use it as a two-part loop for repeated browser work:

- look up a few strong leads before exploring
- write back durable findings after the task

${NOTE_TYPE_GUIDE}

${DO_NOT_SAVE}

${saveInstructions(skipIndex)}

${WHEN_TO_RECALL}

${VERIFY_BEFORE_USE}

${indexSection}`;
}

export const RECALL_SELECTOR_SYSTEM = `You are choosing which saved notes are worth loading before a browser task begins.

Inputs:
- the current browser task
- a manifest of note files with filenames and summaries

Return up to 5 filenames that are most likely to reduce exploration time.

Selection rules:
- Prefer notes that offer a route, selector, warning, or operator preference directly relevant to the task.
- If a file is only a weak match, leave it out.
- Returning an empty list is valid when nothing is clearly useful.
- If a list of recently used tools is provided, avoid generic tool primers for tools already in active use. Do include warnings or edge cases if the task could trip over them.`;

function distillOpener(messageCount, manifest, tools) {
  const manifestBlock = manifest && manifest.trim().length > 0
    ? `## Notes already on disk\n\n${manifest}\n\nReview this list first. Update an existing file when the topic overlaps instead of creating a near-duplicate.\n\n`
    : '';

  return `${manifestBlock}You are running the after-task note refresh pass. Your source material is the last ~${messageCount} messages of conversation above — do not inspect repo files, run git commands, or look elsewhere.

Decide what reusable browser knowledge should be added, revised, or left alone.

Constraints:
- Writes are limited to paths inside the memory root.
- All other tools, including write-capable ${tools.shell}, MCP tools, and agent spawning, will be denied.

Available tools: ${tools.read}, ${tools.search}, ${tools.list}, read-only ${tools.shell}, and ${tools.edit}/${tools.write}.

Turn budget is limited. ${tools.edit} requires a prior ${tools.read}, so batch reads first, then batch writes.`;
}

export function buildDistillGuide({
  messageCount,
  manifest,
  skipIndex = false,
  tools = {
    read: 'Read',
    search: 'Search',
    list: 'List',
    shell: 'Shell',
    edit: 'Edit',
    write: 'Write',
  },
}) {
  return `${distillOpener(messageCount, manifest, tools)}

${NOTE_TYPE_GUIDE}

${DO_NOT_SAVE}

${saveInstructions(skipIndex)}

When in doubt:
- keep fewer, stronger notes
- write the smallest note that still saves time later
- avoid raw transcript fragments
- record the usage limits of brittle details`;
}
