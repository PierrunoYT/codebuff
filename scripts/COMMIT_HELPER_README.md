# Cross-Platform Git Commit Helper

This directory contains tools to resolve heredoc issues when committing on Windows and ensure consistent cross-platform git commit behavior.

## Problem Solved

The original issue was that heredoc syntax (`<<'EOF'`) used in commit messages only works in bash/Unix shells and fails on Windows Command Prompt. This caused commit failures on Windows systems.

## Files

### Core Scripts
- **`commit-helper.js`** - Main Node.js script that handles cross-platform commits
- **`commit.bat`** - Windows batch wrapper
- **`commit.sh`** - Unix/Linux/macOS shell wrapper

### Utility Libraries
- **`../common/src/util/git-cross-platform.ts`** - TypeScript utility functions for cross-platform git operations

## Usage

### Command Line

#### Windows
```batch
scripts\commit.bat "Your commit message"
scripts\commit.bat "Title" "Body line 1" "Body line 2"
```

#### Unix/Linux/macOS
```bash
scripts/commit.sh "Your commit message"
scripts/commit.sh "Title" "Body line 1" "Body line 2"
```

#### Direct Node.js (Cross-platform)
```bash
node scripts/commit-helper.js "Your commit message"
node scripts/commit-helper.js "Title" "Body line 1" "Body line 2"
```

### Programmatic Usage

#### TypeScript/JavaScript
```typescript
import { commitChanges, commitChangesMultiline } from '../common/src/util/git-cross-platform'

// Simple commit
commitChanges("Fix bug in authentication")

// Multiline commit
commitChangesMultiline("Add new feature", [
  "- Implemented user authentication",
  "- Added comprehensive tests",
  "- Updated documentation"
])
```

#### ES Modules
```javascript
import { createCommitMessage, commitWithTempFile } from './scripts/commit-helper.js'

const message = createCommitMessage(["Fix critical bug"])
commitWithTempFile(message)
```

## Features

### ✅ Cross-Platform Compatibility
- Works on Windows (cmd.exe, PowerShell)
- Works on Unix/Linux/macOS (bash, zsh, fish)
- Handles different line ending conventions

### ✅ Automatic Co-Author Attribution
All commits automatically include:
```
Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
```

### ✅ Multiline Message Support
- Supports complex commit messages with titles and body
- Handles special characters and quotes safely
- No heredoc syntax issues

### ✅ Fallback Mechanisms
- Primary: Temporary file method (most reliable)
- Fallback: Direct git commit (if temp file fails)
- Graceful error handling

## Technical Details

### How It Works

1. **Input Processing**: Accepts single or multiple arguments for commit messages
2. **Message Formatting**: Combines title and body lines with proper spacing
3. **Co-Author Addition**: Automatically appends factory-droid attribution
4. **Temporary File Method**: Writes message to temp file and uses `git commit -F`
5. **Cleanup**: Removes temporary files after commit

### Why Temporary Files?

The temporary file approach (`git commit -F file`) is used because:
- Avoids shell escaping issues across different platforms
- Handles multiline messages reliably
- Works with any special characters or quotes
- No heredoc syntax required

### Platform-Specific Considerations

#### Windows
- Escapes double quotes in messages
- Uses Windows-style paths for temp files
- Compatible with both cmd.exe and PowerShell

#### Unix/Linux/macOS
- Escapes single quotes and backslashes
- Uses POSIX-style paths
- Compatible with bash, zsh, fish shells

## Error Handling

The helper includes multiple fallback mechanisms:
1. Try temp file approach with co-author
2. Fall back to simple git commit if temp file fails
3. Provide clear error messages for debugging

## Examples

### Simple Commit
```bash
node scripts/commit-helper.js "Fix typo in README"
```
Results in:
```
Fix typo in README

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
```

### Complex Multiline Commit
```bash
node scripts/commit-helper.js "Add cross-platform commit helper" "Resolves heredoc issues on Windows" "- Created commit-helper.js script" "- Added Windows batch wrapper" "- Added Unix shell wrapper"
```
Results in:
```
Add cross-platform commit helper

Resolves heredoc issues on Windows
- Created commit-helper.js script
- Added Windows batch wrapper
- Added Unix shell wrapper

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
```

## Integration

This helper can be integrated into:
- Build scripts and CI/CD pipelines
- Development workflows
- Automated commit processes
- IDE extensions and tools

The TypeScript utilities in `git-cross-platform.ts` provide a clean API for programmatic use within the Codebuff codebase.
