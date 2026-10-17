# C02 `sd-story-reader` v1.0.0

Independent Shadow DOM Custom Element. No React, backend, credentials, storage or network requests. Load `dist/sd-story-reader.js` as ESM. Demo: `demo/index.html` (serve over HTTP). Build all: `npm run build:components`; test: `node --test packages/components/story-reader/tests/*.test.mjs`.

Properties (set on the DOM element, never JSON attributes): `{"segments": "StorySegmentV1[]", "activeNodeId": "string", "i18n": "Record<string,string>"}`. Set localized `i18n` labels; no German literals in source. All text rendered via textContent, never HTML from input. Events: `{}`; bubbles/composed. Host owns business state and errors/retry.

C03 dispatches one answer per question until host clears busy after error or supplies next question; preserves free-text draft on busy/error and limits input to600 characters. Idempotency/version checks belong to server. C02 displays immutable supplied segments with author labels and persistent green solo contribution color; no history mutation. C01 selection event does not itself start a paid call.
