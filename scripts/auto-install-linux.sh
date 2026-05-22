#!/bin/bash
# ORF-Butler Auto-Installer (Linux)
cd "$(dirname "$0")"
clear
echo "============================================"
echo "   ORF-Butler Auto-Installer"
echo "   OpenRouter Free Butler - Konfiguration"
echo "============================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "  [HINWEIS] Node.js wurde nicht gefunden."
  echo "  Viele Tools brauchen Node.js (z.B. Continue, OpenCode)."
  echo "  Installation: https://nodejs.org (Version 18 oder neuer)"
  echo "  oder via Paketmanager: sudo apt install nodejs"
  echo ""
else
  echo "  [OK] Node.js ist installiert."
fi
echo ""
echo "Kopiere Config-Dateien an die richtigen Orte..."
echo ""

INSTALLED=0
SKIPPED=0

try_copy() {
  SRC="$1"
  DEST="$2"
  TOOL=$(basename "$1" | sed 's/-config\.json//')

  if [ ! -f "$SRC" ]; then
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  DESTDIR=$(dirname "$DEST")
  mkdir -p "$DESTDIR" 2>/dev/null

  if [ -f "$DEST" ]; then
    cp "$DEST" "$DEST.backup" 2>/dev/null
    echo "  [BACKUP] Alte $TOOL-Config gesichert"
  fi

  if cp "$SRC" "$DEST" 2>/dev/null; then
    echo "  [OK] $TOOL"
    INSTALLED=$((INSTALLED + 1))
  else
    echo "  [FEHLER] $TOOL"
    SKIPPED=$((SKIPPED + 1))
  fi
}

try_copy "opencode-config.json" "$HOME/.config/opencode/opencode.json"
try_copy "continue-config.json" "$HOME/.continue/config.json"
try_copy "zed-config.json" "$HOME/.config/zed/settings.json"
try_copy "aider-config.json" "$PWD/.aider.conf.yml"
try_copy "antigravity-config.json" "$PWD/settings.yaml"
echo "  [SKIP] Amazon Q: Nur im Browser nutzbar"
try_copy "cursor-config.json" "$PWD/.cursorrules"
try_copy "windsurf-config.json" "$PWD/.windsurfrules"
try_copy "claude-code-config.json" "$PWD/CLAUDE.md"
try_copy "github-copilot-config.json" "$PWD/.github/copilot-instructions.md"
try_copy "cline-config.json" "$PWD/.clinerules"
try_copy "codeium-config.json" "$PWD/.codeiumrules"

echo ""
echo "============================================"
echo "  Fertig! $INSTALLED installiert, $SKIPPED uebersprungen."
echo "  Starte dein Tool neu."
echo "============================================"
read -p "Druecke Enter zum Schliessen..."