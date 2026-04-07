#!/usr/bin/env node

import { formatManifest } from './memory-core.mjs';
import { getRuntimeContext, parseArgs, scanManifest } from './memory-core.mjs';

const args = parseArgs(process.argv.slice(2));
const context = getRuntimeContext({
  runtimeBase: args['runtime-base'],
});
const entries = scanManifest(context.memoryRoot);
const manifest = formatManifest(entries);

if (args.format === 'text') {
  process.stdout.write(manifest);
} else {
  process.stdout.write(JSON.stringify({
    ...context,
    count: entries.length,
    manifest,
    entries
  }, null, 2));
}
