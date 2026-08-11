'use strict';

const test = require('node:test');

const assert = require('assert').strict;
const { locks, AbortController } = require('..');

const isAbortError = (error) =>
  error?.name === 'AbortError' || error?.code === 20;

test('Abort already aborted signal', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () =>
      locks.request('abort-pre', { signal: controller.signal }, async () => {}),
    isAbortError,
  );
});

test('Abort during wait with AbortController', async () => {
  const controller = new AbortController();
  let entered = false;

  const first = locks.request('abort-wait', async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  const second = locks.request(
    'abort-wait',
    { signal: controller.signal },
    async () => {
      entered = true;
    },
  );

  setTimeout(() => controller.abort(), 10);

  await assert.rejects(() => second, isAbortError);
  await first;
  assert.strictEqual(entered, false);
});
