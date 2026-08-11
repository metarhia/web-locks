'use strict';

const test = require('node:test');

const assert = require('assert').strict;
const { locks } = require('..');

test('Exclusive lock (handler throws)', async () => {
  await assert.rejects(
    () =>
      locks.request('A', async () => {
        throw new Error('Test');
      }),
    { message: 'Test' },
  );

  let recovered = false;
  await locks.request('A', async () => {
    recovered = true;
  });
  assert.strictEqual(recovered, true);
});
