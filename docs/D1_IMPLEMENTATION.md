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

## D1a geprüft und gemergt
PR #2, Komponentencommit88091cc, Merge7b03607. Node22-CI39071117152 und39071114652 erfolgreich. Vier isolierte DOM-Tests, D0-Regression, Typecheck und Produktionbuild bestanden. Nativer GitHub-Pull in vorhandene AI-Studio-App durchgeführt.

## D1b Betriebsvertrag
Server besitzt zufällige HttpOnly/Secure/SameSite=None/Partitioned Owner-Cookies (Preview im Fremdiframe) plus unabhängiges256-Bit-Sitzungstoken im Arbeitsspeicher des Clients. Sessiontokens niemals in URLs, Logs oder LocalStorage. JSON/Header-CSRF-Schutz, keine CORS-Freigabe. Sitzungen/Idempotenzdaten verfallen nach zwei Stunden, maximal200 gleichzeitige Sitzungen,30 Runden. Kein dauerhaftes Resume (D2).

Harte Standardcaps: USD0.01/Call, USD0.10/Session (Client darf nur senken), USD0.20/Owner/UTC-Tag, USD2/Prozess/UTC-Tag. Tages-/Abuse-Zähler sind zusätzliche instanzlokale Schutzgrenzen und kein über Neustarts/mehrere Cloud-Run-Instanzen garantierter Projektabrechnungsdeckel. Call-/Sessionbudget bleiben hart: nach Prozessverlust existiert die Session nicht mehr und kann nicht fortgesetzt werden. Für globale projektweite Budgets ist vor breiter Mehrnutzerfreigabe ein transaktionaler gemeinsamer Ledger erforderlich (spätere Kosten-/Persistenzdelivery); nicht als vorhanden behaupten.

Vor Call konservative Obergrenze: UTF-8-Bytes des vollständigen JSON-Requests plus1024 Protokollreserve (max18000), max1600 generierte Tokens inklusive Thinking; USD0.30/Mio Input und USD2.50/Mio Output. Alle drei Limits (Call/Session/Owner) plus Instanzschutz reservieren synchron vor await. Gemini thinkingLevel MINIMAL, candidateCount1, keine Tools/Audio/automatischen Retries. Standardtarif auch bei Cache konservativ vollständig. Preisprüfung verfällt2026-11-17 und blockiert dann weitere Calls. Bei unerwarteter Überschreitung der Provider-Tokenobergrenze wird der Adapter für den Prozess abgeschaltet. Fehlende Metadaten bleiben null; unbekannte Kosten belasten reserviertes Maximum. Private Runtime-Logs enthalten nur Usage-Metadaten/Hash, keine Texte, Cookies oder Schlüssel.

API: GET /api/play-config (öffentliche Bereitschaft/Limitwerte, Owner-Cookie); POST /api/sessions {useCaseId,locale,idempotencyKey,limitUsd?} -> {state,token}; GET /api/sessions/:id -> {state}; POST /api/sessions/:id/turns {version,questionId,selectedOptionId XOR customAnswer,locale,idempotencyKey} -> {state}; DELETE /api/sessions/:id ->204. Sitzungszugriff erfordert Owner-Cookie und x-sd-session. Schreibzugriffe zusätzlich x-sd-request:1. Fehlgeschlagene explizite Requests werden mit gleicher Idempotenz nicht kostenpflichtig wiederholt; bewusster Retry erzeugt neuen Schlüssel. Unklare Netzwerkantwort wiederholt denselben Schlüssel. Knoten werden bei Providerfehlern nicht verändert, Usage wird trotzdem erfasst.

## Erstbefund Liveintegration
Runtime-Key ist als AI Studio Free Tier Secret vorhanden. Null-Dollar-Sitzung vor Call blockiert. Erster realer Start lieferte Providerfehler nach171ms, keine Provider-Usage-Metadaten und keine Storyänderung. Reserviertes Maximum USD0.0050473 konservativ belastet (keine behauptete Rechnung). Direkter REST-Transport wird auf das offizielle serverseitige @google/genai-SDK umgestellt; retries explizit attempts1 (Standard wären sonst5),35s Timeout plus AbortSignal. Keine Schlüsselwerte oder Provider-Bodytexte in Diagnoseausgaben.

## Aktueller externer Blocker
SDK liefert HTTP400, bereinigte Diagnosekategorie api key. Nicht auf Modellqualität oder ungültiges Story-JSON zurückzuführen. Geladene Secret-Auswahl zeigt einen bestehenden Schlüssel aus einem anderen Projekt; keine Werte wurden abgerufen. Im bereits für D0 genutzten Projekt android-app-erstes ist ein eigener bestehender Schlüssel auswählbar. AI Studio führt dafür durch den Dialog Link a paid API key; abschließendes Select key und Secrets Apply wurden NICHT ausgeführt. Hier ist eine konkrete kosten-/berechtigungsrelevante Bestätigung nötig. Öffentliche D0-App bleibt bis erfolgreicher echter D1-Abnahme unverändert.

Sichere UI-Korrektur: bei vom Hosting als HTML gelieferten503-Antworten Provider-Nichtverfügbarkeit statt irreführendem JSON-Fehler zeigen; unsichere Netzwerkantwort behält Idempotenzschlüssel. SDK400 mit api-key-Kategorie wird provider_unavailable. Keine rohen Providerfehlermeldungen im Log.

Kostenlose Alternative ebenfalls geprüft: Secret auf native AI Studio Free Tier gestellt und Apply ausgeführt, Backend-Neustart beobachtet. Auch dieser reale SDK-Start scheitert mitHTTP400/api-key-Kategorie, Latenz119ms; keine generierte Geschichte/Usage-Metadaten. Kein kostenpflichtiger Schlüssel verbunden, kein neues Projekt/Repository/App, kein Upgrade gekauft. Für die nächste tatsächliche Abnahme bleibt die Verbindung des bereits vorhandenen Schlüssels im bestehenden D0-Projekt als konkrete kostenrelevante Entscheidung offen.
