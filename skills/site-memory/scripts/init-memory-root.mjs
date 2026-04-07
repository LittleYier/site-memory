#!/usr/bin/env node

import { ensureMemoryRoot, getRuntimeContext, parseArgs } from './memory-core.mjs';

const args = parseArgs(process.argv.slice(2));
const context = getRuntimeContext({
  runtimeBase: args['runtime-base'],
});

ensureMemoryRoot(context.memoryRoot);

process.stdout.write(JSON.stringify({
  ...context,
  initialized: true
}, null, 2));
