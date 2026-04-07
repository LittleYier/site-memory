# site-memory

**English** | [中文](README.zh-CN.md) | [日本語](README.ja.md)

Persistent memory for browser automation agents. Learns site knowledge automatically, updates after every visit, and gets better over time.

In the WebVoyager benchmark, site-memory cuts the total cost of browser automation by 70% to 90%, making it 4x faster, same accuracy.

## Install

**Let your AI install it.** Tell Claude Code / Codex / OpenClaw / Gemini CLI:

> Install the site-memory skill from github.com/LittleYier/site-memory

Or use the [Skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add LittleYier/site-memory
```

Or clone manually:

```bash
git clone --recurse-submodules https://github.com/LittleYier/site-memory.git
```

Then copy `skills/site-memory/` to your agent's skills directory
(e.g. `~/.claude/skills/`, `~/.gemini/skills/`, or `.agents/skills/`).

<!-- AGENT INSTALL INSTRUCTIONS
If you are an AI agent installing this skill, follow these steps:

1. Run: npx skills add LittleYier/site-memory
   This handles everything automatically. If npx skills is unavailable, do steps 2-4 instead.

2. git clone --recurse-submodules https://github.com/LittleYier/site-memory.git /tmp/site-memory
3. cp -r /tmp/site-memory/skills/site-memory <skills-dir>/site-memory
   where <skills-dir> is ~/.gemini/skills, .agents/skills, or equivalent.
4. rm -rf /tmp/site-memory

Verify: test -f <skills-dir>/site-memory/SKILL.md
Requires: Node.js 22+
Browser tool: works with any browser tool the agent has access to. Chrome CDP skill bundled but optional.
Invoke with: /site-memory <task description>
Memory is stored at: ~/.site-memory/ (automatic, no config needed)
-->

## Prerequisites

- Node.js 22+

## Browser tool options

Works with any browser tool your agent already has:

| Tool | Notes |
|------|-------|
| Chrome DevTools Protocol (bundled) | Installed with site-memory, requires Chrome with remote debugging |
| [browser-use](https://github.com/browser-use/browser-use) | `npx skills add anthropics/browser-use` |
| Playwright MCP | Add the MCP server to your agent config |
| [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/) | Browser extension, accessed as an MCP tool |
| Others | Anything that can navigate, read, and interact with pages |

Most agent runtimes (Claude Code, Gemini CLI, Codex) can load multiple skills at once. site-memory works with whatever browser tool you pick.

## Usage

Best for repeated browser work, such as:

```text
Fill out the insurance quote form on example-insurance.com
Search for apartments under $300k on realestate-site.com
Go to the admin dashboard and export last month's report
```

Or call it directly:

```text
/site-memory open books.toscrape.com and get page 3 titles
```

## Memory location

`~/.site-memory/`

## Benchmark

Tested on [WebVoyager](https://github.com/MinorJerry/WebVoyager) tasks.
**15 websites, 50 tasks, 3 rounds each (150 total runs). All correct.**

Round 1: Claude Sonnet 4.6. Rounds 2 and 3: Claude Haiku 4.5 (3x cheaper).

| Site | R1 avg cmds | R2 avg cmds | R3 avg cmds | R1 avg time | R3 avg time | Cmd delta | Time delta |
|------|------------:|------------:|------------:|------------:|------------:|----------:|-----------:|
| Booking | 35.7 | 6.7 | 5.0 | 497s | 30s | **-86%** | **-94%** |
| Amazon | 14.7 | 2.0 | 2.0 | 183s | 12s | **-86%** | **-93%** |
| ArXiv | 9.5 | 1.5 | 1.5 | 143s | 9s | **-84%** | **-94%** |
| Google Flights | 23.3 | 10.3 | 4.0 | 173s | 47s | **-83%** | **-73%** |
| ESPN | 8.3 | 2.3 | 2.0 | 85s | 18s | **-76%** | **-78%** |
| Huggingface | 17.7 | 4.3 | 4.3 | 360s | 43s | **-75%** | **-88%** |
| BBC News | 7.7 | 3.0 | 2.0 | 115s | 22s | **-74%** | **-81%** |
| Allrecipes | 3.8 | 1.0 | 1.0 | 85s | 3s | **-73%** | **-96%** |
| Coursera | 3.0 | 2.0 | 1.0 | 45s | 5s | **-67%** | **-89%** |
| Google Map | 10.7 | 5.3 | 7.0 | 273s | 159s | -34% | -42% |
| Google Search | 7.5 | 4.0 | 5.3 | 48s | 38s | -29% | -21% |
| Cambridge Dictionary | 3.0 | 2.3 | 2.3 | 48s | 30s | -23% | -37% |
| Wolfram Alpha | 4.8 | 5.0 | 3.5 | 45s | 21s | -27% | -53% |
| GitHub | 2.3 | 2.3 | 2.0 | 33s | 16s | -13% | -52% |
| Apple | 4.7 | 2.3 | 6.7 | 60s | 72s | +43% | +19% |

### Aggregate results (50 tasks)

| Metric | Round 1 | Round 2 | Round 3 | R1 → R3 |
|--------|--------:|--------:|--------:|---------:|
| Total commands | 498 | 177 | 162 | **-67%** |
| Total time | 6,944s | 1,746s | 1,674s | **-76%** |
| Avg commands / task | 10.0 | 3.5 | 3.2 | **-68%** |
| Avg time / task | 139s | 35s | 33s | **-76%** |

After just one visit, the second run is already 3x faster.
For stable sites (Allrecipes, Coursera, ArXiv), the agent goes straight to the goal after a few visits.

## License

MIT
