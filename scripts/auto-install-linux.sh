#!/bin/bash
cd "$(dirname "$0")"
clear
echo "============================================"
echo "   ORF-Butler Auto-Installer"
echo "   OpenRouter Free Butler - Konfiguration"
echo "============================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "  [HINWEIS] Node.js nicht gefunden."
  echo "  Installation: https://nodejs.org (Version 18+)"
  echo "  oder via Paketmanager: sudo apt install nodejs"
  echo ""
fi
echo ""

read -p "OpenRouter API Key (optional - Enter zum Ueberspringen): " APIKEY
echo ""
if [ -n "$APIKEY" ]; then
  echo "Setze API-Key in Configs ein..."
  for f in *-config.json *.yml *.yaml; do
    [ -f "$f" ] && sed -i.bak "s|DEIN_API_KEY_HERE|$APIKEY|g" "$f" 2>/dev/null
  done
  rm -f *.bak 2>/dev/null
  echo "  [OK] API-Key eingetragen"
  echo ""
fi

echo "Kopiere Config-Dateien..."
echo ""

INSTALLED=0
SKIPPED=0

try_copy() {
  SRC="$1"
  DEST="$2"
  NAME="$3"
  if [ ! -f "$SRC" ]; then
    SKIPPED=$((SKIPPED + 1))
    return
  fi
  mkdir -p "$(dirname "$DEST")" 2>/dev/null
  if [ -f "$DEST" ]; then
    cp "$DEST" "$DEST.backup" 2>/dev/null
  fi
  if cp "$SRC" "$DEST" 2>/dev/null; then
    echo "  [OK] $NAME"
    INSTALLED=$((INSTALLED + 1))
  else
    echo "  [FEHLER] $NAME"
    SKIPPED=$((SKIPPED + 1))
  fi
}

try_copy "opencode-config.json" "$HOME/.config/opencode/opencode.json" "OpenCode CLI"
try_copy "continue-config.json" "$HOME/.continue/config.json" "Continue"
try_copy "zed-config.json" "$HOME/.config/zed/settings.json" "Zed Editor"
try_copy "aider-config.json" "$PWD/.aider.conf.yml" "Aider CLI"
try_copy "antigravity-config.json" "$PWD/settings.yaml" "Antigravity"
echo "  [SKIP] Amazon Q - Nur im Browser nutzbar"
try_copy "cursor-config.json" "$PWD/.cursorrules" "Cursor Editor"
try_copy "windsurf-config.json" "$PWD/.windsurfrules" "Windsurf Editor"
try_copy "claude-code-config.json" "$PWD/CLAUDE.md" "Claude Code CLI"
try_copy "github-copilot-config.json" "$PWD/.github/copilot-instructions.md" "GitHub Copilot"
try_copy "cline-config.json" "$PWD/.clinerules" "Cline"
try_copy "codeium-config.json" "$PWD/.codeiumrules" "Codeium"

echo ""
echo "============================================"
echo "  Fertig - $INSTALLED Configs installiert"
echo "  Starte dein Tool neu."
echo "============================================"
read -p "Druecke Enter zum Schliessen..."