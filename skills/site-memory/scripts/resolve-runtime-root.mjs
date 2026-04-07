#!/usr/bin/env node

import { getRuntimeContext, parseArgs } from './memory-core.mjs';

const args = parseArgs(process.argv.slice(2));
const context = getRuntimeContext({
  runtimeBase: args['runtime-base'],
});

process.stdout.write(JSON.stringify(context, null, 2));
