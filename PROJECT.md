# Openrouter Free Butler (ORFB)

## Projektübersicht

**Openrouter Free Butler** ist eine Web-Anwendung, die Entwicklern hilft, kostenlose KI-Modelle von OpenRouter zu finden und für ihre Entwicklungsumgebungen zu konfigurieren.

## Hauptfunktionen

1. **Free-LLM Auswahl** – 21+ Modelle mit Tags (coding, reasoning, vision, …), echten API-Beschreibungen und Suchfilter. Stündlich aktualisiert via GitHub Actions.
2. **Tool-Integration** – Konfigurations-Export für 12 Tools: OpenCode, Continue, Zed, Aider, Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Codeium, Amazon Q, Antigravity
3. **Bundle-System** – Standard (5€) Basic Config + INSTALL.md, Premium (20€) erweiterte Config + Auto-Installer
4. **Admin-Code-Verwaltung** – Codes generieren/listen/widerrufen/zurücksetzen, persistiert via GitHub Content API
5. **Blog / Changelog** – Automatische Blog-Einträge bei Modell-Änderungen, inkl. historischer Modelle

## Login-Flow

```
orfb.vercel.app  →  NUR Login-Formular (kein Sales)
        ↓ erfolgreicher Login
   /landing       →  Landingpage mit Features/Preisen/Tools/Blog
        ↓ "Zur App"
   /app           →  4-Schritt Wizard
        ↓ Logout
   zurück zu /
```

## Technologie-Stack

- **Frontend:** Vanilla HTML5, Tailwind CSS (CDN), JSZip (CDN)
- **Backend:** Vercel Serverless Functions (API)
- **Auth:** Token-basiert (localStorage) + Server-Validation
- **Daten:** Stündlicher API-Pull von OpenRouter via GitHub Actions
- **Sprachen:** Deutsch / Englisch

## Projektstruktur

```
/
├── index.html       # Login-Tor (root)
├── landing.html     # Sales + Blog
├── app.html         # 4-Schritt Wizard
├── api/             # Serverless Functions
│   ├── login.js
│   └── codes.js
├── lib/github-store.js
├── scripts/
│   ├── update-models.js       # Stündlicher API-Pull
│   ├── auto-install.js        # Premium Installer (mit Merge-Logik)
│   ├── auto-install-win.bat   # Windows Launcher
│   ├── auto-install-mac.command
│   └── auto-install-linux.sh
├── src/js/
│   ├── app.js         # UI-Logik
│   ├── auth.js        # Authentifizierung
│   ├── mapping.js     # Auto-generierte Model-Datenbank
│   ├── templates.js   # Config-Templates (12 Tools)
│   ├── docs.js        # Install-Guides + OS-Pfade
│   └── i18n.js        # DE/EN Übersetzungen
├── src/tests/test-runner.js  # 463 Tests
├── data/
│   ├── codes.json         # Code-Speicher
│   └── changelog.json     # Blog-Einträge
└── .github/workflows/daily-update.yml
```

## Entwicklung

```bash
npm test        # 463 Tests (Node ESM)
npm run dev     # http://localhost:3000
npm run codes generate 5   # Codes generieren (lokal)
```

## Deployment

- **Automatisch** via GitHub → Vercel (jeder Push auf `main`)
- **Stündliches Update:** GitHub Actions (0 * * * *)
- **URL:** https://orfb.vercel.app
- **GitHub:** https://github.com/MarkO75SU/orfb

MIT Lizenz
