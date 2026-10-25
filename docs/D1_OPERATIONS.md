# D1 – Kosten, Abschalten und Schlüssel

Referenz SD-D1-OPS-01. Stand 2026-10-25. D1 weiterhin IN PROGRESS; keine Freigabe zur unkontrollierten Kostensteigerung.

## Freigabe und Grenzen

Der Nutzer hat den zusätzlichen Schlüssel **StoryDuett D1 server** im vorhandenen Projekt und seine ausschließlich serverseitige Nutzung ausdrücklich genehmigt. Weitere selbstständige Schritte sind nur autorisiert, wenn sie höchstens **2 EUR zusätzliche Kosten pro Monat** verursachen. Eine neue Abrechnung, ein zusätzliches Projekt, Repository oder eine weitere App wurden nicht eingerichtet.

Die Erstellung eines API-Schlüssels selbst hat keinen laufenden Abonnementpreis. Kosten entstehen durch API-Nutzung und gegebenenfalls durch Hosting, Builds, Logs, Datenverkehr oder weitere Cloud-Dienste. Ein gestohlener Schlüssel kann fremde Aufrufe auf Rechnung des Projekts ermöglichen. Serverseitige Speicherung verhindert die Auslieferung im Browser-Bundle, ersetzt aber weder Zugriffsschutz noch globale Ausgabenlimits.

In der bestehenden AI-Studio-Ausgabenübersicht wurde am 25.10. ein **Projekt-Monatslimit von 2 EUR** beobachtet; es wurde nicht geändert. Google kennzeichnet diese Funktion als experimentell und weist auf ungefähr zehn Minuten Verzögerung und mögliche Überschreitungen hin. Die Übersicht sagt außerdem ausdrücklich, dass andere Cloud-Produkte und AI-Studio-Kosten nicht enthalten sind. Das ist daher kein garantierter Gesamtdeckel von 2 EUR.

Die App reserviert vor jedem Modellaufruf einen konservativen Höchstbetrag. Aktuell maximal USD0.01 pro Call und USD0.10 pro Sitzung, ohne automatische kostenpflichtige Retries. Die zusätzliche Nutzer-/Prozess-Tagesgrenze liegt im flüchtigen Prozessspeicher. Sie gilt nicht global über mehrere Cloud-Run-Instanzen oder Neustarts hinweg. Eine garantierte monatliche Grenze ist damit noch nicht implementiert. Vor öffentlicher D1-Freigabe sind diese Lücke und die Hostingkosten zu klären.

## Zugriff und Kosten später stoppen

**App-Abschalter:** In der bestehenden AI-Studio-App unter Settings → Secrets `SD_AI_ENABLED` auf `false` setzen, Apply ausführen und den Backend-Neustart abwarten. Der zentrale serverseitige Resolver liefert dann keinen Schlüssel; `/api/play-config` meldet `ready:false`. Nach dem Neuladen ist Geschichte beginnen deaktiviert. Das stoppt neue Gemini-Aufrufe dieser Runtime; bereits laufende Aufrufe und das Hosting werden dadurch nicht rückwirkend gestoppt. Veröffentlichte und Vorschau-Runtime getrennt prüfen; eine geänderte Vorschau-Konfiguration nicht ungeprüft als bereits veröffentlicht behandeln.

1. **Modellzugriff:** In Google AI Studio unter API Keys gezielt den Schlüssel **StoryDuett D1 server** auswählen und widerrufen/löschen. Dadurch kann dieser Schlüssel keine weiteren erfolgreichen Aufrufe autorisieren. Bereits laufende/verarbeitete Aufrufe können noch Kosten erzeugen. Andere bestehende Schlüssel nicht versehentlich löschen. Die endgültige Löschung muss der Kontoinhaber bewusst bestätigen.
2. **Öffentliche App:** In der bestehenden Build-App unter Publish ist **Unpublish app** vorhanden. Diesen Weg verwenden, um die Veröffentlichung zurückzunehmen. Vor dem Bestätigen die Folgen des Dialogs prüfen; nicht behaupten, dass damit alle Cloud-Ressourcen automatisch gelöscht werden.
3. **Hosting:** Den zugehörigen Cloud-Run-Dienst `storyduett` im vorhandenen Projekt über Advanced settings öffnen und stilllegen beziehungsweise nach bewusster Prüfung löschen. Auch verbliebene Images, Builds, Logs oder andere Ressourcen können separat abzurechnen sein. Die Cloud-Konsole war in diesem Cloud Browser am 25.10. nicht erreichbar (Site Unavailable); keine dortige Änderung behauptet.
4. **Kontrolle:** Gemini Spend und Google-Cloud-Abrechnung getrennt auf weiteren Verbrauch prüfen. Budgetwarnungen melden Verbrauch; sie sind keine sofortige Abschaltung. Keine zusätzliche automatische Aufladung oder neue kostenpflichtige Dienste aktivieren.

Schlüssel niemals in Chat, Supporttickets, Screenshots, Git, Browser-Code oder öffentlich lesbare Logs kopieren. Bei vermutetem Leak zuerst Zugriff stoppen, danach einen Ersatz nur serverseitig hinterlegen und Nutzung prüfen.

## Quellen

- https://ai.google.dev/gemini-api/docs/api-key — serverseitige Speicherung, Schlüsseltypen und Leak-Reaktion.
- https://ai.google.dev/gemini-api/docs/pricing — am 25.10. erneut geprüft: `gemini-3.5-flash-lite` Standard USD0.30/Mio Input und USD2.50/Mio Output inklusive Thinking; keine Tools/Audio in D1.
- https://ai.google.dev/gemini-api/docs/billing — Projektlimits, Verzögerung und mögliche Überschreitungen.
- https://ai.google.dev/gemini-api/docs/aistudio-deploying — Cloud-Run-Bereitstellung und Abrechnungsanforderungen.
