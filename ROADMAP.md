# Roadmap – StoryDuett
Stand 2026-10-17. Zuständigkeit für Implementierung, Browser-Bedienung und Fehlerbehebung: **ChatGPT Work**. 'Done' nur nach nachprüfbarem Code und Test.

| ID | Status | Ziel | Nachweis |
|---|---|---|---|
| P0 | DONE | Konzept / Architektur / Contracts / initiale Repository-Checks sichern | Dateien auf `main`, `node scripts/validate.mjs` |
| D0 | DONE | Work verbindet bestehendes GitHub-Repo mit AI Studio, erzeugt minimales React/Node-Gerüst, arbeitet aus Repo | Repo-Sync beide Richtungen, Build/CI grün, https://storyduett.ai.studio/, Bericht SD-D0-DEPLOY-01 |
| D1 | IN PROGRESS | Solo-Flow über C01–C04: Start, Auswahl/Freitext, Kommentar, Integration, neue Frage | 10-Runden-E2E, Fehlerfälle, mobile Ansicht |
| D2 | TODO | C05–C07: Replay/Branches, Story-Bibliothek, Use-Case-Mini-CMS mit 4 Prompts | Refresh/Wiederaufnahme, Promptversionen, Rechte |
| D3a | TODO | C08: TTS und Audio-Caching | zwei Stimmen, wiederholte Abspielung ohne neuen Request |
| D3b | TODO | C09/C14: harte Caps und geschützte API-Debug-Konsole | Token-/Kostenlogs, per-feature/blocking, Rollenprüfung |
| D4 | TODO | C10: lokales Duo + Remote-Einladungen | zwei Browser; Turn Ownership; Reconnect |
| D5 | TODO | C11: Duo-Chat + KI-Anregung | Berechtigungen, offline/resume |
| D6 | TODO | C12: Matching in grobem Radius | Privacy, empty state, block/unmatch |
| D7 | TODO | C13: Cartoon-Antworten + Exporte | Textbeschreibung und Budget, Downloads |

**Tabellen-ID: SD-ROADMAP-T01**

## Vorgehen
- Jede Delivery max. etwa 1.000–2.000 geänderte Codezeilen, nötigenfalls teilen.
- Vor Codeänderungen SPEC und ROADMAP aktualisieren, Contract/Manifest festlegen.
- Komponenten einzeln testen (Demo + automatisiert) und nur versionierte Artefakte integrieren.
- **Work** testet die veröffentlichte App mit Browseragent nach jeder Delivery, erfasst reale Bugs, korrigiert und aktualisiert Roadmap.
- Keine Phase als DONE markieren allein aufgrund generierten Codes oder eines AI-Studio-Erfolgstexts.

## D0 Ausführung – 2026-10-17
- Ausgangscommit: `2d610c3e80ad29f1d4e6529a4ecf7750047d96d8`.
- Alle verlinkten Spezifikationen, Verträge und Delivery-Dokumente gelesen.
- `node scripts/validate.mjs`: bestanden (10 Use Cases, vier Prompts je Use Case). Baseline GitHub Actions Run `39054201692`: success.
- D0 Full-Stack-Gerüst (React 19 + Node Express, Port 3000 / 0.0.0.0) im existierenden Repository bereitgestellt.
- Endpunkte `GET /api/health` und `GET /api/use-cases` implementiert; Katalogprojektion schützt interne Prompts und Geheimnisse.
- Externe Übersetzungen DE/EN/RU eingebunden; mobile-first Vorschau der 10 aktiven Use Cases aus `prompts/catalog.json`.
- Automatisierte Tests `scripts/test-api.mjs`, `scripts/validate.mjs` und `npm run build` erfolgreich durchgeführt.
- GitHub-Sync und browserbasierte Endabnahme erfolgen durch ChatGPT Work. Status von D0 bleibt IN PROGRESS bis zur erfolgreichen Verifikation. D1 bleibt TODO.


- AI Studio → bestehendes GitHub-Repository erfolgreich: Commit `b8901dc568a4d7337a18269ed41d6406e6e96c71`; Oberfläche meldet synchron. Kein Zweitrepository, keine gelöschten Planungsdateien.
- Weitere Build-Prompts durch kostenloses AI-Studio-Tageskontingent blockiert. Work führt die restlichen D0-Korrekturen direkt am Code aus und prüft GitHub → AI Studio Pull.
- Browserbefunde: Header/Status bei Mobilbreite laufen über; Statusanzahl war hartkodiert; Requests ohne Timeout. Korrektur und Regressionstest vor D0-Abnahme.

