#!/bin/bash
cd "$(dirname "$0")"
clear
LOGFILE="install-log.txt"
echo "ORF-Butler Auto-Installer Log" > "$LOGFILE"
echo "Date: $(date)" >> "$LOGFILE"
echo "----------------------------------------" >> "$LOGFILE"
echo "============================================"
echo "   ORF-Butler Auto-Installer"
echo "   OpenRouter Free Butler - Configuration"
echo "============================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "  [NOTE] Node.js not found."
  echo "  Download: https://nodejs.org (version 18+)"
  echo ""
fi
echo ""

echo "  OpenRouter API key (optional):"
echo "    Stored only locally in the config, never sent to a server."
echo "    Without a key: YOUR_API_KEY_HERE stays, replaceable later."
read -p "  Enter key or press Enter to skip: " APIKEY
echo ""
if [ -n "$APIKEY" ]; then
  echo "Setting API key in configs..."
  for f in *-config.json *.yml *.yaml; do
    [ -f "$f" ] && sed -i.bak "s|YOUR_API_KEY_HERE|$APIKEY|g" "$f" 2>/dev/null
  done
  rm -f *.bak 2>/dev/null
  echo "  [OK] API key set"
  echo ""
fi

read -p "Preview config before saving? (y/n, Enter=no): " PREVIEW
echo ""
echo "Copying config files..."
echo ""

INSTALLED=0
INSTALLED_TOOLS=""

find_project_roots() {
  local roots="" base gitdir dir
  for base in "$HOME" "$HOME/Desktop" "$HOME/Documents" "$HOME/Projects" "$HOME/dev" "$HOME/code"; do
    [ -d "$base" ] || continue
    while IFS= read -r gitdir; do
      [ -n "$gitdir" ] || continue
      dir="$(dirname "$gitdir")"
      case " $roots " in
        *" $dir "*) continue ;;
      esac
      roots="$roots
$dir"
    done < <(find "$base" -maxdepth 3 -type d -name .git 2>/dev/null)
  done
  printf '%s\n' "$roots" | sed '/^$/d' | head -n 8
}

choose_project_root() {
  local candidates i choice custom cand_line
  local -a CAND=()
  echo ""
  echo "  Project folder for project-local configs:"
  echo "  (Cursor, Windsurf, Claude, Cline ... store their configs there)"
  echo ""
  candidates="$(find_project_roots)"
  i=1
  while IFS= read -r cand_line; do
    [ -n "$cand_line" ] || continue
    CAND+=("$cand_line")
    echo "    [$i] $cand_line"
    i=$((i + 1))
  done <<< "$candidates"
  echo "    [Enter] Current folder: $PWD"
  echo "    [f] Enter a custom path"
  echo ""
  read -p "  Choice: " choice
  case "$choice" in
    "" )
      PROJECT_ROOT="$PWD"
      ;;
    f|F )
      read -p "  Path: " custom
      if [ -d "$custom" ]; then
        PROJECT_ROOT="$custom"
      else
        echo "  [WARN] Folder not found - using the current folder"
        PROJECT_ROOT="$PWD"
      fi
      ;;
    * )
      case "$choice" in
        *[!0-9]*)
          if [ -d "$choice" ]; then
            PROJECT_ROOT="$choice"
          else
            echo "  [WARN] Invalid input - using the current folder"
            PROJECT_ROOT="$PWD"
          fi
          ;;
        *)
          if [ "$choice" -ge 1 ] && [ "$choice" -le "${#CAND[@]}" ]; then
            PROJECT_ROOT="${CAND[$((choice - 1))]}"
          else
            echo "  [WARN] Invalid number - using the current folder"
            PROJECT_ROOT="$PWD"
          fi
          ;;
      esac
      ;;
  esac
  echo "  Project folder: $PROJECT_ROOT"
}

