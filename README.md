# StoryDuett

Eine React/Node-App im bestehenden Repository, verbunden mit der bestehenden [Google-AI-Studio-App](https://aistudio.google.com/apps/57b82b35-8dbc-4c3d-bcc7-bf454333f191).

**Öffentlich:** https://storyduett.ai.studio/ – verifiziertes D0. **D1: IN PROGRESS**, Komponenten/Engine/Integration implementiert und automatisiert geprüft; echte KI-Abnahme wegen ungültiger Runtime-Schlüsselkonfiguration noch blockiert. Keine abgeschlossenen zehn echten Spielrunden behauptet, D1 noch nicht veröffentlicht. D2 nicht begonnen.

## Lokal
Node22+, `npm ci`, `npm run validate`, `npm run typecheck`, `npm run build`, `npm test`. Start mit `npm start` (PORT default3000). `npm run dev` baut denselben statischen Produktionsstand. Echte Generierung benötigt GEMINI_API_KEY ausschließlich in der Serverumgebung; keine Schlüssel ins Repo/Frontend. Ohne Schlüssel bleibt der Katalog lesbar, Spielstart ist gesperrt. Tests benötigen keinen echten Schlüssel und verwenden klar gekennzeichnete Fixtures; diese ersetzen nicht die reale Endabnahme.

## D1-Code
C01–C04 unter packages/components (Manifest, ESM, Demo, Tests, README), Integration src/Component.tsx. Versionierte Prompts/Katalog serverseitig, ein kombinierter Gemini-Aufruf je Runde, immutable Story-Knoten/Originalantworten, sichere Sitzungszugriffe, Versions-/Idempotenzprüfung. Harte Call-/Sessionbudgetprüfung vor Call, echte Usage-Metadaten/null und konservative Fehlerabrechnung. Sitzungen bis2h flüchtig; kein dauerhaftes Resume/Library/CMS (D2).

Details, verifizierte Preise, API-Verträge, Kosten- und Betriebsgrenzen: [SD-D1-IMPL-01](docs/D1_IMPLEMENTATION.md). D0: [öffentlicher Abnahmebericht](reports/reviews/2026-10-17-2535345.md). Specs: [SPEC](SPEC.md), [Roadmap](ROADMAP.md), [Architektur](docs/ARCHITECTURE_V1.md), [Komponenten](docs/COMPONENTS_V1.md), [Deliveries](docs/DELIVERIES_V1.md).

D1-Zwischenbericht: [SD-D1-REVIEW-01](reports/reviews/2026-10-17-c4521a6.md). Code c4521a6, automatisiert/CI geprüft; echte10-Runden-Abnahme durch Runtime-Keykonfiguration blockiert. D1 bleibt IN PROGRESS, öffentlich weiterhin D0.

## D1 Schlüsseldiagnose – Fortsetzung 2026-10-19
Die Nutzung vorhandener Projektschlüssel und Veröffentlichung nach bestandenen Tests sind autorisiert. Gespeicherter Projektschlüssel tatsächlich getestet: Google meldet API_KEY_INVALID. Keine erfolgreiche echte Generierung/10-Runden-Abnahme; D1 weiterhin IN PROGRESS, öffentlich D0. Sichere Diagnosekorrekturen implementiert, Lockdatei erhalten. [Aktueller Bericht SD-D1-REVIEW-02](reports/reviews/2026-10-18-d1-key-diagnosis.md).
