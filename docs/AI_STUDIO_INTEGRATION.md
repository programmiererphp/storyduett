# AI Studio ↔ GitHub ↔ Work (SD-INTEGRATION-01)

**Keine manuelle Implementierung durch Nutzer.** ChatGPT Work bedient AI Studio im Cloud Browser, startet Prompt-Chats, testet, behebt Fehler und synchronisiert GitHub. Work muss verifizieren, welche AI-Studio-Version/Features im tatsächlichen Konto verfügbar sind.

## Sicherer Ablauf
1. Repo `programmiererphp/storyduett` enthält die kanonischen specs/contracts; `main` ist source of truth.
2. AI Studio Build importiert das Repo (oder erstellt minimale App und verknüpft das *vorhandene* Repo). Kein `storyduett-2`, kein Zweitrepo.
3. UI/Backend-Änderungen in AI Studio → GitHub push/sync; vor Änderungen in Work immer neuesten Commit prüfen.
4. Standalone-Komponenten isoliert als ESM mit Manifest, Demo und Tests via Work entwickeln. Branch/PR, CI, Merge; dann AI Studio synchronisieren und im React-Shell integrieren.
5. Bei Git-Konflikt Dateien einzeln vergleichen; bestehende funktionierende Teile nicht überschreiben. Geprüfter Commit und Deployed URL in Reviewbericht.
6. Neues Modell, SDK oder API-Schema nur nach Verifikation ändern.

## Backend-API-Skizze (noch nicht implementiert)
- `POST /api/sessions` → persistierter Root + erste Frage
- `POST /api/sessions/:id/turns` → idempotente validierte Antwort, Kommentar, appendedSegments, nextQuestion
- `GET /api/sessions/:id` → autorisierter aktueller Zustand und Timeline
- `GET /api/use-cases` → aktive Presets, Sprache
- später `POST /api/tts`, `GET /api/usage`, `GET /api/admin/debug` mit serverseitiger Rollenprüfung

**Vertrag:** Contract-V1 in `contracts/story.contracts.ts`, Events/Manifeste in `docs/COMPONENTS_V1.md`; Datenbanktransaktionen und Kostenprüfung serverseitig.

## AI Studio Referenz
https://ai.google.dev/gemini-api/docs/aistudio-build-mode (GitHub Import + bidirektionale Synchronisation, React/Node, Secrets). Änderungen in AI Studio nur nach bestätigter tatsächlicher Verknüpfung.

## Tatsächlich beobachtete Oberfläche am 2026-10-17 (D0)
- Import: New app → Insert files → Import from GitHub → `programmiererphp/storyduett`, `main`. Der Dialog warnt ausdrücklich: „Imported code won't stay synced with GitHub.“
- Das importierte Projekt ist `57b82b35-8dbc-4c3d-bcc7-bf454333f191`.
- Settings → GitHub bietet „Sync to a new repository“ und „Force push to programmiererphp/storyduett“; die zweite Option ersetzt laut Dialog den main-Inhalt. Ein automatisch konfliktauflösender bidirektionaler Sync ist damit noch nicht nachgewiesen.
- Sicherungsbranch vor Rücksynchronisierung: `backup/d0-before-aistudio-2026-10-17`, Commit `87acaf15896f4d83228b0508ab6851ec697dd5a1`. Kein Zweitrepository.
- Vor einem Rückschreiben vollständigen Export/Diff prüfen, fehlende Planungs- und CI-Dateien erhalten. API-Dienste und private Schlüssel sind in D0 nicht nötig.
- Diese Beobachtungen ersetzen die unbestätigten Annahmen über native bidirektionale Synchronisation in den vorangehenden Abschnitten. Abschlussprüfung steht noch aus.

## Verifiziertes Ergebnis der nativen Verknüpfung
Die anfängliche Importwarnung betrifft den noch nicht verknüpften Import. Nach Auswahl „Force push to programmiererphp/storyduett“ wurde ein Dateidiff mit 17 Änderungen und keinen Löschungen angezeigt. „Push latest changes to GitHub“ erzeugte `b8901dc` als normalen Nachfolgecommit von `87acaf1`; die Historie wurde erhalten. Danach stellt Settings → GitHub tatsächlich „Pull changes to Google AI Studio“ für externe Commits bereit. Pull von `5417ac2` und `7eb1e1c` in dieselbe App wurde durchgeführt; die Oberfläche meldete jeweils synchron. Kein neues Repository und keine zweite App wurden angelegt.

Für weitere Deliveries: vor externen Änderungen Syncstatus prüfen, nach GitHub-Commit nativ pullen, App reloaden und den tatsächlichen Browserstand prüfen. Keine parallelen Änderungen an denselben Dateien.

## Öffentliche Bereitstellung abgeschlossen
2026-10-17: nach ausdrücklicher Freigabe Publish im vorhandenen Projekt `android-app-erstes` ausgeführt. AI Studio meldet Status Ready und https://storyduett.ai.studio/; die öffentliche Seite wurde geöffnet und praktisch getestet. Veröffentlichter Quellstand `2535345` (Code `7eb1e1c`). Keine Codeänderung durch die Veröffentlichung; GitHub meldete danach synchron. Abschlussdokumentation und HTTP-/Screenshotnachweise im Review `2026-10-17-2535345.md`.

D1-Zwischenbericht: [SD-D1-REVIEW-01](../reports/reviews/2026-10-17-c4521a6.md). Code c4521a6, automatisiert/CI geprüft; echte10-Runden-Abnahme durch Runtime-Keykonfiguration blockiert. D1 bleibt IN PROGRESS, öffentlich weiterhin D0.
