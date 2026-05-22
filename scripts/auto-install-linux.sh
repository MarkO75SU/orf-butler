#!/bin/bash
# ORF-Butler Auto-Installer (Linux)
cd "$(dirname "$0")"
clear
echo "============================================"
echo "   ORF-Butler Auto-Installer"
echo "   OpenRouter Free Butler - Konfiguration"
echo "============================================"
echo ""
echo "Pruefe ob Node.js installiert ist..."
echo ""

if ! command -v node &> /dev/null; then
    echo "FEHLER: Node.js ist nicht installiert!"
    echo ""
    echo "Bitte lade Node.js kostenlos herunter von:"
    echo "https://nodejs.org (Version 18 oder neuer)"
    echo ""
    echo "Nach der Installation starte diese Datei erneut."
    echo ""
    read -p "Druecke Enter zum Schliessen..."
    exit 1
fi

echo "Node.js gefunden. Starte Installation..."
echo ""
node "$(dirname "$0")/auto-install.js"
echo ""
echo "============================================"
echo "   Installation abgeschlossen!"
echo "   Druecke Enter zum Schliessen..."
echo "============================================"
read -p ""
