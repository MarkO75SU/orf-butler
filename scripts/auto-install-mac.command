#!/bin/bash
cd "$(dirname "$0")"
clear
LOGFILE="install-log.txt"
echo "ORF-Butler Auto-Installer Log" > "$LOGFILE"
echo "Datum: $(date)" >> "$LOGFILE"
echo "----------------------------------------" >> "$LOGFILE"
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

echo "  OpenRouter API-Key (optional):"
echo "    Nur lokal in der Config gespeichert, kein Server-Versand."
echo "    Ohne Key: DEIN_API_KEY_HERE bleibt stehen, spaeter ersetzbar."
read -p "  Key eingeben oder Enter zum Ueberspringen: " APIKEY
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

read -p "Config vor dem Speichern pruefen? (j/n, Enter=nein): " PREVIEW
echo ""
echo "Kopiere Config-Dateien..."
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
  echo "  Projektordner fuer projekt-lokale Configs:"
  echo "  (Cursor, Windsurf, Claude, Cline ... legen ihre Configs dort ab)"
  echo ""
  candidates="$(find_project_roots)"
  i=1
  while IFS= read -r cand_line; do
    [ -n "$cand_line" ] || continue
    CAND+=("$cand_line")
    echo "    [$i] $cand_line"
    i=$((i + 1))
  done <<< "$candidates"
  echo "    [Enter] Aktueller Ordner: $PWD"
  echo "    [f] Eigenen Pfad eingeben"
  echo ""
  read -p "  Wahl: " choice
  case "$choice" in
    "" )
      PROJECT_ROOT="$PWD"
      ;;
    f|F )
      read -p "  Pfad: " custom
      if [ -d "$custom" ]; then
        PROJECT_ROOT="$custom"
      else
        echo "  [WARN] Ordner nicht gefunden - nutze aktuellen Ordner"
        PROJECT_ROOT="$PWD"
      fi
      ;;
    * )
      case "$choice" in
        *[!0-9]*)
          if [ -d "$choice" ]; then
            PROJECT_ROOT="$choice"
          else
            echo "  [WARN] Ungueltige Eingabe - nutze aktuellen Ordner"
            PROJECT_ROOT="$PWD"
          fi
          ;;
        *)
          if [ "$choice" -ge 1 ] && [ "$choice" -le "${#CAND[@]}" ]; then
            PROJECT_ROOT="${CAND[$((choice - 1))]}"
          else
            echo "  [WARN] Ungueltige Nummer - nutze aktuellen Ordner"
            PROJECT_ROOT="$PWD"
          fi
          ;;
      esac
      ;;
  esac
  echo "  Projektordner: $PROJECT_ROOT"
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
    if [ "$PREVIEW" = "j" ] || [ "$PREVIEW" = "J" ]; then
      echo ""
      echo "============================================"
      echo "  Vorschau: $NAME"
      echo "============================================"
      cat "$SRC"
      echo ""
      echo "  Speichern unter $DEST?"
      read -p "  [j] Ja / [n] In Downloads: " CONFIRM
      if [ "$CONFIRM" = "n" ] || [ "$CONFIRM" = "N" ]; then
        DEST="$HOME/Downloads/$(basename "$SRC")"
      fi
    fi
    if cp "$SRC" "$DEST" 2>/dev/null; then
      echo "  [OK] $NAME > Installiert"
      echo "  [OK] $NAME: $DEST" >> "$LOGFILE"
      INSTALLED=$((INSTALLED + 1))
      INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    else
      echo "  [FEHLER] $NAME"
      echo "  [FEHLER] $NAME" >> "$LOGFILE"
      echo ""
      echo "  FEHLER bei $NAME. Druecke Enter..."
      read -p ""
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
    echo "  [SKIPPED] $NAME" >> "$LOGFILE"
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
      echo "  [WARN] $NAME: Merge nur bei JSON - uebersprungen"
      echo "  [SKIPPED] $NAME: kein JSON" >> "$LOGFILE"
      return
    fi
    # Prüfe ob Inhalt wirklich JSON ist
    FIRST=$(head -c 1 "$SRC")
    if [ "$FIRST" != "{" ]; then
      echo "  [WARN] $NAME: Datei ist kein JSON (Text-Instruktion) - uebersprungen"
      echo "  [SKIPPED] $NAME: kein JSON-Inhalt" >> "$LOGFILE"
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
      echo "  [WARN] $NAME: Kein Tool fuer Merge (jq/node/python3) - uebersprungen"
      return
    fi
    INSTALLED=$((INSTALLED + 1))
    INSTALLED_TOOLS="$INSTALLED_TOOLS $TOOLKEY"
    return
  fi

  echo "  [WARN] $NAME: Ungueltige Eingabe - uebersprungen"
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
  echo "  Projektordner: $PROJECT_ROOT" >> "$LOGFILE"
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
echo ""
echo "  Log: $LOGFILE"
echo ""
read -p "Druecke Enter zum Schliessen..."