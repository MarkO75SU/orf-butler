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
  echo "  Download: https://nodejs.org (Version 18+)"
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
INSTALLED_TOOLS=""

try_copy() {
  SRC="$1"
  DEST="$2"
  NAME="$3"
  TOOLKEY="$4"
  if [ ! -f "$SRC" ]; then
    return
  fi
  mkdir -p "$(dirname "$DEST")" 2>/dev/null
  if [ ! -f "$DEST" ]; then
    if cp "$SRC" "$DEST" 2>/dev/null; then
      echo "  [OK] $NAME → Installiert"
      INSTALLED=$((INSTALLED + 1))
      INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    else
      echo "  [FEHLER] $NAME"
    fi
    return
  fi

  cp "$DEST" "$DEST.backup" 2>/dev/null
  echo "  [BACKUP] $NAME: alte Config gesichert unter $(basename "$DEST").backup"

  echo "  $NAME: Config existiert bereits unter $DEST"
  echo "    [1] Ueberschreiben (Backup vorhanden)"
  echo "    [2] Auskommentieren + neue daneben"
  echo "    [3] Beide Inhalte mergen (nur JSON)"
  echo "    [s] Ueberspringen (nichts tun)"
  read -p "  > " CHOICE

  EXT="${SRC##*.}"

  if [ "$CHOICE" = "s" ] || [ "$CHOICE" = "S" ]; then
    echo "  [WARN] $NAME: Uebersprungen"
    return
  fi

  if [ "$CHOICE" = "1" ]; then
    if cp "$SRC" "$DEST" 2>/dev/null; then
      echo "  [OK] $NAME: Ueberschrieben"
      INSTALLED=$((INSTALLED + 1))
      INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    else
      echo "  [FEHLER] $NAME"
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
    echo "  [OK] $NAME: Alte auskommentiert + neue geschrieben"
    INSTALLED=$((INSTALLED + 1))
    INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    return
  fi

  if [ "$CHOICE" = "3" ]; then
    if [ "$EXT" != "json" ]; then
      echo "  [WARN] $NAME: Merge nur bei JSON – uebersprungen"
      return
    fi
    if command -v jq &> /dev/null; then
      jq -s '.[0] * .[1]' "$DEST" "$SRC" > "$DEST.tmp" 2>/dev/null && mv "$DEST.tmp" "$DEST" && echo "  [OK] $NAME: JSON gemerged (jq)"
    elif command -v node &> /dev/null; then
      node -e "const fs=require('fs'); const a=JSON.parse(fs.readFileSync('$DEST')); const b=JSON.parse(fs.readFileSync('$SRC')); fs.writeFileSync('$DEST', JSON.stringify({...a,...b},null,2))" 2>/dev/null && echo "  [OK] $NAME: JSON gemerged (node)"
    elif command -v python3 &> /dev/null; then
      python3 -c "
import json, sys
with open('$DEST') as f: a=json.load(f)
with open('$SRC') as f: b=json.load(f)
a.update(b)
with open('$DEST','w') as f: json.dump(a,f,indent=2)
" 2>/dev/null && echo "  [OK] $NAME: JSON gemerged (python3)"
    else
      echo "  [WARN] $NAME: Kein Tool fuer Merge (jq/node/python3) – uebersprungen"
      return
    fi
    INSTALLED=$((INSTALLED + 1))
    INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    return
  fi

  echo "  [WARN] $NAME: Ungueltige Eingabe – uebersprungen"
}

try_copy "opencode-config.json" "$HOME/.config/opencode/opencode.json" "OpenCode CLI" "opencode"
try_copy "opencode-desktop-config.json" "$HOME/.config/opencode/opencode.json" "OpenCode Desktop" "opencode_desktop"
try_copy "continue-config.json" "$HOME/.continue/config.json" "Continue" "continue"
try_copy "zed-config.json" "$HOME/.config/zed/settings.json" "Zed Editor" "zed"
try_copy "aider-config.json" "$PWD/.aider.conf.yml" "Aider CLI" "aider"
try_copy "antigravity-config.json" "$PWD/settings.yaml" "Antigravity" "antigravity"
echo "  [SKIP] Amazon Q - Nur im Browser nutzbar"
try_copy "cursor-config.json" "$PWD/.cursorrules" "Cursor Editor" "cursor"
try_copy "windsurf-config.json" "$PWD/.windsurfrules" "Windsurf Editor" "windsurf"
try_copy "claude-code-config.json" "$PWD/CLAUDE.md" "Claude Code CLI" "claude_code"
try_copy "github-copilot-config.json" "$PWD/.github/copilot-instructions.md" "GitHub Copilot" "github_copilot"
try_copy "cline-config.json" "$PWD/.clinerules" "Cline" "cline"
try_copy "codeium-config.json" "$PWD/.codeiumrules" "Codeium" "codeium"

echo ""
echo "============================================"
echo "            ZUSAMMENFASSUNG"
echo "============================================"
if [ "$INSTALLED" -eq 0 ]; then
  echo ""
  echo "  Es wurden KEINE Config-Dateien gefunden."
  echo "  Lege dieses Skript in den Ordner mit den"
  echo "  -config.json und -INSTALL.md Dateien."
  echo ""
  echo "  Oder verwalte die Configs manuell:"
  echo "    node auto-install.js"
  echo ""
else
  echo "  Erfolgreich installiert: $INSTALLED"
  echo ""
fi
echo "  WICHTIG: Das Modell laeuft auf OpenRouter-Servern."
echo "  Du brauchst einen kostenlosen Account auf openrouter.ai"
echo "  und einen API-Key (falls nicht eingegeben)."
echo ""

echo "  Die Schritt-fuer-Schritt Anleitungen stehen"
echo "  in den *_INSTALL.md Dateien im ZIP-Ordner."
echo ""
echo "  Starte dein Tool neu."
echo ""
echo "  WICHTIG: Enthaelt eine Config noch 'DEIN_API_KEY_HERE'?"
echo "  Dann Datei im Editor oeffnen und mit echtem Key ersetzen."
echo "  Kostenlosen Key holen: https://openrouter.ai/keys"
echo ""
read -p "Druecke Enter zum Schliessen..."