#!/usr/bin/env node

import { getRuntimeContext, parseArgs, readSelectedNotes, toList } from './memory-core.mjs';

const args = parseArgs(process.argv.slice(2));
const files = toList(args.files || args.file);

if (files.length === 0) {
  console.error('Missing required --files "<note1.md,note2.md>"');
  process.exit(1);
}

const context = getRuntimeContext({
  runtimeBase: args['runtime-base'],
});

process.stdout.write(JSON.stringify({
  ...context,
  selectedCount: files.length,
  notes: readSelectedNotes(context.memoryRoot, files)
}, null, 2));
