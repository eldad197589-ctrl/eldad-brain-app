/**
 * add-file-headers.mjs — Automated File Header Insertion
 * 
 * Scans all .ts/.tsx files in brain-app/src and adds a standard file header
 * if one does not already exist. Safe to run multiple times.
 * 
 * Usage: node scripts/add-file-headers.mjs
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative, basename, extname } from 'path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');

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

/** Extract export names from file content */
function extractExports(content) {
  const exports = [];
  const defaultMatch = content.match(/export default (?:function|class|const)\s+(\w+)/);
  if (defaultMatch) exports.push(defaultMatch[1] + ' (default)');
  const namedMatches = content.matchAll(/export (?:function|const|interface|type|class|enum)\s+(\w+)/g);
  for (const m of namedMatches) exports.push(m[1]);
  return exports.length > 0 ? exports.join(', ') : 'None';
}

/** Extract import paths */
function extractDependencies(content) {
  const deps = new Set();
  const matches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
  for (const m of matches) {
    const dep = m[1];
    if (dep.startsWith('.')) continue; // skip relative
    deps.add(dep.split('/')[0]);
  }
  return deps.size > 0 ? [...deps].join(', ') : 'None (local only)';
}

/** Determine purpose from filename and content */
function guessPurpose(fileName, content) {
  const name = basename(fileName, extname(fileName));
  if (name === 'index') return 'Barrel exports for feature folder';
  if (name === 'types') return 'Domain-specific interfaces and types';
  if (name === 'constants') return 'Static data and configuration';
  if (name === 'hooks') return 'Custom React hooks (data, computed values)';
  if (name === 'main') return 'App root — routes, providers, lazy loading';
  if (name.includes('Utils') || name.includes('utils')) return 'Pure utility functions';
  if (content.includes('export default function') && /\.tsx$/.test(fileName)) {
    const match = content.match(/export default function\s+(\w+)/);
    return match ? `${match[1]} component` : 'React component';
  }
  if (content.includes('interface ') && !content.includes('function')) return 'Type definitions';
  return `${name} module`;
}

const HEADER_MARKER = '/* ====';

async function main() {
  const files = await getFiles(SRC_DIR);
  let added = 0;
  let skipped = 0;

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    
    // Skip if already has a header
    if (content.trimStart().startsWith(HEADER_MARKER)) {
      skipped++;
      continue;
    }

    const relPath = relative(SRC_DIR, filePath).replace(/\\/g, '/');
    const fileName = basename(filePath);
    const purpose = guessPurpose(filePath, content);
    const exports = extractExports(content);
    const deps = extractDependencies(content);

    const header = `/* ============================================
   FILE: ${fileName}
   PURPOSE: ${purpose}
   DEPENDENCIES: ${deps}
   EXPORTS: ${exports}
   ============================================ */
`;

    // If file starts with JSDoc (/**), put header before it
    // If file starts with import, put header before it
    const newContent = header + content;
    await writeFile(filePath, newContent, 'utf-8');
    added++;
    console.log(`✅ ${relPath}`);
  }

  console.log(`\nDone! Added headers to ${added} files, skipped ${skipped} (already had headers).`);
}

main().catch(console.error);
