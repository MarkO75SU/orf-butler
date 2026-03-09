# Openrouter Free Butler (ORFB)

## Projektübersicht

**Openrouter Free Butler** ist eine Web-Anwendung, die Entwicklern hilft, kostenlose KI-Modelle von OpenRouter zu finden und diese für ihre Entwicklungsumgebungen zu konfigurieren.

## Hauptfunktionen

1. **Free-LLM Auswahl** - Übersichtliche Darstellung aller kostenlosen Modelle von OpenRouter mit Details zu:
   - Modell-Rolle (Code Generation, Reasoning, etc.)
   - Context-Länge
   - Unterstützte Programmiersprachen
   - Beschreibung

2. **Tool-Integration** - Konfigurations-Export für beliebte Tools:
   - OpenCode CLI
   - Continue (VS Code)
   - Zed Editor
   - Aider CLI
   - Und weitere...

3. **Bundle-System**
   - Standard Bundle (5€) - Basic Config + Installationsanleitung
   - Premium Bundle (20€) - Erweiterte Config + Experten-Prompts + Support

4. **4-Schritt Wizard**
   - Step 1: Model-Auswahl
   - Step 2: Tool-Auswahl
   - Step 3: Bundle-Auswahl
   - Step 4: Checkout & Download

## Technologie-Stack

- **Frontend:** Vanilla HTML5, Tailwind CSS (CDN), Modern JavaScript (ES6+)
- **Backend:** Vercel Serverless Functions (API)
- **Auth:** Token-basierte Authentifizierung mit Server-Side Validation
- **Daten:** Live-API von OpenRouter für Free-Modelle

## Projektstruktur

```
/                    # Root
├── index.html       # Hauptanwendung
├── login.html       # Login-Seite
├── api/             # Serverless Functions
│   └── login.js     # Login API
├── src/
│   ├── js/
│   │   ├── app.js      # Hauptanwendung
│   │   ├── auth.js     # Authentifizierung
│   │   ├── api.js      # OpenRouter API
│   │   ├── mapping.js   # Model-Datenbank
│   │   ├── templates.js # Config-Templates
│   │   ├── docs.js     # Installationsanleitungen
│   │   └── i18n.js     # Übersetzungen
│   └── tests/
│       └── test-runner.js
├── docs/
│   └── experts/     # Expertengremium
├── .env            # Environment Variablen
└── vercel.json     # Vercel Konfiguration
```

## Entwicklung

### Tests ausführen
```bash
npm test
```

### Lokal entwickeln
```bash
npm run dev
```

## Zugangsdaten

- Benutzer: `generali`
- Passwort: `generali2026`

(Werden in .env verwaltet und server-seitig validiert)

## Deployment

Das Projekt wird automatisch via GitHub auf Vercel deployed:
- **URL:** https://orfb.vercel.app
- **GitHub:** https://github.com/MarkO75SU/orfb

## Lizenz

MIT
