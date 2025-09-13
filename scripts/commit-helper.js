#!/usr/bin/env node

/**
 * Cross-platform Git Commit Helper
 * 
 * This script resolves the heredoc syntax issues on Windows by providing
 * a cross-platform way to commit with multiline commit messages.
 * 
 * Usage:
 *   node scripts/commit-helper.js "Commit message"
 *   node scripts/commit-helper.js "Title" "Body line 1" "Body line 2"
 * 
 * It automatically adds the factory-droid co-author attribution.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CO_AUTHOR = 'Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>';

function detectPlatform() {
  return {
    isWindows: os.platform() === 'win32',
    shell: process.env.SHELL || (os.platform() === 'win32' ? 'cmd' : 'bash')
  };
}

function createCommitMessage(args) {
  if (args.length === 0) {
    console.error('Error: Commit message is required');
    console.error('Usage: node scripts/commit-helper.js "Commit message"');
    process.exit(1);
  }

  let commitMessage;
  
  if (args.length === 1) {
    // Single argument - treat as complete commit message
    commitMessage = args[0];
  } else {
    // Multiple arguments - first is title, rest are body lines
    const title = args[0];
    const bodyLines = args.slice(1);
    commitMessage = `${title}\n\n${bodyLines.join('\n')}`;
  }

  // Add co-author attribution
  commitMessage += `\n\n${CO_AUTHOR}`;
  
  return commitMessage;
}

function commitWithTempFile(message) {
  const tempFile = path.join(os.tmpdir(), `commit-msg-${Date.now()}.txt`);
  
  try {
    // Write commit message to temporary file
    fs.writeFileSync(tempFile, message, 'utf8');
    
    // Use git commit with -F flag to read from file
    execSync(`git commit -F "${tempFile}"`, {
      stdio: 'inherit',
      maxBuffer: 50 * 1024 * 1024
    });
    
    console.log('✅ Commit successful!');
  } catch (error) {
    console.error('❌ Commit failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(tempFile);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

function commitWithEscaping(message) {
  // Escape quotes and special characters for shell
  const platform = detectPlatform();
  
  let escapedMessage;
  if (platform.isWindows) {
    // Windows cmd.exe escaping
    escapedMessage = message
      .replace(/"/g, '""')  // Escape double quotes
      .replace(/\n/g, '^n'); // Replace newlines with ^n (cmd placeholder)
    
    // For Windows, still use temp file approach as it's more reliable
    return commitWithTempFile(message);
  } else {
    // Unix shell escaping
    escapedMessage = message
      .replace(/'/g, "'\"'\"'")  // Escape single quotes
      .replace(/\\/g, '\\\\');   // Escape backslashes
    
    try {
      execSync(`git commit -m '${escapedMessage}'`, {
        stdio: 'inherit',
        maxBuffer: 50 * 1024 * 1024
      });
      console.log('✅ Commit successful!');
    } catch (error) {
      console.error('❌ Commit failed, trying temp file approach:', error.message);
      // Fallback to temp file method
      commitWithTempFile(message);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Cross-platform Git Commit Helper

Usage:
  node scripts/commit-helper.js "Commit message"
  node scripts/commit-helper.js "Title" "Body line 1" "Body line 2"

Examples:
  node scripts/commit-helper.js "Fix typo in README"
  node scripts/commit-helper.js "Add new feature" "- Implemented user authentication" "- Added tests"

This script automatically adds factory-droid co-author attribution and handles
cross-platform commit message formatting (resolves heredoc issues on Windows).
`);
    process.exit(0);
  }

  // Check if we're in a git repository
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Not in a git repository');
    process.exit(1);
  }

  // Check if there are staged changes
  try {
    execSync('git diff --staged --quiet', { stdio: 'ignore' });
    console.error('❌ Error: No staged changes to commit');
    console.error('Use "git add" to stage changes first');
    process.exit(1);
  } catch (error) {
    // If git diff --staged --quiet fails, there are staged changes (which is what we want)
  }

  const commitMessage = createCommitMessage(args);
  
  console.log('📝 Commit message:');
  console.log('---');
  console.log(commitMessage);
  console.log('---');

  // Always use temp file approach for reliability across platforms
  commitWithTempFile(commitMessage);
}

// Check if this is the main module
const scriptPath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === scriptPath;

if (isMainModule) {
  main();
}

export {
  createCommitMessage,
  commitWithTempFile,
  CO_AUTHOR
};
