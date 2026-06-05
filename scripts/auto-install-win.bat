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

if exist "opencode-config.json" (
  if not exist "%USERPROFILE%\.config\opencode" mkdir "%USERPROFILE%\.config\opencode"
  if exist "%USERPROFILE%\.config\opencode\opencode.json" (
    copy "%USERPROFILE%\.config\opencode\opencode.json" "%USERPROFILE%\.config\opencode\opencode.json.backup" >nul
    echo   [BACKUP] OpenCode CLI: alte Config gesichert
  )
  copy "opencode-config.json" "%USERPROFILE%\.config\opencode\opencode.json" >nul
  if errorlevel 1 (echo   [FEHLER] OpenCode CLI) else (echo   [OK] OpenCode CLI & set /a INSTALLED+=1 & set installed_tools=!installed_tools! opencode)
)

if exist "opencode-desktop-config.json" (
  if not exist "%USERPROFILE%\.config\opencode" mkdir "%USERPROFILE%\.config\opencode"
  if exist "%USERPROFILE%\.config\opencode\opencode.json" (
    copy "%USERPROFILE%\.config\opencode\opencode.json" "%USERPROFILE%\.config\opencode\opencode.json.backup" >nul
    echo   [BACKUP] OpenCode Desktop: alte Config gesichert
  )
  copy "opencode-desktop-config.json" "%USERPROFILE%\.config\opencode\opencode.json" >nul
  if errorlevel 1 (echo   [FEHLER] OpenCode Desktop) else (echo   [OK] OpenCode Desktop & set /a INSTALLED+=1 & set installed_tools=!installed_tools! opencode_desktop)
)

if exist "continue-config.json" (
  if not exist "%USERPROFILE%\.continue" mkdir "%USERPROFILE%\.continue"
  if exist "%USERPROFILE%\.continue\config.json" (
    copy "%USERPROFILE%\.continue\config.json" "%USERPROFILE%\.continue\config.json.backup" >nul
    echo   [BACKUP] Continue: alte Config gesichert
  )
  copy "continue-config.json" "%USERPROFILE%\.continue\config.json" >nul
  if errorlevel 1 (echo   [FEHLER] Continue) else (echo   [OK] Continue & set /a INSTALLED+=1 & set installed_tools=!installed_tools! continue)
)

if exist "zed-config.json" (
  if not exist "%APPDATA%\Zed" mkdir "%APPDATA%\Zed"
  if exist "%APPDATA%\Zed\settings.json" (
    copy "%APPDATA%\Zed\settings.json" "%APPDATA%\Zed\settings.json.backup" >nul
    echo   [BACKUP] Zed: alte Config gesichert
  )
  copy "zed-config.json" "%APPDATA%\Zed\settings.json" >nul
  if errorlevel 1 (echo   [FEHLER] Zed Editor) else (echo   [OK] Zed Editor & set /a INSTALLED+=1 & set installed_tools=!installed_tools! zed)
)

if exist "aider-config.json" (
  if exist ".aider.conf.yml" (
    copy ".aider.conf.yml" ".aider.conf.yml.backup" >nul
    echo   [BACKUP] Aider: alte Config gesichert
  )
  copy "aider-config.json" ".aider.conf.yml" >nul
  if errorlevel 1 (echo   [FEHLER] Aider CLI) else (echo   [OK] Aider CLI & set /a INSTALLED+=1 & set installed_tools=!installed_tools! aider)
)

if exist "antigravity-config.json" (
  if exist "settings.yaml" (
    copy "settings.yaml" "settings.yaml.backup" >nul
    echo   [BACKUP] Antigravity: alte Config gesichert
  )
  copy "antigravity-config.json" "settings.yaml" >nul
  if errorlevel 1 (echo   [FEHLER] Antigravity) else (echo   [OK] Antigravity & set /a INSTALLED+=1 & set installed_tools=!installed_tools! antigravity)
)

echo   [SKIP] Amazon Q - Nur im Browser nutzbar

if exist "cursor-config.json" (
  if exist ".cursorrules" (
    copy ".cursorrules" ".cursorrules.backup" >nul
    echo   [BACKUP] Cursor: alte Config gesichert
  )
  copy "cursor-config.json" ".cursorrules" >nul
  if errorlevel 1 (echo   [FEHLER] Cursor Editor) else (echo   [OK] Cursor Editor & set /a INSTALLED+=1 & set installed_tools=!installed_tools! cursor)
)

if exist "windsurf-config.json" (
  if exist ".windsurfrules" (
    copy ".windsurfrules" ".windsurfrules.backup" >nul
    echo   [BACKUP] Windsurf: alte Config gesichert
  )
  copy "windsurf-config.json" ".windsurfrules" >nul
  if errorlevel 1 (echo   [FEHLER] Windsurf Editor) else (echo   [OK] Windsurf Editor & set /a INSTALLED+=1 & set installed_tools=!installed_tools! windsurf)
)

