/**
 * check-bigbang.mjs
 * 
 * Enforces the "No Big Bang" rule.
 * Checks git status/diff to prevent committing/building more than 10 files or 500 lines at once.
 */
import { execSync } from 'child_process';

console.log('╔══════════════════════════════════════════════╗');
console.log('║   💥 brain-app Big Bang Check                ║');
console.log('╚══════════════════════════════════════════════╝\n');

try {
  if (String(process.env.ALLOW_BIG_BANG).trim() === 'true') {
    console.log('⚠️ Big Bang check bypassed via environment variable.\\n');
    process.exit(0);
  }

  // We check the diff of the currently modified files against HEAD
  // If the user hasn't committed, this checks their working directory + staged files
  const output = execSync('git diff HEAD --numstat', { encoding: 'utf-8' });
  const lines = output.trim().split('\n').filter(Boolean);
  
  if (lines.length === 0) {
    console.log('✅ Passing: No active changes detected.\n');
    process.exit(0);
  }

  let totalAdded = 0;
  let totalDeleted = 0;
  let fileCount = 0;
  
  for (const line of lines) {
    const [added, deleted, file] = line.split('\t');
    
    // Ignore package-lock.json or package.json changes or generated files
    if (file && (file.includes('package-lock.json') || file.includes('package.json'))) {
      continue;
    }
    
    if (added !== '-') totalAdded += parseInt(added, 10) || 0;
    if (deleted !== '-') totalDeleted += parseInt(deleted, 10) || 0;
    fileCount++;
  }
  
  const totalChanged = totalAdded + totalDeleted;
  
  console.log(`Changes detected: ${fileCount} files, ${totalChanged} lines\n`);
  
  if (fileCount > 10 || totalChanged > 500) {
    console.log('❌ ERROR: BIG BANG DETECTED. Rule 9 Validation Failed.');
    if (fileCount > 10) {
      console.log(`- Over 10 files changed! (${fileCount})`);
    }
    if (totalChanged > 500) {
      console.log(`- Over 500 lines changed! (${totalChanged})`);
    }
    console.log('\nPlease split your work into smaller, focused commits before building.');
    process.exit(1);
  }
  
  console.log('✅ Passing: Changes are within safe limits.\n');
  process.exit(0);
  
} catch (error) {
  // Ignore errors if not in a git repo or no commits yet
  console.log('⚠️ Could not check git diff, skipping Big Bang check.\n');
  process.exit(0);
}