## Verifizierter D0-Zwischenabschluss
- Code `7eb1e1c643e9f2eb8817e5d663fcae0f13251b60`; GitHub Actions Run `39057228855`: success.
- AI Studio ↔ GitHub nativer Push/Pull in beide Richtungen bestanden. Laufende Produktionsvorschau mit Desktop-/Mobilbrowser getestet, alle gefundenen D0-Code-/UI-Bugs behoben.
- Bericht und Screenshots: `reports/reviews/2026-10-17-7eb1e1c.md`, `reports/evidence/2026-10-17-d0/`.
- Erledigt nach Nutzerfreigabe am 2026-10-17 um 20:37: im bestehenden Projekt veröffentlicht, öffentliche URL geprüft. D0 ist DONE.
- D1 bleibt TODO und darf vor diesem Abschluss nicht begonnen werden.

## D0 DONE – öffentlicher Abschluss
- URL: https://storyduett.ai.studio/; veröffentlicht aus `2535345` (Code `7eb1e1c`).
- Öffentliche DE/EN/RU-UI, Katalog/Filter/Suche/Leerzustand, Dialog/Escape/Fokusrückkehr und Health-Refresh im Cloud Browser bestanden. Anonyme HTTP-Checks: Health/Katalog200, unbekannte/private spätere API404, keine Rohdatei-/Schlüssel-Leaks.
- Abschlussbericht: `reports/reviews/2026-10-17-2535345.md`; Screenshot/HTTP-Nachweis unter `reports/evidence/2026-10-17-d0/`.
- D1 wurde nicht begonnen. Nächster Auftrag muss ausdrücklich D1 behandeln; bestehende veröffentlichte App als Ausgangsstand verwenden.

## D1 Ausführung
Autorisierter Folgeauftrag vom 2026-10-17; Ausgang64e7518. Intern: D1a isolierte Komponenten; D1b Story-Engine/Provider/Budgets; D1c Integration und echte Browserabnahme. Jede Teillieferung erhält Tests. D1 DONE erst nach zehn echten Runden, Fehler-/Budget-/Mobilprüfung und Veröffentlichung derselben App.

- D1a/PR2 und D1b/PR3 sind nach grüner CI gemergt. C01–C04, Engine, React-Integration und Kostenreservierung implementiert. Reale Providerstarts scheitern aktuell an der Runtime-Keykonfiguration (HTTP400/api-key), einschließlich nativer Free-Tier-Alternative. Keine erfolgreiche10-Runden-Abnahme und keine D1-Veröffentlichung behauptet. Öffentliche D0-App bleibt erhalten. Details im D1-Zwischenbericht; D1 bleibt IN PROGRESS.

D1-Zwischenbericht: [SD-D1-REVIEW-01](reports/reviews/2026-10-17-c4521a6.md). Code c4521a6, automatisiert/CI geprüft; echte10-Runden-Abnahme durch Runtime-Keykonfiguration blockiert. D1 bleibt IN PROGRESS, öffentlich weiterhin D0.

## D1 Schlüsseldiagnose – Fortsetzung 2026-10-19
Die Nutzung vorhandener Projektschlüssel und Veröffentlichung nach bestandenen Tests sind autorisiert. Gespeicherter Projektschlüssel tatsächlich getestet: Google meldet API_KEY_INVALID. Keine erfolgreiche echte Generierung/10-Runden-Abnahme; D1 weiterhin IN PROGRESS, öffentlich D0. Sichere Diagnosekorrekturen implementiert, Lockdatei erhalten. [Aktueller Bericht SD-D1-REVIEW-02](reports/reviews/2026-10-18-d1-key-diagnosis.md).
- Neuer Diagnoseversuch: Nutzer hat neuen Serverschlüssel im bestehenden Projekt genehmigt (`SD_GEMINI_API_KEY`). Zentraler serverseitiger Schlüssel-Resolver wählt prioritär nicht-leeres `SD_GEMINI_API_KEY`, sonst `GEMINI_API_KEY` (für Provider und `/api/play-config`). Kein Frontend-Bezug.
- Neue Nutzer-Kostenvorgabe: Höchstens 2 EUR zusätzliche Kosten pro Monat. Der aktuelle instanzlokale Tageszähler garantiert das nicht; es wird kein globales 2EUR-Limit behauptet. Öffentliche D1-Veröffentlichung bleibt bis passender Kostenabsicherung und echter Abnahme gesperrt. D1 bleibt IN PROGRESS, öffentlich D0.
- Echter Browsernachweis erbracht: Start + 5 Runden mit Gemini 3.5 Flash Lite erfolgreich (Freitext/Kommentar/Append-only). 0.01-USD-Session blockiert danach korrekt vor dem nächsten Call (6 Calls, Story unverändert).
- Zuverlässigkeitskorrekturen: C03 unabhängige `disabled: boolean`-DOM-Property (Eingabensperre ohne `aria-busy` und ohne Arbeitsstatus-Meldung); bereinigtes stdout-Logging für `sd_api_usage`; Server-Killswitch `SD_AI_ENABLED=false` im Resolver; Bereinigung technischer ErrorInfo-Konstanten aus dem Spieler-Banner. Keine DB/D2.
