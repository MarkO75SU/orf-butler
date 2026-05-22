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
if %ERRORLEVEL% NEQ 0 (
    echo   [HINWEIS] Node.js wurde nicht gefunden.
    echo   Viele Tools brauchen Node.js (z.B. Continue, OpenCode).
    echo   Download: https://nodejs.org (Version 18 oder neuer)
    echo.
) else (
    echo   [OK] Node.js ist installiert.
)
echo.
echo Kopiere Config-Dateien an die richtigen Orte...
echo.

set INSTALLED=0
set SKIPPED=0

call :try_copy "opencode-config.json" "%APPDATA%\opencode\opencode.json"
call :try_copy "continue-config.json" "%USERPROFILE%\.continue\config.json"
call :try_copy "zed-config.json" "%APPDATA%\Zed\settings.json"
call :try_copy "aider-config.json" "%CD%\.aider.conf.yml"
call :try_copy "antigravity-config.json" "%CD%\settings.yaml"
echo   [SKIP] Amazon Q: Nur im Browser nutzbar
call :try_copy "cursor-config.json" "%CD%\.cursorrules"
call :try_copy "windsurf-config.json" "%CD%\.windsurfrules"
call :try_copy "claude-code-config.json" "%CD%\CLAUDE.md"
call :try_copy "github-copilot-config.json" "%CD%\.github\copilot-instructions.md"
call :try_copy "cline-config.json" "%CD%\.clinerules"
call :try_copy "codeium-config.json" "%CD%\.codeiumrules"

echo.
echo ============================================
echo   Fertig! %INSTALLED% installiert, %SKIPPED% uebersprungen.
echo   Starte dein Tool neu.
echo ============================================
pause
exit /b 0

:try_copy
set "SRC=%~1"
set "DEST=%~2"
set "TOOL=%~n1"
set "TOOL=%TOOL:-config=%"

if not exist "%SRC%" (
    set /a SKIPPED+=1
    goto :eof
)

set "DESTDIR=%~dp2"
if not exist "%DESTDIR%" mkdir "%DESTDIR%" 2>nul

if exist "%DEST%" (
    copy "%DEST%" "%DEST%.backup" >nul 2>nul
    echo   [BACKUP] Alte %TOOL%-Config gesichert
)

copy "%SRC%" "%DEST%" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   [OK] %TOOL%
    set /a INSTALLED+=1
) else (
    echo   [FEHLER] %TOOL%
    set /a SKIPPED+=1
)
goto :eof
