/**
 * check-safe-delete.mjs
 * 
 * Enforces the "Don't delete code without grep-ing" rule.
 * Detects deleted/removed exports and checks if they are still referenced in the codebase.
 */
import { execSync } from 'child_process';

console.log('╔══════════════════════════════════════════════╗');
console.log('║   🗑️ brain-app Safe Delete Check              ║');
console.log('╚══════════════════════════════════════════════╝\n');

try {
  if (String(process.env.ALLOW_BIG_BANG).trim() === 'true') {
    console.log('⚠️ Safe Delete check bypassed via environment variable.\\n');
    process.exit(0);
  }

  // Get lines deleted in the current working tree/index
  const diffOutput = execSync('git diff HEAD -U0', { encoding: 'utf-8' });
  
  // Parse diff to find removed exports
  const deletedExports = [];
  const lines = diffOutput.split('\n');
  for (const line of lines) {
    if (line.startsWith('-') && !line.startsWith('---')) {
      // match: -export function foo( or -export const foo = or -function foo(
      const match = line.match(/^\-\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|let|var|class)\s+([a-zA-Z0-9_]+)\b/);
      if (match) {
        deletedExports.push(match[1]);
      }
    }
  }
  
  if (deletedExports.length === 0) {
    console.log('✅ Passing: No deleted functions/exports detected.\n');
    process.exit(0);
  }
  
  console.log(`Detected deleted symbols: ${deletedExports.join(', ')}\n`);
  
  // Check if these are used anywhere
  let hasViolation = false;
  
  for (const symbol of deletedExports) {
    try {
      // Use git grep to find remaining references
      // -n for line numbers, -I to ignore binaries
      const grepOutput = execSync(`git grep -nI "\\b${symbol}\\b"`, { encoding: 'utf-8' });
      const uses = grepOutput.trim().split('\n').filter(Boolean);
      
      if (uses.length > 0) {
        console.log(`❌ ERROR: Deleted symbol '${symbol}' is still referenced in the codebase!`);
        for (const use of uses.slice(0, 3)) {
          console.log(`   -> ${use}`);
        }
        if (uses.length > 3) console.log(`   ...and ${uses.length - 3} more uses`);
        hasViolation = true;
      }
    } catch (e) {
      // git grep exits with 1 if no match found -> safely deleted!
    }
  }
  
  if (hasViolation) {
    console.log('\n❌ Safe Delete Check Failed. You cannot delete functions that are still in use.');
    console.log('Rule 10 Violation: Always grep before deleting.');
    process.exit(1);
  }
  
  console.log('✅ Passing: All deleted symbols are safe (no remaining references).\n');
  process.exit(0);
  
} catch (error) {
  console.log('⚠️ Could not run safe delete check or git grep.\n');
  process.exit(0);
}
