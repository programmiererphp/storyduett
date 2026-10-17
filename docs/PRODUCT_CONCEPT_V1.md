# StoryDuett – Produktkonzept V1.0
**Referenz:** SD-CONCEPT-01 | **Gesichert:** 2026-10-17

## Idee
Eine unterhaltsame, leicht verständliche mobile Webapp, in der KI mit einem oder zwei Menschen gemeinsam einen Text weiterschreibt: fiktionale Geschichten, Alltagssimulationen, Sprachlernübungen, psychologische Reflexionen, Smalltalk-Training oder Lerntexte. Ziel ist spielerische Kreativität und, im Duo-Modus, Kennenlernen durch gemeinsame Aktionen.

## Runde für Runde
1. Use Case auswählen (später eigenen Use Case im Mini-CMS anlegen).
2. KI erzeugt stimmungsvollen Anfangssatz, optional kurze Szene, und eine Frage zur Fortsetzung.
3. Genau drei Vorschläge: zwei ernsthafte, ein ironischer. Alternativ Freitext oder Diktat. Später auch drei KI-Cartoons mit semantischen Textbeschreibungen statt Textantworten.
4. KI kommentiert die Antwort **kurz, lakonisch und ironisch**. Bei Sprachlernen korrigiert sie Fehler konkret und erklärt knapp; bei psychologischen Übungen unterstützend statt spöttisch.
5. KI fügt den neuen Beitrag natürlich in den Text ein (ohne alte Teile umzuschreiben) und gibt direkt die nächste Frage.
6. Text wächst sichtbar. Menschliche Beiträge sind pro Spieler mit dauerhaft eigener Hintergrundfarbe *und* Namenskennzeichnung versehen. KI-Verbindungssätze sind neutral.

## Use Cases
| Art | Schwerpunkt |
|---|---|
| Fiktion/Abenteuer | komisch, romantisch, historisch, Fantasy, gemeinsames Erzählen |
| Madagaskar-Azubi | humorvolle Missverständnisse bei Ausbildung in Deutschland |
| Sprachlernen | Deutsch B1/B2, Italienisch A1, einfache Alltagssätze, Fehlerkorrektur |
| Smalltalk-Training | Humor, Schlagfertigkeit, Fragen, spontane soziale Situationen |
| Dating/Kennenlernen | kooperative Szenen, gegenseitige Vorlieben, 2-Personen-Geschichten |
| Psychologische Übungen | positive Perspektivwechsel, Ziele, Gesprächsselbstvertrauen |
| Bewerbung/Beruf | Jobinterview, Rezeption, Kundenkommunikation, Konflikte |
| Lerntexte | Geschichte, Wissenschaft, Alltag, Erkenntnisfragen |
| Gemeinschaft/Zukunft | Postwachstum, gemeinsame Wohnprojekte, soziale Ideen |

## Modi
- Solo mit KI.
- Lokales Duo an einem Bildschirm, abwechselnde Züge.
- Remote-Duo über privaten Einladungslink und gemeinsame synchronisierte Story. Separater Chat zur persönlichen Unterhaltung, optional KI-Gesprächsimpulse.
- Matching (später): Sprache, Interessen, grobe Entfernung; Nutzer in naher geografischer Umgebung bevorzugt, Suchradius nach Bedarf erweitern. Erst nach Auswahl Kontakt herstellen.

## UX und Wiederspielwert
Ein Hauptscreen: oben Story, darunter KI-Kommentar und **jetzt zu beantwortende** Frage. Immer offensichtlicher nächster Schritt. Geschichte vorlesen lassen, optional Stimme je Use Case. Pfeile zur historischen Navigation, Solo-Verzweigungen, private Bibliothek, Lesen/Fortsetzen/Export. Kleine Überraschungsfragen, lustige Wendungen und gelegentliche gemeinsame Ziele; keine überfüllte Startseite.

## Use-Case-Verwaltung
Jeder Use Case besitzt unabhängig editierbar: P1 Anfang; P2 Frage+Antwortoptionen; P3 Kommentar/Korrektur; P4 Integration. Dazu Textmodell, Schwierigkeit, Tonalität, Sprache, Länge, TTS-Stimme/Stil/Tempo, Budget pro KI-Feature und Aktivierungsstatus. Presets versioniert im Repo; benutzerdefinierte Presets privat in der App. Import/Export als JSON/XML.

## Technische Leitgedanken
Mobile-first, trilinguale UI (DE/EN/RU), schlanke React-Shell, einzeln getestete unabhängige Web Components, zentrale sichere Story-Engine und kostenkontrollierte Gemini-Dienste. GitHub verwaltet gesamten Code und **bereinigte** Diagnosebeispiele; echte private Logs bleiben im Backend.

## Story-State und Versionen
Jede Runde ist unveränderlicher Knoten mit Originalantwort, KI-Kommentar, angehängten Segmenten, Folgefrage, Promptversions-IDs und Elternknoten. Zeitreise ist nur Anzeige; Solo kann frühere Knoten als neue Branch-Basis wählen. Bei Remote-Duo keine unilateralen Rücksetzungen.

## Erlebnisqualität
Ziel ist zunächst ein kleines, wirklich funktionierendes MVP statt Vielzahl ungetesteter Features. Standardkommentar respektiert Use-Case-Ton. TTS nutzt ausdrucksstarke Narration, während Sprachlernen bewusst langsam und deutlich vorgelesen werden kann.
