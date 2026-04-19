# site-memory

[English](README.md) | [中文](README.zh-CN.md) | **日本語**

ブラウザ自動化のAI Agentは、同じサイトでも毎回ゼロからページ構造を手探りする。時間もトークンも無駄になる。

site-memoryがあれば、agentは一度訪れたサイトを覚えて、次から迷わず目的の操作に向かう。

WebVoyager benchmarkでコスト70〜90%削減、速度4倍以上、精度は変わらない。

- サイトの知識を自動で学習
- 訪問するたびに記憶を更新
- 使うほど賢くなる

## なぜsite-memoryが必要か

記憶がないagentは毎回が初回と同じ。Booking.comでホテルを予約するのに35ステップ & 約8分かかる。
site-memoryがあれば2回目は5ステップ & 30秒。構造が安定したサイトなら、数回使えばほぼ一発で終わる


## インストール

**AI に任せるのが最速。** Claude Code / Codex / OpenClaw / Gemini CLI に伝えるだけ：

> site-memory スキルをインストールしてください。リポジトリは github.com/LittleYier/site-memory です

[Skills CLI](https://github.com/vercel-labs/skills) を使う場合：

```bash
npx skills add LittleYier/site-memory
```

手動でクローンする場合：

```bash
git clone --recurse-submodules https://github.com/LittleYier/site-memory.git
```

`skills/site-memory/` をエージェントのスキルディレクトリ
（例：`~/.gemini/skills/` や `.agents/skills/`）にコピー。

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

## ブラウザツールの選択

どんなブラウザツールとも組み合わせて使える：

| ツール | 説明 |
|--------|------|
| Chrome DevTools Protocol（付属） | site-memory と一緒にインストール済み、Chrome のリモートデバッグが必要 |
| [browser-use](https://github.com/browser-use/browser-use) | `npx skills add anthropics/browser-use` |
| Playwright MCP | エージェント設定に MCP サーバーを追加 |
| [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/) | ブラウザ拡張機能、MCP ツールとしてアクセス |
| その他 | ページの操作・読み取り・インタラクションができれば何でも可 |

主要なエージェントランタイム（Claude Code、Gemini CLI、Codex）は複数の skills を同時にロードでき、site-memory は選んだブラウザツールと一緒に使える。

## 使い方

くり返しのブラウザ操作に最適：

```text
example-insurance.com で保険見積もりフォームに入力する
realestate-site.com で30万ドル以下のマンションを検索する
管理画面から先月のレポートをエクスポートする
```

直接呼び出す場合：

```text
/site-memory open books.toscrape.com and get page 3 titles
```

## メモリの保存場所

`~/.site-memory/`

## ベンチマーク

WebVoyager タスクセットで検証。
**15 サイト、50 タスク、各 3 ラウンド（計 150 回）。全問正解。**

ラウンド 1 は Claude Sonnet 4.6、ラウンド 2-3 は Claude Haiku 4.5（3 倍安い）。

| サイト | R1 平均 cmd | R2 平均 cmd | R3 平均 cmd | R1 平均時間 | R3 平均時間 | cmd 変化 | 時間変化 |
|--------|----------:|----------:|----------:|-----------:|-----------:|-------:|--------:|
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

### 集計結果（50 タスク）

| 指標 | ラウンド 1 | ラウンド 2 | ラウンド 3 | R1 → R3 |
|------|--------:|--------:|--------:|---------:|
| 総コマンド数 | 498 | 177 | 162 | **-67%** |
| 総時間 | 6,944s | 1,746s | 1,674s | **-76%** |
| 平均コマンド / タスク | 10.0 | 3.5 | 3.2 | **-68%** |
| 平均時間 / タスク | 139s | 35s | 33s | **-76%** |

一度使えば、二回目はすでに 3 倍速い。
安定したサイト（Allrecipes、Coursera、ArXiv）は数回使うと、ほぼ一直線でゴールへ。

## ライセンス

MIT

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=LittleYier/site-memory&type=Date)](https://www.star-history.com/#LittleYier/site-memory&Date)
