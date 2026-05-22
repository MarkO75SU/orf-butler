@echo off
title ORF-Butler Installation
cd /d "%~dp0"
cls
echo ============================================
echo    ORF-Butler Auto-Installer
echo    OpenRouter Free Butler - Konfiguration
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [HINWEIS] Node.js nicht gefunden.
  echo   Download: https://nodejs.org (Version 18+)
  echo.
) else (
  echo   [OK] Node.js ist installiert.
)
echo.

set APIKEY=
set /p "APIKEY=OpenRouter API Key (optional - Enter zum Ueberspringen): "
echo.

if not "%APIKEY%"=="" (
  echo Setze API-Key in Configs ein...
  powershell -Command "$k='%APIKEY:''=''%'; Get-ChildItem '.' -Include '*-config.json','*.yml','*.yaml' -Name | ForEach-Object { $c = Get-Content $_ -Raw; $c = $c -replace 'DEIN_API_KEY_HERE', $k; Set-Content $_ $c }; Write-Host '  [OK] API-Key eingetragen'"
  echo.
)

echo Kopiere Config-Dateien...
echo.

setlocal enabledelayedexpansion
set INSTALLED=0
set SKIPPED=0

if exist "opencode-config.json" (
  if not exist "%APPDATA%\opencode" mkdir "%APPDATA%\opencode"
  if exist "%APPDATA%\opencode\opencode.json" copy "%APPDATA%\opencode\opencode.json" "%APPDATA%\opencode\opencode.json.backup" >nul
  copy "opencode-config.json" "%APPDATA%\opencode\opencode.json" >nul
  if errorlevel 1 (echo   [FEHLER] OpenCode CLI) else (echo   [OK] OpenCode CLI & set /a INSTALLED+=1)
)

if exist "continue-config.json" (
  if not exist "%USERPROFILE%\.continue" mkdir "%USERPROFILE%\.continue"
  if exist "%USERPROFILE%\.continue\config.json" copy "%USERPROFILE%\.continue\config.json" "%USERPROFILE%\.continue\config.json.backup" >nul
  copy "continue-config.json" "%USERPROFILE%\.continue\config.json" >nul
  if errorlevel 1 (echo   [FEHLER] Continue) else (echo   [OK] Continue & set /a INSTALLED+=1)
)

if exist "zed-config.json" (
  if not exist "%APPDATA%\Zed" mkdir "%APPDATA%\Zed"
  if exist "%APPDATA%\Zed\settings.json" copy "%APPDATA%\Zed\settings.json" "%APPDATA%\Zed\settings.json.backup" >nul
  copy "zed-config.json" "%APPDATA%\Zed\settings.json" >nul
  if errorlevel 1 (echo   [FEHLER] Zed Editor) else (echo   [OK] Zed Editor & set /a INSTALLED+=1)
)

if exist "aider-config.json" (
  if exist ".aider.conf.yml" copy ".aider.conf.yml" ".aider.conf.yml.backup" >nul
  copy "aider-config.json" ".aider.conf.yml" >nul
  if errorlevel 1 (echo   [FEHLER] Aider CLI) else (echo   [OK] Aider CLI & set /a INSTALLED+=1)
)

if exist "antigravity-config.json" (
  if exist "settings.yaml" copy "settings.yaml" "settings.yaml.backup" >nul
  copy "antigravity-config.json" "settings.yaml" >nul
  if errorlevel 1 (echo   [FEHLER] Antigravity) else (echo   [OK] Antigravity & set /a INSTALLED+=1)
)

echo   [SKIP] Amazon Q - Nur im Browser nutzbar

if exist "cursor-config.json" (
  if exist ".cursorrules" copy ".cursorrules" ".cursorrules.backup" >nul
  copy "cursor-config.json" ".cursorrules" >nul
  if errorlevel 1 (echo   [FEHLER] Cursor Editor) else (echo   [OK] Cursor Editor & set /a INSTALLED+=1)
)

if exist "windsurf-config.json" (
  if exist ".windsurfrules" copy ".windsurfrules" ".windsurfrules.backup" >nul
  copy "windsurf-config.json" ".windsurfrules" >nul
  if errorlevel 1 (echo   [FEHLER] Windsurf Editor) else (echo   [OK] Windsurf Editor & set /a INSTALLED+=1)
)

if exist "claude-code-config.json" (
  if exist "CLAUDE.md" copy "CLAUDE.md" "CLAUDE.md.backup" >nul
  copy "claude-code-config.json" "CLAUDE.md" >nul
  if errorlevel 1 (echo   [FEHLER] Claude Code CLI) else (echo   [OK] Claude Code CLI & set /a INSTALLED+=1)
)

if exist "github-copilot-config.json" (
  if not exist ".github" mkdir ".github"
  if exist ".github\copilot-instructions.md" copy ".github\copilot-instructions.md" ".github\copilot-instructions.md.backup" >nul
  copy "github-copilot-config.json" ".github\copilot-instructions.md" >nul
  if errorlevel 1 (echo   [FEHLER] GitHub Copilot) else (echo   [OK] GitHub Copilot & set /a INSTALLED+=1)
)

if exist "cline-config.json" (
  if exist ".clinerules" copy ".clinerules" ".clinerules.backup" >nul
  copy "cline-config.json" ".clinerules" >nul
  if errorlevel 1 (echo   [FEHLER] Cline) else (echo   [OK] Cline & set /a INSTALLED+=1)
)

if exist "codeium-config.json" (
  if exist ".codeiumrules" copy ".codeiumrules" ".codeiumrules.backup" >nul
  copy "codeium-config.json" ".codeiumrules" >nul
  if errorlevel 1 (echo   [FEHLER] Codeium) else (echo   [OK] Codeium & set /a INSTALLED+=1)
)

echo.
echo ============================================
echo   Fertig - !INSTALLED! Configs installiert
echo   Starte dein Tool neu.
echo ============================================
pause