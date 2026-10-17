import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { once } from 'node:events';

const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
  env: { ...process.env, PORT: '0', NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk; });
const exited = once(child, 'exit');
let timer;
try {
  const port = await new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Production startup timed out: ${stderr}`)), 15_000);
    createInterface({ input: child.stdout }).on('line', line => {
      const match = line.match(/^STORYDUETT_READY (\d+)$/);
      if (match) { clearTimeout(timer); resolve(Number(match[1])); }
    });
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`Production server exited ${code}: ${stderr}`)));
  });
  const request = path => fetch(`http://127.0.0.1:${port}${path}`, { signal: AbortSignal.timeout(5_000) });
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.match(health.headers.get('cache-control'), /no-store/);
  const h = await health.json();
  assert.equal(h.status, 'ok');
  assert.equal(h.version, 'D1');
  assert.ok(Number.isFinite(Date.parse(h.timestamp)));
  const catalog = await request('/api/use-cases');
  assert.equal(catalog.status, 200);
  const c = await catalog.json();
  assert.equal(c.schemaVersion, '1.0');
  assert.equal(c.useCases.length, 10);
  assert.equal(h.catalogUseCasesCount, c.useCases.length);
  const ids = new Set();
  for (const item of c.useCases) {
    assert.deepEqual(Object.keys(item).sort(), ['enabled','id','language','name','version']);
    assert.ok(item.id && item.name && item.language);
    assert.equal(item.enabled, true);
    assert.ok(!ids.has(item.id)); ids.add(item.id);
  }
  for (const path of ['/api', '/api/unbekannt', '/api/admin/debug', '/api/sessions']) {
    const res = await request(path);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'Endpoint not found' });
  }
  const root = await request('/');
  assert.equal(root.status, 200);
  const html = await root.text();
  assert.ok(html.includes('StoryDuett') && html.includes('/assets/'));
  assert.ok(!html.includes('/@vite/client'));
  for (const path of ['/server.ts', '/prompts/catalog.json', '/.env']) {
    const res = await request(path);
    const text = await res.text();
    assert.ok(!text.includes('GEMINI_API_KEY') && !text.includes('getPublicCatalog') && !text.includes('Beginne eine bildhafte'));
  }
  console.log('PASS production D1: real readiness, ten catalog entries, strict public whitelist, JSON 404s, static production HTML, no raw server/catalog/env files.');
} finally {
  clearTimeout(timer);
  if (child.exitCode === null) child.kill('SIGTERM');
  const fallback = setTimeout(() => child.kill('SIGKILL'), 2000);
  await exited;
  clearTimeout(fallback);
}