if exist "claude-code-config.json" (
  if exist "CLAUDE.md" (
    copy "CLAUDE.md" "CLAUDE.md.backup" >nul
    echo   [BACKUP] Claude Code: alte Config gesichert
  )
  copy "claude-code-config.json" "CLAUDE.md" >nul
  if errorlevel 1 (echo   [FEHLER] Claude Code CLI) else (echo   [OK] Claude Code CLI & set /a INSTALLED+=1 & set installed_tools=!installed_tools! claude_code)
)

if exist "github-copilot-config.json" (
  if not exist ".github" mkdir ".github"
  if exist ".github\copilot-instructions.md" (
    copy ".github\copilot-instructions.md" ".github\copilot-instructions.md.backup" >nul
    echo   [BACKUP] GitHub Copilot: alte Config gesichert
  )
  copy "github-copilot-config.json" ".github\copilot-instructions.md" >nul
  if errorlevel 1 (echo   [FEHLER] GitHub Copilot) else (echo   [OK] GitHub Copilot & set /a INSTALLED+=1 & set installed_tools=!installed_tools! github_copilot)
)

if exist "cline-config.json" (
  if exist ".clinerules" (
    copy ".clinerules" ".clinerules.backup" >nul
    echo   [BACKUP] Cline: alte Config gesichert
  )
  copy "cline-config.json" ".clinerules" >nul
  if errorlevel 1 (echo   [FEHLER] Cline) else (echo   [OK] Cline & set /a INSTALLED+=1 & set installed_tools=!installed_tools! cline)
)

if exist "codeium-config.json" (
  if exist ".codeiumrules" (
    copy ".codeiumrules" ".codeiumrules.backup" >nul
    echo   [BACKUP] Codeium: alte Config gesichert
  )
  copy "codeium-config.json" ".codeiumrules" >nul
  if errorlevel 1 (echo   [FEHLER] Codeium) else (echo   [OK] Codeium & set /a INSTALLED+=1 & set installed_tools=!installed_tools! codeium)
)

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

for %%t in (!installed_tools!) do (
  if "%%t"=="continue" (
    echo   VS Code (Continue Extension):
    echo   1. Continue Extension installiert? (VS Code - Extensions - "Continue")
    echo   2. VS Code neu starten
    echo   3. Strg+Shift+P - "Continue: Open Chat"
    echo   4. Chat unten rechts zeigt dein Modell an
    echo.
  )
  if "%%t"=="opencode" (
    echo   OpenCode CLI:
    echo   1. npm install -g opencode
    echo   2. Terminal: opencode
    echo.
  )
  if "%%t"=="opencode_desktop" (
    echo   OpenCode Desktop:
    echo   1. Download: opencode.ai/download
    echo   2. App starten - Modell in Einstellungen waehlen
    echo.
  )
  if "%%t"=="cursor" (
    echo   Cursor Editor:
    echo   1. Cursor Editor installieren (cursor.com)
    echo   2. Im Projektordner: .cursorrules wurde installiert
    echo   3. Cursor Chat oeffnen (Strg+I)
    echo   4. Modell auf OpenRouter umstellen
    echo.
  )
  if "%%t"=="windsurf" (
    echo   Windsurf Editor:
    echo   1. Windsurf installieren (codeium.com/windsurf)
    echo   2. Cascade oeffnen - Modell auf OpenRouter
    echo.
  )
  if "%%t"=="zed" (
    echo   Zed Editor:
    echo   1. Zed oeffnen
    echo   2. Assistant-Panel (Strg+R)
    echo   3. Modell sollte als "ORF" erscheinen
    echo.
  )
  if "%%t"=="aider" (
    echo   Aider CLI:
    echo   1. pip install aider-install
    echo   2. Terminal: aider --model openrouter/DEIN_MODELL
    echo.
  )
  if "%%t"=="claude_code" (
    echo   Claude Code CLI:
    echo   1. npm install -g @anthropic-ai/claude-code
    echo   2. Terminal im Projekt: claude
    echo.
  )
  if "%%t"=="github_copilot" (
    echo   GitHub Copilot:
    echo   1. GitHub Copilot in VS Code installiert + Abo?
    echo   2. VS Code neu starten - Instructions werden genutzt
    echo.
  )
  if "%%t"=="cline" (
    echo   Cline (VS Code Extension):
    echo   1. Cline Extension installieren
    echo   2. VS Code - Cline-Symbol in Sidebar
    echo   3. OpenRouter-Modell auswaehlen
    echo.
  )
  if "%%t"=="codeium" (
    echo   Codeium:
    echo   1. Codeium Extension installieren
    echo   2. .codeiumrules im Projekt wird gelesen
    echo.
  )
  if "%%t"=="antigravity" (
    echo   Antigravity:
    echo   1. Antigravity starten
    echo   2. Config wird automatisch geladen
    echo.
  )
)

echo.
echo   WICHTIG: Enthaelt eine Config noch DEIN_API_KEY_HERE?
echo   Dann die Datei im Editor oeffnen und durch echten
echo   OpenRouter-API-Key ersetzen (openrouter.ai/keys).
echo.
echo   Fuer Merge/Auskommentieren/Optionen:
echo     "node auto-install.js" im Terminal ausfuehren.
echo.
echo   Starte dein Tool neu.
pause
