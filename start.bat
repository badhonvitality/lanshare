@echo off
title LAN Screen Share Server
cd /d "%~dp0"

echo ===================================
echo   LAN Screen Share Initialization
echo ===================================
echo.

if not exist "node_modules\" (
    echo [1/3] Dependencies not found. Installing via bun...
    bun install
) else (
    echo [1/3] Dependencies found.
)

if not exist ".next\" (
    echo [2/3] Build folder not found. Building Next.js app...
    bun run build
) else (
    echo [2/3] Build folder found.
)

echo.
echo [3/3] Starting server in production mode...
bun run start
pause
