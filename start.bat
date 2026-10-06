@echo off
title LAN Screen Share Server
echo Starting LAN Screen Share server...
cd /d "%~dp0"
bun dev
pause
