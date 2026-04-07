#!/usr/bin/env node

import { buildMemoryPolicy, RECALL_SELECTOR_SYSTEM } from './memory-phrasing.mjs';
import { formatManifest, getRuntimeContext, parseArgs, readIndex, scanManifest, toList } from './memory-core.mjs';

const args = parseArgs(process.argv.slice(2));
const task = String(args.task || '').trim();
const recentTools = toList(args['recent-tools']);
const context = getRuntimeContext({
  runtimeBase: args['runtime-base'],
});

const manifestEntries = scanManifest(context.memoryRoot);
const manifestText = formatManifest(manifestEntries);
const index = readIndex(context.memoryRoot);
const recentToolsText = recentTools.length > 0
  ? `\n\nRecently used tools: ${recentTools.join(', ')}`
  : '';

const policyPrompt = buildMemoryPolicy({
  runtimeRoot: context.memoryRoot,
  indexContent: index.content,
});

const selectorUserPrompt = `Task: ${task}\n\nAvailable notes:\n${manifestText}${recentToolsText}`;

process.stdout.write(JSON.stringify({
  ...context,
  task,
  recentTools,
  index,
  manifest: manifestText,
  manifestCount: manifestEntries.length,
  policyPrompt,
  selectorSystemPrompt: RECALL_SELECTOR_SYSTEM,
  selectorUserPrompt,
}, null, 2));
