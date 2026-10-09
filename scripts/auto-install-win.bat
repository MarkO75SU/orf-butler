@echo off
title ORF-Butler Installation
cd /d "%~dp0"

set LOGFILE=install-log.txt
echo ORF-Butler Auto-Installer Log > "%LOGFILE%"
echo Date: %DATE% %TIME% >> "%LOGFILE%"
echo ---------------------------------------- >> "%LOGFILE%"

echo ============================================
echo    ORF-Butler Auto-Installer
echo    OpenRouter Free Butler - Configuration
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [NOTE] Node.js not found.
  echo   Download: https://nodejs.org (version 18+)
  echo.
) else (
  echo   [OK] Node.js is installed.
)
echo.

set APIKEY=
echo   OpenRouter API key (optional):
echo     Stored only locally in the config, never sent to a server.
echo     Without a key: YOUR_API_KEY_HERE stays, replaceable later.
set /p "APIKEY=  Enter key or press Enter to skip: "
echo.

if not "%APIKEY%"=="" (
  echo Setting API key in configs...
  powershell -Command "$k='%APIKEY:''=''%'; Get-ChildItem '.\*' -Include '*-config.json','*.yml','*.yaml' -Name | ForEach-Object { $c = Get-Content $_ -Raw; $c = $c -replace 'YOUR_API_KEY_HERE', $k; Set-Content $_ $c }; Write-Host '  [OK] API key set'"
  echo.
)

set /p "PREVIEW=Preview config before saving? (y/n, Enter=no): "
echo.
echo Copying config files...
echo.

setlocal enabledelayedexpansion
set INSTALLED=0
set installed_tools=
set PROJECT_ROOT=%cd%
set NEED_PROJECT=0

for %%K in (aider antigravity cursor windsurf claude_code github_copilot cline codeium roocode litellm cody tabby) do (
  set "FK=%%K"
  set "FK=!FK:_=-!"
  if exist "!FK!-config.json" (
    if exist "manifest.txt" (
      findstr /I /C:"%%K" "manifest.txt" >nul 2>&1
      if not errorlevel 1 set NEED_PROJECT=1
    ) else (
      set NEED_PROJECT=1
    )
  )
)

if "%NEED_PROJECT%"=="1" call :choose_project

call :safe_copy "opencode-config.json" "%USERPROFILE%\.config\opencode\opencode.json" "OpenCode CLI" "opencode" global
call :safe_copy "continue-config.json" "%USERPROFILE%\.continue\config.json" "VS Code (Continue)" "continue" global
call :safe_copy "zed-config.json" "%APPDATA%\Zed\settings.json" "Zed Editor" "zed" global
call :safe_copy "aider-config.json" ".aider.conf.yml" "Aider CLI" "aider" project
call :safe_copy "antigravity-config.json" "settings.yaml" "Antigravity" "antigravity" project
call :safe_copy "cursor-config.json" ".cursorrules" "Cursor Editor" "cursor" project
call :safe_copy "windsurf-config.json" ".windsurfrules" "Windsurf Editor" "windsurf" project
call :safe_copy "claude-code-config.json" "CLAUDE.md" "Claude Code CLI" "claude_code" project
call :safe_copy "github-copilot-config.json" ".github\copilot-instructions.md" "GitHub Copilot" "github_copilot" project
call :safe_copy "cline-config.json" ".clinerules" "Cline" "cline" project
call :safe_copy "codeium-config.json" ".codeiumrules" "Codeium" "codeium" project
call :safe_copy "roocode-config.json" ".roorules" "RooCode" "roocode" project
call :safe_copy "litellm-config.json" "litellm_config.yaml" "LiteLLM" "litellm" project
call :safe_copy "cody-config.json" ".cody\config.json" "Cody" "cody" project
call :safe_copy "tabby-config.json" "tabby_config.json" "Tabby" "tabby" project

echo.
echo ============================================
echo            SUMMARY
echo ============================================
if !INSTALLED! equ 0 (
  echo.
  echo   No config files were found.
  echo   Place this script in the folder that contains
  echo   the -config.json and -INSTALL.md files.
  echo.
  echo   Or manage the configs manually
  echo   with "node auto-install.js" in the terminal.
  echo.
) else (
  echo   Successfully installed: !INSTALLED!
  echo.
)
echo.
echo   The step-by-step guides are in the
echo   *_INSTALL.md files in the ZIP folder.
echo.

