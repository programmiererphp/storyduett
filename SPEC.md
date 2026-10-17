# StoryDuett – verbindliche Produktspezifikation V1.0
**Referenz:** SD-SPEC-01 | **Stand:** 2026-10-17 | **Status:** D0 DONE – published and verified at https://storyduett.ai.studio/. D1 not started.

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
