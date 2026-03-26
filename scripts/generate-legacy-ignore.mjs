/**
 * generate-legacy-ignore.mjs
 * Generates a JSON list of files that currently fail linting, so they can be grandfathered in.
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative, basename } from 'path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');

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

function checkFile(filePath, content) {
  const relPath = relative(SRC_DIR, filePath).replace(/\\/g, '/');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const fileName = basename(filePath);
  const violations = [];

  if (!content.trimStart().startsWith('/* ====')) violations.push('FILE_HEADER');
  
  const isDataFile = relPath.startsWith('data/') || /[Tt]emplates|[Ss]eed/.test(fileName);
  const hardLimit = isDataFile ? 500 : 400;
  if (lineCount > hardLimit) violations.push('FILE_SIZE');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    if (/(?::\s*any\b|<any>|as\s+any\b)/.test(line)) violations.push('NO_ANY');
  }

  if (fileName !== 'index.ts' && lineCount > 30 && !content.includes('#region')) violations.push('REGION_BLOCKS');

  if (fileName !== 'index.ts' && lineCount > 10) {
    const hasExports = /export\s+(default\s+)?function/.test(content) || /export\s+const/.test(content);
    if (hasExports && !content.includes('/**')) violations.push('JSDOC');
  }

  if ([...content.matchAll(/^type\s+(\w+)\s*=\s*\{/gm)].length > 0) violations.push('INTERFACE_OVER_TYPE');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    const shortVarMatch = line.match(/\b(?:const|let|var)\s+([a-zA-Z])\s*=/);
    if (shortVarMatch && !['i', 'j', 'k', '_'].includes(shortVarMatch[1]) && !line.includes('for (') && !line.includes('for(')) {
      violations.push('NO_SHORT_NAMES');
    }
  }

  let inFunction = false, functionStartLine = 0, braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    if (/\b(?:function|const\s+[a-zA-Z0-9_]+\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)\s*.*\{/.test(line)) {
      if (!inFunction) { inFunction = true; functionStartLine = i; braceDepth = 0; }
    }
    if (inFunction) {
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      if (braceDepth <= 0) {
        if (i - functionStartLine + 1 > 50) violations.push('FUNCTION_LENGTH');
        inFunction = false; braceDepth = 0;
      }
    }
  }

  return violations.length > 0 ? relPath : null;
}

async function main() {
  const files = await getFiles(SRC_DIR);
  const legacyFiles = [];

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const relPath = checkFile(filePath, content);
    if (relPath) legacyFiles.push(relPath);
  }

  await writeFile(
    join(import.meta.dirname, 'legacy-lint-ignore.json'), 
    JSON.stringify(legacyFiles, null, 2)
  );
  console.log(`Saved ${legacyFiles.length} files to legacy-lint-ignore.json`);
}

main().catch(console.error);
