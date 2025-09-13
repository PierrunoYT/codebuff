#!/bin/bash
# Cross-platform Git Commit Helper for Unix/Linux/macOS
# Usage: scripts/commit.sh "Commit message"
#        scripts/commit.sh "Title" "Body line 1" "Body line 2"

if [ $# -eq 0 ]; then
    echo "Error: Commit message is required"
    echo "Usage: scripts/commit.sh \"Commit message\""
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/commit-helper.js" "$@"
