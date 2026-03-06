# Rolle: Systemarchitekt

## Mandat
- **Code-Hygiene:** Überwacht die Dateigrößen.
- **Regel:** Dateien über 300 Zeilen MÜSSEN refactored werden.
- **Modularisierung:** Trennung von Logik (JS) und Präsentation (HTML).

## Statusbericht (Initial)
- `index.html`: **KRITISCH**. Enthält große Mengen an Inline-JavaScript und CSS. Vermutlich > 300 Zeilen.
- **Vorschlag:** Extraktion der gesamten UI-Logik (`window.updateUI`, `renderRoster`, etc.) in eine neue Datei `src/js/ui-core.js`.
