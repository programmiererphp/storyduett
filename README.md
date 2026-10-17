# StoryDuett

KI-unterstütztes gemeinsames Geschichtenerzählen, Sprachlernen und Kennenlernen. **Ein einziges GitHub-Repository für die vollständige Webapp** inklusive AI-Studio-Build-Code, Web Components, Prompts, Tests und bereinigten Diagnosedaten.

**Stand 2026-10-17:** Delivery D0 technische Vorschau (React 19 + Node Express auf Port 3000 / 0.0.0.0). Bereitgestellt sind echte Endpunkte `GET /api/health` und `GET /api/use-cases` (sichere öffentliche Projektion ohne interne Prompts oder Modell-IDs) sowie eine schlanke Vorschau der 10 Use Cases in DE/EN/RU. Interaktives Storytelling (Solo C01–C04) folgt in D1; Steuerung und Browserabnahme erfolgen durch **ChatGPT Work**.

## Einstieg für ChatGPT Work

1. Lies [SPEC.md](SPEC.md), [ROADMAP.md](ROADMAP.md), [docs/WORK_D0_EXECUTION.md](docs/WORK_D0_EXECUTION.md).
2. Führe den D0-Auftrag **selbstständig** in Google AI Studio Build aus und verknüpfe dort **dieses bestehende Repo**. Kein zweites GitHub-Repo, keine zweite App-Kopie im Repository.
3. Folge dem Delivery-Plan in [docs/DELIVERIES_V1.md](docs/DELIVERIES_V1.md). Work entwickelt isolierte Web Components samt Manifest/Demo/Tests; steuert außerdem die vollständige App-Integration, API, Datenbank, Browser-Tests und Bugfixing in AI Studio Build.
4. Vor jedem Code-Change: SPEC + ROADMAP anpassen. Danach automatisierte Tests sowie Browserprüfung der **tatsächlich laufenden** App dokumentieren.
5. Keine Secrets, privaten Texte, Nutzerdaten oder unbereinigten API-Prompts in einem öffentlichen Repository speichern.

## Dokumente
- [Produktkonzept](docs/PRODUCT_CONCEPT_V1.md) · [Architektur](docs/ARCHITECTURE_V1.md)
- [Komponenten](docs/COMPONENTS_V1.md) · [Deliveries](docs/DELIVERIES_V1.md)
- [Work D0 Auftrag](docs/WORK_D0_EXECUTION.md) · [AI Studio Integration](docs/AI_STUDIO_INTEGRATION.md)
- [Logging / Datenschutz](docs/LOGGING_SECURITY.md) · [Promptkatalog](prompts/catalog.json)

## Status / Checks
- `node scripts/validate.mjs` prüft die Planungsartefakte und Verträge ohne externe Abhängigkeiten.
- `npm test` führt isolierte API-Tests (`GET /api/health`, sichere `GET /api/use-cases` Projektion, 404) auf eigenem Port aus.
- `npm run typecheck` & `npm run build` prüfen TypeScript-Typen und das Produktions-Bundle.

Offizielle Referenzen: https://ai.google.dev/gemini-api/docs/aistudio-build-mode · https://ai.google.dev/gemini-api/docs/models · https://ai.google.dev/gemini-api/docs/speech-generation


## D0: verifizierte technische Vorschau
Codecommit `7eb1e1c643e9f2eb8817e5d663fcae0f13251b60`, [Review und Tests](reports/reviews/2026-10-17-7eb1e1c.md), [Modulverträge](docs/D0_MODULES.md), [Build-Eingaben](docs/build-prompts/D0_2026-10-17.md).

- [AI-Studio-Projekt](https://aistudio.google.com/apps/57b82b35-8dbc-4c3d-bcc7-bf454333f191?showAssistant=true&showPreview=true)
- [Getestete laufende Vorschau](https://ais-dev-4xncdtwz7pslafeok6mckl-237548413897.europe-west2.run.app/) – temporäre Entwicklungsvorschau, keine dauerhafte öffentliche Veröffentlichung.
- Nativer GitHub-Push und Pull im bestehenden Repo geprüft. Die öffentliche Veröffentlichung wartet auf ausdrückliche Freigabe; D0 bleibt deshalb offen.
- Lokal: `npm ci`, `npm run typecheck`, `npm run build`, `npm test`, `npm start`. `npm run dev` baut ebenfalls den Produktionsstand und startet ihn; nach Codeänderungen neu starten. Keine API-Schlüssel erforderlich.
- Noch keine Storygenerierung, kein Modellaufruf, keine Datenbank, kein Chat/TTS/Duo. D1 wurde nicht begonnen.
