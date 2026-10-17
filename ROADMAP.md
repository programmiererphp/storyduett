# Roadmap – StoryDuett
Stand 2026-10-17. Zuständigkeit für Implementierung, Browser-Bedienung und Fehlerbehebung: **ChatGPT Work**. 'Done' nur nach nachprüfbarem Code und Test.

| ID | Status | Ziel | Nachweis |
|---|---|---|---|
| P0 | DONE | Konzept / Architektur / Contracts / initiale Repository-Checks sichern | Dateien auf `main`, `node scripts/validate.mjs` |
| D0 | TODO | Work verbindet bestehendes GitHub-Repo mit AI Studio, erzeugt minimales React/Node-Gerüst, arbeitet aus Repo | Repo-Sync beide Richtungen; Build läuft; veröffentlichte Test-URL und Browser-Screenshot |
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
