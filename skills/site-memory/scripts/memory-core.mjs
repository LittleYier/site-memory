#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join, normalize, relative, resolve, sep } from 'path';
import {
  HEADER_SCAN_LINE_LIMIT,
  INDEX_BYTE_LIMIT,
  INDEX_FILE,
  INDEX_LINE_LIMIT,
  MANIFEST_FILE_LIMIT,
  SURFACE_BYTE_LIMIT,
  SURFACE_LINE_LIMIT,
} from './memory-phrasing.mjs';

export function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    const value = !next || next.startsWith('--') ? 'true' : next;
    if (value !== 'true') index++;

    if (!(key in parsed)) {
      parsed[key] = value;
    } else if (Array.isArray(parsed[key])) {
      parsed[key].push(value);
    } else {
      parsed[key] = [parsed[key], value];
    }
  }

  return parsed;
}

export function toList(value) {
  if (value === undefined) return [];

  return (Array.isArray(value) ? value : [value])
    .flatMap(item => String(item).split(','))
    .map(item => item.trim())
    .filter(Boolean);
}

function byteLength(value) {
  return Buffer.byteLength(value, 'utf8');
}

export function getRuntimeBase(runtimeBaseArg) {
  const candidate = runtimeBaseArg || process.env.SITE_MEMORY_HOME || join(homedir(), '.site-memory');
  return resolve(candidate).normalize('NFC');
}

export function getRuntimeContext({ runtimeBase } = {}) {
  const memoryRoot = getRuntimeBase(runtimeBase);

  return {
    runtimeBase: memoryRoot,
    memoryRoot,
    indexPath: join(memoryRoot, INDEX_FILE).normalize('NFC'),
  };
}

export function ensureMemoryRoot(memoryRoot) {
  mkdirSync(memoryRoot, { recursive: true });
  const indexPath = join(memoryRoot, INDEX_FILE);
  if (!existsSync(indexPath)) {
    writeFileSync(indexPath, '', 'utf8');
  }
  return indexPath;
}

export function parseFrontmatter(content) {
  const raw = String(content).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!raw.startsWith('---\n')) {
    return { frontmatter: {}, body: raw };
  }

  const boundary = raw.indexOf('\n---\n', 4);
  if (boundary === -1) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter = {};
  for (const rawLine of raw.slice(4, boundary).split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) frontmatter[key] = value;
  }

  return {
    frontmatter,
    body: raw.slice(boundary + 5).trim(),
  };
}

function collectMarkdownFiles(root) {
  if (!existsSync(root)) return [];

  const files = [];
  const pending = [root];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== INDEX_FILE) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

export function scanManifest(memoryRoot) {
  const items = [];

  for (const filePath of collectMarkdownFiles(memoryRoot)) {
    try {
      const stats = statSync(filePath);
      const headerPreview = readFileSync(filePath, 'utf8')
        .split(/\r?\n/)
        .slice(0, HEADER_SCAN_LINE_LIMIT)
        .join('\n');
      const { frontmatter } = parseFrontmatter(headerPreview);

      items.push({
        filename: relative(memoryRoot, filePath).replace(/\\/g, '/'),
        filePath,
        modifiedAtMs: stats.mtimeMs,
        name: frontmatter.name || null,
        summary: frontmatter.summary || null,
        kind: frontmatter.kind || null,
      });
    } catch {
      // Best effort scan. Broken files should not block the manifest.
    }
  }

  return items
    .sort((left, right) => right.modifiedAtMs - left.modifiedAtMs)
    .slice(0, MANIFEST_FILE_LIMIT);
}

export function formatManifest(items) {
  return items.map(item => {
    const kindTag = item.kind ? `[${item.kind}] ` : '';
    const timestamp = new Date(item.modifiedAtMs).toISOString();
    return item.summary
      ? `- ${kindTag}${item.filename} (${timestamp}): ${item.summary}`
      : `- ${kindTag}${item.filename} (${timestamp})`;
  }).join('\n');
}

function trimTextToByteLimit(text, limit) {
  let output = text;
  while (output && byteLength(output) > limit) {
    const lastBreak = output.lastIndexOf('\n');
    output = lastBreak === -1 ? output.slice(0, -1) : output.slice(0, lastBreak);
  }
  return output;
}

export function truncateIndex(raw) {
  const trimmed = String(raw || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!trimmed) {
    return {
      content: '',
      lineCount: 0,
      byteCount: 0,
      truncatedByLines: false,
      truncatedByBytes: false,
    };
  }

  const lines = trimmed.split('\n');
  const lineCount = lines.length;
  const byteCount = byteLength(trimmed);
  const truncatedByLines = lineCount > INDEX_LINE_LIMIT;
  const truncatedByBytes = byteCount > INDEX_BYTE_LIMIT;

  let content = truncatedByLines ? lines.slice(0, INDEX_LINE_LIMIT).join('\n') : trimmed;
  content = trimTextToByteLimit(content, INDEX_BYTE_LIMIT);

  if (truncatedByLines || truncatedByBytes) {
    content += '\n\n> Warning: only part of the index was loaded. Move detail into topic files if the index has become too large.';
  }

  return { content, lineCount, byteCount, truncatedByLines, truncatedByBytes };
}

export function readIndex(memoryRoot) {
  const filePath = join(memoryRoot, INDEX_FILE);
  return existsSync(filePath)
    ? truncateIndex(readFileSync(filePath, 'utf8'))
    : truncateIndex('');
}

function normalizeRootPrefix(root) {
  const normalized = normalize(root);
  const withSep = normalized.endsWith(sep) ? normalized : `${normalized}${sep}`;
  return withSep.toLowerCase();
}

export function resolveMemoryPath(memoryRoot, relativePath) {
  const absolutePath = normalize(resolve(memoryRoot, relativePath));
  if (!absolutePath.toLowerCase().startsWith(normalizeRootPrefix(memoryRoot))) {
    throw new Error(`Memory path escapes runtime root: ${relativePath}`);
  }
  return absolutePath;
}

function formatAge(modifiedAtMs) {
  const deltaMs = Math.max(0, Date.now() - modifiedAtMs);
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function truncateSurfacedContent(raw) {
  const lines = String(raw || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let content = lines.slice(0, SURFACE_LINE_LIMIT).join('\n');
  const byLines = lines.length > SURFACE_LINE_LIMIT;
  const byBytes = byteLength(content) > SURFACE_BYTE_LIMIT;

  if (byBytes) {
    content = trimTextToByteLimit(content, SURFACE_BYTE_LIMIT);
  }

  if (byLines || byBytes) {
    const reason = byBytes ? `${SURFACE_BYTE_LIMIT} byte limit` : `first ${SURFACE_LINE_LIMIT} lines`;
    content += `\n\n> Note truncated during recall (${reason}). Open the file directly only if more detail is truly needed.`;
  }

  return { content, truncated: byLines || byBytes };
}

export function readSelectedNotes(memoryRoot, selectedPaths) {
  return selectedPaths.map(relativePath => {
    const absolutePath = resolveMemoryPath(memoryRoot, relativePath);
    const stats = statSync(absolutePath);
    const raw = readFileSync(absolutePath, 'utf8');
    const truncated = truncateSurfacedContent(raw);

    return {
      relativePath: relative(memoryRoot, absolutePath).replace(/\\/g, '/'),
      absolutePath,
      modifiedAtMs: stats.mtimeMs,
      header: `Loaded note (${formatAge(stats.mtimeMs)}): ${absolutePath}:`,
      content: truncated.content,
      truncated: truncated.truncated,
    };
  });
}
