#!/usr/bin/env node

import { buildDistillGuide } from './memory-phrasing.mjs';
import { formatManifest, getRuntimeContext, parseArgs, scanManifest } from './memory-core.mjs';

const args = parseArgs(process.argv.slice(2));
const messageCount = Math.max(1, parseInt(args['message-count'] || '1', 10) || 1);
const skipIndex = String(args['skip-index'] || 'false') === 'true';
const context = getRuntimeContext({
  runtimeBase: args['runtime-base'],
});

const manifestEntries = scanManifest(context.memoryRoot);
const manifest = formatManifest(manifestEntries);
const toolLabels = {
  read: String(args['read-tool'] || 'Read'),
  search: String(args['search-tool'] || 'Search'),
  list: String(args['list-tool'] || 'List'),
  shell: String(args['shell-tool'] || 'Shell'),
  edit: String(args['edit-tool'] || 'Edit'),
  write: String(args['write-tool'] || 'Write'),
};

const prompt = buildDistillGuide({
  messageCount,
  manifest,
  skipIndex,
  tools: toolLabels,
});

process.stdout.write(JSON.stringify({
  ...context,
  messageCount,
  skipIndex,
  manifest,
  prompt,
  writeScope: context.memoryRoot,
}, null, 2));