echo.
echo   NOTE: Does a config still contain YOUR_API_KEY_HERE?
echo   Open the file in an editor and replace it with a real
echo   OpenRouter API key (openrouter.ai/keys).
echo.
echo.
echo   Restart your tool.
echo.
echo   Log: %LOGFILE%
echo.
echo   ============================================
echo   Press any key to close.
echo   ============================================
pause
goto :EOF

:safe_copy
set SRC=%~1
set "DEST=%~2"
set LABEL=%~3
set TOOLKEY=%~4
if /i "%~5"=="project" set "DEST=%PROJECT_ROOT%\%~2"
if not exist "%SRC%" exit /b 0

if exist "manifest.txt" (
  set MANIFEST_FOUND=
  for /f "usebackq delims=" %%M in ("manifest.txt") do (
    if /i "%%M"=="%TOOLKEY%" set MANIFEST_FOUND=1
  )
  if not defined MANIFEST_FOUND exit /b 0
)

for %%I in ("%DEST%") do set "DESTDIR=%%~dpI"
if not exist "!DESTDIR!" mkdir "!DESTDIR!" 2>nul
if not exist "%DEST%" (
  if /i "!PREVIEW!"=="y" (
    echo.
    echo ============================================
    echo   Preview: %LABEL%
    echo ============================================
    type "%SRC%"
    echo.
    echo   Save to %DEST%?
    set /p "CONFIRM=  [y] Yes / [n] Save to Downloads: "
    if /i "!CONFIRM!"=="n" set "DEST=%USERPROFILE%\Downloads\%~nx1"
  )
  copy "%SRC%" "%DEST%" >nul
  if errorlevel 1 (
    echo   [ERROR] %LABEL%
    echo   [ERROR] %LABEL%: %SRC% -^> %DEST% >> "%LOGFILE%"
    echo.
    echo   ERROR with %LABEL%. Press a key...
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
echo   [BACKUP] %LABEL%: old config saved
echo   [BACKUP] %DEST%.backup >> "%LOGFILE%"

echo.
echo   %LABEL%: config already exists at %DEST%
echo     [1] Overwrite (backup available)
echo     [2] Comment out + write new below
echo     [3] Merge both contents (JSON only)
echo     [s] Skip (do nothing)
set /p "CHOICE=  > "

if /i "!CHOICE!"=="s" (
  echo   [WARN] %LABEL%: skipped
  echo   [SKIPPED] %LABEL% >> "%LOGFILE%"
  exit /b 0
)

if "!CHOICE!"=="1" (
  if /i "!PREVIEW!"=="y" (
    echo.
    echo ============================================
    echo   Preview: %LABEL%
    echo ============================================
    type "%SRC%"
    echo.
    set /p "CONFIRM=  Really save to %DEST%? (y/n): "
    if /i not "!CONFIRM!"=="y" (
      echo   [WARN] %LABEL%: cancelled
      echo   [SKIPPED] %LABEL% >> "%LOGFILE%"
      exit /b 0
    )
  )
  copy "%SRC%" "%DEST%" >nul
  if errorlevel 1 (
    echo   [ERROR] %LABEL%
    echo   [ERROR] %LABEL%: overwrite failed >> "%LOGFILE%"
    echo.
    echo   ERROR with %LABEL%. Press a key...
    pause >nul
  ) else (
    echo   [OK] %LABEL%: overwritten
    echo   [OVERWRITTEN] %LABEL%: %DEST% >> "%LOGFILE%"
    set /a INSTALLED+=1
    set installed_tools=!installed_tools! %TOOLKEY%
  )
  exit /b 0
)

if "!CHOICE!"=="2" (
  if /i "!PREVIEW!"=="y" (
    echo.
    echo ============================================
    echo   Preview: %LABEL%
    echo ============================================
    type "%SRC%"
    echo.
    set /p "CONFIRM=  Really save to %DEST%? (y/n): "
    if /i not "!CONFIRM!"=="y" (
      echo   [WARN] %LABEL%: cancelled
      echo   [SKIPPED] %LABEL% >> "%LOGFILE%"
      exit /b 0
    )
  )
  powershell -Command "$c=Get-Content '%DEST%'; $ext=[System.IO.Path]::GetExtension('%DEST%'); $pre='// '; if($ext -eq '.yml' -or $ext -eq '.yaml'){$pre='# '}; $commented=$c -replace '^', $pre; \"$commented`n`n// --- ORF-Butler Config ---`n\"+ (Get-Content '%SRC%') | Set-Content '%DEST%'"
  if errorlevel 1 (
    echo   [ERROR] %LABEL%
    echo   [ERROR] %LABEL%: commenting failed >> "%LOGFILE%"
    echo.
    echo   ERROR with %LABEL%. Press a key...
    pause >nul
  ) else (
    echo   [OK] %LABEL%: old commented out + new one written
    echo   [COMMENTED] %LABEL%: %DEST% >> "%LOGFILE%"
    set /a INSTALLED+=1
    set installed_tools=!installed_tools! %TOOLKEY%
  )
  exit /b 0
)

if "!CHOICE!"=="3" (
  set EXT=%SRC:~-5%
  if /i not "!EXT!"==".json" (
    echo   [WARN] %LABEL%: merge is only possible for JSON - skipped
    echo   [SKIPPED] %LABEL%: not JSON >> "%LOGFILE%"
    exit /b 0
  )
  :: Check that the content really is JSON
  findstr /B "{" "%SRC%" >nul
  if errorlevel 1 (
    echo   [WARN] %LABEL%: file is not JSON (text instruction) - skipped
    echo   [SKIPPED] %LABEL%: not JSON content >> "%LOGFILE%"
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
    echo   [ERROR] %LABEL%
    echo   [ERROR] %LABEL%: merge failed >> "%LOGFILE%"
    del "!MERGE_TMP!" 2>nul
    echo.
    echo   ERROR with %LABEL%. Press a key...
    pause >nul
    exit /b 0
  )
  if /i "!PREVIEW!"=="y" (
    echo.
    echo ============================================
    echo   Merged preview: %LABEL%
    echo ============================================
    type "!MERGE_TMP!"
    echo.
    set /p "CONFIRM=  Really save to %DEST%? (y/n): "
    if /i not "!CONFIRM!"=="y" (
      del "!MERGE_TMP!" 2>nul
      echo   [WARN] %LABEL%: cancelled
      echo   [SKIPPED] %LABEL%: merge rejected >> "%LOGFILE%"
      exit /b 0
    )
  )
  copy "!MERGE_TMP!" "%DEST%" >nul
  del "!MERGE_TMP!" 2>nul
  echo   [OK] %LABEL%: JSON merged
  echo   [MERGED] %LABEL%: %DEST% >> "%LOGFILE%"
  set /a INSTALLED+=1
  set installed_tools=!installed_tools! %TOOLKEY%
  exit /b 0
)

echo   [WARN] %LABEL%: invalid input - skipped
echo   [SKIPPED] %LABEL%: invalid input >> "%LOGFILE%"
exit /b 0

:choose_project
set /a NCAND=0
for %%D in ("%USERPROFILE%\*" "%USERPROFILE%\Desktop\*" "%USERPROFILE%\Documents\*") do (
  if exist "%%~fD\.git\" (
    if !NCAND! lss 8 (
      set /a NCAND+=1
      set "CAND[!NCAND!]=%%~fD"
    )
  )
)
echo.
echo   Project folder for project-local configs:
echo     (.cursorrules, CLAUDE.md, .clinerules, ...)
echo     [0] Current folder: %cd%
for /l %%N in (1,1,!NCAND!) do (
  echo     [%%N] !CAND[%%N]!
)
echo     Or enter a full path.
set "PCHOICE="
set /p "PCHOICE=  Choice (Enter=0): "
if not defined PCHOICE exit /b 0
echo(!PCHOICE!| findstr /R /C:"^[0-9][0-9]*$" >nul
if errorlevel 1 (
  set "PROJECT_ROOT=%PCHOICE%"
  exit /b 0
)
set "SEL="
call set "SEL=%%CAND[%PCHOICE%]%%"
if defined SEL (
  set "PROJECT_ROOT=!SEL!"
) else (
  echo   [WARN] Invalid number - current folder.
)
exit /b 0
