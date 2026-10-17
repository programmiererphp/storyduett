import express from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Explicit projection: public responses never include provider config or prompts.
export function getPublicCatalog() {
  const catalog = JSON.parse(readFileSync(join(root, 'prompts/catalog.json'), 'utf8'));
  if (catalog.schemaVersion !== '1.0' || !Array.isArray(catalog.useCases)) throw new Error('Invalid catalog');
  const ids = new Set<string>();
  const useCases = catalog.useCases.filter((u: any) => u.enabled === true).map((u: any) => {
    if (typeof u.id !== 'string' || !u.id || ids.has(u.id) || typeof u.name !== 'string' ||
        typeof u.language !== 'string' || !Number.isInteger(u.version)) throw new Error('Invalid entry');
    ids.add(u.id);
    return { id: u.id, name: u.name, version: u.version, language: u.language, enabled: true };
  });
  return { schemaVersion: '1.0', delivery: 'D0', useCases };
}

export function createApi(loadCatalog = getPublicCatalog) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => {
    try {
      const catalog = loadCatalog();
      res.json({ status: 'ok', version: 'D0', delivery: 'D0', timestamp: new Date().toISOString(),
        catalogUseCasesCount: catalog.useCases.length });
    } catch {
      res.status(503).json({ status: 'error', version: 'D0', error: 'Catalog unavailable' });
    }
  });
  app.get('/api/use-cases', (_req, res) => {
    try { res.json(loadCatalog()); }
    catch { res.status(503).json({ error: 'Catalog unavailable' }); }
  });
  app.all(['/api', '/api/*'], (_req, res) => { res.status(404).json({ error: 'Endpoint not found' }); });
  return app;
}

export async function setupApp() {
  const app = createApi();
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(join(root, 'dist')));
    app.get('*', (_req, res) => { res.sendFile(join(root, 'dist/index.html')); });
  }
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  setupApp().then(app => {
    const server = app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0', () => {
      const address = server.address();
      console.log(`STORYDUETT_READY ${typeof address === 'object' ? address?.port : ''}`);
    });
    process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
  }).catch(() => { console.error('StoryDuett failed to start'); process.exit(1); });
}
