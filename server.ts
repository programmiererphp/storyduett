import express, { Request, Response } from 'express';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Public catalog loader projecting only harmless metadata (id, name, version, language)
export function getPublicCatalog() {
  const catalogPath = join(__dirname, 'prompts', 'catalog.json');
  if (!existsSync(catalogPath)) {
    throw new Error('Catalog file prompts/catalog.json not found');
  }
  const raw = readFileSync(catalogPath, 'utf8');
  const catalog = JSON.parse(raw);

  const safeUseCases = (catalog.useCases || [])
    .filter((u: any) => u.enabled !== false)
    .map((u: any) => ({
      id: String(u.id),
      name: String(u.name),
      version: Number(u.version),
      language: String(u.language),
      enabled: Boolean(u.enabled),
    }));

  return {
    schemaVersion: catalog.schemaVersion || '1.0',
    delivery: 'D0',
    useCases: safeUseCases,
  };
}

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: 'D0',
    delivery: 'D0 technische Vorschau',
    timestamp: new Date().toISOString(),
    catalogUseCasesCount: 10,
  });
});

// GET /api/use-cases
app.get('/api/use-cases', (_req: Request, res: Response) => {
  try {
    const data = getPublicCatalog();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to load catalog',
      message: err.message,
    });
  }
});

// Unknown API routes return 404 JSON
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Dev server or production static files
export async function setupApp() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  }
  return app;
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  setupApp().then((configuredApp) => {
    configuredApp.listen(port, '0.0.0.0', () => {
      console.log(`StoryDuett server running on http://0.0.0.0:${port} [${process.env.NODE_ENV || 'development'}]`);
    });
  });
}

export default app;
