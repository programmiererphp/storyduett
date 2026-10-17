# StoryDuett

KI-unterstütztes gemeinsames Geschichtenerzählen, Sprachlernen und Kennenlernen. **Ein einziges GitHub-Repository für die vollständige Webapp** inklusive AI-Studio-Build-Code, Web Components, Prompts, Tests und bereinigten Diagnosedaten.

**Stand 2026-10-17:** D0-Planung und Verträge im Repository; die Hauptanwendung ist **noch nicht** implementiert oder deployed. Die künftige Implementierung, AI-Studio-Steuerung und Fehlerbehebung erfolgt durch **ChatGPT Work** (Cloud Browser), nicht durch den Nutzer.

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
`node scripts/validate.mjs` prüft die Planungsartefakte ohne externe Abhängigkeiten. **Es ist kein Test einer laufenden Webapp.**

Offizielle Referenzen: https://ai.google.dev/gemini-api/docs/aistudio-build-mode · https://ai.google.dev/gemini-api/docs/models · https://ai.google.dev/gemini-api/docs/speech-generation
