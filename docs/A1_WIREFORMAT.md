# D1 – italienisches Providerformat

Referenz SD-D1-A1-01. Stand 2026-10-25. Nur `italian-a1`, Katalogversion3. Eine serverseitige Generierung pro Runde; keine automatische Reparaturanfrage und keine Ersatzgeschichte.

`server/wireformat-a1.ts` exportiert das Gemini-JSON-Schema und die reine Funktion `validateAndNormalizeItalianA1(raw, start)`. Sie verändert weder Eingabeobjekt noch Storyzustand. Ungültige Werte erzeugen `StoryError('invalid_response',502)`. Der gemeinsame Fehlertyp liegt in `server/errors.ts` und wird weiterhin aus der Engine exportiert.

| Feld vom Provider | Zulässiger Inhalt | Interner Text |
|---|---|---|
| opening | Start:1–4 Einzelwörter; Turn:leeres Array | Ein kurzer Eröffnungssatz |
| contribution | Start:leer; Turn:1–3 Wortarrays mit je1–4 Wörtern | Neue Sätze, durch Satzgrenzen getrennt |
| bridge | Leer oder ein Wortarray mit1–4 Wörtern; Start:leer | Optionaler KI-Brückensatz |
| nextQuestion.text / Option.text | Je1–4 Einzelwörter | Frage / Antwortstring |
| comment | Deutsches Feedback; Turn:correction | Bestehender Kommentarvertrag |

Tabellen-ID SD-D1-A1-T01.

Die Einzelwortprüfung akzeptiert Unicode-Buchstaben, Ziffern, Apostrophe/Bindestriche sowie umgebende Satzzeichen und einfache Uhrzeiten. Whitespace, reine Satzzeichen und durch interne Satzzeichen verbundene Mehrwortfolgen werden abgewiesen. Arraygrenzen allein ersetzen diese Prüfung nicht.

Ein Contribution-Wortarray entspricht genau einem Satz. Fehlende Endpunkte werden als reine Formatnormalisierung ergänzt, damit zwei vom Modell gelieferte Sätze nicht zu einem langen Satz verschmelzen. Zusätzliche Satzenden innerhalb eines solchen Arrays werden abgewiesen. Abschließend werden die resultierenden Eröffnungs-/Beitrags-/Brückensätze nochmals auf Wort- und Satzanzahl geprüft. Es werden keine Wörter oder Inhalte erfunden. Frage und jede Option bleiben insgesamt bei höchstens vier Wörtern; die gemeinsame Engine prüft zusätzlich drei unterschiedliche Optionen mit2 serious/1 ironic.

Die Engine wählt dieses Format ausschließlich für den italienischen Use Case. Andere Providerformate, öffentliche API- und Komponentenverträge bleiben unverändert. Gesamtes Schema, Systemprompt und History fließen vor dem einzigen Modellaufruf in die bestehende konservative Kostenreservierung ein. Bei fehlerhafter Providerantwort bleiben frühere Knoten/Segmente unverändert; tatsächlicher oder konservativ reservierter Verbrauch wird protokolliert.

Tests prüfen gültige Werte und Unicode, Mehrwort-Bypass, Arraygrenzen, leere aktive Felder, fehlende Satzzeichen, zusätzliche Satzgrenzen, richtige Antwortverteilung, unveränderte History bei502 und Kostenverbuchung. Fixtures sind keine echte KI-Endabnahme; echte Browserergebnisse stehen im D1-Testbericht.

Offizielle Grundlage: https://ai.google.dev/gemini-api/docs/generate-content/structured-output . Unterstützte Arraygrenzen und semantische Validierung; keine Behauptung, dass ein nicht dokumentiertes String-pattern zuverlässig erzwungen wird.

## Robustheitsnachprüfung 2026-10-26 (A1v6)
Das tatsächlich gesendete Schema wird nun phasenbezogen erstellt (`italianA1SchemaFor(start)`), ohne das gemeinsame Basisschema zu verändern: Opening nur bei Start aktiv; Contribution erst beim Turn mit mindestens einem Satz; Start-Bridge leer; Kommentar-Kind nur neutral am Start bzw.correction beim Turn. Natürliche italienische Wortstellung ausdrücklich verlangt, auch ironische Antworten müssen grammatisch korrekt sein. Vorherige Frageformulierungen liegen im selben Modellkontext, ohne weiteren Call.

A1ValidationError protokolliert nur einen endlichen Diagnosecode (z.B.word_count/word_token/comment), niemals Rohtext oder Wörter. Ungültige Generierung bleibt intern502; der App-Endpunkt liefert für diesen erwarteten Fall422JSON, damit die Vorschau den Fehler nicht als allgemeine Server-Nichtverfügbarkeit maskiert. Eine bezahlte, aber verworfene Antwort wird weiter anhand tatsächlicher Metadaten erfasst; Geschichte bleibt unverändert, keine automatischen Retries/Ersatztexte. Der genaue Feldfehler des ersten echten Fehlschlags ist mangels früherer Diagnose nicht rekonstruierbar; die Phasenschema-Präzisierung wird als Härtung, nicht als bewiesene Ursache beschrieben.

## A1v7 – Bedeutungs- und Modellprofil
Reale Flash-Lite-Antworten verloren Uhrzeit/Preis der Auswahl trotz formal korrekter Arrays. A1v7 verlangt konkrete Details einschließlich Verneinungen in contribution und verwendet gemini-3.8-flash mit LOW/1024maxOutput; MINIMAL wird laut offizieller3.8-Modellseite nicht unterstützt. Die neun anderen Use Cases bleiben Flash-Lite3.5. Beschreibungen werden nur im tatsächlich gesendeten A1-Schema weggelassen, alle Validierungsschlüssel bleiben erhalten; kompakter Systemprompt vermeidet doppelte ausführliche Formaterklärungen. Ein Modellcall, keine automatischen Reparaturcalls oder Ersatztexte.

Preise separat pro Profil:3.5Flash-Lite0.30/2.50USD jeMioInput/Output;3.8Flash0.75/3.75USD inklusiveThinking (Stand26.10.,3.8Einführungspreis bis31.12.). Reservierung und Usage-Abrechnung verwenden das tatsächlich gewählte Profil und dessen Outputlimit. Harte0.01USD/Call und0.10USD/Session unverändert. Preisguard17.11.2026 verhindert ungeprüftes Weiterlaufen. Quellen: https://ai.google.dev/gemini-api/docs/pricing und https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash .

## A1v8 – verlustfreie Wortnormalisierung
Ein echter3.8-Turn scheiterte am sicheren Diagnosecodeword_token; exakte Zeichen bleiben absichtlich unveröffentlicht. Harmlos zusammengepackte Leerraumwörter und separat gelieferte Satzzeichen werden nun deterministisch kanonisiert, ohne Wörter hinzuzufügen oder zu ersetzen. Übliche einfache/doppelte Anführungszeichen werden akzeptiert. Entscheidend bleibt: maximal vier tatsächliche Wörter nach Normalisierung, nicht nur vier Arrayplätze. Gepackte fünf Wörter, interne Wortverkettungen und ungültige Symbole bleiben Fehler. Zusätzliche endliche Formcodes unterscheiden Währung/Symbol/Satzzeichen ohne Rohtext. Kein Reparatur- oder Ersatzmodellcall. Profil/Preise unverändert; Live-Nachtest erforderlich.
