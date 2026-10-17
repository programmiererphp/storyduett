import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';

const TEST_PORT = 3144;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function fetchResponse(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          // not json
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
          text: data,
        });
      });
    }).on('error', reject);
  });
}

async function waitForServer(retries = 35) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchResponse('/api/health');
      if (res.status === 200) return true;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error('Test server failed to start within timeout');
}

async function runTests() {
  console.log(`Starting isolated test server on port ${TEST_PORT}...`);
  const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
    env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: 'test-runner' },
    detached: true,
    stdio: 'ignore',
  });

  const cleanup = () => {
    try {
      if (serverProcess.pid) {
        process.kill(-serverProcess.pid, 'SIGKILL');
      }
    } catch {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    await waitForServer();
    console.log('✅ Server running, testing D0 API contracts:\n');

    // 1. Health check test
    console.log('1. Testing GET /api/health...');
    const health = await fetchResponse('/api/health');
    assert.equal(health.status, 200, 'Health endpoint must return 200');
    assert.equal(health.body.status, 'ok', 'Status must be ok');
    assert.equal(health.body.version, 'D0', 'Version must be D0');
    assert.equal(health.body.delivery, 'D0 technische Vorschau', 'Delivery must be D0 technische Vorschau');
    assert.equal(health.body.catalogUseCasesCount, 10, 'Must report 10 use cases');
    assert.ok(health.body.timestamp, 'Timestamp must exist');
    assert.equal(health.text.includes('GEMINI_API_KEY'), false, 'Must not leak env names');
    console.log('   ✓ GET /api/health passed');

    // 2. Safe catalog projection test
    console.log('2. Testing GET /api/use-cases...');
    const catalog = await fetchResponse('/api/use-cases');
    assert.equal(catalog.status, 200, 'Catalog endpoint must return 200');
    assert.equal(catalog.body.schemaVersion, '1.0', 'Schema version must be 1.0');
    assert.equal(catalog.body.delivery, 'D0', 'Delivery must be D0');
    assert.equal(catalog.body.useCases.length, 10, 'Must return 10 enabled use cases');

    const allowedKeys = new Set(['id', 'name', 'version', 'language', 'enabled']);
    for (const uc of catalog.body.useCases) {
      assert.ok(uc.id, 'Use case must have id');
      assert.ok(uc.name, 'Use case must have name');
      assert.equal(typeof uc.version, 'number', 'Version must be number');
      assert.ok(uc.language, 'Language must be defined');
      assert.equal(typeof uc.enabled, 'boolean', 'Enabled must be boolean');

      // Assert no forbidden / internal keys exist on any use case
      assert.equal(uc.prompts, undefined, `Use case ${uc.id} must NOT leak prompts`);
      assert.equal(uc.textModel, undefined, `Use case ${uc.id} must NOT expose planning textModel`);
      assert.equal(uc.tts, undefined, `Use case ${uc.id} must NOT expose planning tts config`);
      assert.equal(uc.commentStyle, undefined, `Use case ${uc.id} must NOT expose commentStyle in D0`);

      for (const key of Object.keys(uc)) {
        assert.ok(allowedKeys.has(key), `Unexpected key ${key} in safe use case`);
      }
    }
    console.log('   ✓ GET /api/use-cases passed (10 items, strictly harmless metadata, zero leaks)');

    // 3. Unknown endpoint 404 test
    console.log('3. Testing GET /api/unbekannt (404)...');
    const notFound = await fetchResponse('/api/unbekannt');
    assert.equal(notFound.status, 404, 'Unknown endpoint must return 404');
    assert.equal(notFound.body?.error, 'Endpoint not found', 'Must return JSON 404 with error message');
    console.log('   ✓ GET /api/unbekannt correctly returned JSON 404');

    // 4. Static / HTML app test
    console.log('4. Testing GET / (App entry)...');
    const appEntry = await fetchResponse('/');
    assert.equal(appEntry.status, 200, 'Root must return 200');
    assert.ok(appEntry.text.includes('StoryDuett'), 'Root HTML must contain StoryDuett');
    console.log('   ✓ GET / serves HTML app shell');

    console.log('\n🎉 All D0 automated test assertions passed!');
    cleanup();
    process.exit(0);
  } finally {
    cleanup();
  }
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
