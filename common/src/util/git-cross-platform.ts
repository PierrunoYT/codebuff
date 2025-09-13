import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

import type { FileChanges } from '../actions'

const maxBuffer = 50 * 1024 * 1024 // 50 MB
const CO_AUTHOR = 'Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>'

export function hasStagedChanges(): boolean {
  try {
    execSync('git diff --staged --quiet', { stdio: 'ignore', maxBuffer })
    return false
  } catch {
    return true
  }
}

export function getStagedChanges(): string {
  try {
    return execSync('git diff --staged', { maxBuffer }).toString()
  } catch (error) {
    return ''
  }
}

/**
 * Creates a commit message with proper co-author attribution
 */
function createCommitMessageWithCoAuthor(commitMessage: string): string {
  // Check if co-author is already present to avoid duplication
  if (commitMessage.includes('Co-authored-by: factory-droid[bot]')) {
    return commitMessage
  }
  
  return `${commitMessage}\n\n${CO_AUTHOR}`
}

/**
 * Cross-platform commit function that handles heredoc issues on Windows
 */
export function commitChanges(commitMessage: string) {
  const messageWithCoAuthor = createCommitMessageWithCoAuthor(commitMessage)
  
  // Use temporary file approach for cross-platform compatibility
  const tempFile = path.join(os.tmpdir(), `commit-msg-${Date.now()}.txt`)
  
  try {
    // Write commit message to temporary file
    fs.writeFileSync(tempFile, messageWithCoAuthor, 'utf8')
    
    // Use git commit with -F flag to read from file
    execSync(`git commit -F "${tempFile}"`, {
      stdio: 'inherit', // Show git output for better user experience
      maxBuffer
    })
  } catch (error) {
    // Fallback to simple commit without co-author if temp file approach fails
    try {
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', maxBuffer })
    } catch (fallbackError) {
      // Re-throw the original error
      throw error
    }
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(tempFile)
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Cross-platform commit function that supports multiline messages
 */
export function commitChangesMultiline(title: string, bodyLines: string[] = []) {
  let commitMessage = title
  
  if (bodyLines.length > 0) {
    commitMessage += '\n\n' + bodyLines.join('\n')
  }
  
  commitChanges(commitMessage)
}

export function stageAllChanges(): boolean {
  try {
    execSync('git add -A', { stdio: 'pipe', maxBuffer })
    return hasStagedChanges()
  } catch (error) {
    return false
  }
}

export function stagePatches(dir: string, changes: FileChanges): boolean {
  try {
    const fileNames = changes.map((change) => change.path)
    const existingFileNames = fileNames.filter((filePath) =>
      fs.existsSync(path.join(dir, filePath)),
    )

    if (existingFileNames.length === 0) {
      return false
    }

    execSync(`git add ${existingFileNames.join(' ')}`, { cwd: dir, maxBuffer })
    return hasStagedChanges()
  } catch (error) {
    console.error('Error in stagePatches:', error)
    return false
  }
}

/**
 * Safely escapes a git commit message for cross-platform use
 * This is used as a fallback when temp file approach fails
 */
export function escapeCommitMessage(message: string): string {
  const platform = os.platform()
  
  if (platform === 'win32') {
    // Windows cmd.exe escaping
    return message
      .replace(/"/g, '""')  // Escape double quotes
      .replace(/\n/g, ' ')  // Replace newlines with spaces for simple commit
  } else {
    // Unix shell escaping
    return message
      .replace(/'/g, "'\"'\"'")  // Escape single quotes
      .replace(/\\/g, '\\\\')   // Escape backslashes
  }
}