try_copy() {
  SRC="$1"
  DEST="$2"
  NAME="$3"
  TOOLKEY="$4"
  SCOPE="$5"
  if [ "$SCOPE" = "project" ]; then
    DEST="$PROJECT_ROOT/$DEST"
  fi
  if [ ! -f "$SRC" ]; then
    return
  fi
  if [ -f "manifest.txt" ]; then
    if ! grep -q "$TOOLKEY" "manifest.txt" 2>/dev/null; then
      return
    fi
  fi
  mkdir -p "$(dirname "$DEST")" 2>/dev/null
  if [ ! -f "$DEST" ]; then
    if [ "$PREVIEW" = "y" ] || [ "$PREVIEW" = "Y" ]; then
      echo ""
      echo "============================================"
      echo "  Preview: $NAME"
      echo "============================================"
      cat "$SRC"
      echo ""
      echo "  Save to $DEST?"
      read -p "  [y] Yes / [n] Save to Downloads: " CONFIRM
      if [ "$CONFIRM" = "n" ] || [ "$CONFIRM" = "N" ]; then
        DEST="$HOME/Downloads/$(basename "$SRC")"
      fi
    fi
    if cp "$SRC" "$DEST" 2>/dev/null; then
      echo "  [OK] $NAME > installed"
      echo "  [OK] $NAME: $DEST" >> "$LOGFILE"
      INSTALLED=$((INSTALLED + 1))
      INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    else
      echo "  [ERROR] $NAME"
      echo "  [ERROR] $NAME" >> "$LOGFILE"
      echo ""
      echo "  ERROR with $NAME. Press Enter..."
      read -p ""
    fi
    return
  fi

  cp "$DEST" "$DEST.backup" 2>/dev/null
  echo "  [BACKUP] $NAME: old config saved as $(basename "$DEST").backup"

  echo "  $NAME: config already exists at $DEST"
  echo "    [1] Overwrite (backup available)"
  echo "    [2] Comment out + write new below"
  echo "    [3] Merge both contents (JSON only)"
  echo "    [s] Skip (do nothing)"
  read -p "  > " CHOICE

  EXT="${SRC##*.}"

  if [ "$CHOICE" = "s" ] || [ "$CHOICE" = "S" ]; then
    echo "  [WARN] $NAME: skipped"
    echo "  [SKIPPED] $NAME" >> "$LOGFILE"
    return
  fi

  if [ "$CHOICE" = "1" ]; then
    if cp "$SRC" "$DEST" 2>/dev/null; then
      echo "  [OK] $NAME: overwritten"
      INSTALLED=$((INSTALLED + 1))
      INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    else
      echo "  [ERROR] $NAME"
    fi
    return
  fi

  if [ "$CHOICE" = "2" ]; then
    COMMENT="// "
    if [ "$EXT" = "yml" ] || [ "$EXT" = "yaml" ]; then
      COMMENT="# "
    fi
    sed "s/^/$COMMENT/" "$DEST" > "$DEST.tmp"
    echo "" >> "$DEST.tmp"
    echo "// --- ORF-Butler Config ---" >> "$DEST.tmp"
    echo "" >> "$DEST.tmp"
    cat "$SRC" >> "$DEST.tmp"
    mv "$DEST.tmp" "$DEST"
    echo "  [OK] $NAME: old config commented out + new one written"
    INSTALLED=$((INSTALLED + 1))
    INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    return
  fi

  if [ "$CHOICE" = "3" ]; then
    if [ "$EXT" != "json" ]; then
      echo "  [WARN] $NAME: merge is only possible for JSON - skipped"
      echo "  [SKIPPED] $NAME: not JSON" >> "$LOGFILE"
      return
    fi
    # Check that the content really is JSON
    FIRST=$(head -c 1 "$SRC")
    if [ "$FIRST" != "{" ]; then
      echo "  [WARN] $NAME: file is not JSON (text instruction) - skipped"
      echo "  [SKIPPED] $NAME: not JSON content" >> "$LOGFILE"
      return
    fi
    if command -v jq &> /dev/null; then
      jq -s '.[0] * .[1]' "$DEST" "$SRC" > "$DEST.tmp" 2>/dev/null && mv "$DEST.tmp" "$DEST" && echo "  [OK] $NAME: JSON merged (jq)"
    elif command -v node &> /dev/null; then
      node -e "const fs=require('fs'); const a=JSON.parse(fs.readFileSync('$DEST')); const b=JSON.parse(fs.readFileSync('$SRC')); fs.writeFileSync('$DEST', JSON.stringify({...a,...b},null,2))" 2>/dev/null && echo "  [OK] $NAME: JSON merged (node)"
    elif command -v python3 &> /dev/null; then
      python3 -c "
import json, sys
with open('$DEST') as f: a=json.load(f)
with open('$SRC') as f: b=json.load(f)
a.update(b)
with open('$DEST','w') as f: json.dump(a,f,indent=2)
" 2>/dev/null && echo "  [OK] $NAME: JSON merged (python3)"
    else
      echo "  [WARN] $NAME: no tool for merge (jq/node/python3) - skipped"
      return
    fi
    INSTALLED=$((INSTALLED + 1))
    INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    return
  fi

  echo "  [WARN] $NAME: invalid input - skipped"
}

