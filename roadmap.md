# Roadmap: ORF-Butler Development

## ✅ Abgeschlossen

- [x] **Auto-Update Workflow**: Stündliches Update aller `:free` Modelle via GitHub Actions – `update-models.js` fragt OpenRouter-API ab, generiert `mapping.js` automatisch
- [x] **NEU-Markierung**: Neue Modelle werden mit "NEU"-Badge markiert und oben sortiert
- [x] **MODEL_HISTORY erhalten**: Update-Script bewahrt `MODEL_HISTORY` und `getBestModels` beim Neugenerieren
- [x] **Fake-Metriken entfernt**: Uptime/Latency/Status waren Zufallswerte – entfernt
- [x] **Tags + echte Beschreibung**: Modelle haben jetzt Tags (coding, reasoning, vision, …) und echte API-Kurzbeschreibungen
- [x] **Blog / Changelog**: Historische Modelle als Blog-Einträge auf der Landingpage
- [x] **Suchfunktion**: Live-Filter nach Modell-ID, Tags, Rolle, Beschreibung
- [x] **Admin-Button im Header**: Code-Verwaltung direkt aus Header für Admin
- [x] **Auto-Installer Merge-Logik**: Bei existierenden Configs: Überschreiben/Auskommentieren/Mergen möglich
- [x] **Login-Flow vereinfacht**: Root zeigt NUR Login, nach Auth → Landing → App
- [x] **Codebasis bereinigt**: Orphan-Dateien gelöscht, tote Imports entfernt, auth.js entschlackt

## Meilenstein 1: Infrastruktur

- [ ] **Backend-Validierung**: Echter Lizenz-Server zur Verifizierung von Kaufdaten
- [ ] **E-Mail-Benachrichtigung**: Secrets MAIL_USER/MAIL_PASS in GitHub setzen für Modell-Change-Mails

## Meilenstein 2: Tool-Erweiterung

- [ ] **Antigravity Endpoint Sync**: Verifizierung der API-Endpunkte für Antigravity-Core
- [ ] **Erweiterte Tool-Datenbank**: ~50 weitere Tools/Plugins
- [ ] **Kategorie-Filter**: Filter nach Tool-Typ (CLI, IDE, Browser, Cloud)

## Meilenstein 3: User Experience

- [ ] **Service Worker**: Offline-Modus für Installationsanleitungen
- [ ] **One-Click Copy**: Config-Blöcke direkt in Zwischenablage
- [ ] **Dark/Light Mode Sync**: Automatisch an OS-Farbschema anpassen

## Meilenstein 4: Kommerzialisierung

- [ ] **Stripe/PayPal Integration**: Echtes Payment für Bundles
- [ ] **Rechtliche Dokumente**: Impressum, DSGVO, AGB
- [ ] **Automatisierter E-Mail Versand**: Download-Link nach Zahlung

## Backlog

- **Echte Metriken aus API:** Uptime/Latency aus `/models/{author}/{slug}/endpoints` – benötigt `OPENROUTER_API_KEY` als GitHub Secret
- **Custom Prompt Builder:** Editor für eigene Experten-Prompts (Premium)
- **Team-Lizenzen:** Zentrale Lizenz-Verwaltung für Teams
