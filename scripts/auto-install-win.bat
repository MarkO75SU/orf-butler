@echo off
title ORF-Butler Installation
cd /d "%~dp0"
cls
echo ============================================
echo    ORF-Butler Auto-Installer
echo    OpenRouter Free Butler - Konfiguration
echo ============================================
echo.
echo Pruefe ob Node.js installiert ist...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo FEHLER: Node.js ist nicht installiert!
    echo.
    echo Bitte lade Node.js kostenlos herunter von:
    echo https://nodejs.org (Version 18 oder neuer)
    echo.
    echo Nach der Installation starte diese Datei erneut.
    echo.
    pause
    exit /b 1
)

echo Node.js gefunden. Starte Installation...
echo.
node "%~dp0auto-install.js"
echo.
echo ============================================
echo    Installation abgeschlossen!
echo    Druecke eine Taste zum Schliessen...
echo ============================================
pause
