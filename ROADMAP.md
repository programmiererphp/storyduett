# Roadmap – StoryDuett
Stand 2026-10-17. Zuständigkeit für Implementierung, Browser-Bedienung und Fehlerbehebung: **ChatGPT Work**. 'Done' nur nach nachprüfbarem Code und Test.

| ID | Status | Ziel | Nachweis |
|---|---|---|---|
| P0 | DONE | Konzept / Architektur / Contracts / initiale Repository-Checks sichern | Dateien auf `main`, `node scripts/validate.mjs` |
| D0 | IN PROGRESS – deployment approval pending | Work verbindet bestehendes GitHub-Repo mit AI Studio, erzeugt minimales React/Node-Gerüst, arbeitet aus Repo | Repo-Sync beide Richtungen; Build läuft; veröffentlichte Test-URL und Browser-Screenshot |
| D1 | TODO | Solo-Flow über C01–C04: Start, Auswahl/Freitext, Kommentar, Integration, neue Frage | 10-Runden-E2E, Fehlerfälle, mobile Ansicht |
| D2 | TODO | C05–C07: Replay/Branches, Story-Bibliothek, Use-Case-Mini-CMS mit 4 Prompts | Refresh/Wiederaufnahme, Promptversionen, Rechte |
| D3a | TODO | C08: TTS und Audio-Caching | zwei Stimmen, wiederholte Abspielung ohne neuen Request |
| D3b | TODO | C09/C14: harte Caps und geschützte API-Debug-Konsole | Token-/Kostenlogs, per-feature/blocking, Rollenprüfung |
| D4 | TODO | C10: lokales Duo + Remote-Einladungen | zwei Browser; Turn Ownership; Reconnect |
| D5 | TODO | C11: Duo-Chat + KI-Anregung | Berechtigungen, offline/resume |
| D6 | TODO | C12: Matching in grobem Radius | Privacy, empty state, block/unmatch |
| D7 | TODO | C13: Cartoon-Antworten + Exporte | Textbeschreibung und Budget, Downloads |

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
- Offen: ausdrückliche Freigabe für öffentlichen Cloud-Run-Publish im bestehenden Projekt `android-app-erstes`/verknüpften Abrechnungskonto; anschließend veröffentlichte URL erneut testen und D0 final auf DONE setzen.
- D1 bleibt TODO und darf vor diesem Abschluss nicht begonnen werden.
