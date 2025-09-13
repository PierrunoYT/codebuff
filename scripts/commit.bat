@echo off
REM Cross-platform Git Commit Helper for Windows
REM Usage: scripts\commit.bat "Commit message"
REM        scripts\commit.bat "Title" "Body line 1" "Body line 2"

if "%1"=="" (
    echo Error: Commit message is required
    echo Usage: scripts\commit.bat "Commit message"
    exit /b 1
)

node "%~dp0commit-helper.js" %*
