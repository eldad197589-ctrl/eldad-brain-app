/**
 * add-regions.mjs — Automated #region block insertion
 *
 * Scans all .ts/.tsx files in brain-app/src and adds #region blocks
 * to files that are missing them. Uses heuristic pattern detection.
 *
 * Run as: node scripts/add-regions.mjs
 * Dry run: node scripts/add-regions.mjs --dry
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

// #region Region Insertion Logic

/**
 * Check if a file needs region blocks added.
 * Skip files that already have regions, are very small, or are index files.
 */
function needsRegions(content, fileName) {
  if (content.includes('#region')) return false;
  if (fileName === 'index.ts') return false;
  if (content.split('\n').length <= 30) return false;
  return true;
}

/**
 * Insert #region blocks into a file based on its structure.
 * Returns the modified content, or null if no changes needed.
 */
function insertRegions(content, fileName) {
  const lines = content.split('\n');
  const isTsx = fileName.endsWith('.tsx');
  const result = [];
  let inImports = false;
  let importsStarted = false;
  let importsEnded = false;
  let typesStarted = false;
  let typesEnded = false;
  let bodyStarted = false;
  let afterHeader = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const nextLine = i + 1 < lines.length ? lines[i + 1]?.trimStart() || '' : '';

    // Skip the file header block
    if (!afterHeader) {
      if (trimmed.startsWith('/* ====') || trimmed.startsWith('/**') || trimmed.startsWith(' *') || trimmed.startsWith('   ') || trimmed === '') {
        // Check if we're past the header (next line is an import or export)
        if (trimmed === '' && (nextLine.startsWith('import ') || nextLine.startsWith('export '))) {
          afterHeader = true;
        }
        result.push(line);
        continue;
      }
      afterHeader = true;
    }

    // Detect import block start
    if (!importsStarted && trimmed.startsWith('import ')) {
      result.push('// #region Imports');
      result.push('');
      importsStarted = true;
      inImports = true;
    }

    // Detect end of import block
    if (inImports && !trimmed.startsWith('import ') && trimmed !== '' && !trimmed.startsWith('//')) {
      result.push('');
      result.push('// #endregion');
      result.push('');
      inImports = false;
      importsEnded = true;
    }

    // Detect types/interfaces block
    if (importsEnded && !typesStarted && (trimmed.startsWith('interface ') || trimmed.startsWith('export interface ') || trimmed.startsWith('type ') || trimmed.startsWith('export type '))) {
      result.push('// #region Types');
      result.push('');
      typesStarted = true;
    }

    // Detect end of types block (when we hit a non-type export or function)
    if (typesStarted && !typesEnded && trimmed !== '' && !trimmed.startsWith('interface ') && !trimmed.startsWith('export interface ') && !trimmed.startsWith('type ') && !trimmed.startsWith('export type ') && !trimmed.startsWith('//') && !trimmed.startsWith('}') && !trimmed.startsWith('/**') && !trimmed.startsWith(' *') && !trimmed.startsWith('  ') && !trimmed.startsWith('\t')) {
      // Check if this is a new section (function, const, etc.)
      if (trimmed.startsWith('export ') || trimmed.startsWith('function ') || trimmed.startsWith('const ') || trimmed.startsWith('let ')) {
        result.push('');
        result.push('// #endregion');
        result.push('');
        typesEnded = true;
      }
    }

    // Detect main component/function body
    if (importsEnded && !bodyStarted) {
      if (trimmed.startsWith('export default function') || trimmed.startsWith('export function') ||
          (isTsx && trimmed.startsWith('export default function'))) {
        if (!typesStarted || typesEnded) {
          const regionName = isTsx ? 'Component' : 'Main';
          result.push(`// #region ${regionName}`);
          result.push('');
          bodyStarted = true;
        }
      } else if (trimmed.startsWith('export const ') && !typesStarted) {
        result.push('// #region Constants');
        result.push('');
        bodyStarted = true;
      }
    }

    result.push(line);
  }

  // Close any open regions at end of file
  if (inImports) {
    result.push('');
    result.push('// #endregion');
  }
  if (typesStarted && !typesEnded) {
    result.push('');
    result.push('// #endregion');
  }
  if (bodyStarted) {
    // Find last non-empty line and add endregion before trailing whitespace
    let lastIdx = result.length - 1;
    while (lastIdx > 0 && result[lastIdx].trim() === '') lastIdx--;
    result.splice(lastIdx + 1, 0, '', '// #endregion');
  }

  // If we didn't manage to add any regions, fallback: wrap everything after header
  if (!importsStarted && !bodyStarted) {
    return addFallbackRegions(content, fileName);
  }

  return result.join('\n');
}

/**
 * Fallback: just wrap the whole file body in a single region
 */
function addFallbackRegions(content, fileName) {
  const lines = content.split('\n');
  const result = [];
  let headerDone = false;
  let regionAdded = false;
  const regionName = fileName.endsWith('.tsx') ? 'Component' : 'Module';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    if (!headerDone && (trimmed.startsWith('/* ====') || trimmed.startsWith('/**') || trimmed.startsWith(' *') || trimmed.startsWith('   ') || trimmed === '')) {
      result.push(line);
      // Check if next line starts actual code
      const next = lines[i + 1]?.trimStart() || '';
      if (trimmed === '' && next !== '' && !next.startsWith('/*') && !next.startsWith('/**') && !next.startsWith(' *')) {
        headerDone = true;
      }
      continue;
    }

    if (!headerDone) headerDone = true;

    if (!regionAdded) {
      result.push(`// #region ${regionName}`);
      result.push('');
      regionAdded = true;
    }

    result.push(line);
  }

  if (regionAdded) {
    let lastIdx = result.length - 1;
    while (lastIdx > 0 && result[lastIdx].trim() === '') lastIdx--;
    result.splice(lastIdx + 1, 0, '', '// #endregion');
  }

  return result.join('\n');
}

// #endregion

// #region Main

async function main() {
  const files = await getFiles(SRC_DIR);
  let modified = 0;
  let skipped = 0;

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const fileName = basename(filePath);

    if (!needsRegions(content, fileName)) {
      skipped++;
      continue;
    }

    const newContent = insertRegions(content, fileName);
    if (newContent && newContent !== content) {
      if (DRY_RUN) {
        console.log(`📝 Would modify: ${fileName}`);
      } else {
        await writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ Added regions: ${fileName}`);
      }
      modified++;
    } else {
      skipped++;
    }
  }

  console.log(`\n${DRY_RUN ? '(DRY RUN) ' : ''}Modified: ${modified}, Skipped: ${skipped}`);
}

main().catch(console.error);

// #endregion
