# StoryDuett – Architektur V1.0 (SD-ARCH-01)

## Ein Repository – keine zwei Hauptapps
- `main` ist die **einzige** kanonische App-Codebasis. Der von Google AI Studio Build generierte React-/Node-Code wird in dieses bestehende Repository synchronisiert.
- ChatGPT Work steuert alle Entwicklungsaufgaben: AI Studio im Cloud Browser, GitHub-Versionen, Backend, Komponenten und deployed Browser-Tests.
- Getrennte isolierte Pakete `packages/components/<component>` enthalten DOM-basierte Custom Elements (Shadow DOM, ESM, keine Gemini-Schlüssel oder Firebase-Logik).
- `packages/contracts` bzw. `contracts` enthält gemeinsame API-/Event-/Persistenzdatentypen. Falls AI Studio Ordner anders anlegt: vorhandene funktionsfähige Struktur respektieren, nicht duplizieren.
- UI-Framework/-Routing und Auth gehören der AI-Studio-Hauptapp; Web Components sind reine Darstellungs-/Interaktionselemente.

## Story Engine (serverseitig)
**Start:** User wählt Use Case. Service lädt versioniertes P1+P2, erzeugt und validiert Opening+Question, speichert Root Node.

**Turn:** `sd:answer-submit` → Auth/Rollen/Rundenbesitz/Session-Version/IdempotencyKey/Kostenlimits prüfen → gespeicherte Originalantwort → P3 Kommentar + P4 Integration + P2 nächste Frage in **einem** strukturierten Gemini-Request → validieren → atomarer Commit neuer Story Node → Client-Update. Bei Fehler bisheriger Zustand unverändert, kontrollierte Wiederholung.

**Formatvorgabe:** `{comment:{kind,text}, appendedSegments:[{kind,text,actorId}], nextQuestion:{id,text,options:[{id,text,tone}]}}`. Exakt drei Optionen: 2 serious + 1 ironic; beim Sprachlernen kann `ironic` humorvoll statt unangemessen sein. Originalantwort erhält separate Speicherung und Kennzeichnung.

**Geschichtskonsistenz:** keine Änderungen früherer Segmente. Für lange Geschichten Kontextfenster plus versionierte Summary. Alle an KI geschickten Informationen sind im privaten Debug nachvollziehbar.

## Persistenz
Vorschlag Firebase Auth + Firestore für private Use Cases, Stories, immutable Nodes, Permissions, Sync/Chat, API-Usage; Cloud Storage für TTS/Cartoons. Architektur kann Work bei vorhandener besserer AI-Studio-Integration begründet anpassen, Schnittstellen erhalten. Realtime-Duo: aktuelle Spieler-ID + atomare Versionsprüfung, Nachrichten nur für Raumteilnehmer.

## Modelldienste
Kostengünstiger Textstartkandidat `gemini-3.5-flash-lite`, Qualitätsvergleich `gemini-3.8-flash`; runtime-verfügbare Modell-IDs prüfen. TTS `gemini-3.8-flash-tts` für erzählerische Qualität, `gemini-3.8-flash-lite-tts` für günstigere Varianten. Je Use Case Stimme, Stil, Tempo. Cache-Schlüssel aus Text+Stimme+Stil+Tempo+Modellversion. Kein TTS im Frontend.

## Kostenkontrolle & Logging
Harte Cap pro API-Call, Session, Feature (Text, Audio, Cartoon, Chat), pro Nutzer/Tag und optional Projekt; Limits serverseitig vor Call, Reservierung für geschätzten Maximalverbrauch und nachträgliche Abrechnung. Kosten immer als Schätzung kennzeichnen. Admin kann individuelle Nutzerlimits anpassen. Runtime-Protokoll erfasst Request-ID, Versions-IDs, Modell, Preislisten-Version, Input/Output/Thinking/Cached/Audio-Token (soweit geliefert), Latency, Status, Fehler und gesendeten effektiven Prompt nur in geschütztem Debugbereich. Öffentlich nur Tests/synthetische Logs.

## Sync- und Codeownership
1. Work prüft `main`, SPEC/ROADMAP, deployed URL und alte Testberichte.
2. Work editiert App-Integration über AI Studio, führt Funktionstests aus, synchronisiert nach GitHub.
3. Work editiert einzelne Komponenten isoliert über branch/PR; nach Tests merged; AI Studio importiert aktuellen Commit.
4. Niemals zeitgleich dieselben Dateien in AI Studio und GitHub überschreiben. Bei Konflikten Git-Diff prüfen, vorhandene Funktionsfähigkeit erhalten.
5. Für jeden Delivery gibt es einen tatsächlich geprüften Browser-Testbericht mit Build-/Commit-ID und Fundstellen für Bugs.

## Sicherheitsgrenzen
Authentifizierung/Autorisierung auf dem Server, API-Keys nur AI Studio Secrets/Backend; Datenschutz, Impressum, Datenlöschung/Export vor öffentlichem Start; Matching ohne exakten öffentlichen Standort, Nutzerblockierung. Keine privaten Produktionslogs im öffentlichen Git.

D1-Darstellungsprojektion (2026-10-26, SD-D1-READ-01): Unveränderliche StorySegmentV1 bleiben unabhängig vom C02-Lesemodus. GET/api/use-cases projiziert nur Metadaten plus presentation und den ausdrücklich öffentlichen integratePrompt. Andere Promptbereiche, Systemanweisungen und Providerkonfiguration bleiben intern. Dieselbe versionierte Integrationsanweisung wird im vorhandenen kombinierten serverseitigen Modellcall verwendet; keine neuen KI-Aufrufe und keine D2-Persistenz.
