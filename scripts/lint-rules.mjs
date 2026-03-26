/**
 * lint-rules.mjs — Automated Coding Rules Enforcement
 * 
 * Checks all .ts/.tsx files in brain-app/src against the project's coding rules.
 * Run as: node scripts/lint-rules.mjs
 * 
 * Rules checked:
 * 1. File headers (FILE/PURPOSE/DEPENDENCIES)
 * 2. Max file size (300 lines warning, 400 error)
 * 3. No `any` type usage
 * 4. #region blocks present
 * 5. JSDoc on exported functions/components
 */
import { readdir, readFile } from 'fs/promises';
import { join, relative, basename } from 'path';
import { existsSync, readFileSync } from 'fs';

const SRC_DIR = join(import.meta.dirname, '..', 'src');

let legacyIgnoreList = [];
try {
  const ignorePath = join(import.meta.dirname, 'legacy-lint-ignore.json');
  if (existsSync(ignorePath)) {
    const ignoreFileContent = readFileSync(ignorePath, 'utf-8');
    legacyIgnoreList = JSON.parse(ignoreFileContent);
  }
} catch (e) {
  console.log('⚠️ Could not read legacy-lint-ignore.json, continuing without exemptions.');
}

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

/** Check a single file against all rules */
function checkFile(filePath, content) {
  const relPath = relative(SRC_DIR, filePath).replace(/\\/g, '/');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const fileName = basename(filePath);
  const violations = [];

  // Rule 1: File header
  if (!content.trimStart().startsWith('/* ====')) {
    violations.push({ rule: 'FILE_HEADER', severity: 'error', message: 'Missing file header (/* ==== FILE: ... */)' });
  }

  // Rule 2: File size (data-only files get a higher limit)
  const isDataFile = relPath.startsWith('data/') || /[Tt]emplates|[Ss]eed/.test(fileName);
  const hardLimit = isDataFile ? 500 : 400;
  if (lineCount > hardLimit) {
    violations.push({ rule: 'FILE_SIZE', severity: 'error', message: `${lineCount} lines (hard limit: ${hardLimit})` });
  } else if (lineCount > 300) {
    violations.push({ rule: 'FILE_SIZE', severity: 'warning', message: `${lineCount} lines (recommended max: 300)` });
  }

  // Rule 3: No `any`
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    // Match `: any`, `<any>`, `as any` but not words containing "any" like "many", "company"
    if (/(?::\s*any\b|<any>|as\s+any\b)/.test(line)) {
      violations.push({ rule: 'NO_ANY', severity: 'error', message: `Line ${i + 1}: usage of \`any\` type` });
    }
  }

  // Rule 4: #region blocks (skip index.ts and very small files)
  if (fileName !== 'index.ts' && lineCount > 30 && !content.includes('#region')) {
    violations.push({ rule: 'REGION_BLOCKS', severity: 'error', message: 'Missing #region blocks for file organization' });
  }

  // Rule 5: JSDoc on exports (skip index.ts)
  if (fileName !== 'index.ts' && lineCount > 10) {
    const hasExports = /export\s+(default\s+)?function/.test(content) || /export\s+const/.test(content);
    const hasJSDoc = content.includes('/**');
    if (hasExports && !hasJSDoc) {
      violations.push({ rule: 'JSDOC', severity: 'error', message: 'Exported functions without JSDoc documentation' });
    }
  }

  // Rule 6: interface over type for object shapes
  const typeAliasMatches = [...content.matchAll(/^type\s+(\w+)\s*=\s*\{/gm)];
  for (const m of typeAliasMatches) {
    violations.push({ rule: 'INTERFACE_OVER_TYPE', severity: 'error', message: `Use \`interface ${m[1]}\` instead of \`type ${m[1]} = {...}\`` });
  }

  // Rule 7: NO_SHORT_NAMES (variable names >= 2 chars)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    
    const shortVarMatch = line.match(/\b(?:const|let|var)\s+([a-zA-Z])\s*=/);
    if (shortVarMatch) {
      const varName = shortVarMatch[1];
      if (!['i', 'j', 'k', '_'].includes(varName) && !line.includes('for (') && !line.includes('for(')) {
        violations.push({ rule: 'NO_SHORT_NAMES', severity: 'error', message: `Line ${i + 1}: Variable name '${varName}' is too short. Use descriptive names.` });
      }
    }
  }

  // Rule 8: FUNCTION_LENGTH (Single Responsibility, max 50 lines)
  let inFunction = false;
  let functionStartLine = 0;
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;

    // Detect function start
    if (/\b(?:function|const\s+[a-zA-Z0-9_]+\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)\s*.*\{/.test(line)) {
      if (!inFunction) {
        inFunction = true;
        functionStartLine = i;
        braceDepth = 0;
      }
    }
    
    if (inFunction) {
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      
      if (braceDepth <= 0) {
        const length = i - functionStartLine + 1;
        if (length > 50) {
          violations.push({ rule: 'FUNCTION_LENGTH', severity: 'error', message: `Line ${functionStartLine + 1}: Function is ${length} lines long (max 50 limit). Extract to smaller functions.` });
        }
        inFunction = false;
        braceDepth = 0;
      }
    }
  }

  const isLegacy = legacyIgnoreList.includes(relPath);
  if (isLegacy) {
    for (const v of violations) {
      if (v.severity === 'error') {
        v.severity = 'warning';
        v.message += ' (Legacy Exemption)';
      }
    }
  }

  return { relPath, violations };
}

async function main() {
  const files = await getFiles(SRC_DIR);
  let totalErrors = 0;
  let totalWarnings = 0;
  const fileResults = [];

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const result = checkFile(filePath, content);
    if (result.violations.length > 0) {
      fileResults.push(result);
      for (const v of result.violations) {
        if (v.severity === 'error') totalErrors++;
        else totalWarnings++;
      }
    }
  }

  // Output results
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🔍 brain-app Coding Rules Lint Report      ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  if (fileResults.length === 0) {
    console.log('✅ All files pass coding rules!\n');
    process.exit(0);
  }

  for (const { relPath, violations } of fileResults) {
    console.log(`📄 ${relPath}`);
    for (const v of violations) {
      const icon = v.severity === 'error' ? '  ❌' : '  ⚠️';
      console.log(`${icon} [${v.rule}] ${v.message}`);
    }
    console.log('');
  }

  console.log('─'.repeat(50));
  console.log(`Total: ${totalErrors} errors, ${totalWarnings} warnings across ${fileResults.length} files`);
  console.log(`Scanned: ${files.length} files\n`);

  if (totalErrors > 0) {
    console.log('❌ FAILED — Fix errors before committing.');
    process.exit(1);
  } else {
    console.log('⚠️  PASSED with warnings — Consider fixing.');
    process.exit(0);
  }
}

main().catch(console.error);
