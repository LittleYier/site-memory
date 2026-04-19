# site-memory

[English](README.md) | **中文** | [日本語](README.ja.md)

AI Agent在进行浏览器自动化操作时，每次访问同一个网站都要重新摸索页面结构，从0开始试错，浪费时间和token。
site-memory可以让agent记住去过的网站，直奔目标。
在WebVoyager benchmark中，site-memory使agent综合成本降低70%~90%，速度提升4倍以上，准确率不变。

- 自动积累站点知识，无需手动配置
- 每次访问后更新记忆
- 越用越准

## 为什么你需要site-memory

没有持久记忆的agent每次访问网站都像第一次访问：在Booking.com上订酒店，需要操作35步、耗费近8分钟时间。
有了site-memory，第二次只需要5步操作和30秒时间。对于结构稳定的网站，agent熟悉之后几乎可以一步到位，大大提高效率。

## 安装

**让你的 AI 帮你装**，直接发给 Claude Code / Codex / OpenClaw / Gemini CLI：

> 帮我安装site-memory这个skill，仓库地址是 github.com/LittleYier/site-memory

或使用 [Skills CLI](https://github.com/vercel-labs/skills)：

```bash
npx skills add LittleYier/site-memory
```

或手动clone：

```bash
git clone --recurse-submodules https://github.com/LittleYier/site-memory.git
```

然后将 `skills/site-memory/` 复制到你的 agent skills 目录
（如 `~/.gemini/skills/` 或 `.agents/skills/`）。

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


## 浏览器工具选择

可以搭配你的 agent 已有的任意浏览器工具使用：

| 工具 | 说明 |
|------|------|
| Chrome DevTools Protocol（已内置） | 随 site-memory 安装，需要 Chrome 开启远程调试 |
| [browser-use](https://github.com/browser-use/browser-use) | `npx skills add anthropics/browser-use` |
| Playwright MCP | 在 agent 配置中添加 MCP server |
| [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/) | 浏览器扩展，agent 通过 MCP 访问 |
| 其他 | 只要能导航、读取、交互即可 |

主流 agent 运行时（Claude Code、Gemini CLI、Codex）支持同时加载多个 skills，
site-memory 可与你选的浏览器工具共存。

## 使用方式

适合重复性的浏览器工作，例如：

```text
在 example-insurance.com 上填写保险报价表单
在 realestate-site.com 上搜索 30 万美元以下的公寓
进入管理后台，导出上个月的报告
```

也可以直接调用skills：

```text
/site-memory open books.toscrape.com and get page 3 titles
```

## 记忆存储位置

`~/.site-memory/`

## 基准测试

基于 [WebVoyager](https://github.com/MinorJerry/WebVoyager) 任务集测试。
**15 个网站，50 个任务，每个任务 3 轮（共 150 次运行），全部正确。**

第 1 轮使用 Claude Sonnet 4.6，第 2-3 轮使用 Claude Haiku 4.5（比前者便宜 3 倍）。

| 站点 | R1 平均指令 | R2 平均指令 | R3 平均指令 | R1 平均时间 | R3 平均时间 | 指令变化 | 时间变化 |
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

### 汇总结果（50 个任务）

| 指标 | 第 1 轮 | 第 2 轮 | 第 3 轮 | R1 → R3 |
|------|--------:|--------:|--------:|---------:|
| 总指令数 | 498 | 177 | 162 | **-67%** |
| 总时间 | 6,944s | 1,746s | 1,674s | **-76%** |
| 平均指令 / 任务 | 10.0 | 3.5 | 3.2 | **-68%** |
| 平均时间 / 任务 | 139s | 35s | 33s | **-76%** |

只要用过一次，第二次就快 3 倍。
结构稳定的站点（Allrecipes、Coursera、ArXiv），用几次之后 agent 几乎可以直奔目标。

## License

MIT

