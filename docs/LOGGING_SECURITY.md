# Runtime Logs, API-Budget, öffentliche Logs (SD-LOG-01)
**Das Repo ist Public.** Niemals echte Nutzergeschichten, Identitäten, private Chatnachrichten, rohe effektive Prompts, API-Schlüssel oder vollständige Antworten ins Repo pushen.

## 2 Speicherorte
**Public GitHub:** Schemas, Preis-Konfigurationsbeispiele (keine Schlüssel), synthetische Logs, anonymisierte nicht rückrechenbare Diagnoseberichte, CI-/Browser-Testprotokolle ohne Nutzerdaten.
**Privates Backend:** API-Request-Logs, User-/Session-IDs, echte Promptinhalte falls explizit Debug aktiviert, Anbieter-Usage-Metadaten, Fehlerdetails, Kosten. Zugriff nur Admin/gesondert berechtigt, Aufbewahrungsfrist und Export/Löschung implementieren.

## Audit pro Request
ID + idempotencyKey, anonymisierte private Nutzerzuordnung, Feature, Modell, Promptversion/Hash, effektive Promptlänge, timestamp, latency, retry, status/error, input/output/thinking/cached/audio tokens falls verfügbar, priceVersion, estimatedCostUSD. Fehlende Werte = null, keine erdachten Null-Kosten. Für vollständigen Prompt nur geschützte Admin-Einzelsicht.

## Caps
Harte Obergrenzen pro Aufruf, Session, Feature (Text/TTS/Cartoon/Chat/Research falls später), Nutzer/Tag und optional Projekt, Admin-Override optional. Vor Call serverseitig Kapazität reservieren, nach Provider-Reply mit echtem Verbrauch abrechnen; bei Abbruch oder Fehler sauber freigeben bzw. bereits berechnete Kosten verbuchen. Endnutzer-UI zeigt verbraucht/Limit; bei Limitüberschreitung API-Aufruf blockieren.

## Versionierung
Tarife ändern sich; Kosten sind Schätzungen, Daten mit `priceListVersion` und Datum. Nie einen Preis unbekannter Tokenarten ausdenken. Texte in Monitoring anonymisieren, Beispiellog synthetisch.

## Security Tests
GitHub CI auf typische `.env`/Keymuster; Backend-Rollenprüfung; Rate Limits; andere Nutzer-Sessions nicht lesbar; Prompt/Provider-Response nur Admin; CORS/CSRF/Auth entsprechend Hosting; Nutzerlöschung; Einladungslinks zeitlich begrenzen.
