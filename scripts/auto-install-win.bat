@echo off
title ORF-Butler Installation
cd /d "%~dp0"

set LOGFILE=install-log.txt
echo ORF-Butler Auto-Installer Log > "%LOGFILE%"
echo Datum: %DATE% %TIME% >> "%LOGFILE%"
echo ---------------------------------------- >> "%LOGFILE%"

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
echo   OpenRouter API-Key (optional):
echo     Nur lokal in der Config gespeichert, kein Server-Versand.
echo     Ohne Key: DEIN_API_KEY_HERE bleibt stehen, spaeter ersetzbar.
set /p "APIKEY=  Key eingeben oder Enter zum Ueberspringen: "
echo.

if not "%APIKEY%"=="" (
  echo Setze API-Key in Configs ein...
  powershell -Command "$k='%APIKEY:''=''%'; Get-ChildItem '.' -Include '*-config.json','*.yml','*.yaml' -Name | ForEach-Object { $c = Get-Content $_ -Raw; $c = $c -replace 'DEIN_API_KEY_HERE', $k; Set-Content $_ $c }; Write-Host '  [OK] API-Key eingetragen'"
  echo.
)

set /p "PREVIEW=Config vor dem Speichern pruefen? (j/n, Enter=nein): "
echo.
echo Kopiere Config-Dateien...
echo.

setlocal enabledelayedexpansion
set INSTALLED=0
set installed_tools=

call :safe_copy "opencode-config.json" "%USERPROFILE%\.config\opencode\opencode.json" "OpenCode CLI" "opencode"
call :safe_copy "continue-config.json" "%USERPROFILE%\.continue\config.json" "VS Code (Continue)" "continue"
call :safe_copy "zed-config.json" "%APPDATA%\Zed\settings.json" "Zed Editor" "zed"
call :safe_copy "aider-config.json" ".\aider.conf.yml" "Aider CLI" "aider"
call :safe_copy "antigravity-config.json" "settings.yaml" "Antigravity" "antigravity"
call :safe_copy "cursor-config.json" ".cursorrules" "Cursor Editor" "cursor"
call :safe_copy "windsurf-config.json" ".windsurfrules" "Windsurf Editor" "windsurf"
call :safe_copy "claude-code-config.json" "CLAUDE.md" "Claude Code CLI" "claude_code"
call :safe_copy "github-copilot-config.json" ".github\copilot-instructions.md" "GitHub Copilot" "github_copilot"
call :safe_copy "cline-config.json" ".clinerules" "Cline" "cline"
call :safe_copy "codeium-config.json" ".codeiumrules" "Codeium" "codeium"
call :safe_copy "litellm-config.json" "litellm_config.yaml" "LiteLLM" "litellm"
call :safe_copy "cody-config.json" ".cody\config.json" "Cody" "cody"
call :safe_copy "tabby-config.json" "tabby_config.json" "Tabby" "tabby"

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
echo.
echo   Die Schritt-fuer-Schritt Anleitungen stehen
echo   in den *_INSTALL.md Dateien im ZIP-Ordner.
echo.

echo.
echo   WICHTIG: Enthaelt eine Config noch DEIN_API_KEY_HERE?
echo   Dann die Datei im Editor oeffnen und durch echten
echo   OpenRouter-API-Key ersetzen (openrouter.ai/keys).
echo.
echo.
echo   Starte dein Tool neu.
echo.
echo   Log: %LOGFILE%
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

if exist "manifest.txt" (
  set /p MANIFEST=<manifest.txt
  echo !MANIFEST! | findstr /C:"%TOOLKEY%" >nul
  if errorlevel 1 (
    exit /b 0
  )
)

set DESTDIR=%~dp2
if not exist "!DESTDIR!" mkdir "!DESTDIR!" 2>nul
if not exist "%DEST%" (
  if /i "!PREVIEW!"=="j" (
    echo.
    echo ============================================
    echo   Vorschau: %LABEL%
    echo ============================================
    type "%SRC%"
    echo.
    echo   Speichern unter %DEST%?
    set /p "CONFIRM=  [j] Ja / [n] In Downloads: "
    if /i "!CONFIRM!"=="n" set "DEST=%USERPROFILE%\Downloads\%~nx1"
  )
  copy "%SRC%" "%DEST%" >nul
  if errorlevel 1 (
    echo   [FEHLER] %LABEL%
    echo   [FEHLER] %LABEL%: %SRC% -^> %DEST% >> "%LOGFILE%"
    echo.
    echo   FEHLER bei %LABEL%. Druecke eine Taste...
    pause >nul
  ) else (
    echo   [OK] %LABEL%
    echo   [OK] %LABEL%: %DEST% >> "%LOGFILE%"
    set /a INSTALLED+=1
    set installed_tools=!installed_tools! %TOOLKEY%
  )
  exit /b 0
)

copy "%DEST%" "%DEST%.backup" >nul
echo   [BACKUP] %LABEL%: alte Config gesichert
echo   [BACKUP] %DEST%.backup >> "%LOGFILE%"

echo.
echo   %LABEL%: Config existiert bereits unter %DEST%
echo     [1] Ueberschreiben (Backup vorhanden)
echo     [2] Auskommentieren + neue daneben
echo     [3] Beide Inhalte mergen (nur JSON)
echo     [s] Ueberspringen (nichts tun)
set /p "CHOICE=  > "

if /i "!CHOICE!"=="s" (
  echo   [WARN] %LABEL%: Uebersprungen
  echo   [SKIPPED] %LABEL% >> "%LOGFILE%"
  exit /b 0
)

