# Deliveries + Akzeptanztests (SD-DEL-01)
Jede Delivery dokumentiert: tatsächlichen GitHub-Commit, Arbeitsbranch, Modell, API-Calls, sichtbare UI, Backend-Verträge, Testplan, gefundene Bugs und Deployed URL. **Work** implementiert und testet die komplette Hauptapp in AI Studio Build; Work erstellt auch die isolierten Komponenten. Work setzt Status erst nach Browsernachweis auf Done.

| ID | Ergebnis | Mindesttests |
|---|---|---|
| D0 | AI Studio Build erzeugt minimales React/Node-Gerüst **im bestehenden Repo**. Work etabliert CI, Preview/Deployed URL, private Secrets. | Repo-Push und Pull beide Richtungen; Browser zeigt App, Build und Schema-Checks laufen; keine Secrets im Repo. |
| D1 | C01–C04 integriert, Solo 10 Runden spielbar, autorenmarkierter append-only Text und neue Frage. | exakt 2 ernste+1 ironische Option, Freitext, Kommentare; 10 Runden; Fehler/429/JSON kaputt; Doubleclick; Handy. |
| D2 | C05–C07: Replay, Branch, Speicherbibliothek, Prompteditor, 4 Promptfelder. | Zurück/Weiter deterministisch, Reload/Speichern, Prompt-Versionierung, UX leer/Fehler, Autorisierung. |
| D3a | C08 TTS mit Pro-Use-Case Stimme und Audiocache. | verschiedene Stimmen, Pause/Weiter, Cache-Hit ohne neue Kosten, lange Geschichte. |
| D3b | C09/C14 Kostenanzeige, harte Caps, geschützte API-Debug-Konsole. | Limit überschreiten, retry, 429, Prompt/Effektivanfrage nur für Admin, Token-Felder, Preislisten-Version. |
| D4 | C10 2er Duo lokal + Remote-Einladungsraum. | 2 Browser, Reconnect, Turn-Rechte, atomare Versionierung, privater Invite. |
| D5 | C11 separater Duo-Chat und sparsame KI-Gesprächsanregungen. | nur Mitglieder lesen/schreiben; Reihenfolge; Offline; Abuse/Block. |
| D6 | C12 Matching nach Sprache/Thema/grobem Entfernungsradius. | empty state, Radius-Erweiterung, keine genauen Positionsdaten, Block/Unmatch. |
| D7 | C13 drei Cartoon-Antwortmöglichkeiten + Dateiexport. | jede Grafik hat semantischen Text, Integration bleibt Prosa, Budget, TXT/MD/PDF. |

**Tabellen-ID: SD-DEL-T01**

## Arbeitsregel
Jede Lieferung beschränkt sich auf wenige Module und ca. max 1–2k zusätzliche/geänderte Codezeilen. Vorher SPEC + ROADMAP anpassen. Work entwickelt isolierte Komponenten samt Manifest+Demo+Tests und integriert diese **selbst** über den AI-Studio-Build-Chat. Danach öffnen: aktuelle laufende/deployte App, echte Events auslösen, Screenshot/Log-Auswertung, Bugs fixen. `reports/reviews/YYYY-MM-DD-<commit>.md` ohne Nutzerdaten ablegen. Folgeschritt nur nach realer Bestandsaufnahme.

## D0: Implementierung und Preview verifiziert, Veröffentlichung offen
Stand 2026-10-17: Work hat die eine React/Node-App in AI Studio erstellt, nativen GitHub-Push/Pull in beide Richtungen verifiziert und die laufende technische Vorschau mit Desktop-/Mobilbrowser geprüft. Final geprüfter Code: `7eb1e1c643e9f2eb8817e5d663fcae0f13251b60`. CI, Validator, Typecheck, Build und Produktions-API-/Fehlertests sind grün. Bericht: [SD-D0-REVIEW-01](../reports/reviews/2026-10-17-7eb1e1c.md).

D0 bleibt IN PROGRESS, weil die öffentliche Cloud-Run-Veröffentlichung durch die automatische Freigabeprüfung blockiert wurde und ausdrückliche Nutzerfreigabe benötigt. Es existiert eine getestete Entwicklungsvorschau, aber noch keine dauerhafte öffentliche Deployment-URL. Nach Freigabe veröffentlichen, URL erneut testen und erst dann D0 als DONE markieren. D1 wurde nicht begonnen.
