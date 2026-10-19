# D1 – Runtime-Schlüsseldiagnose und geprüfte Korrekturen
Referenz: SD-D1-REVIEW-02. Status: IN PROGRESS, keine echte Spielabnahme bestanden. Fortsetzung am 2026-10-19.

## Ergebnis
C01–C04, Solo-Engine, React-Integration, serverseitige Kostenreservierung und Tests sind implementiert. Die echte Gemini-Generierung bleibt blockiert. Google meldete beim tatsächlich laufenden Browserstart am 2026-10-18T09:30:46.890Z HTTP400 mit maschinenlesbarem ErrorInfo.reason API_KEY_INVALID; Latenz143ms. Keine Modellversion, Provider-Response-ID oder Tokenverbrauch zurückgegeben. Keine Geschichte und keine zehn erfolgreichen Runden behauptet. Öffentliche App https://storyduett.ai.studio/ weiterhin D0; D1 wurde nicht veröffentlicht. D2 nicht begonnen.

## Autorisierung und echte Versuche
Nutzerfreigabe vom 2026-10-18: vorhandene Projektschlüssel verwenden, D1 nach bestandener Abnahme veröffentlichen. Vorhandenen Schlüssel android-app-erstes im bestehenden D0-Projekt gen-lang-client-0231384376 über Select key verbunden und Secrets Apply ausgeführt. Backend-Neustart und erneut geladene maskierte Auswahl beobachtet.

Fünf tatsächliche Startversuche am18.10.:169ms,40ms,36ms,130ms,143ms. Alle scheiterten mitHTTP400/api-key; letzter mitAPI_KEY_INVALID sicher präzisiert. Pro Versuch USD0.0050473 konservativ reserviert/verbucht; Summe USD0.0252365. Dies ist keine nachgewiesene Google-Rechnung; tatsächlicher Verbrauch ist mangels Provider-Metadaten unbekannt. Kein automatischer kostenpflichtiger Retry. Zusätzliche lokale Tests verwenden klar gekennzeichnete Fixtures und sind keine echte Endabnahme.

Vorhandene Alternative im Projekt Gemini API nur im maskierten Auswahldialog geprüft: AI Studio fordert dafür Set up billing. Keine neue Abrechnung eingerichtet, kein Schlüssel dort verbunden und kein Provideraufruf mit dieser Alternative ausgeführt. Keine neuen Projekte/Repos/Apps/Schlüssel erstellt. Eine normale Server-Secret-Alternative wurde nur als leerer Entwurf vorbereitet; kein Schlüsselwert gespeichert. Auslesen des Schlüsseldialogs wurde von der automatischen Freigabeprüfung wegen möglicher Offenlegung von Credentials abgelehnt; Aktion nicht weiter verfolgt. Kein Secret im Repository.

## Tatsächlich durchgeführte Build-Arbeit
Zwei Diagnoseprompts wurden in derselben AI-Studio-App eingegeben und vom Build-Agenten ausgeführt. Tageskontingent wieder verfügbar; kein Upgrade gekauft. Vollständige Prompts: docs/build-prompts/D1_2026-10-18.md. AI Studio ergänzte User-Agent aistudio-build und eine Allowlist für Google ErrorInfo.reason; Testfehler im neuen Parser wurde erkannt und behoben. Typecheck, Build, Vertragsvalidierung und18 Tests (4 Komponenten+14 Backend/Client) bestanden dort anschließend.

Die Behauptung des Build-Agenten, der Projektname beweise Android-Beschränkungen, wurde ausdrücklich verworfen. Auch ein vom alten Standardformat abweichender Key ist allein kein Ungültigkeitsbeweis: Google dokumentiert Standard- und Authorization-Keys. Nur die tatsächlich empfangene API_KEY_INVALID-Antwort ist der belastbare Befund. Keine Proxy-/BaseURL-Variable in der lokal geprüften AI-Studio-Laufzeit gefunden; Standard-SDK-Weg bleibt bestehen. Offizielle Quellen: https://ai.google.dev/gemini-api/docs/api-key und https://ai.google.dev/gemini-api/docs/aistudio-fullstack .

