# ORF-Butler (OpenRouter Free Butler)

**Konfiguriere kostenlose OpenRouter-KI-Modelle für deine Entwicklungsumgebung.**

![Tests](https://github.com/MarkO75SU/orfb/actions/workflows/daily-update.yml/badge.svg)

## Features

- **21+ Free-Modelle** – stündlich aktualisiert via OpenRouter-API, mit Tags (coding, reasoning, vision, …) und echten Beschreibungen
- **Live-Suche** – filtert Modelle nach ID, Tags, Rolle oder Beschreibung
- **12 Tools** – Continue, Cursor, Windsurf, Claude Code, Aider, GitHub Copilot, Cline, Codeium, OpenCode, Zed, Amazon Q, Antigravity
- **Config-Export** – JSON/YAML/Instruction pro Tool, gebündelt als ZIP
- **Auto-Installer** (Premium) – interaktiv mit Merge-Logik (überschreiben/auskommentieren/mergen)
- **Tool-spezifische INSTALL.md** – exakte Anleitung pro Tool
- **Blog / Changelog** – automatische Blog-Einträge bei Modell-Änderungen

## Quick Start

```bash
npm install
npm start        # http://localhost:3000
npm test         # 463 Tests
```

## Login-Flow

`orfb.vercel.app` → Login → `/landing` (Sales-Seite) → `/app` (Wizard) → Logout

## Deployment

Automatisch via GitHub → Vercel. Jeder Push auf `main` deployed live.

## Lizenz

MIT
