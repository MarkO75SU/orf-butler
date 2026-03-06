# Roadmap: ORF-Butler Development

Dieses Dokument beschreibt die geplanten Erweiterungen und noch umzusetzenden Features für den ORF-Butler, um von einem Prototyp zu einem produktionsreifen Service zu gelangen.

## Meilenstein 1: Infrastruktur & Konnektivität
- [ ] **RSS-Feed Server-Side:** Umstellung des RSS-Feeds von einem lokalen Download auf eine serverseitig gehostete Datei (z. B. via GitHub Actions), damit Nutzer den Feed tatsächlich in Readern abonnieren können.
- [ ] **Backend-Validierung:** Implementierung eines echten Lizenz-Servers zur Verifizierung der Kaufdaten für den 4-Wochen-Update-Service (aktuell simuliert).
- [ ] **OpenRouter Live-Mapping:** Entwicklung einer Logik, die unbekannte neue `:free` Modelle automatisch einer "Standard-Rolle" zuweist, bis ein manuelles Experten-Mapping erfolgt.

## Meilenstein 2: Tool-Erweiterung & Deep Search
- [ ] **Antigravity Endpoint Sync:** Verifizierung der spezifischen API-Endpunkte für den Antigravity-Core, um den Status von `partial` auf `stable` zu heben.
- [ ] **Erweiterte Tool-Datenbank:** Erfassung von weiteren ~50 populären Nischen-Tools (z. B. spezialisierte IDE-Plugins für Rust oder Go).
- [ ] **Kategorie-Filter:** Einführung von Filtern in der Suche nach Tool-Typ (CLI, IDE, Browser-Extension, Cloud).

## Meilenstein 3: User Experience & PWA
- [ ] **Service Worker Integration:** Aktivierung des Offline-Modus, damit die Installationsanleitungen auch ohne aktive Internetverbindung im lokalen Butler gelesen werden können.
- [ ] **One-Click Copy:** Hinzufügen eines Buttons, um einzelne Instruktionsblöcke direkt in die Zwischenablage zu kopieren (zusätzlich zum Datei-Download).
- [ ] **Dark/Light Mode Sync:** Automatische Anpassung an das Betriebssystem-Farbschema (aktuell fest auf Dark-Mode).

## Meilenstein 4: Kommerzialisierung
- [ ] **Stripe/PayPal Integration:** Einbindung eines echten Payment-Gateways für die 5€ und 20€ Bundles.
- [ ] **Rechtliche Dokumente:** Erstellung von Impressum, Datenschutzerklärung (DSGVO) und AGB, die dynamisch in das Bundle aufgenommen werden.
- [ ] **Automatisierter E-Mail Versand:** Versand des Download-Links und der Lizenz-ID direkt nach Zahlungseingang.

## Feature Backlog (Ideenpool)
- **Modell-Benchmark-Integration:** Anzeige von Live-Geschwindigkeitsdaten (Latenz) der Gratis-Modelle direkt im Roster.
- **Custom Prompt Builder:** Ein interaktiver Editor für Premium-Nutzer, um eigene Experten-Prompts vor dem Export in die Config zu integrieren.
- **Team-Lizenzen:** Bundles für ganze Entwickler-Teams mit zentraler Lizenz-Verwaltung.
