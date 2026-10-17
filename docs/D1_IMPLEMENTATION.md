# Delivery D1 Implementierungsvertrag
Referenz: SD-D1-IMPL-01. Status IN PROGRESS. Ausgang64e7518.

## Gelesene Grundlagen
SPEC, ROADMAP, PRODUCT_CONCEPT_V1, ARCHITECTURE_V1, COMPONENTS_V1, DELIVERIES_V1, AI_STUDIO_INTEGRATION, LOGGING_SECURITY, contracts/story.contracts.ts, Promptkatalog, Usage-/Pricing-Schemata und beide D0-Reviews. Eine App/ein Repository, kein D2.

## Teillieferungen
D1a: C01–C04 unter packages/components, je eigenes Manifest, typisierte DOM-Properties, composed/bubbling CustomEvents, Shadow DOM, ESM-Bundle, Demo, automatisierte DOM-Tests. Keine Provider-/Speicherlogik. React-Adapter setzt Properties und entfernt Eventlistener.
D1b: serverseitiger Gemini-Adapter; strukturierte und danach semantisch validierte Ausgabe, exakt zwei serious/eine ironic Option. Ein Startcall und ein Call je Runde. Unveränderliche Knoten/Rohantwort, Versionsprüfung/Idempotenz; atomarer Commit erst nach vollständiger Validierung. Zugriff capability-basiert; D1 flüchtige Sitzungen mit Ablauf, D2 Persistenz später.
D1c: Integration in vorhandene App über AI Studio Build, echte Tests ohne simulierte Endabnahme. Einheitlicher Produktionsbuild wie D0, bestehende GitHub-Anbindung.

## Modell-/Preisprüfung am 2026-10-17
Offizielle Quellen: https://ai.google.dev/gemini-api/docs/models und https://ai.google.dev/gemini-api/docs/pricing sowie /docs/models/gemini-3.5-flash-lite . Die bislang ungeprüften IDs existieren laut aktuellem Katalog tatsächlich. Für D1 wird bewusst der günstigere stabile Textkandidat gemini-3.5-flash-lite vereinheitlicht: Standardtarif USD0.30/Mio Input, USD2.50/Mio Output inklusive Thinking. Cache konservativ als normaler Input abgerechnet; keine Tools/Grounding/Audio. Konto-Verfügbarkeit muss zusätzlich durch echte Runtime-Antwort nachgewiesen werden. TTS bleibt deaktiviert und seine Tarife ungeprüft.

## Kosten- und Datenschutzregeln
Limits werden serverseitig vor dem Request reserviert und im Fehlerfall konservativ belastet, sofern Verbrauch unbekannt ist. Provider-Key ausschließlich Backend-Umgebung; keine Geheimniswerte anzeigen/übertragen. Keine Rohprompts, Antworten, Capability-Tokens oder privaten Geschichten im öffentlichen Repository; Testnachweise enthalten nur aggregierte Messwerte und Prüfergebnisse. Für Browsertests ausschließlich künstliche Eingaben verwenden.
