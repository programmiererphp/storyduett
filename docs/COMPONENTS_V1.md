# Web-Component-Verträge V1 (SD-COMP-01)
Jede Komponente: eigenes `component.manifest.json`, `src/index.ts`, `dist/*.js`, `demo/index.html`, `tests/*`, README. Separat lauffähig, unabhängig testbar. Keine Geschäftslogik/Provider-Calls in Web Components. React nutzt ref und lauscht CustomEvents `sd:...` (bubbles + composed). Komplexe Inputs über DOM-Properties, nicht JSON-Attribute.

| ID | Custom Element | Eingaben | Ereignis | Delivery |
|---|---|---|---|---|
| C01 | sd-usecase-picker | useCases, selectedId | sd:usecase-select | D1 |
| C02 | sd-story-reader | segments, activeNodeId, presentation, actorLabels | sd:segment-select | D1 |
| C03 | sd-choice-panel | question, busy, disabled, allowCustom | sd:answer-submit | D1 |
| C04 | sd-ai-comment | comment, context | sd:comment-expand | D1 |
| C05 | sd-story-timeline | nodes, currentNodeId, allowBranch | sd:navigate, sd:branch-request | D2 |
| C06 | sd-story-library | sessions, loading | sd:session-open, sd:session-create | D2 |
| C07 | sd-usecase-editor | useCase, errors | sd:usecase-save, sd:usecase-test | D2 |
| C08 | sd-voice-player | audioUrl, status, voice | sd:tts-request, sd:playback-state | D3a |
| C09 | sd-budget-meter | usage, limits | sd:open-usage | D3b |
| C10 | sd-duo-room | room, players, activePlayerId | sd:invite-request, sd:room-leave | D4 |
| C11 | sd-duo-chat | messages, canSend | sd:chat-send | D5 |
| C12 | sd-match-lobby | preferences, status, matches | sd:match-search, sd:match-join | D6 |
| C13 | sd-cartoon-choices | imageOptions, busy | sd:cartoon-answer | D7 |
| C14 | sd-debug-console | logs, filters | sd:logs-filter, sd:log-select | D3b |

**Tabellen-ID: SD-COMP-T01**

## Kritischer C03 Contract
`question = {id,text,options:[{id,text,tone}]}`. `tone` ist 'serious' oder 'ironic'. Drei Optionen werden angezeigt, zusätzlich eigener Texteingabemodus. Event `sd:answer-submit` Detail: `{questionId, selectedOptionId? , customAnswer?}`. Busy unterbindet erneute Auswahl; Enter/Keyboard/ARIA testen; Fehlerstate mit Wiederholung. Client und Backend validieren identische Semantik.

## Design & Tests
- UI immer eindeutig, minimal und mobile-first; responsive, accessible, Usernamen zusätzlich zu Autorenfarben.
- Manifest-Parser validiert Pflichtfelder und bekannte Contract-Versionen.
- Standalone Demo ohne Backend mit lokalen Fixtures; Unit-/Browser-Tests, simulierte Fehler, Leerzustände.
- Build als versionierte ESM-Datei; React-Adapter implementiert Property-Updates und Listener-Cleanup.
- Keine hardcodierten deutschen Strings; lokalisierte Texte werden über Prop/I18n-Contract übergeben.
- Jede Erweiterung muss auch bereits gemergte Komponenten und deployed App regressionstesten.

## C03 Erweiterung 1.1.0 (2026-10-25)
`disabled:boolean` sperrt Antworten und Freitext ohne Arbeitsstatus. `busy:boolean` bezeichnet ausschließlich eine laufende Anfrage. Ein Budgetblock setzt disabled, nicht busy; bestehender Text bleibt lesbar. Beide Properties verhindern Submit-Ereignisse bei Sperre. Manifest, Demo und gezielter Komponenten-Regressionstest sind aktualisiert.

D1-Lesefassung (2026-10-26): C02v1.1.0 rendert prose inline, language/learning mit Absätzen je turnId. Gemeinsame Legende und stabile actorId-Tönungen, keine Chatkarten. Details: [SD-D1-READ-01](READING_PRESENTATION.md), eigenständige Demo und Tests im Komponentenpaket. C04 bleibt separater Kommentar-/Korrekturbereich.
