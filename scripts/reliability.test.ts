import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fetchJson } from '../src/api';
process.env.NODE_ENV = 'test';
const { createApi } = await import('../server');

test('readiness and catalog fail closed when the catalog cannot be read', async () => {
  const server = createApi(() => { throw new Error('private internal path'); }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  try {
    for (const path of ['/api/health', '/api/use-cases']) {
      const res = await fetch(`http://127.0.0.1:${address.port}${path}`);
      assert.equal(res.status, 503);
      assert.equal((await res.text()).includes('private internal path'), false);
    }
  } finally { server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); }
});

test('client rejects an HTTP error and malformed JSON, then permits a successful retry', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('{}', { status: 503 });
    await assert.rejects(fetchJson('/api/health'), /http/);
    globalThis.fetch = async () => new Response('broken JSON');
    await assert.rejects(fetchJson('/api/health'), SyntaxError);
    globalThis.fetch = async () => Response.json({ status: 'ok' });
    assert.deepEqual(await fetchJson('/api/health'), { status: 'ok' });
  } finally { globalThis.fetch = original; }
});

test('client aborts a stalled request instead of leaving loading forever', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
    await assert.rejects(fetchJson('/api/health', 25), /timeout/);
  } finally { globalThis.fetch = original; }
});
