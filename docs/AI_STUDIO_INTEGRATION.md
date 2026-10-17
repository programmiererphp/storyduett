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