NEED_PROJECT=0
for TK in aider antigravity cursor windsurf claude-code github-copilot cline codeium roocode litellm cody tabby; do
  if [ -f "${TK}-config.json" ]; then
    MANIFEST_KEY=$(echo "$TK" | tr '-' '_')
    if [ ! -f "manifest.txt" ] || grep -q "$MANIFEST_KEY" "manifest.txt" 2>/dev/null; then
      NEED_PROJECT=1
      break
    fi
  fi
done
PROJECT_ROOT="$PWD"
if [ "$NEED_PROJECT" -eq 1 ]; then
  choose_project_root
  echo "  Project folder: $PROJECT_ROOT" >> "$LOGFILE"
fi
echo ""

try_copy "opencode-config.json" "$HOME/.config/opencode/opencode.json" "OpenCode CLI" "opencode" "global"
try_copy "continue-config.json" "$HOME/.continue/config.json" "Continue" "continue" "global"
try_copy "zed-config.json" "$HOME/.config/zed/settings.json" "Zed Editor" "zed" "global"
try_copy "aider-config.json" ".aider.conf.yml" "Aider CLI" "aider" "project"
try_copy "antigravity-config.json" "settings.yaml" "Antigravity" "antigravity" "project"
try_copy "cursor-config.json" ".cursorrules" "Cursor Editor" "cursor" "project"
try_copy "windsurf-config.json" ".windsurfrules" "Windsurf Editor" "windsurf" "project"
try_copy "claude-code-config.json" "CLAUDE.md" "Claude Code CLI" "claude_code" "project"
try_copy "github-copilot-config.json" ".github/copilot-instructions.md" "GitHub Copilot" "github_copilot" "project"
try_copy "cline-config.json" ".clinerules" "Cline" "cline" "project"
try_copy "codeium-config.json" ".codeiumrules" "Codeium" "codeium" "project"
try_copy "roocode-config.json" ".roorules" "RooCode" "roocode" "project"
try_copy "litellm-config.json" "litellm_config.yaml" "LiteLLM" "litellm" "project"
try_copy "cody-config.json" ".cody/config.json" "Cody" "cody" "project"
try_copy "tabby-config.json" "tabby_config.json" "Tabby" "tabby" "project"

echo ""
echo "============================================"
echo "            SUMMARY"
echo "============================================"
if [ "$INSTALLED" -eq 0 ]; then
  echo ""
  echo "  No config files were found."
  echo "  Place this script in the folder that contains"
  echo "  the -config.json and -INSTALL.md files."
  echo ""
  echo "  Or manage the configs manually:"
  echo "    node auto-install.js"
  echo ""
else
  echo "  Successfully installed: $INSTALLED"
  echo ""
fi
echo "  NOTE: The model runs on OpenRouter servers."
echo "  You need a free account at openrouter.ai"
echo "  and an API key (if not entered)."
echo ""

echo "  Step-by-step guides are in the"
echo "  *_INSTALL.md files in the ZIP folder."
echo ""
echo "  Restart your tool."
echo ""
echo "  NOTE: Does a config still contain 'YOUR_API_KEY_HERE'?"
echo "  Open the file in an editor and replace it with a real key."
echo "  Get a free key: https://openrouter.ai/keys"
echo ""
echo ""
echo "  Log: $LOGFILE"
echo ""
read -p "Press Enter to close..."
