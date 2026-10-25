# StoryDuett – verbindliche Produktspezifikation V1.0
**Referenz:** SD-SPEC-01 | **Stand:** 2026-10-17 | **Status:** D0 DONE; D1 IN PROGRESS (Auftrag 2026-10-17).

## Ziel / Unterschied zu gewöhnlichen Story-Generatoren
Zwei Menschen (oder ein Mensch mit KI) bauen **inkrementell und gemeinsam** eine Geschichte, Lernübung oder einen Simulationstext. KI kommentiert jeden Beitrag lakonisch, stellt spielerische Folgefragen und erzeugt jeweils **genau drei Antworten: zwei ernsthafte und eine ironische**. Freitext ist immer möglich. Die App unterstützt später sozialem Kennenlernen nahe Wohnorten durch Matching und privaten Chat.

## Hauptflow (erstes MVP)
Use Case auswählen → KI erzeugt Anfangssatz und erste Frage → Nutzer wählt A/B/C oder schreibt frei → KI liefert je nach Use Case einen Kommentar / Sprachkorrektur → KI ergänzt **nur neue** kohärente Textsegmente → neue Frage → nächste Runde. Storybereich oben, nächste Aktion unten, mobile-first. Klare Loading/Fehlerzustände; nicht mehrfach absenden.

## Regeln
- Jeder menschliche Beitrag bleibt als Rohantwort unverändert gespeichert; die KI darf ihn für die organische Erzählform umformulieren, niemals frühere Segmente rückwirkend überschreiben.
- Unterschiedliche ruhige Autorenfarben und Autorennamen (nicht nur Farbe); KI-Brückentext neutral. Auch 2 lokale/remote Spieler.
- UI: aktuell lesen, wählen/diktieren/schreiben, fortsetzen. Einfache Navigation. Chronologischer Replay mit Pfeilen; Solo darf von einem historischen Punkt abzweigen; Remote-Duo nur per gemeinsamem Branch.
- Historische Fragen, Kommentare, Antworten, Promptversionen und Textsegmente unveränderlich speichern.
- Ein einzelner strukturierter Gemini-Call **kann** P3 Kommentar, P4 Integration und P2 Folgefrage gemeinsam abarbeiten; vier editierbare Promptbereiche bleiben unabhängig.
- TTS: pro Use Case Stimme, Stil und Tempo, default `gemini-3.8-flash-tts`, sparsame Alternative `gemini-3.8-flash-lite-tts`; Audio-Caching pro Segment und Voice-Konfiguration.
- Use Cases vollständig im Mini-CMS pflegbar: vier Prompts P1 Start, P2 Frage, P3 Kommentar, P4 Integration; Modell, TTS, Tonfall, Sprache, Niveau, Promptversionen, Kostenlimits, Aktivierung, Import/Export.
- Dauerhafte Speicherung: Sessions, Branches, Resume, Export als TXT/Markdown/PDF (spätere Delivery).
- Duo lokal, Remote per Invite-Link, Chat mit optionaler KI-Gesprächsbegleitung; später Matching nach Sprache/Interessen/grobem Radius, keine präzise öffentliche Position.
- Cartoon-Alternative: drei KI-Bilder ersetzen die sichtbaren Antworttexte; jedes Bild trägt eine gültige Beschreibung, die als Prosa integriert wird; als optionale spätere Delivery.
- Gesamt-UI Deutsch/English/Русский via Übersetzungsdateien, nicht im Komponentenquellcode fest verdrahten.
- Öffentliche rechtliche Seiten für Deutschland (Impressum/Datenschutz), verständliche Speicherung/Löschung/Export von Nutzerdaten vor öffentlichem Multiplayer-Launch.

## Kosten & Diagnose
Per Call, Session, Feature und Nutzer/Tag je hartes Budget; vor KI-Call serverseitig prüfen und begrenzten Betrag reservieren. Admin darf Limits pro Nutzer anpassen. UI zeigt verbraucht vs Limit. Audit-Log speichert exakte Provider-Metadaten, falls vorhanden; sonst `null`. Effektiv gesendete KI-Prompts im geschützten Admin-Debug (zeitlich begrenzt, deaktivierbar), niemals in Public GitHub.

## Nicht im ersten MVP
TTS, Matching, Realtime-Chat, Cartoon-Grafik, Prompt-Mini-CMS-UI, komplexe Rollenoberfläche. Diese Funktionen sind geplant, aber dürfen D1 nicht überladen.

