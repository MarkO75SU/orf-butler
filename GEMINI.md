# GEMINI.md - Projektkontext: ORF-Butler

## Projekt-Übersicht
Dieses Verzeichnis dient der Entwicklung und Dokumentation des **OpenRouter Free Butler (ORF-Butler)**. Das Ziel des Projekts ist die Erstellung einer Progressive Web App (PWA), die Entwicklern hilft, die ständig wechselnde Liste kostenloser KI-Modelle auf OpenRouter zu überwachen und diese effizient in ihren Workflow (z. B. VS Code mit Continue oder CLI-Tools wie OpenCode) zu integrieren.

### Hauptmerkmale (geplant/konzipiert):
- **Echtzeit-Radar:** Abfrage der OpenRouter-API nach `:free` Modellen.
- **Experten-Mapping:** Kategorisierung der Modelle nach Stärken (z. B. Frontend/UI, Logik/Backend, Code-Generierung).
- **Config-Export:** Generierung von `config.json` Dateien für `Continue` und `OpenCode`.
- **PWA-Funktionalität:** Nutzung als installierbare Web-App auf Desktop und Mobilgeräten.

## Schlüsseldateien
- **idee.txt**: Die zentrale Wissensdatenbank des Projekts. Sie enthält:
    - Die Evolution des Konzepts von einfachen Python-Skripten bis hin zu einer komplexen PWA (v1 bis v12).
    - Vollständige HTML/JS-Code-Snippets für verschiedene Prototyp-Versionen.
    - Strategien für die Nutzung von Gratis-Modellen im Jahr 2026.
    - Benchmarks und Experten-Einschätzungen zu Modellen wie Qwen, Gemini Flash und Llama.

## Nutzung der Inhalte
Die in `idee.txt` enthaltenen Code-Snippets (insbesondere ab Version v9/v10) können direkt als `index.html` extrahiert und gehostet werden (z. B. via GitHub Pages), um den Butler zu starten.

### Nächste Schritte (TODO):
- Extraktion des finalen PWA-Codes (v12) in eine dedizierte `index.html`.
- Implementierung eines Service Workers für vollständigen PWA-Support.
- Hinzufügen einer Such- und Filterfunktion für Anbieter (Google, Meta, Mistral etc.).

## Entwicklungskonventionen (Inferred)
- **Frontend-Stack:** Vanilla HTML5, Tailwind CSS (via CDN für Prototypen), Modern JavaScript (ES6+).
- **API-Integration:** Direkte Kommunikation mit `https://openrouter.ai/api/v1/models`.
- **Design-Philosophie:** "Dark Mode First", minimalistisches Dashboard-Design, Fokus auf Informationsdichte und schnelle Interaktion.
