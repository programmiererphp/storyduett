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
