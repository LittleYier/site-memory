#!/usr/bin/env node

/**
 * cdp-proxy.mjs — Locates and proxies to the chrome-cdp-skill's cdp.mjs.
 * Searches local vendor directory first, then common sibling locations.
 */

import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const root = resolve(join(__dirname, '..'));

const cdpRelPath = join('skills', 'chrome-cdp', 'scripts', 'cdp.mjs');
const candidates = [
  join(root, 'vendor', 'chrome-cdp-skill', cdpRelPath),
  process.env.SITE_MEMORY_CDP_SCRIPT || '',
].filter(Boolean);

const scriptPath = candidates.find((c) => existsSync(c));
if (!scriptPath) {
  console.error('Unable to locate cdp.mjs. Ensure chrome-cdp-skill is in vendor/ or set SITE_MEMORY_CDP_SCRIPT.');
  process.exit(1);
}

const result = spawnSync('node', [scriptPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

process.exit(typeof result.status === 'number' ? result.status : 1);