## Kritische D1-Abnahmetests
1. 10 aufeinanderfolgende Runden mit identischen historischen Segmenten; je Runde exakt 3 Antworten + Freitext.
2. Genauer Ausdruck: 2x serious, 1x ironic, oder Korrektur bei Lernusecase; Antworten korrekt zugeordnet.
3. Kein doppelter Spielzug trotz Doppelclick/Retry; Kostenprüfungen serverseitig.
4. Fehlende API-Antwort, Timeout, 429, ungültiges JSON → verständliche UI, kein inkonsistenter Speicherstand.
5. Einfache mobile Ansicht mit sichtbar lesbarer Geschichte/Frage, stabile Autorenfarben.
6. Keine privaten Inhalte oder Tokens in Browser-Bundles/GitHub.

## Implementierungsverantwortung
**ChatGPT Work** bedient Google AI Studio Build im Cloud Browser und entwickelt/testet dort die gesamte Anwendung inklusive Fehlerbehebung. Work erstellt außerdem die isolierten Web Components und integriert sie über dieselbe GitHub-Codebasis.

## Delivery D0 – verbindlicher Arbeitsumfang (2026-10-17)
- Eine React/Node-App im vorhandenen Repository; Kennzeichnung „D0 technische Vorschau“.
- Auswahl/Vorschau der zehn aktiven Use Cases aus `prompts/catalog.json`, ohne Storygenerierung oder Provider-Aufrufe.
- Echte serverseitige Endpunkte `GET /api/health` und `GET /api/use-cases`; nur öffentliche Katalogmetadaten, keine Schlüssel/Umgebungsvariablen in Antworten.
- Übersetzungen in externen Dateien für DE/EN/RU; responsive, tastaturbedienbare Vorschau und nachvollziehbare Lade-/Fehler-/Retry-Zustände.
- Abnahme: Build, bestehender Validator, Health/Katalog-Tests, Browser Desktop/Mobil, Console/Netzwerkprüfung, GitHub-Push und Pull, dokumentierte URL/Commit.
- Keine aktiven KI-Endpunkte in D0. Vor D1 müssen Modellverfügbarkeit, Preise, Auth und serverseitige harte Budgets verifiziert/implementiert sein. Die Modell-IDs des Katalogs sind bis dahin ungeprüfte Planungswerte.
- D1 sowie C01–C04 bleiben unimplementiert.

### D0 Review-Korrekturen vor finalem Codeabgleich
- Readiness ermittelt den tatsächlich gültigen aktiven Katalog; fehlender/ungültiger Katalog liefert 503.
- GET-Anfragen haben zehn Sekunden Timeout und lokalisierte Fehler mit Wiederholung.
- Bei 375px Breite dürfen Kopfzeile und Status-/Filterbereich nicht horizontal überlaufen.
- Produktionsstart über `node --import tsx`, festgeschriebene Dependencies und CI für Validator, Typecheck, Build und produktive API-Tests.

- D0 Preview nutzt denselben statischen Produktionsbuild wie das Deployment; `npm run dev` baut zuerst und startet den Produktionsserver. Damit werden weder Vite-HMR-WebSockets noch Quell-/Katalogdateien über die Preview ausgeliefert.

## D0 verifizierter Stand
- Geprüfter Codecommit: `7eb1e1c643e9f2eb8817e5d663fcae0f13251b60`.
- Eine importierte AI-Studio-App `57b82b35-8dbc-4c3d-bcc7-bf454333f191`, verbunden mit `programmiererphp/storyduett`, `main`. Nativer Push und nachfolgende externe Änderungen plus nativer Pull sind nachgewiesen.
- Preview: https://ais-dev-4xncdtwz7pslafeok6mckl-237548413897.europe-west2.run.app/ (Entwicklungsvorschau, kein öffentliches Deployment).
- Backend, zehn Katalogeinträge, DE/EN/RU, Filter/Suche/Leerzustand/Dialog/Tastatur, Desktop und Mobilbreite geprüft. CI für Produktionsbuild/API/Fehlerverhalten erfolgreich.
- Bericht: `reports/reviews/2026-10-17-7eb1e1c.md`. Der damalige Freigabeblocker wurde durch ausdrückliche Nutzerfreigabe am 2026-10-17 um 20:37 Europe/Berlin aufgehoben. Öffentliche Veröffentlichung und Abnahme sind erfolgt; siehe Abschlussbericht `reports/reviews/2026-10-17-2535345.md`.

## D0 öffentlicher Abschluss – 2026-10-17
- Öffentliche URL: https://storyduett.ai.studio/; AI Studio Publish meldet „storyduett is published!“ und Status Ready.
- Veröffentlichter Repository-Stand: `2535345d6bf43e1b3a587816ce21d410de9817be`; unveränderter getesteter Anwendungscode aus `7eb1e1c643e9f2eb8817e5d663fcae0f13251b60`.
- Tatsächliche öffentliche Browser- und anonyme HTTP-Prüfungen bestanden; Abschlussbericht `reports/reviews/2026-10-17-2535345.md`. D0 DONE, D1 weiterhin TODO.

