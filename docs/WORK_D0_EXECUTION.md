# D0 – Ausführungsauftrag an ChatGPT Work (SD-WORK-D0-01)
**Kernregel:** Nicht den Nutzer zum Durchklicken oder Copy-Paste bitten. **Work** führt Schritte in Cloud Browser und GitHub eigenständig aus. Falls Login, OAuth oder konkrete Zustimmung wirklich erforderlich ist, nur diese Nutzeraktion anfordern. Kein Agent darf fälschlich behaupten, etwas sei getestet, wenn keine echte Browserprüfung erfolgte.

## Auftrag und Links
Repository: https://github.com/programmiererphp/storyduett
AI Studio: https://aistudio.google.com/apps

1. Öffne Repo und lies README, SPEC, ROADMAP, docs/PRODUCT_CONCEPT_V1.md, docs/ARCHITECTURE_V1.md, docs/COMPONENTS_V1.md und docs/AI_STUDIO_INTEGRATION.md. Protokolliere Commit von `main`.
2. Öffne **Google AI Studio Build über Work Cloud Browser**. Prüfe bestehende Apps; wenn noch keine StoryDuett-App besteht, lege **eine** neue Full-Stack-Webapp an. Wichtig: Das GitHub-Repo existiert schon, **keine zweite Repo-/App-Codebasis** erzeugen. Falls sinnvoll, importiere bestehendes GitHub-Repo über den AI-Studio-Dialog; wenn eine App aus Prompt entstehen muss, verwende minimale Startanweisung unten.
3. Erstelle durch AI Studio **eine minimale mobile-first React + Node App** mit Titel StoryDuett; Startscreen mit Use-Case-Auswahl und deutlicher Kennzeichnung 'D0 technische Vorschau'. In D0 nur App-Shell und Backend-Health-Endpunkt; keine simulierten 'funktionierenden' API-Buttons. Übernehme die existierenden docs/contracts/prompts, statt sie zu löschen.
4. Verbinde in AI Studio die App über GitHub Settings mit `programmiererphp/storyduett` und synchronisiere in dieses existierende Repo. Verifiziere, dass beide Richtungen funktionieren; bei Konflikten Diff anzeigen, keine bestehenden Planungsdateien löschen. Repo-GitHub `main` ist maßgeblich. Automatische Secret-Konfiguration von AI Studio prüfen; Schlüssel nur serverseitig. Nie Schlüssel kopieren.
5. Teste im Cloud Browser die laufende Preview: Titel, mobil nutzbar, Health-Endpunkt (falls erreichbar). Soweit verfügbar deployed Test-URL veröffentlichen und erneut mit Browser öffnen. Für jede behauptete Funktion echte Browserprüfung; Console-/Netzwerkfehler und Screenshot prüfen.
6. Aktualisiere SPEC und ROADMAP vor Codeänderungen bzw. nach Verifikation; schreibe bereinigtes `reports/reviews/<date>-<commit>.md` mit exakter App-/Commit-Version, URLs, bestandenen und offenen Tests, Bugs und möglichen Blockern. Commit in dasselbe Repo.
7. Bereite Delivery D1 vor, aber implementiere nicht D2/Multiplayer/TTS vor dem getesteten Solo-MVP. Komponenten C01–C04 isoliert in `packages/components` entwickeln (manifest/demo/test), in AI Studio App integrieren. Nach D1 10 echte Runden und UI/Backend-/Kostenchecks ausführen.

## Minimaler AI-Studio-Build-Prompt
> Erstelle im vorhandenen Projekt 'StoryDuett' nur Delivery D0: eine sehr schlanke mobile-first React/Node Full-Stack-App als funktionsfähiges Grundgerüst. Die gesamte Spezifikation liegt im bestehenden GitHub-Repository https://github.com/programmiererphp/storyduett, insbesondere SPEC.md, ROADMAP.md und docs/WORK_D0_EXECUTION.md. Übernimm diese bestehenden Dateien und synchronisiere die resultierende App wieder in dasselbe Repository. Zeige einen klaren StoryDuett-Titel, eine Use-Case-Vorschau aus dem Promptkatalog, einen sichtbaren D0-Status und einen serverseitigen Health-Check. Kein erfundener KI-Erfolg, keine implementierten Multiplayer-/TTS-/Cartoon-Funktionen vortäuschen. Secret nur Backend. Komponenten werden später von ChatGPT Work isoliert entwickelt und importiert, bitte nicht eigenständig neu bauen. Beseitige alle echten Build-/UI-Fehler und zeige die Laufzeitprüfung.

## Stop-/Fail-Kriterien
GitHub-Sync ist nicht verifiziert; falsches zweites Repo; Secrets im Bundle; Preview nicht erreichbar; Deploy behauptet, aber nicht getestet; fehlendes Budget-/Zugriffsmodell für späteren API-Call. Diese Punkte als offene Bugs angeben, nicht als abgeschlossen markieren.

## Erfolg
D0 nur dann DONE, wenn Repo die echte funktionierende App enthält, CI erfolgreich ist und Work die AI-Studio-App im Browser mit dokumentierter Commit-ID und URL geprüft hat.
