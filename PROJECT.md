# Openrouter Free Butler (ORFB)

## Projektübersicht

**Openrouter Free Butler** ist eine Web-Anwendung, die Entwicklern hilft, kostenlose KI-Modelle von OpenRouter zu finden und diese für ihre Entwicklungsumgebungen zu konfigurieren.

## Hauptfunktionen

1. **Free-LLM Auswahl** – Übersichtliche Darstellung aller kostenlosen Modelle von OpenRouter. Automatisch aktualisiert via täglichem GitHub Actions Workflow (00:01 UTC):
   - Modell-ID mit ↗ Link zu OpenRouter
   - Kategorisierte Rolle (Code Generation, Reasoning, Assistant, Lightweight, General)
   - Context-Länge (echter API-Wert)
   - Unterstützte Programmiersprachen (abgeleitet)
   - **NEU-Badge** für seit dem letzten Update hinzugekommene Modelle

2. **Tool-Integration** – Konfigurations-Export für 12 Tools:
   - OpenCode CLI, Continue (VS Code), Zed Editor, Aider CLI, Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Codeium, Amazon Q, Antigravity

3. **Bundle-System**
   - Standard Bundle (5€) – Basic Config + tool-spezifische INSTALL.md
   - Premium Bundle (20€) – Erweiterte Config + Auto-Installer (native Scripts für Win/Mac/Linux, kein Node.js nötig)

4. **4-Schritt Wizard**
   - Step 1: Model-Auswahl (22+ Modelle, neue zuerst)
   - Step 2: Tool-Auswahl (12 Tools, alphabetisch)
   - Step 3: Bundle-Auswahl (Basic / Premium)
   - Step 4: Checkout & ZIP-Download

5. **Anonymer Code-Login**
   - Ein-Feld-Login: Code eingeben oder "GENERALI" für Admin
   - Codes via `/api/codes?action=generate` (Admin, Basic-Auth)
   - Persistenz via GitHub Content API (GH_TOKEN) oder lokaler Datei

## Technologie-Stack

- **Frontend:** Vanilla HTML5, Tailwind CSS (CDN), Modern JavaScript (ES6+), JSZip (CDN)
- **Backend:** Vercel Serverless Functions (API)
- **Auth:** Token-basiert (localStorage) + Server-Validation
- **Daten:** Täglicher API-Pull von OpenRouter via GitHub Actions
- **Sprachen:** Deutsch / Englisch (bilingual)

## Projektstruktur

```
/                    # Root
├── index.html       # Hauptanwendung (4-Step Wizard)
├── landing.html     # Sales Landing Page (öffentlich)
├── login.html       # Login (Code oder GENERALI)
├── api/
│   ├── login.js     # Admin Login API
│   └── codes.js     # Code CRUD (generate/redeem/check/list/revoke/reset)
├── lib/
│   └── github-store.js   # GitHub Content API für Code-Persistenz
├── scripts/
│   ├── update-models.js       # Daily: Holt :free Modelle von OpenRouter
│   ├── manage-codes.js        # CLI: npm run codes generate|list|revoke|reset
│   ├── auto-install.js        # Premium Auto-Installer (Node.js)
│   ├── auto-install-win.bat   # Windows Launcher (nativ)
│   ├── auto-install-mac.command # Mac Launcher (nativ)
│   └── auto-install-linux.sh  # Linux Launcher (nativ)
├── .github/workflows/
│   └── daily-update.yml  # Cron 00:01 UTC + workflow_dispatch
├── data/
│   └── codes.json        # Code-Speicher (lokal)
├── src/
│   ├── js/
│   │   ├── app.js        # Hauptanwendung (Model/Tool/Bundle/ZIP)
│   │   ├── auth.js       # Authentifizierung (Admin + Anon-Codes)
│   │   ├── api.js        # OpenRouter API
│   │   ├── mapping.js    # Auto-generierte Model-Datenbank (22 Modelle)
│   │   ├── templates.js  # Config-Templates (12 Tools)
│   │   ├── docs.js       # Tool-spezifische INSTALL.md + OS-Pfade
│   │   └── i18n.js       # DE/EN Übersetzungen
│   └── tests/
│       └── test-runner.js # 448 Tests (Node ESM, kein Browser)
├── docs/
│   └── experts/          # Expertendokumente
├── .env                  # Environment Variablen (nicht committed)
├── .gitattributes        # CRLF/LF für Launcher-Scripts
├── AGENTS.md             # Agenten-Instruktionen
├── PROJECT.md            # Dieses Dokument
├── roadmap.md            # Entwicklungs-Roadmap
└── vercel.json           # Vercel Routen-Konfiguration
```

## Entwicklung

### Tests ausführen
```bash
npm test        # 448 Tests, pure Node ESM
```

### Lokal entwickeln
```bash
npm run dev     # http://localhost:3000
```

### Codes verwalten (lokal)
```bash
npm run codes generate 5     # 5 Codes generieren
npm run codes list           # Alle Codes anzeigen
npm run codes revoke CODE    # Code deaktivieren
npm run codes reset CODE     # Code zurücksetzen
```

## Zugangsdaten

- Benutzer: `generali` (Admin)
- Passwort: via `.env` (`LOGIN_PASS`)
- Gäste: Anonymer Code (8-stellig, alphanumerisch)

## Deployment

- **Automatisch** via GitHub → Vercel (jeder Push auf `main`)
- **Daily Update:** GitHub Actions um 00:01 UTC
- **URL:** https://orfb.vercel.app
- **GitHub:** https://github.com/MarkO75SU/orfb

## Lizenz

MIT