## Delivery D1 – verbindlicher Umfang
C01–C04 als eigenständige Shadow-DOM-ESM-Komponenten (Manifest, Schnittstellen, Demo, Tests), integriert in dieselbe React/Node-App. Zehn vorhandene Szenarien, echter Gemini-Start und ein kombinierter strukturierter Call pro Runde (Kommentar/Korrektur, Integration, Folgefrage). Append-only Knoten mit unveränderter Rohantwort, serverseitigen IDs, Versions-/Frageprüfung und Idempotenz.

D1 ist eine zeitlich begrenzte Solo-Sitzung ohne Bibliothek/Resume nach Serverneustart (D2). Sitzungszugriff über zufälliges Capability-Token, keine öffentlichen Sessionlisten oder Debugprompts. Vor jedem kostenpflichtigen Call werden konservative Text-Input-/Output-Obergrenzen gegen Call- und Sessionlimits reserviert; unbekannter Verbrauch wird zum reservierten Maximum verbucht. Keine automatischen kostenpflichtigen Retries. UI zeigt Schätzkosten/Limit, aktive Anfrage und verständliche Fehler. Modell/Preisliste werden vor Freigabe verifiziert. D2 bleibt TODO.

D1-Zwischenbericht: [SD-D1-REVIEW-01](reports/reviews/2026-10-17-c4521a6.md). Code c4521a6, automatisiert/CI geprüft; echte10-Runden-Abnahme durch Runtime-Keykonfiguration blockiert. D1 bleibt IN PROGRESS, öffentlich weiterhin D0.

## D1 Schlüsseldiagnose – Fortsetzung 2026-10-19
Die Nutzung vorhandener Projektschlüssel und Veröffentlichung nach bestandenen Tests sind autorisiert. Gespeicherter Projektschlüssel tatsächlich getestet: Google meldet API_KEY_INVALID. Keine erfolgreiche echte Generierung/10-Runden-Abnahme; D1 weiterhin IN PROGRESS, öffentlich D0. Sichere Diagnosekorrekturen implementiert, Lockdatei erhalten. [Aktueller Bericht SD-D1-REVIEW-02](reports/reviews/2026-10-18-d1-key-diagnosis.md).

### Diagnoseversuch mit dediziertem Serverschlüssel (SD_GEMINI_API_KEY) & Monatliches Kostenlimit – 2026-10-25
- Der Nutzer hat einen neuen Serverschlüssel im bestehenden Projekt genehmigt, welcher als privates Secret `SD_GEMINI_API_KEY` hinterlegt wurde.
- Zentraler, ausschließlich serverseitiger Schlüssel-Resolver priorisiert nicht-leeres `SD_GEMINI_API_KEY`, sonst Fallback auf `GEMINI_API_KEY`. Er wird sowohl beim Gemini-Provider als auch bei Readiness/`/api/play-config` verwendet; niemals im Frontend referenzieren.
- Neue Nutzer-Kostenvorgabe: Höchstens 2 EUR zusätzliche Kosten pro Monat.
- Wichtige Einschränkung: Der aktuelle instanzlokale Tageszähler (In-Memory-Ledger) garantiert diese monatliche Obergrenze über Serverneustarts und Monatszeiträume hinweg nicht; es wird kein globales 2EUR-Limit behauptet.
- Die öffentliche D1-Veröffentlichung bleibt bis zu einer passenden Kostenabsicherung und erfolgreicher echter 10-Runden-Endabnahme strikt gesperrt. D1 bleibt IN PROGRESS, öffentlich weiterhin D0.

### Echter Browsernachweis & Zuverlässigkeitskorrekturen – 2026-10-25
- **Browsernachweis erbracht:** Start + 5 echte Runden mit `gemini-3.5-flash-lite` erfolgreich durchgeführt (inkl. Freitext, lakonischem Kommentar und Append-only-Knoten). Eine konfigurierte 0.01-USD-Sitzung blockiert danach deterministisch VOR dem nächsten Call; Aufrufzähler bleibt exakt bei 6, Geschichte unverändert erhalten.
- **Punkt 1 (C03 UI-Zustand bei Sperre):** Ergänzung einer unabhängigen `disabled: boolean`-Property auf `sd-choice-panel`. Sperrt Antwortbuttons, Freitext und Submit-Button sowie `submit()`, setzt aber weder `aria-busy` noch den Arbeitsstatus („Die KI schreibt weiter …“). `busy` bleibt rein tatsächlicher Arbeitszustand. React übergibt `busy={busy}` und `disabled={blocked}` getrennt.
- **Punkt 2 (Logging sd_api_usage):** Strukturierte bereinigte Usage-Ereignisse werden direkt über `process.stdout.write(JSON.stringify(...) + '\n')` ausgegeben, um Fehlklassifizierungen in Cloud Run / AI Studio als Backend-Error zu vermeiden. Echte Providerfehler verbleiben sicher in `console.warn`.
- **Punkt 3 (Server-Abschalter & Banner):** Notfall-Abschalter `SD_AI_ENABLED=false` im Resolver implementiert (liefert `undefined`, `ready=false`, Standard bleibt aktiv). Technische ErrorInfo-Konstanten werden aus dem normalen Spieler-Banner entfernt; sichere Backend-Metadaten bleiben erhalten. Keine Datenbank/D2.