if "!CHOICE!"=="1" (
  if /i "!PREVIEW!"=="j" (
    echo.
    echo ============================================
    echo   Vorschau: %LABEL%
    echo ============================================
    type "%SRC%"
    echo.
    set /p "CONFIRM=  Wirklich speichern unter %DEST%? (j/n): "
    if /i not "!CONFIRM!"=="j" (
      echo   [WARN] %LABEL%: Abgebrochen
      echo   [SKIPPED] %LABEL% >> "%LOGFILE%"
      exit /b 0
    )
  )
  copy "%SRC%" "%DEST%" >nul
  if errorlevel 1 (
    echo   [FEHLER] %LABEL%
    echo   [FEHLER] %LABEL%: Ueberschreiben fehlgeschlagen >> "%LOGFILE%"
    echo.
    echo   FEHLER bei %LABEL%. Druecke eine Taste...
    pause >nul
  ) else (
    echo   [OK] %LABEL%: Ueberschrieben
    echo   [OVERWRITTEN] %LABEL%: %DEST% >> "%LOGFILE%"
    set /a INSTALLED+=1
    set installed_tools=!installed_tools! %TOOLKEY%
  )
  exit /b 0
)

if "!CHOICE!"=="2" (
  if /i "!PREVIEW!"=="j" (
    echo.
    echo ============================================
    echo   Vorschau: %LABEL%
    echo ============================================
    type "%SRC%"
    echo.
    set /p "CONFIRM=  Wirklich speichern unter %DEST%? (j/n): "
    if /i not "!CONFIRM!"=="j" (
      echo   [WARN] %LABEL%: Abgebrochen
      echo   [SKIPPED] %LABEL% >> "%LOGFILE%"
      exit /b 0
    )
  )
  powershell -Command "$c=Get-Content '%DEST%'; $ext=[System.IO.Path]::GetExtension('%DEST%'); $pre='// '; if($ext -eq '.yml' -or $ext -eq '.yaml'){$pre='# '}; $commented=$c -replace '^', $pre; \"$commented`n`n// --- ORF-Butler Config ---`n\"+ (Get-Content '%SRC%') | Set-Content '%DEST%'"
  if errorlevel 1 (
    echo   [FEHLER] %LABEL%
    echo   [FEHLER] %LABEL%: Auskommentieren fehlgeschlagen >> "%LOGFILE%"
    echo.
    echo   FEHLER bei %LABEL%. Druecke eine Taste...
    pause >nul
  ) else (
    echo   [OK] %LABEL%: Alte auskommentiert + neue geschrieben
    echo   [COMMENTED] %LABEL%: %DEST% >> "%LOGFILE%"
    set /a INSTALLED+=1
    set installed_tools=!installed_tools! %TOOLKEY%
  )
  exit /b 0
)

if "!CHOICE!"=="3" (
  set EXT=%SRC:~-5%
  if /i not "!EXT!"==".json" (
    echo   [WARN] %LABEL%: Merge nur bei JSON - uebersprungen
    echo   [SKIPPED] %LABEL%: kein JSON >> "%LOGFILE%"
    exit /b 0
  )
  set MERGE_TMP=%TEMP%\orf-merge-%RANDOM%.json
  where node >nul 2>nul
  if errorlevel 1 (
    powershell -Command "$a=Get-Content '%DEST%'|ConvertFrom-Json; $b=Get-Content '%SRC%'|ConvertFrom-Json; $m=@{}; $a.PSObject.Properties|%%{$m[$_.Name]=$_.Value}; $b.PSObject.Properties|%%{$m[$_.Name]=$_.Value}; $m|ConvertTo-Json -Depth 10|Set-Content '!MERGE_TMP!'"
  ) else (
    set "NODE_DEST=!DEST!"
    set "NODE_SRC=!SRC!"
    set "NODE_OUT=!MERGE_TMP!"
    node -e "var a=JSON.parse(require('fs').readFileSync(process.env.NODE_DEST));var b=JSON.parse(require('fs').readFileSync(process.env.NODE_SRC));var m={};Object.keys(a).forEach(function(k){m[k]=a[k]});Object.keys(b).forEach(function(k){m[k]=b[k]});require('fs').writeFileSync(process.env.NODE_OUT,JSON.stringify(m,null,2))"
  )
  if errorlevel 1 (
    echo   [FEHLER] %LABEL%
    echo   [FEHLER] %LABEL%: Merge fehlgeschlagen >> "%LOGFILE%"
    del "!MERGE_TMP!" 2>nul
    echo.
    echo   FEHLER bei %LABEL%. Druecke eine Taste...
    pause >nul
    exit /b 0
  )
  if /i "!PREVIEW!"=="j" (
    echo.
    echo ============================================
    echo   Gemergte Vorschau: %LABEL%
    echo ============================================
    type "!MERGE_TMP!"
    echo.
    set /p "CONFIRM=  Wirklich speichern unter %DEST%? (j/n): "
    if /i not "!CONFIRM!"=="j" (
      del "!MERGE_TMP!" 2>nul
      echo   [WARN] %LABEL%: Abgebrochen
      echo   [SKIPPED] %LABEL%: Merge abgelehnt >> "%LOGFILE%"
      exit /b 0
    )
  )
  copy "!MERGE_TMP!" "%DEST%" >nul
  del "!MERGE_TMP!" 2>nul
  echo   [OK] %LABEL%: JSON gemerged
  echo   [MERGED] %LABEL%: %DEST% >> "%LOGFILE%"
  set /a INSTALLED+=1
  set installed_tools=!installed_tools! %TOOLKEY%
  exit /b 0
)

echo   [WARN] %LABEL%: Ungueltige Eingabe - uebersprungen
echo   [SKIPPED] %LABEL%: ungueltige Eingabe >> "%LOGFILE%"
exit /b 0
