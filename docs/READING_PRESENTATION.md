# SD-D1-READ-01: Kontinuierliche Lesefläche (C02 v1.1.0) & Darstellungsprojektion

## 1. Motivation & Problemstellung
Bisher stellte C02 `sd-story-reader` jeden Storybeitrag als separate "Chatkarte" mit Autorenkopfzeile (`small`) und Block-Paragraph dar. Dies widerspricht dem Charakter einer gemeinsamen Geschichte und wirkt wie ein Messaging-Verlauf statt eines zusammenhängenden literarischen oder didaktischen Textes.

## 2. Kernanforderungen

### 2.1 C02 `sd-story-reader` (v1.1.0)
- **Lesefläche statt Chatkarten:**
  - `presentation="prose"`: Ein einziger, fortlaufender Fließtextabsatz (`p.prose-surface`), in dem Segmente als Inline-`span`s mit natürlichen Leerzeichen aneinandergefügt sind. Keine separaten Boxen, Karten oder Autoren-Kopfzeilen pro Segment.
  - `presentation="language"`: Kurze, zusammenhängende Absätze je Runde (`turnId`). Ein vom Spieler gelieferter Beitrag (`user-contribution`) und eine optionale KI-Brücke (`ai-bridge`) derselben Runde werden im selben Absatz als fortlaufender Text dargestellt.
  - `presentation="learning"`: Sachlich gegliederte Absätze je Runde (`turnId`).
- **Typografie:**
  - Ruhige Serifenschrift (`ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`).
  - Zeilenlänge ca. 65–75ch (z.B. `max-width: 72ch`).
  - Großzügige Zeilenhöhe ca. 1.85 (`line-height: 1.85`).
- **Autoren-Hervorhebung:**
  - Menschliche Textsegmente erhalten eine dezente Inline-Hintergrundtönung mit `box-decoration-break: clone; -webkit-box-decoration-break: clone;`.
  - Keine linke Kante, keine Karten-Rahmen, kein Block-Padding.
  - `solo` (Standard-Spieler in D1): Sanftes, neutrales Hellgrau (`#e8ecef` bzw. `#eceef0`).
  - Weitere menschliche `actorId`s erhalten deterministisch reproduzierbare, sanfte Pastelltöne (z.B. abgeleitet über einen stabilen Hash auf die Actor-ID), völlig unabhängig von der Reihenfolge im Storyverlauf.
  - KI-Segmente (`ai`) bleiben ungetönt (transparenter Hintergrund).
  - Gemeinsame kompakte Legende am Anfang der Lesefläche listet die im Text vorkommenden Autoren auf (z.B. Swatch + Name).
  - Jedes interaktive Segment trägt `title` und `aria-label` mit sprechendem Autorenbezeichner.
- **Neue & erweiterte DOM-Properties:**
  - `presentation?: 'prose' | 'language' | 'learning'` (Standard `'prose'`).
  - `actorLabels?: Record<string, string>` (optionales Mapping von `actorId` auf sprechenden Anzeigenamen).
  - Bestehende Properties `segments: StorySegmentV1[]`, `activeNodeId: string`, `i18n: Record<string, string>` bleiben unverändert erhalten.
- **Interaktion & Zugänglichkeit:**
  - Event `sd:segment-select` via Klick, `Enter` und `Space` bleibt unverändert erhalten (`detail: { segmentId: string }`).
  - Tastaturfokus sichtbar (`outline: 2px solid #58714b`).
  - Alle Texte werden strikt über `textContent` gerendert (keine HTML-Interpretation von Eingabetext).
  - Leerer Zustand (`empty`) bleibt erhalten.

### 2.2 Katalog & API-Schnittstellen
- **`prompts/catalog.json`:**
  - Zehn Use Cases erhalten das Attribut `presentation`:
    - `'language'` für `german-b2` und `italian-a1`.
    - `'learning'` für `learning`.
    - `'prose'` für die restlichen sieben Use Cases.
  - Spezifisch formulierte `prompts.integrate`-Instruktionen für alle zehn Szenarien (präzise Fortführung, Erhalt früherer Segmente, kein "Du hast gewählt").
  - Versionserhöhung: `italian-a1` von v3 auf v4; alle anderen neun Use Cases von v2 auf v3.
- **Sichere öffentliche Katalogprojektion (`GET /api/use-cases`):**
  - Rückgabeobjekt pro Use Case strikt auf Whitelist beschränkt:
    `['id', 'name', 'version', 'language', 'presentation', 'integratePrompt', 'textModel', 'enabled']`.
  - `integratePrompt` spiegelt den echten Text aus `prompts.integrate`.
  - Die drei internen Prompts (`start`, `question`, `comment`), Systemanweisungen und Server-Secrets verbleiben intern.
- **Transparenz in der Web-App:**
  - Vor Spielstart und während des Spiels bietet die App eine kompakte, aufklappbare Sektion „Wie dein Beitrag eingewoben wird“ (`<details>`), die den tatsächlichen `integratePrompt` und die Versionsnummer anzeigt.

Review: Die Legende ist eine beschriftete Gruppe, kein Navigationsmenü. Dauerhafte Rahmen um aktive Passagen entfallen; nur Tastaturfokus erhält eine Kontur. KI-Passagen haben kein zusätzliches Padding. Beschriftungen kommen aus i18n; fehlen Autorenlabels, dient die actorId als Fallback. Die endliche Farbpalette kann bei weiteren Autoren kollidieren; Namen bleiben die verbindliche Zuordnung. D1 verwendet ausschließlich solo.

## Zeitform-Nachprüfung (SD-D1-BUG-06)
Neue Geschichten beginnen im Präsens. Fortsetzungen bewahren die tatsächlich etablierte Erzählperspektive und Zeitform; Rückblicke, direkte Rede und historische Fakten dürfen sachgerecht Vergangenheitsformen enthalten. Alle zehn Integrationsprompts entsprechend präzisiert, Katalogversionen jetztv4 beziehungsweisev5(italian-a1). Kein rückwirkendes Umschreiben und kein zusätzlicher Modellcall.

A1-Nachprüfung: Aktueller italienischer Katalogv6 mit natürlicher Wortstellung und phasenbezogenem Provider-Schema; siehe A1_WIREFORMAT.md. Erzählfälle bleibenv4. Darstellung und C02 bleiben unverändert.

Aktuelle ausdrücklich öffentliche Modellmetadaten: textModel je Szenario; Kopfzeile zeigt die gewählte Modell-ID. A1v7 testet3.8Flash, andere Szenarienv4 bleiben3.5Flash-Lite. Keine Veröffentlichung von Credentials oder weiteren internen Promptteilen.
