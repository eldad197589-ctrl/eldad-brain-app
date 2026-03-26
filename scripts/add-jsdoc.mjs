/**
 * add-jsdoc.mjs — Automated JSDoc comment insertion
 *
 * Scans all .ts/.tsx files in brain-app/src and adds JSDoc comments
 * above exported functions/components that are missing them.
 *
 * Run as: node scripts/add-jsdoc.mjs
 * Dry run: node scripts/add-jsdoc.mjs --dry
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');
const DRY_RUN = process.argv.includes('--dry');

// #region File Discovery

/** Recursively get all .ts/.tsx files */
async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// #endregion

// #region JSDoc Insertion

/**
 * Extract the PURPOSE from the file header, if present.
 */
function extractPurpose(content) {
  const match = content.match(/PURPOSE:\s*(.+)/);
  return match ? match[1].trim() : null;
}

/**
 * Extract a human-readable name from a function declaration.
 */
function extractFuncName(line) {
  // export default function ComponentName(...)
  const m = line.match(/export\s+(?:default\s+)?function\s+(\w+)/);
  if (m) return m[1];
  // export const name = ...
  const c = line.match(/export\s+const\s+(\w+)/);
  if (c) return c[1];
  return null;
}

/**
 * Check if the line before an export already has a JSDoc comment.
 */
function hasJSDocAbove(lines, lineIndex) {
  // Walk backwards over blank lines, then check for closing */
  let i = lineIndex - 1;
  while (i >= 0 && lines[i].trim() === '') i--;
  if (i >= 0 && lines[i].trim().endsWith('*/')) return true;
  // Also check for single-line /** ... */
  if (i >= 0 && lines[i].trim().startsWith('/**')) return true;
  return false;
}

/**
 * Generate a JSDoc comment for an export.
 */
function generateJSDoc(name, purpose, isTsx, isConst) {
  if (isConst) {
    return `/** ${name} — ${purpose || 'exported constant'} */`;
  }
  if (isTsx && name && name[0] === name[0].toUpperCase()) {
    return `/** ${name} component${purpose ? ' — ' + purpose : ''} */`;
  }
  return `/** ${name}${purpose ? ' — ' + purpose : ''} */`;
}

/**
 * Process a single file and add JSDoc comments where missing.
 * Returns modified content, or null if no changes needed.
 */
function addJSDocToFile(content, fileName) {
  const lines = content.split('\n');
  const isTsx = fileName.endsWith('.tsx');
  const purpose = extractPurpose(content);
  const result = [];
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Detect exported function/component without JSDoc
    const isExportFunc = /^export\s+(default\s+)?function\s+\w+/.test(trimmed);
    const isExportConst = /^export\s+const\s+[A-Z_]/.test(trimmed); // Only UPPER_CASE constants

    if ((isExportFunc || isExportConst) && !hasJSDocAbove(lines, i)) {
      const name = extractFuncName(trimmed);
      if (name) {
        const indent = line.match(/^(\s*)/)[1];
        const jsdoc = generateJSDoc(name, purpose, isTsx, isExportConst);
        result.push(`${indent}${jsdoc}`);
        modified = true;
      }
    }

    result.push(line);
  }

  return modified ? result.join('\n') : null;
}

// #endregion

// #region Main

async function main() {
  const files = await getFiles(SRC_DIR);
  let modifiedCount = 0;
  let skippedCount = 0;

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const fileName = basename(filePath);

    // Skip index files and very small files
    if (fileName === 'index.ts' || content.split('\n').length <= 10) {
      skippedCount++;
      continue;
    }

    // Skip files that already have JSDoc on all exports
    const hasExports = /export\s+(default\s+)?function/.test(content) || /export\s+const\s+[A-Z_]/.test(content);
    if (!hasExports) {
      skippedCount++;
      continue;
    }

    const newContent = addJSDocToFile(content, fileName);
    if (newContent) {
      if (DRY_RUN) {
        console.log(`📝 Would modify: ${fileName}`);
      } else {
        await writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ Added JSDoc: ${fileName}`);
      }
      modifiedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`\n${DRY_RUN ? '(DRY RUN) ' : ''}Modified: ${modifiedCount}, Skipped: ${skippedCount}`);
}

main().catch(console.error);

// #endregion