## Review und Korrekturen des Exports
Fünf geänderte Quell-/Testdateien aus dem offiziellen ZIP-Export geprüft. Ungewollte package-lock.json-Löschung NICHT nach GitHub übernommen; kanonische Lockdatei erhalten. Editor-Uploadversuch hing und wurde nicht als erfolgreiche Wiederherstellung behauptet.

ErrorInfo-Parser übernimmt ausschließlich erlaubte Konstanten aus strukturierten Details; keine Freitextsuche nach scheinbaren Codes. Regression für in Freitext erwähnte Codes ergänzt. Gefilterter Fehlergrund im Usage-Datensatz und Schema dokumentiert. Unnötige technische Diagnose im normalen Spielbanner aus dem Export entfernt. HTML-Hostingfehler mitHTTP200 werden nun als unklare Provider-Nichtverfügbarkeit behandelt; Idempotenzschlüssel bleibt beim Retry erhalten. Defektes JSON bleibt gesonderter Fehler.

## Offene Abnahme
- Funktionierenden serverseitigen Gemini-Zugriff herstellen. Neuer Schlüssel im vorhandenen D0-Projekt als mögliche nächste Maßnahme vorbereitet, noch NICHT erstellt. Name: StoryDuett D1 server. Bestehende Schlüssel bleiben erhalten; keine zusätzliche Abrechnung vorgesehen.
- Mindestens10 aufeinanderfolgende echte Runden, Optionen/Freitext, Präfix-Unveränderlichkeit, Kommentare und neue Fragen prüfen.
- Echten Sprachlernfall, mobile Spielansicht, Fehler/Retry und Kostenlimits auf dem finalen Runtime-Stand prüfen.
- Erst dann dieselbe App veröffentlichen, öffentliche Endabnahme wiederholen und geprüften Runtime-Commit/URL abschließend protokollieren.

## Nachweise
- SD-D1-KEY-02: ../evidence/2026-10-18-d1/project-key-linked.jpg – gespeicherte maskierte Zuordnung.
- SD-D1-KEY-03: ../evidence/2026-10-18-d1/new-key-ready.jpg – vorbereitete Neuanlage im bestehenden Projekt; Create key nicht gedrückt.
- Frühere Komponenten-/Mobil-/Nullbudget-Belege: SD-D1-REVIEW-01.

## Verifikation am 2026-10-19
Geprüfter Codecommit4997b1a321ca8a1b343ad3409711a145757782cc: lokal validate/typecheck/build/npm test erfolgreich (4 Komponenten+14 weitere Tests, keine Fehler), zusätzlich CI39234092608 erfolgreich. Native GitHub-Pull in dieselbe AI-Studio-App abgeschlossen; drei Konflikte in Engine, Engine-Test und Client zugunsten des geprüften GitHub-Stands aufgelöst. UI bestätigt am19.10.12:01 Europe/Berlin „GitHub & Google AI Studio are currently in sync“. Nachweis SD-D1-SYNC-02: ../evidence/2026-10-18-d1/github-sync-2026-10-19.jpg .

Am19.10. wurde die Vorbereitung der Schlüsselneuanlage von der automatischen Sicherheitsprüfung abgelehnt: bisherige Autorisierung betrifft vorhandene Schlüssel, ein neuer persistenter API-Zugang benötigt spezifische Freigabe. Nicht umgangen; keine Neuanlage ausgeführt. Nächste konkrete Entscheidung: Ersatzschlüssel StoryDuett D1 server im vorhandenen Projekt android-app-erstes ausschließlich für die bestehende App anlegen/verbinden; keine neue Abrechnung, kein neues Projekt. Bestehende Freigaben für API-Nutzung bisUSD0.50 in der Abnahme und D1-Veröffentlichung nach bestandenen echten Tests bleiben bestehen. D1 bleibt bis dahin IN PROGRESS.
