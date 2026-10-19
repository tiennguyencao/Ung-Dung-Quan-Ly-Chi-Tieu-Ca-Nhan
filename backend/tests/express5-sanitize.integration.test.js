import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import express5QueryCompatibility from '../src/middleware/express5-query-compat.middleware.js';

process.env.NODE_ENV = 'test';
const { default: appUnderTest } = await import('../src/app.js');

// This test deliberately exercises a real HTTP request. A unit test of the
// compatibility function alone would not catch a regression in Express's
// request-query property behavior or in the sanitizer integration.
async function withServer(app, fn) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test('Express 5 query sanitizer removes Mongo operator keys without throwing', async () => {
  const app = express();
  app.use(express5QueryCompatibility);
  app.use(mongoSanitize());
  app.get('/inspect', (req, res) => res.json(req.query));

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/inspect?%24where=blocked&safe=kept`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { safe: 'kept' });
  });
});


test('full API app keeps /health reachable with the global sanitizer enabled', async () => {
  await withServer(appUnderTest, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health?%24where=blocked`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, data: { status: 'ok' } });
  });
});