### Logging-Nachprüfung – 2026-10-25
Der echte Zehn-Runden-Test besteht, aber die Plattform markiert auch stdout-Usage mit `errorCode:null` als Fehler. Weitere gezielte Korrektur: nullable Fehlerfelder nur in der Log-Zeile auslassen, wenn kein Fehler vorliegt; vollständiger privater Usage-Zustand und tatsächliche Fehler bleiben erhalten. Kein Unterdrücken realer Fehler. Anschließender echter Browser-Nachtest erforderlich.

### Gezielter Italienisch-A1-Fix (Isoliertes Provider-Wireformat) – 2026-10-25
- **Befund:** Im realen Browser-Test funktionierte der A1-Start korrekt mit <= 4 Wörtern je Satz, der erste Turn erzeugte jedoch 7/5/5 Wörter pro Storysatz trotz Prompt-Instruktionen.
- **Gemini Structured Output Garantie:** Gemäß offizieller `generateContent`-Dokumentation (`https://ai.google.dev/gemini-api/docs/generate-content/structured-output`) garantiert das Schema für Arrays `items`, `minItems` und `maxItems`. String-Validierungen wie `pattern` oder `maxLength` werden von der Gemini-Engine nicht garantiert erzwungen.
- **Isoliertes Wireformat für `italian-a1`:**
  - `opening`: Wort-Array (max 4 Strings; bei Start aktiv, bei Turn leer `[]`).
  - `contribution`: Array von maximal 3 Sätzen; jeder Satz ist ein Wort-Array mit maximal 4 Strings (bei Turn aktiv, bei Start leer `[]`).
  - `bridge`: Wort-Array (max 4 Strings, optional; bei Inaktivität `[]`).
  - `comment`: bleibt normales Text-Objekt `{ kind: 'correction', text: string }` auf Deutsch. Prompt instruiert: tatsächlich vorhandenen Fehler korrigieren (ohne erfundene Modalverb-Erklärung), korrigierter Satz, deutsche Bedeutung und einfache Aussprachehilfe.
  - `nextQuestion`: `text` als Wort-Array (max 4 Strings); `options` als genau 3 Optionen, jede Option mit `text` als Wort-Array (max 4 Strings) und `tone` ('serious' | 'ironic').
  - Inaktive Textfelder liefern leere Arrays; aktive Felder dürfen nicht leer sein.
- **Deterministische Normalisierung & Validierung:**
  - Normalisiert Provider-Wort-Arrays zu kanonischen internen Strings (Wörter mit Leerzeichen verbunden; fehlende Satzendpunkte ergänzt, zusätzliche Satzenden innerhalb eines Wortarrays abgewiesen). Keine synthetischen Antworten, keine automatischen Retries.
  - Serverseitige Validierung: Prüfung aller Arraygrenzen (max 4 Wörter pro Satz/Feld, max 3 Sätze in contribution, min 1 aktives Wort).
  - Einzelwort-Integrität: Jedes Array-Element muss genau ein einzelnes Wort ohne Whitespace sein (Unicode-Einzelwortprüfung mit Satzzeichen nur um das Wort), damit Mehrwort-Strings die Arraygrenze nicht umgehen.
  - Satzgrenzen-Prüfung: Jeder resultierende Satz wird nochmals auf max 4 Wörter geprüft.
  - Bei Verletzung: `StoryError('invalid_response', 502)`. Kein State-Commit, aber reguläre Verbuchung der verbrauchten Token/Kosten im `finally`-Block.
- **Budget & Nicht-Italian-Invarianz:**
  - Zusätzliches Schema- und Systemprompt-Volumen fließt vollständig in `inputBound` und die harten Vorabreservierungen ein.
  - Native Nicht-Italian-Schemas und alle C01–C04/API-Contracts bleiben unverändert.
  - Versionsnummer in `prompts/catalog.json` wird ausschließlich für `italian-a1` auf v3 erhöht.


Details und Schnittstellen: [SD-D1-A1-01](docs/A1_WIREFORMAT.md). Nach dem Review zusätzlich interne Mehrwort-Verbindungen, fehlende Satztrennung und Unicode-Kombinationszeichen abgesichert.
