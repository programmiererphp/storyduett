# C02 `sd-story-reader` v1.1.0

Independent Shadow DOM Custom Element providing a continuous, unified reading surface for collaborative storytelling. No React, backend, credentials, storage, or network requests. Load `dist/sd-story-reader.js` as ESM. Demo: `demo/index.html` (serve over HTTP). Build: `npm run build:components`; test: `node --test packages/components/story-reader/tests/*.test.mjs`.

## Schnittstellen & Properties (DOM Properties, keine JSON-Attribute)
- `segments: StorySegmentV1[]`: Unveränderliche Liste der Story-Segmente `{ id: string, turnId: string, text: string, kind: string, actorId: string }`.
- `activeNodeId: string`: Aktive Turn-/Node-ID zur semantischen Kennzeichnung (`aria-current="true"`).
- `presentation: 'prose' | 'language' | 'learning'`:
  - `'prose'` (Default): Ein einziger fortlaufender Fließtextabsatz (`p.prose-surface`) mit Inline-`<span>`-Segmenten und natürlichen Wortabständen. Keine Chat-Karten, keine Autorentitel pro Segment, keine Chat-Sidebars. Ruhige Serifenschrift, Zeilenlänge ca. 65–75ch, Zeilenhöhe 1.85.
  - `'language'`: Kurze, kohärente Absätze je Spielrunde (`turnId`). Nutzerbeitrag und optionale KI-Brücke derselben Runde stehen gemeinsam im selben Fließtext-Absatz.
  - `'learning'`: Didaktisch/sachlich gegliederte Absätze je Spielrunde (`turnId`).
- `actorLabels: Record<string, string>`: Optionales Mapping von `actorId` auf sprechende Autorennamen (z.B. `{ "solo": "Anna", "p2": "Ben" }`).
- `i18n: Record<string, string>`: Lokalisierte Strings (`empty`, `you`, `ai`, `authors`, etc.). Keine fest verdrahteten Sprachliterale.

## Autoren-Farben & Typografie
- Textausgabe erfolgt strikt über `textContent`, damit übergebene Texte nicht als HTML interpretiert werden.
- Menschliche Beiträge werden dezent über Inline-Hintergrundtönung hervorgehoben (`box-decoration-break: clone; -webkit-box-decoration-break: clone;`), ohne linke Rahmenkante oder Kartenränder.
- `solo` erhält ein ruhiges, helles Neutralgrau (`#eceef0`).
- Weitere menschliche `actorId`s erhalten deterministisch reproduzierbare, sanfte Pastelltöne (Palette aus Salbei, Sand, Lavendel, Pfirsich, Taubenblau), völlig unabhängig von der Reihenfolge im Storyverlauf.
- KI-Segmente (`ai`) bleiben ungetönt (transparenter Hintergrund).
- Eine kompakte gemeinsame Autorenlegende über der Lesefläche listet die im Dokument vorkommenden Autoren auf.

## Events
- `sd:segment-select`: Ausgelöst bei Mausklick sowie Tastatur (`Enter`, `Space`) auf ein Segment (`detail: { segmentId: string }`). Bubbles und composed. Sichtbarer Tastaturfokus (`outline: 2px solid #58714b`).

## Fehler- und Grenzfalle
- Leerer Zustand (`segments = []`): Zeigt ruhigen Leermeldungstext (`empty`), keine Fragmente oder kaputten Layouts.
- Ungültige/fehlende Segmenttexte: Leere Strings werden sicher behandelt.
- Unveränderlichkeit: Eingehende Segmente werden niemals mutiert oder umsortiert.

Review: Die Legende ist eine beschriftete Gruppe, kein Navigationsmenü. Dauerhafte Rahmen um aktive Passagen entfallen; nur Tastaturfokus erhält eine Kontur. KI-Passagen haben kein zusätzliches Padding. Beschriftungen kommen aus i18n; fehlen Autorenlabels, dient die actorId als Fallback. Die endliche Farbpalette kann bei weiteren Autoren kollidieren; Namen bleiben die verbindliche Zuordnung. D1 verwendet ausschließlich solo.
