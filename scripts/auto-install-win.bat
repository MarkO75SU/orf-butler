@echo off
title ORF-Butler Installation
cd /d "%~dp0"

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
set installed_tools=

call :safe_copy "opencode-config.json" "%USERPROFILE%\.config\opencode\opencode.json" "OpenCode CLI" "opencode"
call :safe_copy "opencode-desktop-config.json" "%USERPROFILE%\.config\opencode\opencode.json" "OpenCode Desktop" "opencode_desktop"
call :safe_copy "continue-config.json" "%USERPROFILE%\.continue\config.json" "VS Code (Continue)" "continue"
call :safe_copy "zed-config.json" "%APPDATA%\Zed\settings.json" "Zed Editor" "zed"
call :safe_copy "aider-config.json" ".\aider.conf.yml" "Aider CLI" "aider"
call :safe_copy "antigravity-config.json" "settings.yaml" "Antigravity" "antigravity"
echo   [SKIP] Amazon Q - Nur im Browser nutzbar
call :safe_copy "cursor-config.json" ".cursorrules" "Cursor Editor" "cursor"
call :safe_copy "windsurf-config.json" ".windsurfrules" "Windsurf Editor" "windsurf"
call :safe_copy "claude-code-config.json" "CLAUDE.md" "Claude Code CLI" "claude_code"
call :safe_copy "github-copilot-config.json" ".github\copilot-instructions.md" "GitHub Copilot" "github_copilot"
call :safe_copy "cline-config.json" ".clinerules" "Cline" "cline"
call :safe_copy "codeium-config.json" ".codeiumrules" "Codeium" "codeium"

echo.
echo ============================================
echo            ZUSAMMENFASSUNG
echo ============================================
if !INSTALLED! equ 0 (
  echo.
  echo   Es wurden KEINE Config-Dateien gefunden.
  echo   Lege dieses Skript in den Ordner mit den
  echo   -config.json und -INSTALL.md Dateien.
  echo.
  echo   Alternativ verwalte die Configs manuell
  echo   mit "node auto-install.js" im Terminal.
  echo.
) else (
  echo   Erfolgreich installiert: !INSTALLED!
  echo.
)
echo   DETAILS: Fuers Mergen und Auskommentieren
echo   nutze "node auto-install.js" im Terminal.
echo.
echo   Die Schritt-fuer-Schritt Anleitungen stehen
echo   in den *_INSTALL.md Dateien im ZIP-Ordner.
echo.

echo.
echo   WICHTIG: Enthaelt eine Config noch DEIN_API_KEY_HERE?
echo   Dann die Datei im Editor oeffnen und durch echten
echo   OpenRouter-API-Key ersetzen (openrouter.ai/keys).
echo.
echo   Fuer Merge/Auskommentieren/Optionen:
echo     "node auto-install.js" im Terminal ausfuehren.
echo.
echo   Starte dein Tool neu.
echo.
echo   ============================================
echo   Druecke eine beliebige Taste zum Schliessen.
echo   ============================================
pause
goto :EOF

:safe_copy
set SRC=%~1
set DEST=%~2
set LABEL=%~3
set TOOLKEY=%~4
if not exist "%SRC%" exit /b 0
set DESTDIR=%~dp2
if not exist "!DESTDIR!" mkdir "!DESTDIR!"
if exist "%DEST%" (
  echo   [INFO] %LABEL%: Config existiert bereits.
  set /p "CHOICE=  Ueberschreiben? (j/n, Enter = ueberspringen): "
  if /i not "!CHOICE!"=="j" (
    echo   [WARN] %LABEL%: Uebersprungen
    exit /b 0
  )
  copy "%DEST%" "%DEST%.backup" >nul
  echo   [BACKUP] %LABEL%: alte Config gesichert
)
copy "%SRC%" "%DEST%" >nul
if errorlevel 1 (
  echo   [FEHLER] %LABEL%
) else (
  echo   [OK] %LABEL%
  set /a INSTALLED+=1
  set installed_tools=!installed_tools! %TOOLKEY%
)
exit /b 0
