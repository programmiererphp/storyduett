# D0 module contracts – SD-D0-MODULES-01

D0 is a technical preview; it implements no D1 Web Components or paid provider calls.

- `server.ts`: `getPublicCatalog()` validates the versioned catalog and returns only public metadata. `createApi(loadCatalog?)` owns GET health/catalog and JSON 404s; the injectable loader permits a real unavailable-catalog test. `setupApp()` serves static `dist` for both preview and production. PORT is configurable; bind 0.0.0.0. No key required or returned.
- `package.json`: `npm run dev` builds and starts the production runtime too, avoiding Cloud-Preview HMR WebSocket errors and exposed development source.
- `src/api.ts`: `fetchJson<T>(sameOriginPath, timeoutMs=10000)` performs a no-cache GET, rejects bad HTTP/JSON and aborts stalled responses. No retries or provider calls are hidden inside it.
- `src/App.tsx`: D0 shell, catalog search/language filter, accessible metadata dialog and health refresh. Maintains only in-memory UI state. Consumes the two public endpoints; localized error/retry states. Does not persist user text.
- `src/i18n/{de,en,ru}.json`: UI labels, ARIA text and catalog presentation keyed by immutable catalog ID. Locale changes title and document language. Catalog version and activation remain server-owned.
- `scripts/validate.mjs`: unchanged planning/contract validator. `scripts/reliability.test.ts`: readiness failure and client HTTP/JSON/timeout/retry behavior. `scripts/test-api.mjs`: isolated **production** process on OS-assigned port; API/public projection/404/static-HTML/source-exclusion checks and cleanup.
- `.github/workflows/ci.yml`: Node22, lockfile installation, existing validator, TypeScript, production frontend build and tests.

## Runtime contract
GET `/api/health` returns status/version/delivery/timestamp/catalogUseCasesCount; it returns 503 if the catalog is unavailable. GET `/api/use-cases` returns schemaVersion/delivery/useCases; each entry contains only id/name/version/language/enabled. API errors never include exception paths or environment values. Unsupported API routes, including future story/admin routes, return JSON 404.

## Deferred
D1 story engine/C01–C04, authentication, database, budgets for actual AI calls, model/pricing verification, TTS, duo/chat/matching and CMS remain unimplemented. The current catalog's model names are unverified planning values and never drive D0 provider calls.
